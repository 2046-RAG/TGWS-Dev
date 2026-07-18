# M05 - Tickets 工单系统

> **状态**：75%（基于源码事实评估，详见 spec.md §7.5）— Wave 1 修复了 P0 致命问题

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /support, /support/login, /support/register, /support/reset-password, /support/tickets/[id] |
| 核心文件 | support/page.tsx (13KB), TicketForm.tsx (15KB), TicketList.tsx (4KB), tickets/[id]/page.tsx + TicketDetailClient.tsx |
| 组件 | LoginForm.tsx (8KB), RegisterForm.tsx (7KB), ResetPasswordForm.tsx (新增 W1-2) |
| 组件大小 | 34KB+ |
| PRD | [S6] 工单系统 |
| 完成度 | 75% |

## 页面结构（Wave 1 后完整）

- **工单仪表板**: /support (需登录，显示工单列表 + 创建新工单)
- **登录页**: /support/login（已登录自动跳 /support）
- **注册页**: /support/register（已登录自动跳 /support）
- **密码重置页**: /support/reset-password（W1-2 新增，设置新密码表单）
- **工单详情页**: /support/tickets/[id]（W1-3 新增，含 admin 状态变更 UI）

## 数据库表

- users, tickets, ticket_attachments, ticket_comments, ticket_audit_log
- 迁移：`001_init.sql`, `002_add_audit_log.sql`, `003_add_idempotency_key.sql`（W1-3）

## API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| /api/tickets | GET, POST | 工单 CRUD（含 idempotency_key + 事务包装 + 字段校验） |
| /api/tickets/[id] | GET, PATCH, POST | 工单详情 + admin 状态变更（字段级角色白名单） |
| /api/tickets/stats | GET | 工单统计 |
| /api/upload | POST | 文件上传（10MB + 类型白名单 + signed URL + 先校验后上传） |
| /api/auth/callback | GET | OAuth 回调 |
| /api/auth/reset-password | POST | 密码重置（重定向到 /support/reset-password） |

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W1-1 | API 安全加固：CSRF + rate limit + 字段长度校验（subject ≤200, description ≤800）+ enum 校验 + PATCH 字段级角色白名单（非 admin 不可改 status/priority/assigned_to） | api/tickets/, api/upload/ |
| W1-2 | 新建 `/support/reset-password` 页面 + `ResetPasswordForm.tsx`；修复 `LoginForm.tsx:50` redirectTo → `${origin}/${locale}/support/reset-password`；middleware 路由保护（`/support/*` 未登录跳 login） | LoginForm.tsx, support/reset-password/, lib/supabase/middleware.ts |
| W1-3 | **工单详情页** `/support/tickets/[id]` + `TicketDetailClient.tsx`；admin 状态变更 UI；幂等键（uuid v4）+ 后端去重；工单号 6 字符 base36 + 碰撞重试 3 次；ticket insert + audit log + email 事务包装（补偿动作）；i18n + "PHT" 时区修复（用 `Intl.DateTimeFormat`） | tickets/[id]/, TicketForm.tsx, TicketList.tsx, api/tickets/route.ts |
| W2-3 | `TicketList.tsx` "Submit a ticket to get started" 硬编码英文修复 | TicketList.tsx |
| W2-4 | `TicketForm` 接入 `useAutoSave` 完整 API（含 restoredDraft/acceptDraft/discardDraft）+ beforeunload flush；`support/page.tsx` 工单列表用 `useOfflineCache` + staleness 指示器 | TicketForm.tsx, support/page.tsx |
| W4-6 | 删除 `support/page.tsx:7` 死 `Breadcrumb` import | support/page.tsx |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | 同 idempotency_key 两次提交工单返回同一工单号（线上验证） | ⏳ 部署后人工抽查（F-5） |
| 2 | Odoo CRM 凭证未配置 | ⏳ 待用户配置（F-6） |

## 关键教训

1. **注册 UX 修复**：signUp 成功后显示验证邮件提示，不直接跳转
2. **导航显示 "Tickets"，路由是 /support**：i18n nav.support 的值是 "Tickets"
3. **附件限制统一**：代码改 10MB（W1-1），与 PRD S2.5 一致（之前代码允许 50MB 与 PRD 冲突）
4. **幂等键设计**：前端 uuid v4 + 后端按 `idempotency_key` 去重，避免网络抖动重试创建重复工单（AGENTS #8）
5. **事务包装**：ticket insert + audit log + email 三步用补偿动作（email 失败不回滚工单，AGENTS #9）

## 相关 Session

- S52: Ticket 注册修复（#2）完成
- W1-3: 工单系统补完（2026-07-19）
