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
| [S11] | ~~案例展示~~（已废弃 2026-07-12） | Deprecated |
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
- **Light theme primary**: Auto dark mode via `prefers-color-scheme: dark`, with manual toggle fallback

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
6. **Dark mode**: Automatic via `prefers-color-scheme: dark`, manual toggle available via DarkModeToggle
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
37. **Playwright并发标签页限制** - Playwright执行过程中，同时开启的浏览器标签页（page）数量不得超过3个。超出的任务必须排队等待，形成队列依次执行。违反此规则会导致内存溢出和系统卡顿 [2026-07-09]
38. **UI页面审计必须用Playwright截图** - Sanity脚本只能检查数据正确性，webfetch只能抓HTML结构，都无法验证图片是否broken、布局是否正确、元素是否重叠。任何UI页面审计必须用Playwright截图验证实际渲染效果 [2026-07-10]
39. **数据正确不等于视觉正确** - 审计不能只查数据不查视觉。S38用Sanity脚本扫描发现11篇中文匿名文字，但没有用Playwright截图，导致8张broken images、导航遮挡、标签重复等问题遗漏 [2026-07-10]
40. **文档职责划分必须遵守** - MEMORY.md是真实状态源（待办、进度、配置），AGENTS.md是规则约束源（开发约束、架构），PRD是设计权威源（功能需求）。展示待办时必须从MEMORY.md获取，不能从AGENTS.md的Open Items获取（那是PRD阶段原始设计，很多已解决但未更新）[2026-07-11]
41. **文档同步检查清单** - 执行文档同步时必须检查：(1)AGENTS.md Open Items与MEMORY.md是否一致 (2)PRD [S22]状态是否与MEMORY.md一致 (3)MEMORY.md待办是否标记最新状态 (4)是否有过期文档需要标记 [2026-07-11]
42. **Task完成后自动doc-sync** - 每个task执行完毕后，必须运行doc-sync检查MEMORY.md/AGENTS.md/PRD三方一致性，确保状态同步。不能只改代码不更新文档 [2026-07-11]
43. **边界约束: 每个计划在自己的边界内执行，不允许影响任何已经能正常工作的模块或者页面**: 修改前必须确认目标文件/组件的当前状态，修改后必须测试相关功能是否正常。具体规则：(1)只修改与任务直接相关的文件 (2)不顺手"清理"或"优化"其他代码 (3)每改3个组件必须截图验证light mode (4)暗色模式修改必须分批进行，先改globals.css再改组件 (5)新增功能必须在独立目录，不修改现有组件结构 [2026-07-11]
44. **首页是最高流量页面，布局变动必须保守**: 首页5个区块结构(Hero+CoreValue+AIJourney+VMware+SocialProof)已经稳定，不合并区块。只清理死代码CSS，不改变信息架构。任何首页改动必须先截图对比，确认视觉差异最小化 [2026-07-11]
45. **新增依赖必须先评估bundle size影响**: 添加新npm包前，必须先在本地测试bundle size增加量。如果>50KB则改用纯JS实现或寻找替代方案。搜索功能优先使用Next.js内置路由+本地JSON，不轻易引入flexsearch等新依赖 [2026-07-11]
46. **暗色模式修改必须分批进行**: Tailwind v4的dark mode配置方式与v3不同，直接改globals.css可能导致全局样式崩溃。必须分3步：(1)先在layout.tsx添加class="dark"测试单个组件 (2)确认生效后再改globals.css的CSS变量 (3)最后逐个修改组件的硬编码颜色。每改3个组件必须截图验证light mode未受影响 [2026-07-11]
47. **文案修改必须用户确认**: Hero文案、UI文案等用户可见的文本修改，必须先展示给用户确认后再执行。不能仅凭技术判断就修改品牌文案。特别是Hero tagline这种核心文案，需要用户确认品牌调性 [2026-07-11]
48. **Hook可直接操作文件系统**: MiMoCode的hook运行在Node.js环境中，可以使用`fs`模块直接读写文件，不只是修改output字符串。设计自动化流程时，优先考虑hook直接实现，而不是提醒主代理手动执行 [2026-07-12]
49. **i18n映射必须多文件同步**: slugToI18n映射存在于ProductDetail.tsx和CategoryPage.tsx两个文件，修改时必须同步修改，否则产品列表页和详情页标题不一致 [2026-07-12]
50. **hook同步必须做完整状态机**: hook不能只做标题同步，必须做完整的三方文档(MEMORY↔AGENTS↔PRD)状态同步，包括待办列表、已完成列表、Open Items、Phase状态等所有状态字段 [2026-07-12]
51. **hook触发时机必须每次变更**: hook不能只在task done时触发，必须在每次工具调用后(tool.execute.after)检查同步，因为任务可能返工 [2026-07-12]
52. **Phase状态检测必须排除"待执行"**: 正则表达式`/Phase\s*(\d+)/`+`line.includes('完成')`必须同时排除`line.includes('待执行')`，否则会把"Phase 3待执行"误判为最新Phase [2026-07-12]
53. **禁止擅自添加视觉样式**: 任何视觉效果(颜色/透明度/动画/grayscale等)必须先确认是否符合项目设计意图，不能基于刻板印象自作主张添加 [2026-07-12]
54. **评估必须完整列出具体缺陷**: 评估缺陷或差距时，禁止只给笼统结论（如"检查不够深"）。必须完整列出所有具体缺失项（如"缺i18n key检查、缺Sanity schema字段检查、缺组件props检查"）。教训：2026-07-14 评估doc-sync skill时只说"设计同步检查不够深"，没有列出具体缺什么，用户追问后才补充 [2026-07-14]
55. **PRD必须反向同步**: 功能删除/新增后，必须反向检查PRD是否需要同步更新。只做"实现是否符合PRD"的正向检查不够，还要做"PRD是否反映实现"的反向检查。教训：2026-07-12 删除Case Studies，但PRD中S11案例展示、页面清单、数据模型、导航栏设计均未同步更新 [2026-07-14]
56. **一次性穷极所有方面**: 当用户要求列出改进方面、差距、缺陷时，必须一次性穷极所有方面，直接输出完整清单。禁止挤牙膏式分批输出（先说一部分，等用户追问再补充）。教训：2026-07-14 评估doc-sync时分3次输出（先5个缺陷→用户追问→补充6项缺失→用户再追问→才完整），用户明确指出这种做法不可接受 [2026-07-14]
57. **分析与执行必须一致**: 分析阶段说"应该是什么"，执行阶段必须严格遵循，不能因为"容易"就走捷径。教训：2026-07-15 分析时说Build应该用"AI生成内容的效果对比图"，执行时却用了picsum.photos的随机风景照，用户指出"分析和执行脱节" [2026-07-15]
58. **禁止用随机图片填充内容**: IT产品页面禁止使用picsum.photos等随机图片服务。必须根据内容含义选择相关视觉元素：渐变背景+图标、产品截图、架构图、数据可视化。多个产品共享同一张图片是严重错误 [2026-07-15]
59. **执行前必须验证质量**: 每次资源获取（图片、数据、配置）后，必须验证其与内容的相关性。不能只检查"文件是否存在"，要检查"内容是否匹配"。教训：2026-07-15 获取图片后没有验证是否与产品相关，导致5个AI产品用同一张森林图 [2026-07-15]
60. **视觉元素必须与内容语义匹配**: 图标、图片、颜色必须与所表达的内容在语义上相关。AI产品用代码/数据可视化，安全产品用盾牌/监控，基础设施用服务器/网络。禁止用无关的装饰性图片 [2026-07-15]

