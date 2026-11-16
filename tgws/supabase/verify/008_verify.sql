-- 008 线上核对：Supabase SQL Editor 粘贴运行（只读，不改数据）
-- 每一项输出 PASS / FAIL，可逐行核对。
-- 注意：本文件只核对表级 RLS 与函数；桶私有化与 storage 策略见 009_verify.sql。

-- 1) 审计表 RLS 必须已启用（001 的遗漏点）
SELECT CASE WHEN relrowsecurity THEN 'PASS' ELSE 'FAIL' END AS "1 RLS已启用(ticket_audit_log)"
FROM pg_class WHERE oid = 'public.ticket_audit_log'::regclass;

-- 2) 审计表策略：只应有 SELECT + INSERT 两条，且不得有 UPDATE/DELETE
SELECT CASE WHEN count(*) = 2 THEN 'PASS' ELSE 'FAIL' END AS "2 策略数应为2",
       count(*) AS actual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_audit_log';

SELECT CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS "2b 不得有UPDATE/DELETE策略"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_audit_log'
  AND cmd IN ('UPDATE', 'DELETE');

-- 2c) 审计写入必须校验操作人（旧策略缺这一条，可伪造 performed_by）
SELECT CASE
         WHEN bool_and(with_check LIKE '%performed_by%') THEN 'PASS'
         ELSE 'FAIL'
       END AS "2c 审计写入校验操作人"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_audit_log' AND cmd = 'INSERT';

SELECT cmd, policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_audit_log'
ORDER BY cmd, policyname;

-- 3) 附件表：客户 INSERT + admin INSERT + admin SELECT 均已存在
SELECT CASE WHEN count(*) FILTER (WHERE cmd = 'INSERT') = 2 THEN 'PASS' ELSE 'FAIL' END AS "3 附件INSERT策略应为2",
       count(*) FILTER (WHERE cmd = 'SELECT') AS "SELECT策略数(应≥2)"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_attachments';

SELECT cmd, policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ticket_attachments'
ORDER BY cmd, policyname;

-- 4) 四个 SECURITY DEFINER 函数存在
SELECT CASE WHEN count(*) = 4 THEN 'PASS' ELSE 'FAIL' END AS "4 函数应为4"
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'reopen_ticket_on_customer_reply',
    'get_ticket_owner_email',
    'get_staff_emails',
    'is_staff_user'
  );

-- 5) 审计表现有数据仍在（迁移不应丢历史）
SELECT count(*) AS "审计历史行数" FROM public.ticket_audit_log;
