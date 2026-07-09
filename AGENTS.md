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
| UI | Tailwind CSS + shadcn/ui | Styling + components |
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
├── app/                    # Next.js App Router pages
│   ├── [locale]/           # i18n routing (en/zh)
│   │   ├── page.tsx        # Home
│   │   ├── products/       # Products
│   │   ├── solutions/      # Industry solutions
│   │   ├── case-studies/   # Case studies
│   │   ├── blog/           # Blog
│   │   ├── about/          # About us
│   │   ├── support/        # Support/tickets
│   │   └── contact/        # Contact
│   └── api/                # API routes
├── components/             # Reusable components
├── lib/                    # Utilities, Supabase client, Sanity client
├── styles/                 # Global styles
└── types/                  # TypeScript types
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
- File uploads validated (type whitelist, 10MB limit)
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

## Open Items (PRD [S22])

Before implementation, confirm:

1. Hero video source (free library vs custom)
2. Partner logos collection
3. Real case study data
4. Team member photos
5. Office addresses for map
6. Social media accounts (WeChat, WhatsApp)
7. Analytics tool (Google Analytics vs Umami)
8. Timezone handling for tickets
9. Acknowledge email template
10. Initial super admin creation method

## Notes

- All service credentials go in `.env.local` (never committed)
- Supabase RLS must be enabled for all tables
- Sanity webhooks configured for ISR revalidation
- Resend used for all transactional emails
- **每次变更后自动部署Vercel**: 任何代码变更(新模块/新功能/质感提升)完成后，必须执行 `npx vercel --prod --yes` 部署到Vercel，并提醒用户前往 https://www.techguru-it.asia 复审
- **功能任务自动分解**: 当用户规划到对功能进行添加或修改相关的任务时，自动进入任务设计分解过程，帮助用户逐步进行任务/计划的分解，直到无可再分为止。分解输出格式：(1)目标 (2)前置依赖 (3)子任务列表(每个子任务含：具体文件/改动点/验证方式) (4)执行顺序
