# M05 - Tickets 工单系统

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /support, /support/login, /support/register |
| 核心文件 | support/page.tsx (13KB), TicketForm.tsx (15KB), TicketList.tsx (4KB) |
| 组件 | LoginForm.tsx (8KB), RegisterForm.tsx (7KB) |
| 组件大小 | 34KB |
| PRD | [S6] 工单系统 |
| 状态 | ✅ 完成 |

## 页面结构

- **工单仪表板**: /support (需登录，显示工单列表+创建新工单)
- **登录页**: /support/login
- **注册页**: /support/register

## 数据库表

- users, tickets, ticket_attachments, ticket_comments, ticket_audit_log

## API路由

- /api/tickets (CRUD)
- /api/tickets/[id] (单个工单)
- /api/tickets/stats (统计)
- /api/upload (文件上传)
- /api/auth/callback (OAuth回调)
- /api/auth/reset-password (密码重置)

## 关键教训

1. **注册UX修复**: signUp成功后显示验证邮件提示，不直接跳转
2. **导航显示"Tickets"，路由是/support**: i18n nav.support的值是"Tickets"
3. **附件限制**: 代码允许50MB，PRD写10MB(已更新)

## 相关Session

- S52: Ticket注册修复(#2)完成
