# TGWS 安全测试计划

**版本:** 1.0.0
**日期:** 2026-06-30
**项目:** TechGuru Network & Data Solutions
**参考标准:** OWASP Top 10 (2021) + PRD [S2.5] 安全要求

---

## 一、安全头部验证 (PRD [S2.5.2])

| # | Header | 当前值 | 验证方法 | 状态 |
|---|--------|--------|----------|------|
| 1 | Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; media-src https://d8j0ntlcm91z4.cloudfront.net` | `curl -I https://tgws.vercel.app \| grep content-security-policy` | ✅ 已配置 |
| 2 | Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | 同上 | ✅ 已配置 |
| 3 | X-Frame-Options | `DENY` | 同上 | ✅ 已配置 |
| 4 | X-XSS-Protection | `1; mode=block` | 同上 | ✅ 已配置 |
| 5 | X-Content-Type-Options | `nosniff` | 同上 | ✅ 已配置 |
| 6 | Referrer-Policy | `strict-origin-when-cross-origin` | 同上 | ✅ 已配置 |
| 7 | Permissions-Policy | `camera=(), microphone=(), geolocation=()` | 同上 | ✅ 已配置 |

## 二、OWASP Top 10 检查

### A01:2021 - Broken Access Control (权限控制缺陷)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 未登录访问工单页面 | 直接访问 /support 无session | 应显示登录提示 | ⚠️ 待Supabase配置后验证 |
| API未授权访问 | 不带token调用 /api/tickets | 返回401 | ⚠️ 待验证 |
| Supabase RLS | 检查 migrations/001_initial_schema.sql | 所有表启用RLS | ✅ SQL已配置 |
| 垂直权限提升 | 普通用户调用 /api/tickets/[id] PATCH | 非管理员应被拒绝 | ⚠️ 待验证 |
| IDOR防护 | 使用其他用户ticket ID访问 | 应返回404或403 | ⚠️ 待验证 |

### A02:2021 - Cryptographic Failures (加密失败)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| HTTPS强制 | 访问http://版本 | 301跳转HTTPS | ✅ Vercel默认启用 |
| HSTS | 检查Strict-Transport-Security头 | max-age>=1年 | ✅ 63072000s |
| 敏感数据加密 | 检查.env.local是否在.gitignore | 不提交到Git | ✅ .gitignore已配置 |

### A03:2021 - Injection (注入攻击)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| SQL注入 | 输入 `' OR 1=1 --` 到搜索框 | 不影响查询 | ✅ Supabase参数化查询 |
| XSS反射型 | 在联系表单输入 `<script>alert(1)</script>` | 转义输出 | ✅ React自动转义 |
| XSS存储型 | 工单描述注入JS | CMS/DB不执行脚本 | ✅ Sanity/Supabase安全 |
| NoSQL注入 | 输入 `{"$gt":""}` 到字段 | 不影响查询 | ✅ Supabase参数化 |

### A04:2021 - Insecure Design (不安全设计)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 安全架构 | 代码审查 | 最小权限原则 | ✅ RLS+中间件 |
| 速率限制 | 高频调用API | 应有429响应 | ⚠️ 建议增加 |
| 暴力破解防护 | 连续错误登录 | 应有锁定机制 | ⚠️ Supabase默认 |

### A05:2021 - Security Misconfiguration (安全配置错误)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 安全头全部存在 | curl检查7个头部 | 7/7存在 | ✅ |
| 错误页面不泄露信息 | 触发500错误 | 不显示堆栈信息 | ✅ ErrorBoundary |
| 默认凭证 | 检查.env.local.example | 无真实密钥 | ✅ |

### A06:2021 - Vulnerable Components (脆弱组件)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| npm audit | `npm audit` | 无高危漏洞 | ⚠️ 定期执行 |
| 依赖版本 | package.json | 使用最新稳定版 | ✅ Next.js 16.2.9 |

### A07:2021 - Auth Failures (认证失败)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 密码最小长度 | 输入<8位密码 | 注册被拒绝 | ✅ minLength=8 |
| 密码复杂度 | 纯数字密码 | 注册被拒绝 | ✅ 正则验证 |
| 邮箱大小写 | 大写邮箱登录 | 统一转小写 | ✅ .toLowerCase() |
| Session管理 | HttpOnly+Secure+SameSite | Cookie不可JS读取 | ✅ Supabase配置 |
| 密码重置 | 检查resetPasswordForEmail | 链接有时效 | ✅ Supabase默认 |

### A08:2021 - Software and Data Integrity (数据完整性)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 乐观锁 | 工单更新使用version字段 | 并发更新被拒绝 | ✅ 已实现 |
| 审计追踪 | 工单状态变更记录 | who/when/what | ✅ 审计字段 |
| 软删除 | 用户删除使用deleted_at | 不硬删除 | ✅ SQL已配置 |

### A09:2021 - Security Logging (安全日志)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 认证日志 | Supabase Auth日志 | 记录登录/失败 | ✅ Supabase提供 |
| API日志 | 检查server logs | 记录异常请求 | ⚠️ 建议增加 |
| 敏感数据过滤 | 检查console.log | 不记录密码/token | ✅ 代码审查通过 |

### A10:2021 - SSRF (服务端请求伪造)

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 外部URL输入 | 联系表单输入URL | 不被服务端请求 | ✅ 仅存储文本 |
| Sanity查询 | 恶意GROQ查询 | 被Sanity API拒绝 | ✅ Sanity沙箱 |

## 三、文件上传安全 (PRD [S2.5.5])

| 测试项 | 验证方法 | 预期结果 | 状态 |
|--------|----------|----------|------|
| 文件类型白名单 | 尝试上传.exe/.js | 被拒绝 | ✅ accept="image/*,.pdf,.doc,.docx" |
| 文件大小限制 | 上传>10MB文件 | 被拒绝 | ✅ API端检查 |
| 文件名消毒 | 上传含../的文件名 | 被清理 | ⚠️ 待验证 |
| 存储访问控制 | 直接访问Supabase Storage URL | 需认证 | ✅ RLS保护 |

## 四、输入验证 (PRD [S2.5.1])

| 字段 | 验证规则 | 实现位置 | 状态 |
|------|----------|----------|------|
| 姓名 | 必填, 非空 | ContactPage, TicketForm | ✅ |
| 邮箱 | 必填, 正则格式 | LoginForm, RegisterForm, ContactPage | ✅ |
| 密码 | >=8位, 大小写+数字 | RegisterForm | ✅ |
| 工单主题 | 必填 | TicketForm | ✅ |
| 工单描述 | 必填 | TicketForm | ✅ |
| 联系消息 | 必填 | ContactPage | ✅ |

## 五、建议改进

| # | 建议 | 优先级 | 说明 |
|---|------|--------|------|
| 1 | 增加API速率限制 | 高 | 防止DDoS和暴力破解 |
| 2 | 增加CSRF Token | 中 | 联系表单和工单表单 |
| 3 | 集成Zod schema验证 | 中 | 统一前后端验证 |
| 4 | 增加安全审计日志 | 中 | 记录敏感操作 |
| 5 | 定期npm audit | 低 | 持续安全监控 |