## 项目状态

详细状态请查看 `MEMORY.md` 和 `docs/modules/INDEX.md`

## 教训记录

### 2026-07-12: i18n映射多文件同步 + Hook完整状态机
**事件**：产品列表页AIGC卡片显示"Text-To-Video"而非"AI-Generated Content (AIGC)"，用户发现并指出。

**根因**：
1. `slugToI18n`映射存在于两个组件文件：`ProductDetail.tsx`和`CategoryPage.tsx`
2. 之前只修改了`ProductDetail.tsx`的映射，漏了`CategoryPage.tsx`
3. Hook只做了标题同步，没有做完整的三方文档状态同步

**规则**：已写入第49-52条
- #49: i18n映射必须多文件同步
- #50: hook同步必须做完整状态机
- #51: hook触发时机必须每次变更
- #52: Phase状态检测必须排除"待执行"

### 2026-07-09: 事实核查必须读源码

**事件**：做全面待办评估时，断言"关于页面内容单薄、缺时间线/团队/资质"，实际上这三个板块早已实现。

**根因链**：
1. 只检查文件是否存在（`about/page.tsx` ✅），没读内容
2. 采信旧评估报告（UI-UX-GAP-ASSESSMENT.md 2026-07-05）的结论
3. 用PRD原始设计推断当前状态
4. 三个判断全部基于二手信息，零次原始验证

