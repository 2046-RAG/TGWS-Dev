// Local harness for migration 006 (T-057). Runs 001 -> 002 -> 005 -> 006
// against an in-memory Postgres (PGlite) and asserts the auth.users ->
// public.users sync, backfill, idempotency and the tickets FK.
//
// Not part of the app build. To run (PGlite must already be available):
//   mkdir -p /tmp/pgtest && cd /tmp/pgtest && npm i @electric-sql/pglite
//   node <path-to-this-file>
//
// This harness does NOT need network access or any credential.

import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIG = process.env.TGWS_MIG || path.resolve(here, '..', 'migrations');
const read = (f) => fs.readFileSync(path.join(MIG, f), 'utf8');

const db = new PGlite();
let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!ok) failures++;
}

// Minimal Supabase-like auth scaffolding
await db.exec(`
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY, email text);
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
`);

await db.exec(read('001_initial_schema.sql'));
await db.exec(read('002_add_occurred_at.sql'));
await db.exec(read('005_fix_leads_rls.sql'));
console.log('baseline 001/002/005 applied');

// An account that registered BEFORE the trigger existed
const hist = '11111111-1111-1111-1111-111111111111';
await db.exec(`INSERT INTO auth.users (id, email) VALUES ('${hist}', 'old@example.com');`);

await db.exec(read('006_add_user_sync.sql'));
console.log('006 applied');

const backfill = await db.query(
  `SELECT id, email, role FROM public.users WHERE id = '${hist}'`
);
check('历史用户被回填', backfill.rows.length === 1 &&
  backfill.rows[0].email === 'old@example.com' &&
  backfill.rows[0].role === 'customer', JSON.stringify(backfill.rows[0] || {}));

// A brand-new registration AFTER the trigger
const fresh = '22222222-2222-2222-2222-222222222222';
await db.exec(`INSERT INTO auth.users (id, email) VALUES ('${fresh}', 'new@example.com');`);
const trig = await db.query(
  `SELECT id, email, role FROM public.users WHERE id = '${fresh}'`
);
check('新注册自动生成 users 行', trig.rows.length === 1 &&
  trig.rows[0].role === 'customer', JSON.stringify(trig.rows[0] || {}));

// Idempotency: run 006 a second time
let idem = true;
try {
  await db.exec(read('006_add_user_sync.sql'));
} catch (e) {
  idem = false;
  console.log('  重复执行报错:', String(e.message).split('\n')[0]);
}
check('重复执行 006 不报错', idem);
const dup = await db.query(
  `SELECT count(*)::int AS n FROM public.users WHERE id = '${fresh}'`
);
check('重复执行未产生重复行', dup.rows[0].n === 1, `n=${dup.rows[0].n}`);

// Function + trigger presence
const fn = await db.query(
  `SELECT to_regprocedure('public.handle_new_user()') IS NOT NULL AS ok`
);
check('handle_new_user 函数存在', fn.rows[0].ok === true);
const tr = await db.query(
  `SELECT count(*)::int AS n FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND tgname = 'on_auth_user_created' AND NOT tgisinternal`
);
check('触发器已挂载 auth.users', tr.rows[0].n === 1, `n=${tr.rows[0].n}`);

// End-to-end: the freshly registered user can now create a ticket
let fk = true, fkErr = '';
try {
  await db.exec(`INSERT INTO tickets (user_id, ticket_number, subject)
    VALUES ('${fresh}', 'TEST-006-001', 'trigger check');`);
} catch (e) {
  fk = false;
  fkErr = String(e.message).split('\n')[0];
}
check('新用户可建工单（FK 不再报错）', fk, fkErr);

// Known boundary: an account with no email is intentionally skipped
const noMail = '33333333-3333-3333-3333-333333333333';
await db.exec(`INSERT INTO auth.users (id, email) VALUES ('${noMail}', NULL);`);
const skipped = await db.query(
  `SELECT count(*)::int AS n FROM public.users WHERE id = '${noMail}'`
);
check('无邮箱账号不建档案（已知边界，非失败）', skipped.rows[0].n === 0, `n=${skipped.rows[0].n}`);

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
