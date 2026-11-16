-- 009 线上核对：Supabase SQL Editor 粘贴运行（只读，不改数据）
-- 前置：009 已执行，且签名 URL 代码已部署。

-- 1) 存储桶必须已转 private
SELECT CASE WHEN COALESCE((SELECT public FROM storage.buckets WHERE id = 'ticket-attachments'), true)
            THEN 'FAIL' ELSE 'PASS' END AS "1 桶为private";

-- 2) storage.objects 策略应为 4 条（读自己 / 读 staff / 写自己 / 删自己）
SELECT CASE WHEN count(*) = 4 THEN 'PASS' ELSE 'FAIL' END AS "2 storage策略应为4",
       count(*) AS actual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'ticket attachments %';

SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'ticket attachments %'
ORDER BY policyname;

-- 3) 桶内对象数量（迁移不改数据，仅作基线记录）
SELECT count(*) AS "对象数量" FROM storage.objects WHERE bucket_id = 'ticket-attachments';
