# TGWS 全项目差距评估与优化方案 Spec

> **change-id**: `audit-tgws-gap-optimization`
> **评估日期**: 2026-07-19
> **评估方法**: 4 个并行子代理读取全部 11 个模块的源代码（共 100+ 文件），对照 PRD v1.2 / AGENTS.md / Sanity schema / 数据库迁移逐项核实，不采信任何二手报告。
> **评估范围**: `/workspace/tgws` 完整 Next.js 16 App Router 工程。

---

## 1. Why

TGWS 项目自 2026-06-28 启动至今约 3 周，PRD 全部 22 章节标注 "已完成"，README 声明 Vitest 49/49 + Playwright 47/47 通过，已部署至 https://www.techguru-it.asia。但近期多次出现 "已标完成功能实际无法使用 / 文案漏译 / 图片与内容不匹配" 等问题（详见 AGENTS.md 教训记录 2026-07-09 至 2026-07-15），表明 "PRD 完成度" 与 "实际可用度" 之间存在系统性偏差。

本次评估的目的是：**逐模块用源代码事实校正完成度声明**，定位每个差距的根因，输出可执行、可验收的优化方案，作为下一阶段开发的依据。

---

## 2. What Changes

本 spec 不直接修改源代码，**只产出三份评估文档** + 一份优化任务清单：

1. `spec.md`（本文档）— 项目总结、架构图、模块化总结、差距评估、根因分析、优化方案
2. `tasks.md` — 按 P0/P1/P2 优先级排序的可执行优化任务
3. `checklist.md` — 优化完成后的验收检查点

待用户审批后，进入执行阶段按 `tasks.md` 顺序实施。

---

## 3. Impact

- **Affected specs**: 所有模块（M01-M11）+ 全局基础设施（i18n / Sanity / Supabase / SEO / 测试 / 构建）
- **Affected code**: 详见第 7 章逐模块清单
- **不影响的代码**: 本 spec 阶段不修改任何代码；执行阶段由后续 task 控制

---

## 4. 项目总结

### 4.1 项目定位

**TechGuru Network & Data Solutions**（泰谷网数科技）官方网站。菲律宾马尼拉 IT 解决方案集成商，业务覆盖网络安全 / 网络优化 / 云计算 / 基础设施 / 人工智能 / 托管服务 / 业务连续性七大领域。

### 4.2 技术栈（实际版本）

| 组件 | 实际版本 | PRD 约定 |
|------|----------|----------|
| Next.js | 16.2.9 (App Router) | ✅ 一致 |
| React | 19.2.4 | ✅ |
| TypeScript | ^5 | ✅ |
| Tailwind CSS | 4.3.2 (v4) | ✅ |
| Sanity | v3 (`@sanity/client` ^7.23.0) | ✅ |
| Supabase | `@supabase/ssr` ^0.12.0 + `@supabase/supabase-js` ^2.110.0 | ✅ |
| Resend | ^6.17.1 | ✅ |
| next-intl | ^4.13.1 | ✅ |
| framer-motion | 未在 package.json 但代码 import | ❌ **疑似幽灵依赖** |
| lucide-react | ^1.23.0 | ✅ |
| Playwright | ^1.61.1 | ✅ |
| Vitest | ^4.1.9 | ✅ |

### 4.3 部署状态

- 生产域名: https://www.techguru-it.asia
- 平台: Vercel
- 构建命令: `npx next build --webpack`（强制 Webpack，未用 Turbopack）
- 安装源: `registry.npmmirror.com`（中国镜像，**非中国区构建可能失败**）

### 4.4 文档与状态源

| 文档 | 用途 | 实际状态 |
|------|------|----------|
| `PRD-TechGuru-Website.md` (33KB) | 设计权威源 | 存在，但部分章节未反向同步（Case Studies 已删但 PRD S11 未更新） |
| `AGENTS.md` (27KB) | 规则约束源 | 60 条规则 + 6 条教训，最新 2026-07-15 |
| `README.md` (2KB) | 项目说明 | PRD 完成度全标 ✅，与实际差距较大 |
| `MEMORY.md` | 真实状态源 | **❌ 缺失**（AGENTS.md 反复引用但文件不存在） |
| `PROJECT-REVIEW-REPORT.md` | 2026-07-12 文件清理报告 | 已执行归档 |
| `docs/modules/INDEX.md` | 11 模块索引 | 全部标 ✅，与实际差距较大 |
| `docs/modules/M01-M11.md` | 各模块详情 | 待复核 |
| `PRD/` (10 文件) | PRD v2.0 模块化分割 | GLOBAL + M01-M07 + S07 + S08 |

---

## 5. 架构图

