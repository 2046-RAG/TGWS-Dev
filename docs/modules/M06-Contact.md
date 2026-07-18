# M06 - Contact 联系我们

> **状态**：80%（基于源码事实评估，详见 spec.md §7.6）

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /contact |
| 核心文件 | contact/page.tsx (11KB) |
| 组件大小 | 24KB |
| PRD | [S13] 联系我们 |
| 完成度 | 80% |

## 页面结构

- **联系表单**：姓名、邮箱、公司、电话、消息
- **Resend 集成**：表单提交后发送通知邮件
- **Odoo 非阻塞同步**：W2-4 改为入库 `contact_submissions` + 立即返回，Odoo 同步入队（用 `setImmediate` + `useRetry`）
- **OpenStreetMap iframe**：马尼拉办公室坐标 (14.6497, 121.0501)
- **社交媒体链接**：LinkedIn / WhatsApp（W4-4 集中到 `lib/config.ts`）

## API 路由

- /api/contact (POST，含 CSRF + rate limit 5 req/min/IP)

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W1-1 | /api/contact 加 CSRF token 验证 + rate limit（5 req/min/IP） | api/contact/route.ts |
| W2-3 | `contact/page.tsx:64` 面包屑 "Contact Us" 硬编码英文修复（W2-1 Breadcrumb locale 自动获取后已自动） | contact/page.tsx |
| W2-4 | /api/contact 改非阻塞：先入库 `contact_submissions` + 立即返回，Odoo 同步入队（`setImmediate` + `useRetry`）；成功后回写 `odoo_synced = true` | api/contact/route.ts, lib/odoo.ts |
| W4-6 | **删除 `contact/ContactPage.tsx` + `ContactPage.test.tsx`**（166 行死代码，page.tsx 的剥离副本，无样式、无地图、无社交） | contact/ |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | 办公室标签写 "台北/香港" 但 OSM 坐标指向马尼拉 | 🟡 待修正标签或移除 |
| 2 | Odoo CRM 凭证未配置 | ⏳ 待用户配置（F-6） |

## 关键教训

1. **Resend 配置**：`from: 'TechGuru Support <support@techguru-it.asia>'`
2. **Odoo CRM 集成**：W2-4 改为异步队列模式，避免 Odoo 慢导致联系表单挂起；用 `useRetry` 包装 `createOdooLead`（maxRetries=3）
3. **死代码反模式**：`ContactPage.tsx` 是重构中途放弃留下的剥离副本，应在一开始就删除（AGENTS #33 修 bug 不要动正常功能 + W4-6 死代码清理）

## 相关 Session

- W2-4: Odoo 非阻塞同步（2026-07-19）
- W4-6: ContactPage 死代码清理（2026-07-19）
