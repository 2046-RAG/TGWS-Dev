-- ===========================================================================
-- 009_attachment_private_bucket.sql — 附件桶私有化（2026-11-16）
--
-- 为什么单独一个迁移：
--   把桶从 public 改为 private 会让所有旧的公开 URL 立刻失效。只有在
--   签名 URL 代码已经部署到生产之后执行本迁移，才不会有可感知的窗口。
--   表级 RLS 与函数放在 008，与部署顺序无关，可以先跑。
--
-- 执行前置：008 已执行；引用签名 URL 的代码已在生产。
-- 回滚：update storage.buckets set public = true where id = 'ticket-attachments';
--       （storage.objects 策略保留无害）
-- 幂等：可重复执行。
-- ===========================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- G3: 存储桶私有化 + storage.objects 策略
--     对象路径约定：{auth.uid()}/{timestamp}-{filename}
-- ---------------------------------------------------------------------------
UPDATE storage.buckets
SET public = false
WHERE id = 'ticket-attachments';

DROP POLICY IF EXISTS "ticket attachments read own" ON storage.objects;
DROP POLICY IF EXISTS "ticket attachments read staff" ON storage.objects;
DROP POLICY IF EXISTS "ticket attachments write own" ON storage.objects;
DROP POLICY IF EXISTS "ticket attachments delete own" ON storage.objects;

CREATE POLICY "ticket attachments read own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "ticket attachments read staff" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ticket-attachments'
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "ticket attachments write own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- /api/upload 在 DB 元数据写入失败时会回滚（删除）刚上传的对象。
CREATE POLICY "ticket attachments delete own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

COMMIT;