### 5.1 系统架构（分层视图）

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          客户端浏览器                                    │
│  (Tailwind v4 + RSC + next-intl EN/ZH + 暗色模式自动切换)               │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Vercel Edge Network (CDN)                          │
│  - ISR (revalidate=3600)                                                 │
│  - next/image 优化 (WebP/AVIF)                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  Next.js 16 App Router (Node Runtime)                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Middleware (src/middleware.ts)                                  │   │
│  │  - next-intl 路由前缀 (/en, /zh)                                 │   │
│  │  - Supabase updateSession (cookie 刷新)                          │   │
│  │  - ❌ 无路由保护逻辑                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  App Router 页面层 (src/app/[locale]/*)                          │   │
│  │  - 11 个模块: home/products/blog/solutions/about/contact/        │   │
│  │    support/compare/vmware-alternative/help/privacy/terms         │   │
│  │  - Server Components (数据获取 + metadata)                       │   │
│  │  - Client Components (交互 / framer-motion / use client)         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  API Routes (src/app/api/*)                                      │   │
│  │  - /auth/callback, /auth/reset-password                          │   │
│  │  - /tickets (GET/POST), /tickets/[id] (GET/PATCH/POST),          │   │
│  │    /tickets/stats (GET)                                          │   │
│  │  - /contact (POST + Odoo 同步)                                   │   │
│  │  - /upload (POST, 50MB)                                          │   │
│  │  - /products (GET, Sanity)                                       │   │
│  │  - /revalidate (POST, ISR webhook)                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
        │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Sanity     │  │   Supabase   │  │   Resend     │  │    Odoo      │
│  (CMS)       │  │  (DB+Auth+   │  │  (邮件)      │  │  (CRM, 可选) │
│              │  │   Storage)   │  │              │  │              │
│ - products   │  │ - users      │  │ - 4 模板     │  │ - crm.lead   │
│ - posts      │  │ - tickets    │  │   (创建/状态 │  │   (无幂等)   │
│ - solutions  │  │ - attachments│  │    /密码/回复│  │              │
│ - faq        │  │ - comments   │  │   )          │  │              │
│ - partners   │  │ - audit_log  │  │              │  │              │
│ - teamMember │  │ - contact_   │  │              │  │              │
│              │  │   submissions│  │              │  │              │
│ ❌ caseStudy │  │              │  │              │  │              │
│   (已删但    │  │ RLS: 启用    │  │              │  │              │
│   schema 残留)│  │ ⚠️ INSERT    │  │              │  │              │
│              │  │   policy 缺失│  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### 5.2 模块依赖关系图

```
                    ┌──────────────────────────┐
                    │  全局基础设施             │
                    │  - i18n (en/zh)           │
                    │  - Navbar/Footer/MegaMenu │
                    │  - globals.css            │
                    │  - JsonLd 组件            │
                    │  - middleware.ts          │
                    └──────────────────────────┘
                              ▲
            ┌─────────────────┼─────────────────┐
            │                 │                 │
   ┌────────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐
   │  M01 Home      │  │  M02 Products │  │  M03 Blog    │
   │  (Hero+5 blocks│  │  (Build/Run/  │  │  (列表+详情  │
   │   +合作Logo)   │  │   Protect+    │  │   +PortableT)│
   │                │  │   [slug])     │  │              │
   └────────────────┘  └───────────────┘  └──────────────┘
   ┌────────────────┐  ┌───────────────┐  ┌──────────────┐
   │  M04 Solutions │  │  M05 Tickets  │  │  M06 Contact │
   │  (6 行业 Tab)  │  │  (Portal+表单 │  │  (表单+Odoo  │
   │                │  │   +列表)      │  │   +地图)     │
   └────────────────┘  └───────────────┘  └──────────────┘
   ┌────────────────┐  ┌───────────────┐  ┌──────────────┐
   │  M07 About     │  │  M08 Compare  │  │  M09 VMware  │
   │  (时间线+团队  │  │  (对比表)     │  │  Alternative │
   │   +资质)       │  │               │  │  (营销页)    │
   └────────────────┘  └───────────────┘  └──────────────┘
   ┌────────────────┐  ┌───────────────┐  ┌──────────────┐
   │  M10 Help      │  │  M11 Legal    │  │  Auth        │
   │  (FAQ 搜索)    │  │  (Privacy+    │  │  (Login +    │
   │                │  │   Terms)      │  │   Register)  │
   └────────────────┘  └───────────────┘  └──────────────┘

   共享组件层 (src/components/ui/*)：
   Breadcrumb | CookieConsent | DarkModeToggle | ErrorBoundary
   FAQAccordion | HelpText | JsonLd | LanguageSwitcher
   ScrollReveal | ScrollToTop | Tooltip

   共享 hooks (src/hooks/*)：
   useAutoSave | useOfflineCache | useOptimistic | useRetry
   ⚠️ 后三个 hook 实现完整但未被任何组件使用（死代码）
```

### 5.3 数据流图

```
用户 ────► /en/products ────► RSC page.tsx ────► Sanity GROQ ────► ProductsList.tsx (client)
                              │                                              │
                              │ generateMetadata ◄── getTranslations         │
                              │                                              │
                              ▼                                              ▼
                          SEO HTML                                     交互（Tab 切换）

用户 ────► /zh/support ────► middleware.ts ────► NextIntlClientProvider
                                                  │
                                                  ▼
                                         support/page.tsx (client)
                                                  │
                                ┌─────────────────┼─────────────────┐
                                ▼                 ▼                 ▼
                       supabase.auth.       /api/tickets       useAutoSave
                       getUser()            (GET)              (30s, 不还原)
                                │                 │
                                ▼                 ▼
                       重定向 /login       Supabase RLS SELECT
```

---

## 6. 模块化总结

### 6.1 模块完成度总表（基于源码事实）

| 模块 | 路由 | 完成度 | 关键问题数 | 优先级 |
|------|------|--------|-----------|--------|
| M01 Home | `/` | 78% | 5+ | P1 |
| M02 Products | `/products/*` | 70% | 5+（含代码重复 3 文件） | P0 |
| M03 Blog | `/blog/*` | 70% | 5+（含 picsum 违规） | P1 |
| M04 Solutions | `/solutions` | **55%** | 5+（含 GROQ 漏字段致命 bug） | **P0** |
| M05 Tickets | `/support/*` | 55% | 5+（含非幂等 + 无事务） | **P0** |
| M06 Contact | `/contact` | 60% | 5+（含 Odoo 同步阻塞） | P1 |
| M07 About | `/about` | 60% | 5+（含零 Sanity 集成） | P1 |
| M08 Compare | `/compare` | 55% | 5+（含死组件 CompareTable） | P2 |
| M09 VMware Alt | `/vmware-alternative` | 75% | 5 | P2 |
| M10 Help | `/help` | 70% | 5 | P2 |
| M11 Legal | `/privacy`, `/terms` | 60% | 5 | P2 |
| Auth | `/login`, `/register` | 65% | 5+（含密码重置流程断裂） | P0 |
| API Routes | `/api/*` | 55% | 8+（含无 CSRF / 无限流 / 无白名单） | **P0** |
| Hooks | `src/hooks/*` | 30%（实现质量高，集成≈0） | 4（含 3 个死代码） | P1 |
| 全局基建 | i18n / Sanity / SEO / 中间件 | 80% | 5 | P1 |
| 测试 | unit + e2e | 60% | 5+（M08-M11 零覆盖） | P1 |
| 构建配置 | next.config / vercel.json | 70% | 5+（含 picsum 白名单） | P1 |

**全项目实际加权完成度: 约 65%**（vs README 声称的 100%）

### 6.2 共性模式问题

| 模式 | 影响模块 | 严重度 |
|------|----------|--------|
| **picsum.photos 兜底图** | JsonLd.tsx, blog/[slug], next.config | 🔴 违反 AGENTS #58 |
| **浏览器端 sanity client 用于 RSC** | products/page, blog/page, solutions/page | 🟡 性能 + 约定违反 |
| **面包屑标签硬编码英文** | products, blog, solutions, contact, compare, help, about | 🔴 i18n 违规 |
| **死代码 / 重复实现** | contact/ContactPage.tsx, CompareTable.tsx, 3 个 hooks, sendTicketReplyEmail | 🟡 维护负担 |
| **未使用 useRetry/useOptimistic/useOfflineCache** | TicketForm, support/page, /api/contact, /lib/odoo | 🔴 AGENTS #7-#13 形同虚设 |
| **Case Studies 残留** | sanity.config.ts, e2e/case-studies.spec.ts | 🔴 违反 AGENTS #55 反向同步 |
| **hardcoded hex 颜色** | 所有模块 | 🟡 设计 token 未贯彻 |
| **`<meta.icon ... />` 小写 JSX** | solutions/SolutionsList.tsx:138 | 🔴 渲染 bug |
| **无 CSRF / 无限流 / 无文件类型白名单** | 所有 POST API | 🔴 安全违规 |
| **CSP 允许 'unsafe-inline'** | next.config.ts | 🟡 弱化 XSS 防护 |
| **Playwright baseURL = 生产** | playwright.config.ts | 🔴 E2E 污染生产 |
| **framer-motion 幽灵依赖** | home/page, products 三组件 | 🟡 构建风险 |

---

## 7. 每个模块的差距评估 + 根因分析

### 7.1 M01 Home — 完成度 78%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 1.1 | `home/page.tsx:341,345-347,391,411,434-436` | 6 处硬编码 EN/ZH 字符串绕过 i18n（"Choose Path"、"Powered by"、"VMware Alternatives"、迁移步骤标题/描述） | zh 用户看到英文，i18n 审计漏报 |
| 1.2 | `home/page.tsx:424` | 用裸 `<img>` 加载 `/images/architecture/vmware-migration.svg` | 绕过 next/image 优化、违反 CSP img-src 约束 |
| 1.3 | `HeroSection.tsx:20-45,87-114` | 打字机效果 + 鼠标拖动视频进度 **不尊重 `prefers-reduced-motion: reduce`** | WCAG 2.3.3 违规 |
| 1.4 | `HeroSection.tsx:144-152` | `<video>` 无 `poster`、无 `aria-label`、无 `<track>` 字幕 | 慢加载白屏 + a11y 缺失 |
| 1.5 | `home/page.tsx:199,237,275` | 3 个 "Explore Products" 链接指向 `/products`（未带 `#build`/`#run`/`#protect` 锚点） | 与 Navbar/Footer 锚点不一致 |

#### 根因分析

1. **客户端组件优先架构** — `home/page.tsx` 顶部 `'use client'` 阻止服务端 i18n，迫使开发者用 `locale === 'zh' ? ... : ...` 走捷径。
2. **Hero 为 "视觉惊艳" 而生** — 鼠标拖动 + 打字机效果追求 wow factor，未做 a11y 兼容。
3. **无 i18n key 全量审计机制** — 文案小改直接 inline，i18n 键值表长期不更新。

---

### 7.2 M02 Products — 完成度 70%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 2.1 | `CategoryPage.tsx` / `ProductsList.tsx` / `ProductDetail.tsx` | `slugToI18n`(28 项)、`iconMap`(28 项)、`tabColors`、`runSubgroups` **在 3 个文件完全重复** | 违反 AGENTS #49 教训；每次修改需改 3 处 |
| 2.2 | `CategoryPage.tsx:163,225,235` / `ProductsList.tsx:239,350` / `ProductDetail.tsx:183,207,213,224,226` | "Learn more"、"No products found"、"Key Features"、"Interested in {title}?"、"Related Vendor Solutions" 等多处硬编码英文 | zh 用户看英文 UI |
| 2.3 | `/products#build` (Tab) vs `/products/build` (独立路由) | 双路由渲染同一 `CategoryPage`，**无 canonical 标签** | SEO 重复内容惩罚 |
| 2.4 | `[slug]/page.tsx:41,47-48` | `ProductJsonLd.url` 和 Breadcrumb href **缺 `/${locale}/` 前缀** | 结构化数据 URL 错误、面包屑跳错 locale |
| 2.5 | `JsonLd.tsx:156` | `ProductJsonLd` image 兜底 `picsum.photos`；且为服务型产品硬编码 `offers.price:'0'/InStock/USD` | 违反 AGENTS #58 + schema 语义错误 |

#### 根因分析

1. **3 个产品卡片组件 copy-paste** — `CategoryPage` / `ProductsList` / `ProductDetail` 各自复制了 slugToI18n、iconMap 等映射，未抽取共享 `<ProductCard>`。
2. **客户端组件渲染产品数据** — 服务端 fetch Sanity 后传给 `'use client'` 组件，丢失 SSR HTML（SEO 受损）。
3. **两套并行数据获取路径** — `page.tsx` 内联 GROQ 与 `product-data.ts` 的 `getAllProducts()` 字段选择不同（前者缺 `subcategory` 和 `relatedVendors`），无单一数据源。

---

### 7.3 M03 Blog — 完成度 70%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 3.1 | `blog/page.tsx:1` | 在 RSC 中用浏览器端 `@/lib/sanity` 而非 `@/lib/sanity.server` | 约定违反，可能泄漏到浏览器 bundle |
| 3.2 | `blog/[slug]/page.tsx:43-45` + `BlogDetail.tsx:217` | OG image 兜底 `picsum.photos/seed/${slug}/1200/630` | 违反 AGENTS #58 |
| 3.3 | `blog/[slug]/page.tsx:44` | 硬编码 Sanity CDN URL `https://cdn.sanity.io/images/r6ztl1oq/production/...` 并手动解析 asset-ref | 项目 ID 硬编码，字符串解析脆弱 |
| 3.4 | `BlogList.tsx:54-59` | `formatReadingTime` 从 `excerpt` 而非 `content` 计算阅读时间 | 所有文章显示 "1 min read"，无意义 |
| 3.5 | `BlogDetail.tsx:80-83,185` | 调用标签硬编码英文（"Key Takeaway"/"Warning"/"Pro Tip"）；`window.location.href` 在 SSR 阶段为空字符串 | zh 用户看英文 + 分享链接首屏失效 |

#### 根因分析

1. **防御性兜底优先于正确模式** — picsum 兜底、硬编码 CDN、`str()` 防御提取器，都是 "先让它跑" 而非 "做对"。
2. **混合 sanity client 无约定** — 列表用浏览器端、详情用服务端，明显是 copy-paste 漂移。
3. **未引入 `@portabletext/react`** — 自实现 `PortableText` 渲染器，无 marks（粗体/斜体/链接）支持，callout 用文本前缀 hack。

---

### 7.4 M04 Solutions — 完成度 55%（P0 关键）

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 4.1 | `solutions/page.tsx:28-38` | GROQ **未取** `challengesZh`、`solutionsZh`、`recommendedProductsZh`、`metricLabel`、`metricLabelZh`，但 `SolutionsList.tsx:81,85,88,91` 读取这些字段 | 🔴 zh locale 永远走 i18n 兜底，**Sanity 中文内容死代码** |
| 4.2 | `solutions/layout.tsx` | 与 `page.tsx` 重复定义 `generateMetadata`，且 wrapper 是 `<>{children}</>` | 死代码 + metadata 合并混乱 |
| 4.3 | `solutions/page.tsx:1` | RSC 中用浏览器端 sanity client | 同 3.1 |
| 4.4 | `SolutionsList.tsx:138` | `<meta.icon ... />` 小写 JSX 标签 | 🔴 React 视为 DOM 元素，可能不渲染或告警 |
| 4.5 | `SolutionsList.tsx:161-178` | 架构图 SVG 路径 `/images/solutions/${industryKey}-network.svg` 硬编码 | `solution.ts` schema 的 `image` 字段定义但从未消费（死字段） |

#### 根因分析

1. **GROQ 与消费接口漂移** — schema 有 13 字段、query 取 8 字段、consumer 读 11 字段，三方无契约。
2. **i18n + Sanity 混合策略无规范** — zh 从 Sanity、en 从 i18n，但 Sanity 内容从未填齐，设计假设落空。
3. **Layout-as-metadata-wrapper 反模式** — 多个模块（solutions/about/compare/help/contact）都有此冗余。

---

### 7.5 M05 Tickets — 完成度 55%（P0 关键）

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 5.1 | `TicketForm.tsx:51` | `useAutoSave` 返回的 `restoredDraft/acceptDraft/discardDraft` 被忽略 | 表单草稿存了但不还原，AGENTS #11 半实现 |
| 5.2 | `api/tickets/route.ts:22` | 工单号 4 字符随机后缀（`TG-YYYYMMDD-XXXX`），无唯一性重试 | 高并发下碰撞风险 |
| 5.3 | `api/tickets/route.ts:24-47` | ticket insert + audit log + email 三步**无事务包装** | 部分失败留下不一致状态，AGENTS #9 违规 |
| 5.4 | `api/tickets/route.ts` 整体 | 无幂等键，重试创建重复工单 | AGENTS #8 违规 |
| 5.5 | `support/page.tsx` + `TicketList.tsx:65,95` | 无工单详情视图、无状态变更 UI；PATCH/POST 端点存在但 UI 不消费；`TicketList` 行 `cursor-pointer + ArrowRight` 但**不可点击**；"Submit a ticket to get started" 硬编码英文；"PHT" 时区硬编码 | PRD S6 工单管理半成品；i18n 违规 |

#### 根因分析

1. **抽象层有，集成层无** — `useRetry`/`useOptimistic`/`useOfflineCache` 都实现了但没被调用，"规则靠文件存在来满足"。
2. **乐观锁字段 `version` 在 PATCH 用**，但无 UI 触发 PATCH，schema 字段实际无用。
3. **useAutoSave API 设计完整**（`restoredDraft`/`acceptDraft`/`discardDraft`）但消费方只用 `clear`/`lastSaved`，还原流程未走通。

---

### 7.6 M06 Contact — 完成度 60%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 6.1 | `api/contact/route.ts:32` | `await createOdooLead(...)` 阻塞响应；Odoo 慢则联系表单挂起 | 用户体验差，应改异步队列 |
| 6.2 | `api/contact/route.ts` 整体 | `contact_submissions.odoo_synced` 列存在但**成功后从未回写** | schema 字段死代码 |
| 6.3 | `contact/ContactPage.tsx` | 166 行 `page.tsx` 的剥离副本（无样式、无地图、无社交） | 死代码，维护者困惑 |
| 6.4 | `contact/page.tsx:64` | Breadcrumb 标签 `'Contact Us'` 硬编码英文 | i18n 违规 |
| 6.5 | `contact/page.tsx:248` | OpenStreetMap iframe 坐标 (14.6497, 121.0501) 指向马尼拉，但办公室标签写 "台北/香港" | 数据/视觉不一致 |

#### 根因分析

1. **Odoo 集成当 fire-and-forget 但同步 await** — 无异步 job 模式。
2. **两个 ContactPage 实现共存** — 重构中途放弃，留了死文件。
3. **数据模型（`odoo_synced`）设计了但写回路径没实现**。

---

### 7.7 M07 About — 完成度 60%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 7.1 | `about/page.tsx` 整体 | **零 Sanity 集成**，全部内容来自 `messages/{en,zh}.json` | 违反 AGENTS "内容通过 Sanity 多语言字段管理"；改内容需重新部署 |
| 7.2 | `about/page.tsx:73` | 团队照片路径 `/images/team/marco.jpg` 等硬编码在 `.map` 内 | 无 fallback、无 Sanity image 字段、每次渲染重建数组 |
| 7.3 | `about/page.tsx:8-15` | `timeline` 数组有重复年份（2023,2023,2024,2024,2025,2025）但每槽只渲染一个事件 | 数据形状 stub 但未完成 |
| 7.4 | `about/page.tsx:17-28` | `team` 和 `qualifications` 数组只含 `{icon, color}`，内容全在 i18n | 无结构化数据，无 Sanity schema |
| 7.5 | `about/layout.tsx` | 与 solutions 同样的 metadata-only wrapper 死代码 | 同 4.2 |

#### 根因分析

1. **内容策略未强制** — i18n JSON 当内容仓库用，违反 "全部内容走 Sanity" 规则。About 页面很可能是 Sanity 接通前建的，从未迁移。
2. **硬编码资源路径无校验** — 团队照片、图标颜色、时间线年份都在源码里，无 fallback、无校验、无资产清单。
3. **stub 数据形状进了生产** — `timeline` 重复年份、`team`/`qualifications` 仅 icon/color 是明显的占位形状。

---

### 7.8 M08 Compare — 完成度 55%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 8.1 | `compare/page.tsx:38-68` + `CompareTable.tsx` 整体 | `CompareTable.tsx` 有 category 过滤能力但**从未被 page 导入**；page 内联了自己的表格 | 死组件 / 重复实现 |
| 8.2 | `CompareTable.tsx:81` | `t('features.${feature.key}B').includes('N/A')` 同一表达式 OR 链中**重复 2 次** | lazy copy-paste，第二次无效果 |
| 8.3 | `compare/page.tsx:26` | `<Breadcrumb items={...}/>` 未传 `locale` prop | 默认 'en'，`/zh/compare` 显示 "Home" 而非 "首頁" |
| 8.4 | `compare/page.tsx:74-80` | 6 个合作伙伴凭证字符串（"Authorized Partner"、"Channel Partner"）硬编码英文 | i18n 违规 |
| 8.5 | `compare/page.tsx:40-44` | `<table>` 无 `<caption>`、无 `aria-label`；TechGuru 列仅用 `bg-[#00D4FF]/5` 颜色区分 | WCAG 1.4.1（颜色使用）违规 |

#### 根因分析

1. **两套实现各自演化** — page.tsx 和 CompareTable.tsx 独立演进，组件本应是规范实现但 page 绕过它。
2. **i18n 纪律松散** — 合作伙伴字符串当数据而非可翻译内容。
3. **无 a11y review** — 表格语义缺失，视觉样式优先于屏幕阅读器。

---

### 7.9 M09 VMware Alternative — 完成度 75%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 9.1 | `vmware-alternative/layout.tsx:11-18` | metadata 缺 `alternates.canonical` 和 `alternates.languages` | SEO 多语言信号缺失 |
| 9.2 | `vmware-alternative/page.tsx:60-72` | Hero 两个 CTA（hero CTA + phone CTA）都指向 `/contact`；底部 CTA 用 `tel:` | 行为不一致 |
| 9.3 | `vmware-alternative/page.tsx:19-22,160` | 厂商品牌色（`#E57000`、`#0066CC` 等）和 `colors` 数组内联在 JSX | 未进设计 token |
| 9.4 | `vmware-alternative/page.tsx:197-200` | 统计数据 `t('stat1')` 等作为显示值，无数值校验、无 aria-label | 翻译者可注入任意字符串 |
| 9.5 | `vmware-alternative/page.tsx:49,80,90,122,164,219` | 用 `scroll-reveal` 类但依赖全局 IntersectionObserver；若 `.js-loaded` 缺失，内容隐藏 | 违反 PRD S9 渐进增强 |

#### 根因分析

1. **CTA copy-paste** — Hero 复制了 phone CTA 变体但接了同样的 `/contact`。
2. **内联样式漂移** — 厂商主题色按区段写，未集中。
3. **metadata 模板太薄** — layout.tsx 从 compare 复制但缺 SEO 扩展。

---

### 7.10 M10 Help — 完成度 70%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 10.1 | `help/page.tsx:102` | `BreadcrumbJsonLd` items `[{ name: 'Help', url: ... }]` 硬编码英文 | zh SEO 结构化数据错 |
| 10.2 | `help/page.tsx:103` | `<Breadcrumb>` 未传 `locale` prop | 同 8.3 |
| 10.3 | `help/page.tsx:101` | `FAQJsonLd` 接收**全部** `faqItems` 而非 `filteredFaqs` | SEO 显示用户当前看不到的 FAQ |
| 10.4 | `help/page.tsx:145-153` | 类目筛选无 FAQ 时显示 "no results"，但搜索可能为空 | 文案混淆 |
| 10.5 | `help/page.tsx:117` | 搜索无 debounce，每次按键全量扫描 FAQ | 小数据集可接受，无扩展考虑 |

#### 根因分析

1. **i18n 在结构化数据上漏审** — 可视 UI 用 `t()`，JSON-LD 用裸字符串。
2. **Breadcrumb `locale` prop 设计为可选默认 'en'** — 消费方忘记传。
3. **筛选逻辑与 SEO 不同步** — JSON-LD 应反映页面默认状态。

---

### 7.11 M11 Legal — 完成度 60%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 11.1 | `privacy/page.tsx:33` + `terms/page.tsx:33` | 硬编码 `"June 30, 2026"` 日期 | 不本地化、不自动更新 |
| 11.2 | `privacy/page.tsx:60,68` + `terms/page.tsx:56` | `Inquiries@techguru-it.asia` 硬编码多处 | 未集中配置 |
| 11.3 | 多处 | `mailto:` 链接无 `target="_blank"` / `rel="noopener"` | 安全一致性 |
| 11.4 | privacy + terms | 7 节长内容无目录导航 | WCAG 2.4.1（绕过块）建议 |
| 11.5 | privacy + terms | 无 `@media print` 样式、无 "打印" / "下载 PDF" 按钮 | 法律页常见需求缺失 |

#### 根因分析

1. **日期当内容而非数据** — last-updated 应来自构建时元数据或 i18n。
2. **联系信息未集中** — email 多处重复。
3. **法律页当营销页处理** — 同样的布局，缺法律专属 affordance（TOC、打印、PDF）。

---

### 7.12 Auth — 完成度 65%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 12.1 | `LoginForm.tsx:50` | 重置密码 `redirectTo` 指向 `/api/auth/reset-password`，但该端点本身是 POST 重新发重置邮件 | 🔴 循环/断流 |
| 12.2 | `api/auth/reset-password/route.ts:20` | 重置后重定向 `/support/login`，但**全项目无 "设置新密码" 页面** | 流程死路 |
| 12.3 | `LoginForm.tsx` + `RegisterForm.tsx` | 无 CSRF、无 honeypot、无 rate limit、无 captcha | 撞库/注册轰炸向量 |
| 12.4 | `support/login/page.tsx` + `register/page.tsx` | 无 "已登录则跳转" 检查 | 已登录用户能看到登录表单 |
| 12.5 | `lib/supabase/middleware.ts` | `updateSession` 只刷新 session，**无路由保护 redirect 逻辑** | 每个受保护页都要客户端自实现 redirect（闪 loading） |

#### 根因分析

1. **密码重置流程跨客户端+API 设计但 "设置新密码" 页面从未建** — 流程死在 `/support/login`。
2. **认证信任边界全压到 API** — 每路由 `auth.getUser()`，无中间件级路由保护。
3. **Supabase Auth 错误消息原样透传** — 信息泄漏。

---

### 7.13 API Routes — 完成度 55%（P0 关键）

#### 差距清单（8 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 13.1 | `api/upload/route.ts:4` | 50MB 限制与 PRD S2.5（10MB）和迁移注释 line 48 冲突 | PRD 与代码不一致 |
| 13.2 | `api/upload/route.ts` 整体 | **无文件类型白名单** | PRD S2.5 明确要求；任意 MIME 可上传 |
| 13.3 | `api/upload/route.ts:30-51` | 文件**先上传到 Storage 再做 ticket ownership 校验** | 校验失败留孤儿文件 |
| 13.4 | `api/upload/route.ts:40` | 用 `getPublicUrl` 而非 signed URL | 工单附件任何拿到 URL 的人可访问 |
| 13.5 | `api/tickets/[id]/route.ts:92-105` | PATCH 允许非 admin owner 改 `status`/`priority`/`assigned_to`（无字段级角色白名单） | PRD S6 通常限 admin 改状态 |
| 13.6 | 所有 POST 路由 | **无 CSRF token** | CSRF 攻击向量 |
| 13.7 | 所有 POST 路由 | **无 rate limit** | 垃圾提交/炸弹向量 |
| 13.8 | 所有路由 | 无结构化错误日志，错误原样返回客户端 | 信息泄漏 + 不可观测 |

#### 根因分析

1. **安全 = "auth check 即可"** — 输入校验、限流、CSRF 全省了。
2. **文件上传按 happy path 写** — ownership 校验放在上传后图简单，留孤儿。
3. **乐观锁 schema 存在但只 PATCH 用** — POST assign 也用但无 UI 触发。

---

### 7.14 Hooks — 完成度 30%（实现质量高，集成 ≈ 0）

#### 差距清单（4 项）

| # | 文件 | 问题 |
|---|------|------|
| 14.1 | `useOptimistic.ts` | 实现完整但**无任何组件使用**（死代码） |
| 14.2 | `useRetry.ts` | 实现完整但**无任何组件/路由使用**（Odoo、邮件、工单创建全吞错） |
| 14.3 | `useOfflineCache.ts` | 实现完整但 `support/page.tsx` 用裸 `fetch`；网络失败时空白 | 违反 AGENTS #10/#13 |
| 14.4 | `useAutoSave.ts:35-40` | `restoredDraft` 通过 effect 同步到 state，但 `TicketForm` 忽略它；还原端到端不通 |

#### 根因分析

1. **hooks 按规则（AGENTS #6-#15）投机实现** — 文件存在 = 规则满足 = 实际从不集成。
2. **"规则靠存在满足" 反模式** — 评审时看文件存在就过，不验证调用链。
3. **无 `beforeunload` flush** — 关 tab 丢最近 30s 输入。

---

### 7.15 全局基建 — 完成度 80%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 15.1 | `sitemap.ts` | 缺 `/products/build`、`/products/run`、`/products/protect`、`/products/[slug]`、`/compare` | 产品页不被爬虫通过 sitemap 发现 |
| 15.2 | `middleware.ts:17-19` | cookie 合并不完整，只复制 cookies 不合并 headers（如 `Location`） | auth 重定向流可能断 |
| 15.3 | `[locale]/layout.tsx:13-31` | 静态 metadata 仅英文 | zh locale 继承英文 metadata |
| 15.4 | `globals.css:35,187` + `.card`/`.btn-secondary` | body color `#000000` 而非 `var(--color-foreground)`；`.section-title`、`.card`、`.btn-secondary` 硬编码颜色 | token 不一致；dark mode 靠 Tailwind `dark:` 类补救 |
| 15.5 | `JsonLd.tsx` | `ArticleJsonLd` 和 `ProductJsonLd` image 兜底 `picsum.photos`；`OrganizationJsonLd.sameAs: []` 空数组；`ProductJsonLd` 硬编码 `offers.price:'0'` | 违反 AGENTS #58 + schema 语义错 |

#### 根因分析

1. **sitemap 一次性写完未随路由扩展更新** — 无 Sanity 内容到 sitemap 的自动化。
2. **中间件堆叠两个函数无合并工具** — 只 cookies 幸存。
3. **JSON-LD 写成通用组件** — 未考虑 TechGuru 卖服务而非产品，`offers.price:0` 是 schema 滥用。

---

### 7.16 测试 — 完成度 60%

#### 差距清单（5 项）

| # | 范围 | 问题 |
|---|------|------|
| 16.1 | M08-M11 全部 | **零单元测试覆盖**（compare / vmware-alternative / help / privacy / terms） |
| 16.2 | UI 组件 | 10 个组件仅 `LanguageSwitcher` 有测试，**8/10 零覆盖** |
| 16.3 | `e2e/case-studies.spec.ts` | 测试已删功能（Case Studies 2026-07-12 删除） | 死代码 + 违反 AGENTS #55 |
| 16.4 | `api-integration.test.ts` | 仅覆盖 `/api/products` + `/api/contact`；缺 `/api/tickets` CRUD、`/api/upload`、`/api/auth/*`、`/api/revalidate` |
| 16.5 | a11y / 视觉回归 | 无 `@axe-core/playwright` 或 `jest-axe`；无 Percy/Chromatic；无移动端 emulation | PRD S19 WCAG 2.1 AA 无自动化覆盖 |

#### 根因分析

1. **测试按 "已写代码" 而非 "PRD 需求" 编写** — 后加的模块没人补测试。
2. **e2e 不清理用例** — 功能删除但 spec 留下。
3. **a11y 测试不在 CI** — 设计规范无执行保障。

---

### 7.17 构建配置 — 完成度 70%

#### 差距清单（5 项）

| # | 文件:行 | 问题 | 影响 |
|---|---------|------|------|
| 17.1 | `next.config.ts:32-34` | `images.remotePatterns` 包含 `picsum.photos` | 违反 AGENTS #58 |
| 17.2 | `next.config.ts:54-56` | CSP 允许 `'unsafe-inline'` for `script-src` 和 `style-src` | 弱化 XSS 防护，应改 nonce |
| 17.3 | `next.config.ts` | 缺 `poweredByHeader: false`、`reactStrictMode: true` | 信息泄漏 + 开发体验 |
| 17.4 | `vercel.json:2,5` | `buildCommand: "npx next build --webpack"`（强制 Webpack）；`installCommand: "npm install --registry https://registry.npmmirror.com"`（中国镜像） | 非中国区构建可能失败；Turbopack 工作绕过 |
| 17.5 | `playwright.config.ts:8` | `baseURL: 'https://www.techguru-it.asia'`（**生产**）；无 `webServer`；仅 Desktop Edge 单 project；`retries: 1` | 🔴 E2E 污染生产；无移动端；flaky 风险 |

#### 根因分析

1. **CSP 写过一次未迭代** — App Router + RSC 可用 nonce 替代 `'unsafe-inline'`，但未实施。
2. **构建配置本地优先** — China mirror 反映开发者在大陆，但 Vercel 构建区域未必。
3. **E2E 走生产图省事** — 无本地 webServer 启动配置。

---

## 8. 优化方案（按优先级）

### P0 — 安全/数据完整性致命问题（必须立即修复）

| # | 任务 | 关联差距 | 工作量 |
|---|------|----------|--------|
| P0-1 | **API 安全加固**：CSRF token、rate limit（10 req/min/IP）、文件类型白名单（PRD S2.5）、文件大小统一为 10MB、上传顺序改为先校验后上传、改用 signed URL | 13.1-13.8 | M |
| P0-2 | **修复 M04 Solutions GROQ 致命 bug**：补齐 `challengesZh/solutionsZh/recommendedProductsZh/metricLabel/metricLabelZh` 字段；移除 `<meta.icon>` 小写 JSX bug | 4.1, 4.4 | S |
| P0-3 | **修复 Auth 密码重置断流**：建 `/support/reset-password` 页面（设置新密码表单）；修复 `LoginForm.tsx:50` redirectTo；统一 reset 流程入口 | 12.1, 12.2 | M |
| P0-4 | **工单系统补完**：工单详情页 `/support/tickets/[id]`；状态变更 UI（admin）；幂等键（前端 uuid + 后端去重）；ticket insert + audit + email 事务包装（Supabase RPC 或补偿动作）；工单号改 6-8 字符 + 碰撞重试 | 5.2-5.5 | L |
| P0-5 | **移除所有 picsum.photos 引用**：`JsonLd.tsx:77,156`、`blog/[slug]/page.tsx:43-45`、`BlogDetail.tsx:217`、`next.config.ts:32-34` 改为本地 fallback 图 `/images/og-default.png`（新建 1200×630） | 3.2, 13.x, 15.5, 17.1 | S |
| P0-6 | **清理 Case Studies 残留**：删除 `sanity.config.ts` 中 `caseStudy` schema 引用；删除 `e2e/case-studies.spec.ts`；同步更新 PRD S11 | AGENTS #55 | S |

### P1 — i18n / 内容 / 集成完整性问题

| # | 任务 | 关联差距 | 工作量 |
|---|------|----------|--------|
| P1-1 | **全站 i18n 硬编码扫描与修复**：建立 `scripts/i18n-audit.mjs` 扫描 `'<英文>'` 模式；逐模块修复 M01-M11 硬编码字符串（home 6 处、products 多处、blog 调用标签、solutions 架构图标签、contact 面包屑、compare 合作伙伴、help BreadcrumbJsonLd、legal 日期、ticket "Submit a ticket"、"PHT" 时区） | 1.1, 2.2, 3.5, 6.4, 7.x, 8.4, 10.1, 11.1, 5.5 | L |
| P1-2 | **Breadcrumb 组件修复**：将 `locale` prop 改为必填或从 `useParams` 自动获取；`'Home'/'首頁'` 移入 i18n；所有调用方补 locale | 8.3, 10.2, 多模块 | S |
| P1-3 | **Sanity client 统一**：所有 RSC 强制用 `@/lib/sanity.server`；建立 ESLint 规则禁止 RSC 导入 `@/lib/sanity` | 3.1, 4.3, M02 | S |
| P1-4 | **抽取共享 ProductCard 组件**：合并 `CategoryPage.tsx` / `ProductsList.tsx` / `ProductDetail.tsx` 中重复的 `slugToI18n`/`iconMap`/`tabColors`/`runSubgroups` 到 `src/components/products/shared.ts` | 2.1 | M |
| P1-5 | **集成 useRetry/useOptimistic/useOfflineCache**：`/api/contact` 和 `/lib/odoo.ts` 用 `useRetry`；`support/page.tsx` 工单列表用 `useOfflineCache`；`TicketForm` 用 `useOptimistic`；`useAutoSave` 实现还原流程并接入 TicketForm | 14.1-14.4, 5.1 | M |
| P1-6 | **About 页面迁移到 Sanity**：新建 `sanity/schemas/teamMember.ts` 已存在 — 接入；新建 `sanity/schemas/qualification.ts`；改 `about/page.tsx` 从 Sanity 获取内容；时间线年份去重 | 7.1-7.4 | M |
| P1-7 | **Hero a11y 修复**：打字机和鼠标拖动加 `prefers-reduced-motion` 检查；`<video>` 加 `poster`、`aria-label`、`<track>` | 1.3, 1.4 | S |
| P1-8 | **sitemap 补全**：加 `/products/{build,run,protect}` + `/products/[slug]`（从 Sanity 拉） + `/compare`；`lastModified` 用真实数据 | 15.1 | S |
| P1-9 | **middleware 完善**：合并 headers/status；增加受保护路由 redirect 逻辑（`/support/*` 未登录跳 `/support/login`）；`/support/login` 已登录跳 `/support` | 12.5, 15.2 | M |
| P1-10 | **测试补全**：M08-M11 单元测试；UI 组件测试（Breadcrumb、CookieConsent、DarkModeToggle、ErrorBoundary、JsonLd、ScrollToTop、Tooltip、HelpText、FAQAccordion）；API 集成测试覆盖所有 `/api/*`；引入 `@axe-core/playwright` 跑 a11y 扫描 | 16.1-16.5 | L |

### P2 — 体验/SEO/代码质量提升

| # | 任务 | 关联差距 | 工作量 |
|---|------|----------|--------|
| P2-1 | **M08 Compare 重构**：删除内联表格，启用 `CompareTable.tsx`；修重复条件 bug；加 `<caption>` 和 `aria-label` | 8.1, 8.2, 8.5 | S |
| P2-2 | **M09 VMware 修复**：phone CTA 改 `tel:`；metadata 加 canonical + alternates；厂商色进 token | 9.1-9.3 | S |
| P2-3 | **M10 Help 修复**：FAQJsonLd 接收 `filteredFaqs`；空状态文案分场景；搜索 debounce | 10.3-10.5 | S |
| P2-4 | **M11 Legal 增强**：last-updated 改构建时；email 集中到 `lib/config.ts`；加 TOC；加 `@media print` + 打印按钮 | 11.1-11.5 | M |
| P2-5 | **JsonLd 修复**：`OrganizationJsonLd.sameAs` 填 LinkedIn/WhatsApp；`ProductJsonLd` 移除 `offers` 块（服务型）或改 `Service` schema；`ArticleJsonLd` image 改本地 fallback | 15.5 | S |
| P2-6 | **globals.css token 化**：body color 改 `var(--color-foreground)`；`.section-title`、`.card`、`.btn-secondary` 改用 CSS 变量；加 `@media (prefers-reduced-motion: reduce)` 全局禁动画 | 15.4 | S |
| P2-7 | **死代码清理**：`contact/ContactPage.tsx`（整文件）、`lib/resend.ts:132 sendTicketReplyEmail`（接入或删）、`support/page.tsx:7` 死 import、`compare/CompareTable.tsx`（如 P2-1 启用则保留） | 多模块 | S |
| P2-8 | **构建配置修复**：`next.config.ts` 加 `poweredByHeader: false`、`reactStrictMode: true`；CSP 改 nonce 方案；移除 `picsum.photos` remotePattern（与 P0-5 合并）；`vercel.json` 移除 npmmirror（或加 regions 配置）；`playwright.config.ts` 改 `webServer` 启动本地 build | 17.1-17.5 | M |
| P2-9 | **文档同步**：根据本 spec 优化结果，更新 `README.md` 完成度表、`docs/modules/INDEX.md`、AGENTS.md 教训记录；新建 `MEMORY.md`（AGENTS 多处引用但缺失） | 全局 | S |
| P2-10 | **PRD 反向同步**：删除 PRD S11 案例展示；S22 开放问题表对齐当前状态；S17 数据模型补 RLS policy 备注 | AGENTS #55 | S |

---

## 9. ADDED Requirements

### Requirement: TGWS-GAP-001 全站源码级 i18n 审计

The system SHALL provide an automated i18n audit script (`scripts/i18n-audit.mjs`) that scans all `.tsx`/`.ts` files under `src/` for hardcoded user-facing strings (English text in JSX, string literals passed to components as labels/props).

#### Scenario: 硬编码字符串发现
- **WHEN** 开发者运行 `npm run i18n:audit`
- **THEN** 脚本输出所有疑似硬编码的字符串（文件:行:内容）
- **AND** 退出码非零当发现 >0 处

### Requirement: TGWS-GAP-002 API 安全基线

The system SHALL enforce on all POST/PUT/PATCH API routes:
- CSRF token validation（双重提交 cookie 模式）
- Rate limiting（10 req/min/IP，可配置）
- Input length validation（subject ≤200, description ≤800）
- Enum validation（category ∈ {build, run, protect}）

#### Scenario: 缺少 CSRF token
- **WHEN** POST 请求未带 `x-csrf-token` header 或与 cookie 不匹配
- **THEN** 返回 403 + `{ success: false, error: { code: 'CSRF_INVALID' } }`

#### Scenario: 超出速率限制
- **WHEN** 同一 IP 1 分钟内发起 >10 个 POST 请求
- **THEN** 返回 429 + `Retry-After` header

### Requirement: TGWS-GAP-003 工单完整流程

The system SHALL provide:
- 工单详情页 `/support/tickets/[id]`
- Admin 状态变更 UI（status / priority / assigned_to）
- 工单创建幂等键（前端生成 uuid，后端按 `idempotency_key` 去重）
- 工单号 6-8 字符 + 碰撞重试（最多 3 次）
- ticket insert + audit log + email 三步事务包装（Supabase RPC 或补偿）

#### Scenario: 重复提交
- **WHEN** 用户网络抖动重试同一工单（相同 idempotency_key）
- **THEN** 后端返回首次创建的工单号，不创建新记录

### Requirement: TGWS-GAP-004 Sanity 内容契约

The system SHALL enforce:
- RSC 强制使用 `@/lib/sanity.server`（ESLint 规则）
- GROQ 查询字段集 = Sanity schema 字段集 + 消费方字段集（单源真理）
- `solutions/page.tsx` GROQ 必须包含 `challengesZh/solutionsZh/recommendedProductsZh/metricLabel/metricLabelZh`

### Requirement: TGWS-GAP-005 文件上传安全

The system SHALL enforce on `/api/upload`:
- 文件大小 ≤ 10MB（与 PRD S2.5 对齐）
- 文件类型白名单：`image/png, image/jpeg, image/webp, image/gif, application/pdf, text/plain, application/zip`
- 先校验 ticket ownership，再上传到 Storage（避免孤儿）
- 返回 signed URL（有效期 1 小时），不返回 public URL
- 文件名 sanitize（移除 `..` 和 `/`）

---

## 10. MODIFIED Requirements

### Requirement: PRD [S6] 工单系统（修订）

原 PRD S6 仅声明 "提交+列表+状态管理"，实际状态管理 UI 缺失。修订为：

- 提交：✅ 实现，需补幂等键
- 列表：✅ 实现，需补 i18n（"Submit a ticket to get started"、"PHT" 时区）
- 详情：❌ 缺失，需新建 `/support/tickets/[id]`
- 状态管理 UI：❌ 缺失，需 admin 视图
- 事务安全：❌ 缺失，需补
- 幂等：❌ 缺失，需补

### Requirement: PRD [S19] 无障碍（修订）

原 PRD S19 列出 WCAG 2.1 AA 要求但无自动化执行。修订为：

- 增加：CI 中运行 `@axe-core/playwright`，零 critical 违规
- 增加：所有动画尊重 `prefers-reduced-motion: reduce`（含 Hero 打字机、鼠标拖动）
- 增加：`<video>` 必须有 `poster`、`aria-label`、`<track>`（如有音频）

### Requirement: PRD [S21] 测试策略（修订）

原 PRD S21 描述测试金字塔但无覆盖率门槛。修订为：

- 单元测试覆盖率 ≥ 60%（ Statements / Branches / Functions / Lines）
- M01-M11 每个模块至少 1 个测试文件
- 10 个 UI 组件至少 8 个有测试
- E2E 覆盖关键流程：注册 → 登录 → 提交工单 → 查看工单 → admin 改状态
- E2E **不再以生产 URL 为 baseURL**，改为本地 build + `webServer` 启动
- a11y 扫描作为 E2E 步骤

---

## 11. REMOVED Requirements

### Requirement: Case Studies（PRD S11）

**Reason**: 2026-07-12 已完全删除，但 PRD S11、sanity.config.ts、e2e/case-studies.spec.ts 未同步。
**Migration**:
- 删除 `sanity/schemas/caseStudy.ts` 文件
- 从 `sanity.config.ts` 移除 `caseStudy` import 和 type 数组项
- 删除 `e2e/case-studies.spec.ts`
- 删除 `scripts/query-case-studies.mjs` 和 `scripts/verify-case-studies.mjs`
- 更新 PRD S11 标记为 "[已废弃 - 2026-07-12]"
- 更新 `next.config.ts` 中 case-studies → blog 的重定向（保留 30 天后删除）

### Requirement: 手动暗色模式切换（设计系统冲突）

**Reason**: AGENTS.md 设计规则明确 "Dark mode: Automatic via `prefers-color-scheme: dark` — no manual toggle"，但 `DarkModeToggle.tsx` 实现了手动切换并持久化到 localStorage，直接违反设计系统。
**Migration**:
- 评估：保留 DarkModeToggle 但改为 "跟随系统 / 强制浅色 / 强制深色" 三态切换（更现代做法），并更新 AGENTS.md 设计规则
- 或：删除 DarkModeToggle 组件，恢复纯自动切换
- **此决策需用户确认**，本 spec 仅标记冲突，不擅自决定

---

## 12. 验收标准（高层）

参见 `checklist.md` 详细检查点。本 spec 验收通过的最低门槛：

1. 所有 P0 任务完成 + 验收通过
2. P1 任务完成 ≥ 80%
3. P2 任务完成 ≥ 50%
4. `npm run i18n:audit` 退出码 0
5. `npm run test` 覆盖率 ≥ 60%
6. `npm run test:e2e` 全绿（基于本地 build，非生产）
7. `npm run build` 成功（Webpack + Turbopack 双模式）
8. `npm run lint` 零 error
9. `npm run typecheck` 零 error
10. 部署 https://www.techguru-it.asia 后人工抽查 11 个模块核心流程通过

---

## 附录 A：评估方法说明

- **未采信的二手信息**：README 完成度表、`docs/modules/INDEX.md` 状态、`UI-UX-GAP-ASSESSMENT.md`（已归档）、`PROJECT-REVIEW-REPORT.md`、AGENTS.md Open Items
- **采信的一手信息**：实际 `.tsx`/`.ts`/`.sql`/`.json`/配置文件源码
- **未覆盖项**（标注 "unknown - needs runtime test"）：
  - Sanity 实际响应字段是否全填充
  - `picsum.photos` 兜底图是否真被触发
  - 重复路由是否真受 SEO 惩罚
  - 移动菜单路由切换是否真不关闭
  - RLS INSERT policy 缺失是否真导致 API 失败（取决于 service-role key 使用）
- **建议**：执行阶段优先用 Playwright 截图验证 P0 修复（遵循 AGENTS #38）

## 附录 B：与 AGENTS.md 教训的对应关系

| AGENTS 教训 | 本 spec 对应章节 |
|-------------|-----------------|
| #36 事实核查必须读源码 | 整个评估方法 |
| #49 i18n 映射多文件同步 | 2.1 |
| #55 PRD 必须反向同步 | P0-6, P2-10 |
| #58 禁用随机图片 | P0-5 |
| #56 一次性穷极所有方面 | 第 7 章逐模块清单 |
| #54 评估必须完整列具体缺陷 | 第 7 章每模块 5+ 项 |
| #57 分析与执行一致 | 第 8 章优化方案与第 7 章差距一一对应 |
