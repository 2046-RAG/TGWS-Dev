# TGWS Project - TechGuru Network & Data Solutions

## Project Structure

- Root directory: `D:\软件集\Mimo\WorkSpace\TGWS`
- PRD document: `PRD-TechGuru-Website.md` (source of truth)
- All project-level markdown files stored in root directory

## Specs-Driven Development

This project follows **Specs-driven Development**. The PRD is the canonical source of truth.

### Workflow

1. **PRD is authoritative** - All implementation decisions must trace back to PRD sections [S1]-[S22]
2. **Section-based development** - Implement features by PRD section, not by arbitrary task grouping
3. **Harness constraints** - Code changes must not violate PRD-defined boundaries

### PRD Section Reference

| Section | Content | Priority |
|---------|---------|----------|
| [S1] | 项目概述 - 企业背景、定位、品牌口号 | Foundation |
| [S2] | 技术架构 - 技术栈、多语言、SEO、安全 | Foundation |
| [S3] | 产品归类 - Build/Run/Protect | Core |
| [S4] | 网站架构 - 页面结构、导航 | Core |
| [S5] | Hero Section - 视频背景、打字机效果 | Core |
| [S6] | 工单系统 - 认证、提交、管理 | Feature |
| [S7] | Odoo CRM集成 | Integration |
| [S8] | CMS内容管理 - Sanity配置 | Integration |
| [S9] | 设计规范 - 色彩、字体、特效 | Design |
| [S10] | 行业解决方案 | Content |
| [S11] | 案例展示 | Content |
| [S12] | 新闻博客 | Feature |
| [S13] | 联系我们 | Feature |
| [S14] | 关于我们 | Content |
| [S15] | 免费额度汇总 | Reference |
| [S16] | VMware替代方案 | Feature |
| [S17] | 数据模型 | Foundation |
| [S18] | API设计 | Foundation |
| [S19] | 无障碍要求 | Design |
| [S20] | 浏览器兼容性 | Reference |
| [S21] | 测试策略 | Quality |
| [S22] | 开放问题 | Reference |

## Tech Stack

| Component | Choice | Purpose |
|-----------|--------|---------|
| Framework | Next.js (App Router) | SSR/SSG, Vercel optimized |
| CMS | Sanity | Content management, real-time |
| Database | Supabase | Users, tickets storage |
| Auth | Supabase Auth | Gmail OAuth + email/password |
| Storage | Supabase Storage | Ticket attachments |
| Email | Resend | Notification emails |
| UI | Tailwind CSS | Styling (components hand-written, no shadcn/ui) |
| Deployment | Vercel | Hosting + CDN |
| Language | TypeScript | Type safety |

## Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint check
npm run typecheck    # TypeScript check

