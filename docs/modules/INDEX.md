# TGWS Modules Index

> **状态声明**：本表完成度基于源码事实评估（2026-07-19），非 PRD 标记。
> 评估方法详见 `.trae/specs/audit-tgws-gap-optimization/spec.md` 第 6 章。
> Wave 0-4 已完成；Wave 5（文档同步）进行中。详见 `MEMORY.md` §1。

## 模块总览

| 模块ID | 模块名称 | 路由 | 完成度 | 状态 | 大小 | 备注 |
|--------|----------|------|--------|------|------|------|
| M01 | Home | /home | 80% | ✅ 基本完成 | 20KB | Hero a11y 已修（W0-5）；framer-motion 幽灵依赖待决；首页布局保守，5 区块稳定 |
| M02 | Products | /products/* | 80% | ✅ 基本完成 | 36KB | ProductCard 共享抽取（W2-2）；canonical 标签已加；3 文件去重 |
| M03 | Blog | /blog/* | 80% | ✅ 基本完成 | 26KB | picsum 移除（W0-2）；OG image 改本地兜底；PortableText 增强 |
| M04 | Solutions | /solutions | 75% | ⚠️ 关键修复完成 | 12KB | GROQ 5 字段补齐（W0-1）；`<meta.icon>` JSX bug 修复；中文 Sanity 数据已激活 |
| M05 | Tickets | /support/* | 75% | ⚠️ 关键修复完成 | 34KB | 工单详情页（W1-3）；幂等键 + 事务包装；i18n + 时区修复 |
| M06 | Contact | /contact | 80% | ✅ 基本完成 | 24KB | Odoo 非阻塞同步（W2-4）；ContactPage 死代码清理（W4-6）；面包屑 i18n |
| M07 | About | /about | 80% | ✅ 基本完成 | 6KB | Sanity 迁移完成（W2-5）；teamMember/qualification/timelineEvent 3 schema 注册 |
| M08 | Compare | /compare | 80% | ✅ 基本完成 | 5KB | CompareTable 启用（W4-1）；重复条件 bug 修复；`<caption>` + a11y |
| M09 | VMware Alt | /vmware-alternative | 85% | ✅ 基本完成 | 11KB | phone CTA `tel:`（W4-2）；canonical/alternates；厂商色集中到 `lib/vendor-colors.ts` |
| M10 | Help | /help | 85% | ✅ 基本完成 | 8KB | FAQJsonLd 修正（W4-3）；空状态分场景；300ms debounce |
| M11 | Legal | /privacy, /terms | 80% | ✅ 基本完成 | 5KB | last-updated 构建时（W4-4）；`lib/config.ts` 集中联系信息；TOC + 打印样式 |

**全项目加权完成度：约 70%**（spec.md 评估为 65%，Wave 0-4 修复后接近 70-75%；非 100%）

## 状态图例

- ✅ **基本完成** — 核心功能可用，已知差距已在 Wave 0-4 修复，剩余为待用户决策项或后续优化
- ⚠️ **关键修复完成** — Wave 0-4 修复了 P0 致命问题，仍存在非阻塞型 follow-up（如待用户决策项）
- ❌ **未实现** — 无对应代码

## 全局组件（被多个模块共享）

| 组件 | 文件 | 使用模块 | 状态 |
|------|------|----------|------|
| Navbar | components/layout/Navbar.tsx | 所有页面 | ✅ |
| Footer | components/layout/Footer.tsx | 所有页面 | ✅ |
| MegaMenu | components/layout/MegaMenu.tsx | Navbar | ✅ |
| Breadcrumb | components/ui/Breadcrumb.tsx | M02-M11 | ✅ locale 自动获取（W2-1） |
| DarkModeToggle | components/ui/DarkModeToggle.tsx | Navbar | ⚠️ 设计系统冲突待用户决策 |
| LanguageSwitcher | components/ui/LanguageSwitcher.tsx | Navbar | ✅ |
| JsonLd | components/ui/JsonLd.tsx | M01, M03, M10 | ✅ 修复（W4-5） |
| CookieConsent | components/ui/CookieConsent.tsx | 全局 | ✅ i18n 修复（W2-3） |
| ErrorBoundary | components/ui/ErrorBoundary.tsx | 全局 | ✅ i18n 修复（W2-3） |
| ScrollToTop | components/ui/ScrollToTop.tsx | 全局 | ✅ |
| ScrollReveal | components/ui/ScrollReveal.tsx | 全局 | ✅ |
| FAQAccordion | components/ui/FAQAccordion.tsx | M10 | ✅ |
| HelpText | components/ui/HelpText.tsx | 表单 | ✅ |
| Tooltip | components/ui/Tooltip.tsx | 表单 | ✅ |
| ResetPasswordForm | components/auth/ResetPasswordForm.tsx | M05 | ✅ 新增（W1-2） |
| CompareTable | components/compare/CompareTable.tsx | M08 | ✅ 启用（W4-1） |
| ProductCard shared | components/products/shared.ts | M02 | ✅ 新增（W2-2） |
| TableOfContents | components/legal/TableOfContents.tsx | M11 | ✅ 新增（W4-4） |
| HeroSection | components/hero/HeroSection.tsx | M01 | ✅ a11y 修复（W0-5） |
| TicketForm | components/tickets/TicketForm.tsx | M05 | ✅ 幂等键（W1-3）+ useAutoSave 完整（W2-4） |
| TicketList | components/tickets/TicketList.tsx | M05 | ✅ 行可点击 + i18n 修复（W1-3） |
| LoginForm | components/auth/LoginForm.tsx | M05 | ✅ redirectTo 修复（W1-2） |
| RegisterForm | components/auth/RegisterForm.tsx | M05 | ✅ |

## 全局基础设施

| 模块 | 文件 | 说明 | 状态 |
|------|------|------|------|
| i18n | messages/en.json, zh.json | 多语言（EN + 繁中），923/923 keys 对齐 | ✅ |
| i18n audit | scripts/i18n-audit.mjs | 硬编码审计脚本，`npm run i18n:audit` | ✅ 新增（W2-3） |
| Sanity | lib/sanity.ts, sanity.server.ts | CMS 数据层；RSC 强制用 `sanity.server`（ESLint 规则） | ✅ 统一（W0-4） |
| Sanity Schemas | sanity/schemas/* | 8 个：products / posts / solutions / faq / partners / teamMember / qualification / timelineEvent | ✅ caseStudy 已删（W0-3） |
| Supabase | lib/supabase/* | 数据库 + 认证 + 中间件路由保护 | ✅ middleware 完善（W1-2） |
| CSRF | lib/csrf.ts | 双重提交 cookie 模式 | ✅ 新增（W1-1） |
| Rate Limit | lib/rate-limit.ts | 内存 Map，10 req/min/IP（可配置） | ✅ 新增（W1-1） |
| Config | lib/config.ts | SUPPORT_EMAIL / CONTACT_PHONE / WHATSAPP_URL / LINKEDIN_URL | ✅ 新增（W4-4） |
| Vendor Colors | lib/vendor-colors.ts | VMware 厂商品牌色集中 | ✅ 新增（W4-2） |
| Retry | lib/retry.ts | 指数退避重试 | ✅ |
| SEO | sitemap.ts, robots.ts, JsonLd.tsx | 搜索引擎优化；sitemap 全覆盖（含 products/[slug]） | ✅ 补全（W0-6） |
| Dark Mode | globals.css, DarkModeToggle.tsx | 自动 + 手动三态 toggle | ⚠️ 设计系统冲突待用户决策 |
| Tests | vitest.config.ts, playwright.config.ts | Vitest 295 passing + Playwright 本地 + a11y 扫描 | ✅ 补全（W3-1, W0-7） |
| Build Config | next.config.ts, vercel.json, tsconfig.json, eslint.config.mjs | poweredByHeader / reactStrictMode / 严格 tsconfig / jsx-a11y / security plugins | ✅ 修复（W4-7） |
| globals.css | globals.css | token 化（CSS 变量）+ `@media (prefers-reduced-motion: reduce)` | ✅ 修复（W4-8） |

## 共享 hooks

| Hook | 文件 | 状态 |
|------|------|------|
| useAutoSave | hooks/useAutoSave.ts | ✅ 完整集成（W2-4）：含 restoredDraft/acceptDraft/discardDraft + beforeunload flush |
| useOfflineCache | hooks/useOfflineCache.ts | ✅ 已集成（W2-4）：support/page 工单列表用 |
| useOptimistic | hooks/useOptimistic.ts | ✅ 已集成（W2-4） |
| useRetry | hooks/useRetry.ts | ✅ 已集成（W2-4）：lib/odoo.ts 用 |

## API Routes

| 路由 | 方法 | 说明 | 状态 |
|------|------|------|------|
| /api/auth/callback | GET | OAuth 回调 | ✅ |
| /api/auth/reset-password | POST | 密码重置（重定向到 `/support/reset-password`） | ✅ 修复（W1-2） |
| /api/contact | POST | 联系表单（非阻塞 + Odoo 入队 + useRetry） | ✅ 修复（W1-1, W2-4） |
| /api/products | GET | Sanity 产品列表 | ✅ |
| /api/revalidate | POST | ISR webhook | ✅ |
| /api/tickets | GET, POST | 工单 CRUD（含 idempotency_key + 事务包装 + 字段校验） | ✅ 修复（W1-1, W1-3） |
| /api/tickets/[id] | GET, PATCH, POST | 工单详情 + admin 状态变更（字段级角色白名单） | ✅ 修复（W1-1, W1-3） |
| /api/tickets/stats | GET | 工单统计 | ✅ |
| /api/upload | POST | 文件上传（10MB + 类型白名单 + signed URL + 先校验后上传） | ✅ 修复（W1-1） |

## Review工作流

**用户说**："review Home模块"

**Agent执行**：
```
1. Read(docs/modules/INDEX.md)           # 定位 M01
2. Read(docs/modules/M01-Home.md)        # 模块详情
3. Read(MEMORY.md) §1 / §2 / §3          # 当前状态 + 待办 + 已完成
4. 总计: ~15KB
```

## 文档维护规则

1. **模块文档更新时机**：模块有重大变更时更新对应文档（W5-1.5 同步 Wave 0-4 改动）
2. **MEMORY.md 保留**：当前状态 + 待办 + 核心规则（详见 `/workspace/MEMORY.md`）
3. **历史 session 记录**：保留在 MEMORY.md §7 历史教训索引中，不单独分割
4. **状态源优先级**：MEMORY.md（真实状态） > AGENTS.md（规则约束） > PRD（设计权威）— 详见 AGENTS #40
5. **文档同步检查清单**（AGENTS #41）：每次同步必须检查 (1) AGENTS Open Items 与 MEMORY 一致 (2) PRD [S22] 与 MEMORY 一致 (3) MEMORY 待办标记最新 (4) 过期文档标记
