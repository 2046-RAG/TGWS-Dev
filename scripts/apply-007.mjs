// One-shot: confirm the Supabase project is active, apply migration 007
// (ticket conversation RLS, T-060), then run the verification query.
//
// Credential source: .secrets/supabase-pat.txt (git-ignored). The token is
// never printed and never passed on the command line. Unlike apply-005.mjs
// this script KEEPS the token file afterwards, because more migrations are
// queued; delete it or revoke the token when you are done.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokenPath = path.join(root, '.secrets', 'supabase-pat.txt');
const envPath = path.join(root, 'tgws', '.env.local');
const migPath = path.join(root, 'tgws', 'supabase', 'migrations', '007_ticket_comments_rw.sql');

if (!fs.existsSync(tokenPath)) {
  console.error('缺少 .secrets/supabase-pat.txt');
  process.exit(2);
}
const token = fs.readFileSync(tokenPath, 'utf8').trim();
if (!token || token.startsWith('PASTE_')) {
  console.error('token 文件仍是占位符，请先填入 Supabase Personal Access Token');
  process.exit(2);
}

const env = fs.readFileSync(envPath, 'utf8');
const urlMatch = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
if (!urlMatch) {
  console.error('无法从 tgws/.env.local 读取 NEXT_PUBLIC_SUPABASE_URL');
  process.exit(2);
}
const supabaseUrl = urlMatch[1].trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
const ref = new URL(supabaseUrl).hostname.split('.')[0];
console.log('project ref:', ref.slice(0, 4) + '…' + ref.slice(-2));

const verifySql = `
WITH checks AS (
  SELECT 1 AS ord, 'comment policies = 4' AS item,
         ((SELECT count(*) FROM pg_policies
            WHERE schemaname='public' AND tablename='ticket_comments') = 4)::text AS ok
  UNION ALL SELECT 2, 'RLS enabled on comments',
         (SELECT relrowsecurity::text FROM pg_class
           WHERE oid = 'public.ticket_comments'::regclass)
  UNION ALL SELECT 3, 'INSERT policies exist',
         ((SELECT count(*) FROM pg_policies
            WHERE schemaname='public' AND tablename='ticket_comments' AND cmd='INSERT') >= 2)::text
)
SELECT item, CASE WHEN ok = 'true' THEN 'PASS' ELSE 'FAIL' END AS result
FROM checks ORDER BY ord;
`;

const headerFile = path.join(root, '.secrets', '_headers.tmp');
const bodyFile = path.join(root, '.secrets', '_body.tmp.json');

function api(method, apiPath, bodyObj) {
  fs.writeFileSync(headerFile, `Authorization: Bearer ${token}\n`);
  const args = [
    '-sS', '--max-time', '120',
    '-X', method,
    `https://api.supabase.com${apiPath}`,
    '-H', `@${headerFile}`,
    '-w', '\n__HTTP__%{http_code}',
  ];
  if (bodyObj) {
    fs.writeFileSync(bodyFile, JSON.stringify(bodyObj));
    args.push('-H', 'Content-Type: application/json', '--data-binary', `@${bodyFile}`);
  }
  try {
    return execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } finally {
    fs.rmSync(headerFile, { force: true });
    fs.rmSync(bodyFile, { force: true });
  }
}

function split(out) {
  const i = out.lastIndexOf('\n__HTTP__');
  return { body: out.slice(0, i), status: out.slice(i + 9).trim() };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureActive() {
  const r = split(api('GET', `/v1/projects/${ref}`));
  if (r.status !== '200') {
    console.error('读取项目状态失败 HTTP', r.status, r.body.slice(0, 200));
    return false;
  }
  let status = 'UNKNOWN';
  try { status = JSON.parse(r.body).status || 'UNKNOWN'; } catch {}
  console.log('项目状态:', status);
  if (status === 'ACTIVE_HEALTHY' || status === 'ACTIVE') return true;
  if (status !== 'PAUSED' && status !== 'INACTIVE') {
    console.error('非暂停状态但不可用，停止:', status);
    return false;
  }
  console.log('项目已暂停，调用 restore…');
  const rr = split(api('POST', `/v1/projects/${ref}/restore`));
  if (rr.status !== '200' && rr.status !== '201') {
    console.error('restore 失败 HTTP', rr.status, rr.body.slice(0, 200));
    return false;
  }
  for (let i = 1; i <= 12; i++) {
    await sleep(10000);
    const s = split(api('GET', `/v1/projects/${ref}`));
    let st = 'UNKNOWN';
    try { st = JSON.parse(s.body).status || 'UNKNOWN'; } catch {}
    console.log(`  等待中 ${i * 10}s: ${st}`);
    if (st === 'ACTIVE_HEALTHY' || st === 'ACTIVE') return true;
  }
  console.error('恢复超时，请到 Dashboard 查看');
  return false;
}

let failed = false;
try {
  console.log('\n[0/2] 确认项目状态…');
  if (!(await ensureActive())) throw new Error('project not active');

  console.log('\n[1/2] 执行 007 迁移…');
  const mig = fs.readFileSync(migPath, 'utf8');
  const r1 = split(api('POST', `/v1/projects/${ref}/database/query`, { query: mig }));
  console.log('HTTP', r1.status, r1.body.slice(0, 300));
  if (r1.status !== '200' && r1.status !== '201') throw new Error('migration failed');

  console.log('\n[2/2] 验证…');
  const r2 = split(api('POST', `/v1/projects/${ref}/database/query`, { query: verifySql }));
  console.log('HTTP', r2.status);
  console.log(r2.body.slice(0, 2000));
  if (!r2.body.includes('PASS') || r2.body.includes('FAIL')) failed = true;
} catch (e) {
  failed = true;
  console.error('执行失败:', String(e.message).slice(0, 300));
}
console.log('\n凭据文件保留在 .secrets/supabase-pat.txt（后续迁移还要用）。');
process.exit(failed ? 1 : 0);