# Testing (to be configured)
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
```

## Conventions

### File Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── globals.css             # Global styles + CSS classes
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Root redirect to /[locale]
│   ├── robots.ts               # SEO robots.txt
│   ├── sitemap.ts              # SEO sitemap
│   ├── [locale]/               # i18n routing (en/zh)
│   │   ├── page.tsx            # Home → re-exports home/page.tsx
│   │   ├── layout.tsx          # Locale layout (next-intl provider)
│   │   ├── error.tsx           # Error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   ├── home/               # Home page components
│   │   ├── products/           # Products listing
│   │   ├── solutions/          # Industry solutions (6 industries)
│   │   ├── case-studies/       # Case studies + [slug] detail
│   │   ├── blog/               # Blog listing + [slug] detail
│   │   ├── about/              # About us
│   │   ├── contact/            # Contact form
│   │   ├── support/            # Support portal
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Register page
│   │   ├── compare/            # VMware comparison page
│   │   ├── vmware-alternative/ # VMware alternatives page
│   │   ├── help/               # Help center
│   │   ├── privacy/            # Privacy policy
│   │   └── terms/              # Terms of service
│   └── api/                    # API routes
│       ├── auth/
│       │   ├── callback/       # OAuth callback
│       │   └── reset-password/ # Password reset
│       ├── contact/            # Contact form submission
│       ├── products/           # Sanity product listing
│       ├── revalidate/         # ISR revalidation (Sanity webhook)
│       ├── tickets/            # Ticket CRUD
│       │   ├── stats/          # Ticket statistics
│       │   └── [id]/           # Ticket detail/update
│       └── upload/             # File upload to Supabase Storage
├── components/                 # Reusable components
│   ├── auth/                   # Authentication
│   │   ├── LoginForm.tsx       # Email/password + OAuth login
│   │   └── RegisterForm.tsx    # New account registration
│   ├── compare/                # VMware comparison
│   │   └── CompareTable.tsx    # Feature comparison table
│   ├── hero/                   # Hero section
│   │   └── HeroSection.tsx     # Video background + typewriter
│   ├── layout/                 # Layout components
│   │   ├── Footer.tsx          # 4-column dark footer
│   │   ├── MegaMenu.tsx        # Desktop dropdown mega menu
│   │   └── Navbar.tsx          # Fixed glass-morphism nav
│   ├── tickets/                # Ticket system
│   │   ├── TicketForm.tsx      # Ticket submission form
│   │   └── TicketList.tsx      # User ticket list
│   └── ui/                     # Shared UI components
│       ├── Breadcrumb.tsx      # Breadcrumb navigation
│       ├── CookieConsent.tsx   # GDPR cookie consent banner
│       ├── DarkModeToggle.tsx  # Light/dark/system theme toggle
│       ├── ErrorBoundary.tsx   # React error boundary
│       ├── FAQAccordion.tsx    # Collapsible FAQ items
│       ├── HelpText.tsx        # Inline help text with icon
│       ├── JsonLd.tsx          # SEO structured data
│       ├── LanguageSwitcher.tsx # EN/ZH language toggle
│       ├── ScrollReveal.tsx    # IntersectionObserver reveal
│       ├── ScrollToTop.tsx     # Back-to-top button
│       └── Tooltip.tsx         # Hover tooltip
├── hooks/                      # Custom React hooks
│   ├── useAutoSave.ts          # Auto-save form data to localStorage
│   ├── useOfflineCache.ts      # Offline data caching
│   ├── useOptimistic.ts        # Optimistic UI updates
│   └── useRetry.ts             # Retry with exponential backoff
├── i18n/                       # Internationalization config
│   ├── config.ts               # i18n configuration
│   └── request.ts              # Request locale resolution
├── lib/                        # Utilities and clients
│   ├── odoo.ts                 # Odoo CRM integration
│   ├── resend.ts               # Resend email client
│   ├── sanity.ts               # Sanity client (browser)
│   ├── sanity.image.ts         # Sanity image URL builder
│   ├── sanity.server.ts        # Sanity client (server)
│   └── supabase/               # Supabase clients
│       ├── client.ts           # Browser client
│       ├── middleware.ts       # Auth middleware
│       └── server.ts           # Server client
├── messages/                   # i18n translation files
│   ├── en.json                 # English translations
│   └── zh.json                 # Traditional Chinese translations
└── test/                       # Test setup
    └── setup.ts                # Vitest setup
```

### Naming Conventions

