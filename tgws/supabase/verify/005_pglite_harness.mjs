// Local harness: runs migrations 001 -> 003 (expected failure) -> 005
// against an in-memory Postgres (PGlite), then asserts schema/RLS/trigger.
//
// Not part of the app build. To run:
//   mkdir -p /tmp/pgtest && cd /tmp/pgtest && npm i @electric-sql/pglite
//   node <path-to-this-file>
//
// Note: the anonymous INSERT path is NOT tested here. Testing it requires
// granting the anon role SELECT on public.users (because the leads SELECT
// policy evaluates a users subquery), which would weaken access control in
// the test fixture. Verify that path in Supabase with a real anon key instead.

import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';

const MIG = 'D:/软件集/Vibe Coding/Mimo Space/TGWS/tgws/supabase/migrations';
const read = (f) => fs.readFileSync(path.join(MIG, f), 'utf8');

const db = new PGlite();
const log = (...a) => console.log(...a);
let failures = 0;
function check(name, ok, detail = '') {
  log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
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

// 001 / 002
await db.exec(read('001_initial_schema.sql'));
log('001 applied');
await db.exec(read('002_add_occurred_at.sql'));
log('002 applied');

// 003 — expected to fail on the broken leads policy
let err003 = null;
try {
  await db.exec('BEGIN;\n' + read('003_add_search_tables.sql') + '\nCOMMIT;');
} catch (e) {
  err003 = e.message;
  try { await db.exec('ROLLBACK;'); } catch { /* already aborted */ }
}
check('003 fails as recorded (user_id column missing)', !!err003 && /user_id/.test(err003), (err003 || '').split('\n')[0]);
const after003 = await db.query(`SELECT to_regclass('public.leads')::text AS leads, to_regclass('public.search_logs')::text AS logs`);
check('003 rollback leaves neither table (transaction semantics)', after003.rows[0].leads === null && after003.rows[0].logs === null,
  JSON.stringify(after003.rows[0]));

// 005
await db.exec(read('005_fix_leads_rls.sql'));
log('005 applied');

// Assertions
const t = await db.query(`SELECT to_regclass('public.leads')::text AS leads, to_regclass('public.search_logs')::text AS logs`);
check('leads + search_logs exist', !!t.rows[0].leads && !!t.rows[0].logs, JSON.stringify(t.rows[0]));

const col = await db.query(`SELECT count(*)::int AS n FROM information_schema.columns
  WHERE table_schema='public' AND table_name='leads' AND column_name='user_id'`);
check('leads has no user_id column', col.rows[0].n === 0, `n=${col.rows[0].n}`);

const pol = await db.query(`SELECT tablename, policyname FROM pg_policies
  WHERE schemaname='public' AND tablename IN ('leads','search_logs') ORDER BY tablename, policyname`);
check('6 policies created', pol.rows.length === 6, pol.rows.map(r => `${r.tablename}:${r.policyname}`).join(' | '));
check('no policy references user_id on leads', !pol.rows.some(r => r.tablename === 'leads' && /user_id/.test(r.policyname)) , '');

const rls = await db.query(`SELECT relname, relrowsecurity FROM pg_class
  WHERE oid IN ('public.leads'::regclass,'public.search_logs'::regclass) ORDER BY relname`);
check('RLS enabled on both', rls.rows.every(r => r.relrowsecurity === true), JSON.stringify(rls.rows));

const trg = await db.query(`SELECT tgname FROM pg_trigger WHERE tgrelid='public.leads'::regclass AND NOT tgisinternal`);
check('updated_at trigger exists', trg.rows.some(r => r.tgname === 'update_leads_updated_at'), JSON.stringify(trg.rows));

// Data + RLS behaviour
const cust = '11111111-1111-1111-1111-111111111111';
const admin = '22222222-2222-2222-2222-222222222222';
await db.exec(`
  INSERT INTO auth.users (id, email) VALUES
    ('${cust}','cust@example.com'),
    ('${admin}','admin@example.com');
  INSERT INTO users (id, email, role) VALUES
    ('${cust}','cust@example.com','customer'),
    ('${admin}','admin@example.com','admin');
  INSERT INTO leads (search_query, email, assigned_to) VALUES
    ('q1','c@example.com','${cust}'),
    ('q2','a@example.com','${admin}');
  CREATE ROLE authenticated;
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT SELECT ON leads, users TO authenticated;
`);

const updated = await db.query(`UPDATE leads SET notes='x' WHERE search_query='q1' RETURNING updated_at > created_at AS bumped`);
check('updated_at trigger fires', updated.rows[0]?.bumped === true, JSON.stringify(updated.rows[0]));

await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${cust}',false);`);
const c1 = await db.query(`SELECT count(*)::int AS n FROM leads`);
check('customer sees only own assigned lead', c1.rows[0].n === 1, `n=${c1.rows[0].n}`);

await db.exec(`SELECT set_config('request.jwt.claim.sub','${admin}',false);`);
const c2 = await db.query(`SELECT count(*)::int AS n FROM leads`);
check('admin sees all leads', c2.rows[0].n === 2, `n=${c2.rows[0].n}`);
await db.exec(`RESET ROLE;`);


log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