**规则**：已写入第36条 — 做待办梳理或差距评估时，必须逐页 `read` 源代码确认实际内容，禁止仅凭文件树、旧评估报告、PRD原始设计推断。

### 2026-07-14: 评估必须完整列出具体缺陷

**事件**：评估doc-sync skill缺陷时，第一次只说"设计同步检查不够深"，但没有列出具体缺什么检查项（i18n key完整性、Sanity schema字段、组件props等）。用户追问后才补充。

**根因链**：
1. 评估时只给了笼统结论（"不够深"），没有展开具体缺失项
2. 没有系统性地列出所有应该检查但未检查的维度
3. 依赖用户追问才补充完整

**规则**：已写入第54条 — 评估缺陷或差距时，必须完整列出所有具体缺失项，不能只给笼统结论。

### 2026-07-14: PRD必须反向同步

**事件**：Case Studies在2026-07-12已完全删除，但PRD中S11案例展示、页面清单、数据模型、导航栏设计均未同步更新。

**根因链**：
1. 只做"实现是否符合PRD"的正向检查
2. 没做"PRD是否反映实现"的反向检查
3. doc-sync skill只检查状态同步（MEMORY↔AGENTS↔PRD S22），漏掉设计同步

**规则**：已写入第55条 — 功能删除/新增后，必须反向检查PRD是否需要同步更新。

### 2026-07-14: 一次性穷极所有方面

**事件**：用户要求评估doc-sync skill的scope和缺陷。我分3次输出：
1. 第一次：5个结构性缺陷
2. 第二次（用户追问后）：8个缺失检查项
3. 第三次（用户再追问后）：才完整

**用户反馈**："你的教训深度不够：当用户让你来给出可以改进的方面时，你必须一次性把所有的差距全部列出来，直接穷极所有方面，不允许挤牙膏一样的每次都只说一部分"

**根因链**：
1. 没有一次性穷极所有方面
2. 分批输出，依赖用户追问
3. 低估了用户对完整性的要求

**规则**：已写入第56条 — 要求列出改进/差距/缺陷时，必须一次性输出完整清单，禁止挤牙膏式分批输出。

### 2026-07-15: dev server端口冲突处理

**事件**：用户要求打开localhost查看效果，但dev server多次启动失败，报错`EADDRINUSE: address already in use :::3000`。

**根因链**：
1. 上次session中dev server成功启动并运行
2. bash工具超时后，node进程没有被正确清理，仍在后台运行占用端口3000
3. 新的启动尝试因为端口被占用而失败
4. 用户多次尝试都无法打开，体验极差

**解决方案**：
启动dev server前，先检查并清理旧进程：
```powershell
# 检查端口占用
netstat -ano | findstr :3000

# 如果有占用，杀掉进程
Stop-Process -Id <PID> -Force
```

**规则**：已写入MEMORY.md核心规则 + AGENTS.md约束 — dev server端口冲突处理

### 2026-07-15: 分析与执行脱节 + 随机图片填充