- Components: PascalCase (`HeroSection.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- Types/Interfaces: PascalCase with `I` prefix optional (`Ticket`, `IUser`)

### Security Requirements (PRD [S2.5])

**CRITICAL**: All code must comply with security measures in PRD section 2.5:

- Input validation on all user inputs
- Parameterized queries only (no string concatenation)
- CSP headers configured
- File uploads validated (type whitelist, 50MB limit)
- Session cookies: HttpOnly + Secure + SameSite
- No sensitive data in logs or error responses

### Multi-Language (PRD [S2.2])

- Routes: `/en/...` (English), `/zh/...` (Traditional Chinese)
- Default: English (`/` redirects to `/en`)
- Content managed via Sanity multi-language fields
- Use `next-intl` or similar for i18n

## Design Context

### Design System Files

| File | Purpose |
|------|---------|
| `tgws/DESIGN.md` | Color system, typography, spacing, animations, accessibility, responsive rules |
| `tgws/COMPONENTS.md` | Component inventory, props, patterns, shared conventions |
| `tgws/src/app/globals.css` | All CSS classes (`.card`, `.glass`, `.glow`, `.btn-primary`, `.btn-secondary`, animations) |

### Design Principles

- **Restrained**: Tinted neutrals + cyan accent, accent color stays ≤10% of surface area
- **Professional**: Enterprise IT — not a startup, not a toy
- **Progressive enhancement**: Content visible without JS; animations are enhancement
- **Accessibility-first**: WCAG 2.1 AA compliance throughout
- **Light theme primary**: Auto dark mode via `prefers-color-scheme: dark`, no manual toggle

### Color Tokens (from globals.css)

| Token | Value | Role |
|-------|-------|------|
| `--color-primary` | `#00D4FF` | CTAs, links, focus rings, accents |
| `--color-accent` | `#7B61FF` | Secondary accent (Run pillar) |
| `--color-surface` | `#FAFAFA` | Card backgrounds |
| `--color-background` | `#F4F4F5` | Page background |
| `--color-foreground` | `#18181B` | Primary text |

### Font Stack

| Role | Font | CSS Variable |
|------|------|-------------|
| Heading | HelveticaNowDisplay-Medium | `var(--font-heading)` |
| Body | HelveticaNowDisplayW01-Rg | `var(--font-body)` |
| Mono | JetBrains Mono | `var(--font-mono)` |

### Key Design Rules

1. **Accent restraint**: Primary color `#00D4FF` stays ≤10% of any surface area
2. **Pill buttons**: All primary/secondary buttons use `border-radius: 9999px`
3. **Card hover**: `translateY(-2px)` with cyan border glow — respects `prefers-reduced-motion`
4. **Focus rings**: `box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #00D4FF` (double ring)
5. **Touch targets**: 44px minimum on mobile (WCAG 2.5.8)
6. **Dark mode**: Automatic via `prefers-color-scheme: dark` — no manual toggle
7. **Form inputs**: Consistent `bg-gray-50 border-gray-200 rounded-lg` with `focus:border-[#00D4FF]`
8. **Icons**: Lucide React, sizes 14–32px depending on context
9. **Progressive enhancement**: Content visible without JS; animations are enhancement via `.js-loaded` class
10. **Reduced motion**: All animations disabled via `@media (prefers-reduced-motion: reduce)`

### Brand Personality

- **Professional**: Enterprise IT, not a startup
- **Technical**: Code-forward, infrastructure-focused
- **Reliable**: Trust signals, partner logos, case studies
- **Anti-patterns**: No gradient CTAs, no fake metrics, no template-feeling card grids

---

## Harness Constraints

These constraints are enforced during development:

1. **No framework switching** - Next.js is locked; do not introduce React/Vue alternatives
2. **No paid services** - All services must have free tier (Vercel, Sanity, Supabase, Resend)
3. **Security-first** - Any new feature must consider PRD [S2.5] security implications
4. **i18n mandatory** - All user-facing text must support en/zh
5. **PRD traceability** - New features must map to a PRD section; if no section exists, update PRD first

### State Management & Crash Recovery

6. **Persistent state** - Any state that affects user data must be persisted to Supabase immediately, not just in memory
7. **Optimistic updates** - UI updates should show immediately but rollback on failure
8. **Idempotent operations** - All write operations (create/update/delete) must be idempotent to handle retries safely
9. **Transaction safety** - Multi-step operations must use database transactions or compensating actions
10. **Graceful degradation** - If Supabase is unreachable, show cached data with staleness indicator, not error page
11. **Form auto-save** - Long forms (ticket submission) must auto-save to localStorage every 30 seconds
12. **Session recovery** - On page reload, restore user session from Supabase Auth, not localStorage
13. **Offline support** - Critical reads (ticket list, user profile) should work offline with cached data
14. **Error boundaries** - Every route must have error boundary to prevent full-page crashes
15. **State versioning** - Use timestamps or versions to detect stale state and prevent overwrites

### Data Integrity

16. **No orphaned records** - Deleting a user must cascade or soft-delete related tickets
17. **Audit trail** - All ticket status changes must log who/when/what
18. **Soft deletes** - Never hard delete user data; use `deleted_at` timestamp
19. **Concurrency control** - Use optimistic locking (version field) for ticket updates
20. **Backup verification** - Supabase backups must be tested monthly for restore capability

### Development Workflow

21. **Auto-reload AGENTS.md** - Every 30 seconds, re-read this file to ensure rules are current
22. **Module verification** - After each module completes, run lint + typecheck + build; list gaps with root causes
23. **Fix proposal required** - If gaps found, present fix options with pros/cons to user for approval
24. **No unauthorized deployment** - Never deploy or实施 fix without explicit user approval

### Tool Usage Constraints

25. **skill工具失败时换方案** - skill工具底层依赖ripgrep，项目路径含中文字符会导致加载失败。如果skill工具报错，不要重试，改用 `read` 工具直接读取skill文件（路径在系统提示的available_skills中），或用 `bash` + `node -e` 实现相同功能。
26. **文件搜索替代方案** - 需要搜索文件内容时，使用 `bash` + `node -e` 或 `Get-ChildItem` 命令，而非 `grep` 或 `glob` 工具（同样受中文路径影响）。
27. **Playwright只允许Edge浏览器** - 所有Playwright测试和配置禁止使用Chrome/Chromium，只允许使用Microsoft Edge。配置路径: `executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'`。禁止安装Chromium。
28. **重复检测处理规则** - 系统提示"repetition detected"时，禁止用不同措辞重复相同内容。正确做法：直接跳过该部分，继续下一个话题，或等待用户指示。"重新组织输出"会陷入循环，不是解决方案。
29. **行动前必须查阅约束** - 每次执行任何操作前，必须先查阅AGENTS.md中的约束条件（第25-28条），确保不违反项目规则。违反约束将导致严重错误。
30. **评估必须用工具，不能手动判断** - 任何UI/UX、内容质量、一致性的评估，必须调用对应的MCP工具或skill，不能仅凭阅读源代码就下结论。手动阅读代码只能发现"现象"（如字段名不匹配），不能做出"评价"（如设计质量、内容优劣）。违反此规则会导致评估缺乏工具支撑，结论不可靠。
31. **skill是规范不是工具** - skill提供的是评估规范和最佳实践（只读知识），MCP提供的是数据查询和操作能力（读写工具）。评估时必须两者配合：skill定标准，MCP查数据，不能只用其中一个。
32. **禁止启动dev server做测试** - `npm run dev` / `next dev` 启动耗时过长（>5秒），禁止用于问题排查。分析问题时必须用代码静态分析（读文件+逻辑推理）或 `npx next build --webpack` 验证编译。如需运行时验证，使用 `webfetch` 直接访问线上部署地址，或用 `node -e` 编写脚本测试API/数据层。
33. **修bug不要动正常功能** - 进行功能改动时，只修改与问题直接相关的代码，不要顺手"清理"或"优化"其他看似无关的部分。任何非必要的改动都可能引入新问题。
34. **评估维度必须记录工具归属** - 每个评估维度完成后，必须在checkpoint中记录"维度X → 工具Y → 评分/结论Z"，确保可追溯。不能只写"评估完成"，必须写明每个维度用了什么工具、得到什么结论。
35. **维度评估不能替代实现审查** - 维度级评分（如"信息密度2.5/4"）会掩盖具体实现bug（空标签、未翻译字段、URL不同步）。评估时必须同时做：(1)维度打分 (2)按页面逐项检查具体实现。两者缺一不可。
36. **事实核查必须读源码** - 做待办梳理或差距评估时，禁止仅凭文件树、旧评估报告、PRD原始设计来推断当前实现状态。必须逐页 `read` 源代码确认实际内容。教训：2026-07-09 因未读 about/page.tsx 就断言"内容单薄、缺时间线"，实际上时间线/团队/资质三个板块早已实现。二手信息（旧评估、PRD）只能作为起点，不能作为结论。

## Open Items (PRD [S22])

| # | 问题 | 状态 | 说明 |
|---|------|------|------|
| 1 | Hero视频来源 | ✅ 已解决 | CloudFront CDN 托管 MP4 |
| 2 | 合作伙伴Logo | ✅ 已解决 | 21个SVG/PNG在 `public/logos/` |
| 3 | 案例数据 | ⚠️ 需确认 | Sanity已有seed数据，需确认是否真实 |
| 4 | 团队成员照片 | 🔲 待收集 | |
| 5 | 办公地址 | 🔲 待确认 | |
| 6 | 社交媒体账号 | 🔲 待确认 | |
| 7 | 分析工具 | 🔲 待选择 | GA vs Umami |
| 8 | 工单时区 | 🔲 待确认 | |
| 9 | 邮件模板 | 🔲 待设计 | acknowledge/状态更新模板 |
| 10 | 超级管理员 | ✅ 已解决 | 通过网站/register页面创建Supabase Auth账号即可 |

## 项目现状（2026-07-09 源码验证）

### 已完成

- **19个页面全部实现**：首页/关于/产品/解决方案/案例列表+详情/博客列表+详情/联系/支持(含登录注册)/帮助/VMware替代/对比/隐私/条款/404/错误
- **9个API路由全部实现**：auth callback/reset-password, contact, products, revalidate, tickets(CRUD+stats), upload
- **25个组件全部实现**：HeroSection, Navbar, MegaMenu, Footer, LoginForm, RegisterForm, TicketForm, TicketList, CompareTable, + 12个UI组件
- **4个Hooks全部实现**：useAutoSave, useOfflineCache, useOptimistic, useRetry
- **6表数据库**：users, tickets, ticket_attachments, ticket_comments, contact_submissions, ticket_audit_log + RLS + 审计
- **4个Sanity Schema**：product, caseStudy, post, solution
- **17个E2E测试 + 7个单元测试**
- **安全头部**：CSP, HSTS, X-Frame-Options 等全部配置

### 待改进

- **CMS化**：帮助页FAQ、合作伙伴Logo、团队信息、解决方案内容目前用i18n硬编码，需迁移到Sanity CMS
- **i18n**：Solutions页面6处硬编码英文 metricLabel
- **功能缺失**：全站搜索、客户评价(Testimonial)、Sanity缺FAQ/Partner/Team Schema
- **测试补充**：Sanity数据完整性测试、API集成测试、性能基准测试

## 教训记录

### 2026-07-09: 事实核查必须读源码

**事件**：做全面待办评估时，断言"关于页面内容单薄、缺时间线/团队/资质"，实际上这三个板块早已实现。

**根因链**：
1. 只检查文件是否存在（`about/page.tsx` ✅），没读内容
2. 采信旧评估报告（UI-UX-GAP-ASSESSMENT.md 2026-07-05）的结论
3. 用PRD原始设计推断当前状态
4. 三个判断全部基于二手信息，零次原始验证

**规则**：已写入第36条 — 做待办梳理或差距评估时，必须逐页 `read` 源代码确认实际内容，禁止仅凭文件树、旧评估报告、PRD原始设计推断。

## Notes

- All service credentials go in `.env.local` (never committed)
- Supabase RLS must be enabled for all tables
- Sanity webhooks configured for ISR revalidation
- Resend used for all transactional emails
- **每次变更后自动部署Vercel**: 任何代码变更(新模块/新功能/质感提升)完成后，必须执行 `npx vercel --prod --yes` 部署到Vercel，并提醒用户前往 https://www.techguru-it.asia 复审
- **功能任务自动分解**: 当用户规划到对功能进行添加或修改相关的任务时，自动进入任务设计分解过程，帮助用户逐步进行任务/计划的分解，直到无可再分为止。分解输出格式：(1)目标 (2)前置依赖 (3)子任务列表(每个子任务含：具体文件/改动点/验证方式) (4)执行顺序
