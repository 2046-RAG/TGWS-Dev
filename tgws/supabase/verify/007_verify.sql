-- 007 线上核对：Supabase SQL Editor 粘贴运行
SELECT CASE WHEN count(*) = 4 THEN 'PASS' ELSE 'FAIL' END AS "策略数(应为4)",
       count(*) AS actual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_comments';

SELECT CASE WHEN relrowsecurity THEN 'PASS' ELSE 'FAIL' END AS "RLS已启用"
FROM pg_class WHERE oid = 'public.ticket_comments'::regclass;

SELECT cmd, policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_comments'
ORDER BY cmd, policyname;