**事件**：用户要求全站添加图片+打破AI模板感。我在分析阶段正确推荐了相关图片（AI效果对比图、代码编辑器截图、安全仪表板界面），但执行时却用了picsum.photos的随机风景照，导致：
1. Build类别5个产品全部用同一张雾气森林图
2. Run类别7个产品全部用同一张道路森林图
3. Protect类别8个产品全部用同一张云朵图

**根因链**：
1. **走捷径** - picsum.photos是最简单的图片来源，不需要思考内容相关性
2. **分析→执行断裂** - 分析说"效果图"，执行用"风景照"
3. **懒惰验证** - 没有逐个验证每张图片是否与内容匹配
4. **映射设计错误** - 多个slug映射到同一张图片

**教训**：
- 分析阶段说"应该是什么"，执行阶段必须严格遵循
- IT产品页面禁止使用随机风景照
- 必须根据内容含义选择相关视觉元素
- 多个产品共享同一张图片是严重错误

**规则**：已写入第57-60条 — 分析与执行一致、禁止随机图片、执行前验证、视觉语义匹配

## Token 消耗优化规则

57. **大文件JSON必须精确提取** - 读取 >20KB 的 JSON 文件（en.json/zh.json/PRD）时，必须用 `node -e` 精确提取需要的 key/section，不能用 `read` 工具整文件读取。示例：`node -e "const en = require('./messages/en.json'); console.log(JSON.stringify(en.footer, null, 2))"` 节省 ~99% tokens [2026-07-14]
58. **禁止重复读取同一文件** - 同一文件在同一次工具调用链中只 read 一次。修改文件时，首次 read 后记住内容，后续 edit 直接用 old_string 匹配，不重复 read。需要确认修改结果时用 grep 检查关键内容而非全文重读 [2026-07-14]
59. **PRD按需读取** - 读取 PRD 时，先用 grep 定位章节行号，再用 `read(offset=N, limit=M)` 精确读取目标章节，禁止全文读取 33KB PRD [2026-07-14]
60. **技能按需加载** - 匹配已知任务模式（部署/审计/文案）时，优先用已有知识执行。只在遇到未知场景时才 `load` skill。禁止同一会话同时加载 >2 个 skill [2026-07-14]

## Notes

- All service credentials go in `.env.local` (never committed)
- Supabase RLS must be enabled for all tables
- Sanity webhooks configured for ISR revalidation
- Resend used for all transactional emails
- **每次变更后自动部署Vercel**: 任何代码变更(新模块/新功能/质感提升)完成后，必须执行 `npx vercel --prod --yes` 部署到Vercel，并提醒用户前往 https://www.techguru-it.asia 复审
- **功能任务自动分解**: 当用户规划到对功能进行添加或修改相关的任务时，自动进入任务设计分解过程，帮助用户逐步进行任务/计划的分解，直到无可再分为止。分解输出格式：(1)目标 (2)前置依赖 (3)子任务列表(每个子任务含：具体文件/改动点/验证方式) (4)执行顺序

## 技能加载策略

| 任务模式 | 匹配关键词 | 是否加载skill |
|----------|-----------|--------------|
| 部署 | deploy, vercel, 部署 | ❌ 用已有知识 |
| 审计 | audit, review, 检查 | ⚠️ 只在需要完整框架时加载 |
| 文案 | copy, 文案, 去AI化 | ⚠️ 只在不确定时加载 |
| SEO | seo, metadata, meta | ❌ 用已有知识 |
| 文档同步 | doc-sync, 同步 | ❌ 用已有知识 |
| 未知场景 | — | ✅ 加载对应skill |

## 自动化扩展

### Hook: auto-doc-sync (`hooks/auto-doc-sync.ts`)
- `tool.execute.after`: 每次工具调用后执行三方完整状态同步(MEMORY↔AGENTS↔PRD)
- 包含: Phase状态同步、待办/已完成列表、Open Items表格、Sanity变更检测

### Tool: sanity-validate (`tools/sanity-validate.ts`)
- Sanity数据上传前自动验证格式
- 检查: title/excerpt对象格式、必填字段、coverImage格式
