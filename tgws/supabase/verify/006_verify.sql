-- ===========================================================================
-- 006 线上核对：Supabase SQL Editor 粘贴运行，把输出贴回来即可。
-- ===========================================================================
WITH checks AS (
  SELECT 1 AS ord, 'handle_new_user 函数存在' AS item,
         (to_regprocedure('public.handle_new_user()') IS NOT NULL)::text AS ok
  UNION ALL
  SELECT 2, 'on_auth_user_created 触发器存在',
         ((SELECT count(*) FROM pg_trigger
            WHERE tgrelid = 'auth.users'::regclass
              AND tgname = 'on_auth_user_created'
              AND NOT tgisinternal) = 1)::text
  UNION ALL
  SELECT 3, 'users 表 RLS 已启用',
         (SELECT relrowsecurity::text FROM pg_class WHERE oid = 'public.users'::regclass)
  UNION ALL
  SELECT 4, '有邮箱账号全部有档案',
         ((SELECT count(*) FROM auth.users au
             LEFT JOIN public.users u ON u.id = au.id
            WHERE au.email IS NOT NULL AND au.email <> '' AND u.id IS NULL) = 0)::text
)
SELECT item AS "检查项",
       CASE WHEN ok = 'true' THEN 'PASS' ELSE 'FAIL' END AS "结果"
FROM checks ORDER BY ord;

-- 明细（数量核对，不涉及个人信息明文）
SELECT
  (SELECT count(*) FROM auth.users) AS auth_users,
  (SELECT count(*) FROM public.users) AS public_users,
  (SELECT count(*) FROM auth.users au
     LEFT JOIN public.users u ON u.id = au.id
    WHERE au.email IS NOT NULL AND au.email <> '' AND u.id IS NULL) AS missing_profiles;
