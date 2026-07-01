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
| Animation | Framer Motion | Page transitions, micro-interactions |
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
