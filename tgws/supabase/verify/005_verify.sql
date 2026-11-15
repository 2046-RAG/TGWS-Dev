-- Verification for migration 005
-- Run AFTER 005_fix_leads_rls.sql in Supabase SQL Editor.
-- Read-only: it selects from catalogs only.

-- 1. Tables must exist.
--    Expect: leads = leads, search_logs = search_logs (not null).
SELECT to_regclass('public.leads')       AS leads,
       to_regclass('public.search_logs') AS search_logs;

-- 2. The broken column must NOT exist.
--    Expect: 0.
SELECT count(*) AS leads_user_id_columns_should_be_0
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'leads'
  AND column_name  = 'user_id';

-- 3. Policies.
--    Expect 3 on leads + 3 on search_logs:
--      leads:        Users can create leads / Users can view own leads / Admins can update leads
--      search_logs:  Users can create search logs / Users can view own search logs / Admins can view all search logs
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'search_logs')
ORDER BY tablename, policyname;

-- 4. RLS must be enabled on both tables.
--    Expect: rowsecurity = true for both.
SELECT relname, relrowsecurity
FROM pg_class
WHERE oid IN ('public.leads'::regclass, 'public.search_logs'::regclass);

-- 5. updated_at trigger.
--    Expect: update_leads_updated_at.
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.leads'::regclass
  AND NOT tgisinternal;

-- 6. Functional smoke test (optional; runs as the SQL Editor role, bypasses RLS).
--    Uncomment to confirm INSERT + cascade works, then rollback.
-- BEGIN;
--   INSERT INTO leads (search_query, email, gap_description)
--   VALUES ('verify-005', 'verify@example.com', 'migration smoke test')
--   RETURNING id, status, created_at;
-- ROLLBACK;

-- 7. RLS behaviour test (optional; requires a real user JWT).
--    Replace <uuid> with an auth.users id that has a matching public.users row.
-- SET LOCAL role authenticated;
-- SET LOCAL request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}';
--   SELECT count(*) FROM leads;          -- expect only rows assigned to <uuid> (or all, if admin)
-- RESET role;
