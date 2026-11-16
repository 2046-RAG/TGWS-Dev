-- ===========================================================================
-- 008_ticket_hardening.sql — 工单模块加固（2026-11-16）
--
-- 与最初版本的差别（重要）：
--   原版基于迁移文件推断"审计表未启用 RLS、附件表无 INSERT 策略"。
--   2026-11-16 10:30 用 Supabase 个人访问令牌实测生产库，结论不同：
--     · ticket_audit_log RLS 已启用，有 1 条 SELECT + 2 条 INSERT，无 UPDATE/DELETE
--     · ticket_attachments 已有客户/admin 的 INSERT 与 SELECT 策略，条件正确
--     · storage.objects 对 ticket-attachments 没有任何策略（附件上传失败的真因）
--   因此本迁移不再"从零补策略"，而是：
--     1) 收紧审计写入：两条旧 INSERT 策略都不校验 performed_by，
--        意味着可以伪造"某操作是别人做的"。改为 performed_by = auth.uid()。
--     2) 附件表策略按线上实际名字重建，保持语义不变（幂等，便于新环境）。
--     3) 新增 4 个 SECURITY DEFINER 函数，修复状态邮件/回复通知/客户重开/指派校验。
--
-- 附件存储层（storage.objects 无策略、桶为 public）在 009_attachment_private_bucket.sql。
--
-- 幂等：可重复执行。
-- 安全：整体包在事务里，任何一步失败全部回滚。
-- ===========================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0) 确保审计表 RLS 开启（线上已为 true，此处仅为新环境兜底）
-- ---------------------------------------------------------------------------
ALTER TABLE public.ticket_audit_log ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 1) 审计日志：读取保持 admin 专属；写入必须绑定真实操作人
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view audit log" ON public.ticket_audit_log;
DROP POLICY IF EXISTS "Admins read ticket audit log" ON public.ticket_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.ticket_audit_log;
DROP POLICY IF EXISTS "Users can insert audit log for own tickets" ON public.ticket_audit_log;
DROP POLICY IF EXISTS "Insert audit trail for accessible tickets" ON public.ticket_audit_log;

-- 读取：只有管理端能看审计时间线（客户永远拿不到）。
CREATE POLICY "Admins can view audit log" ON public.ticket_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'super_admin')
        AND u.deleted_at IS NULL
    )
  );

-- 写入：performed_by 必须是调用者本人（旧策略缺这一条，可伪造操作人）；
-- 同时要求调用者对目标工单有访问权（本人工单或管理员）。
-- 不建 UPDATE / DELETE 策略：审计记录只能追加。
CREATE POLICY "Insert audit trail for accessible tickets" ON public.ticket_audit_log
  FOR INSERT WITH CHECK (
    performed_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE t.id = ticket_audit_log.ticket_id
        AND t.deleted_at IS NULL
        AND (
          t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- 2) 附件表：按线上现名重建，语义不变（客户只能挂自己的工单，admin 不限）
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert attachments for own tickets" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Admins can insert attachments for any ticket" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Admins can view all attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can insert own attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Admins can insert attachments" ON public.ticket_attachments;

CREATE POLICY "Users can insert attachments for own tickets" ON public.ticket_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_attachments.ticket_id
        AND t.user_id = auth.uid()
        AND t.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can insert attachments for any ticket" ON public.ticket_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'super_admin')
        AND u.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can view all attachments" ON public.ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'super_admin')
        AND u.deleted_at IS NULL
    )
  );

-- ---------------------------------------------------------------------------
-- 3) 客户回复推进工单状态
--    客户没有 tickets 的 UPDATE 策略（线上仅有 "Admins can update all tickets"），
--    因此"客户回复后工单从 resolved/closed 回到 in_progress"必须走 definer 函数。
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reopen_ticket_on_customer_reply(p_ticket_id uuid)
RETURNS TABLE (new_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user   uuid := auth.uid();
  v_status text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT t.status INTO v_status
  FROM public.tickets t
  WHERE t.id = p_ticket_id
    AND t.user_id = v_user
    AND t.deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ticket not found';
  END IF;

  IF v_status IN ('resolved', 'closed') THEN
    UPDATE public.tickets
    SET status      = 'in_progress',
        resolved_at = NULL,
        updated_at  = now(),
        version     = COALESCE(version, 0) + 1
    WHERE id = p_ticket_id;

    INSERT INTO public.ticket_audit_log (ticket_id, action, old_value, new_value, performed_by)
    VALUES (
      p_ticket_id,
      'status_changed',
      json_build_object('status', v_status)::text,
      json_build_object('status', 'in_progress')::text,
      v_user
    );

    RETURN QUERY SELECT 'in_progress'::text;
  ELSE
    -- 已经是 open/in_progress：只刷新 updated_at，让工单在后台列表浮起。
    UPDATE public.tickets
    SET updated_at = now()
    WHERE id = p_ticket_id;

    RETURN QUERY SELECT v_status;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reopen_ticket_on_customer_reply(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reopen_ticket_on_customer_reply(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4) 状态变更通知工单所有者
--    users 表只有 "view own profile" 策略，管理员改客户工单时读不到 owner 邮箱，
--    状态变更邮件因此一直发不出。此函数只在调用者已能访问该工单时返回邮箱。
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_ticket_owner_email(p_ticket_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email::text
  FROM public.tickets t
  JOIN public.users u ON u.id = t.user_id
  WHERE t.id = p_ticket_id
    AND t.deleted_at IS NULL
    AND (
      t.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users me
        WHERE me.id = auth.uid() AND me.role IN ('admin', 'super_admin')
      )
    );
$$;

REVOKE ALL ON FUNCTION public.get_ticket_owner_email(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ticket_owner_email(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5) 指派目标校验：只回答"这个 id 是不是有效员工"，不返回任何资料
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff_user(p_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_id
      AND u.role IN ('admin', 'super_admin')
      AND u.deleted_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff_user(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6) 客户回复时通知管理员：只暴露 staff email，不放开 users 表行级读取
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_staff_emails()
RETURNS TABLE (email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email::text
  FROM public.users u
  WHERE u.role IN ('admin', 'super_admin')
    AND u.deleted_at IS NULL
    AND u.email IS NOT NULL
    AND u.email <> '';
$$;

REVOKE ALL ON FUNCTION public.get_staff_emails() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_staff_emails() TO authenticated;

COMMIT;
