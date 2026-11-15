# TGWS 代码库系统性架构分析

> 分析对象：`D:\软件集\Vibe Coding\Mimo Space\TGWS`
> 分析基线：Git 分支 `Trunk`，HEAD `4e5895c chore(blog): remove wizard-selected preview cover samples`
> 分析方式：静态阅读全部源码 + 配置 + schema + 脚本，未运行构建（构建结论引用仓库内既有报告，已标注）

---

## 0. 代码库边界与仓库拓扑

先把"哪些是代码库、哪些不是"钉死，否则后面所有数字都会失真。

| 路径 | 性质 | 文件量 | 是否纳入分析 |
|------|------|--------|--------------|
| `tgws/src/` | **主应用源码**（Next.js App Router） | 193 个 ts/tsx/css/json | ✅ 全量 |
| `tgws/sanity/` | Sanity Studio schema 定义 | 9 个 schema | ✅ 全量 |
| `tgws/supabase/migrations/` | PostgreSQL 迁移（数据模型） | 3 个 SQL | ✅ 全量 |
| `tgws/e2e/` + `tgws/tests/functional/` | Playwright E2E / 功能测试 | 24 个 spec | ✅ 结构层 |
| `tgws/scripts/` | 内容运维脚本（seed / upload / audit / fix） | 151 个 | ✅ 分类说明 |
| `scripts/`（根） | Sanity 内容注入脚本 | 7 个 | ✅ 全量 |
| 根目录 `*.mjs` / `*.cjs` | 一次性排查脚本（博客封面、重复 slug、标题清单） | 7 个 | ✅ 说明 |
| `PRD/` + `PRD-TechGuru-Website.md` | 需求源（Specs-driven 的唯一真源） | 11 个 md | ✅ 引用 |
| `docs/modules/` | 模块级实现文档（M01–M11） | 12 个 md | ✅ 交叉印证 |
| `docs/archive/` | 设计稿归档（Smart-Form / AI-Hub / Ticket-Trend） | 含大量截图、日志 | ⚠️ **非现行实现** |
| `docs/eval/` | 视觉/文案评估产物 | 报告 + 截图脚本 | ⚠️ 评估用 |
| `tgws/node_modules/` | 依赖（18309 js + 9167 ts） | 45580 文件 | ❌ 第三方产物 |
| `tgws/.next/`、`tgws/coverage/`、`test-results/` | 构建 / 覆盖率 / 测试产物 | — | ❌ 产物 |
| `tgws/tgws/test/` | **嵌套残留目录**（仅 1 个 test 子目录，无源码） | 极少 | ❌ 历史遗留 |
| `.mimocode/` | 工具链配置（hooks / plans / skills / cron-lock） | — | ❌ 非业务代码 |
| `index.html`（根） | 一次性"树架构校验 / 术语 / Battlecard"报告页 | 1 | ⚠️ 参考，非应用入口 |

**结论：真正的应用代码库只有一份 —— `tgws/`。** 根目录是"项目管理与内容运营层"，`tgws/` 是"应用层"。二者共同构成本工作区，但只有一个可部署单元。

---

## 1. 工程的整体目标与业务背景

### 1.1 业务实体

TechGuru Network & Data Solutions —— 面向东南亚（菲律宾为落地重心，覆盖中国香港、中国台湾地区）的企业 IT 集成商。品牌主张三词概括：**Build. Run. Protect.**

| 支柱 | 业务内涵 | 产品线（Sanity `product.category` 枚举） |
|------|----------|------------------------------------------|
| **Build** | AI / AIGC、云迁移、AI 辅助开发、遗留系统 AI 增强 | `build` |
| **Run** | 虚拟化、HCI、云平台、存储硬件、托管、BCDR、路由交换、无线 | `run`（下分 8 个 subcategory） |
| **Protect** | NGFW/IPS、WAF、EDR、NDR、云安全、SD-WAN、MDR、应急响应 | `protect` |

### 1.2 工程目标（从代码反推，非文档愿景）

代码实际承担的职责有六条，按实现完整度排序：

1. **营销获客站点**：24 条页面路由，双语（EN / 繁体中文），Sanity 驱动内容，SEO 完整（sitemap / robots / JSON-LD / hreflang）。
2. **售前技术工具**：VMware 替代方案页 + **TCO 计算器**（3 厂商 × 多场景 × 逐年累计成本 + PNG 导出）。这是全站唯一的"可计算业务逻辑"，也是差异化卖点。
3. **AI 增强站内搜索**：站内 Sanity 检索 + Google CSE + Tavily + Gemini 融合摘要，并做**能力缺口检测**（搜不到 → 判定为业务空白 → 收集线索）。
4. **线索捕获双通道**：联系表单（落 Supabase + 同步 Odoo CRM）、搜索缺口线索表单（落 Supabase `leads` + 三封内部通知邮件 + 客户确认邮件）。
5. **认证式工单支持门户**：Supabase Auth 登录 → 建单 / 附件上传 / 状态流转 / 批量操作 / 审计日志 / 管理员统计看板。
6. **运营后台支撑**：151 个脚本承担内容批量入库、封面生成、i18n 修补、页面审计 —— 属于"工程外的生产线"。

### 1.3 工程方法论：Specs-driven Development

`AGENTS.md` 明确规定 **PRD 是唯一真源**，所有实现必须回溯到 PRD 的 `[S1]–[S22]` 分节。实际落地形态是双轨文档：

- `PRD-TechGuru-Website.md`（34KB 原始全文）
- `PRD/` 按模块拆分为 `GLOBAL.md` + `M01–M07` + `S07–S08`（解决单文件过大导致 AI 上下文溢出）

这条约束在代码中留下了明显痕迹：源码注释里大量出现 `AUDIT-0xx` 编号（安全审计项）与 `PRD constraint #17`（审计日志必写），说明"需求编号 → 代码位置"是可追溯的。

---

## 2. 技术架构与技术栈选型

### 2.1 运行时拓扑

```
                        ┌──────────────────────────────┐
   浏览器 ──HTTPS──▶     │  Vercel Edge / Serverless     │
                        │                              │
                        │  middleware.ts               │
                        │   ├─ next-intl 路由重写       │
                        │   └─ Supabase session 刷新    │
                        │                              │
                        │  App Router (RSC + Client)   │
                        │   ├─ 24 页面路由（SSG/ISR）   │
                        │   └─ 12 API 路由（Node）      │
                        └───────┬──────────┬───────────┘
                                │          │
              ┌─────────────────┘          └────────────────┐
              ▼                                             ▼
   ┌────────────────────┐                       ┌────────────────────────┐
   │ Sanity (CMS, 只读) │                       │ Supabase (写主库)       │
   │ project r6ztl1oq   │                       │ Postgres + Auth +      │
   │ dataset production │                       │ Storage                │
   │ CDN: useCdn=true   │                       │ RLS 全表启用            │
   └────────────────────┘                       └────────────────────────┘
              ▲                                             ▲
              │ Webhook (HMAC/secret)                       │
              │ → /api/revalidate → revalidatePath/Tag       │
              │                                             │
   ┌──────────┴──────────┐                        ┌─────────┴─────────┐
   │ Odoo CRM (出站)     │                        │ Resend (出站邮件)  │
   │ session + call_kw   │                        │ 4 类事务邮件       │
   └─────────────────────┘                        └───────────────────┘
              │
   ┌──────────┴──────────────────────────────────────────────┐
   │ 外部 AI / 搜索（出站，均可降级）                          │
   │ Google CSE · Tavily · Gemini 2.0 Flash                  │
   └─────────────────────────────────────────────────────────┘
```

### 2.2 技术栈与版本（以 `package.json` 为准）

| 层 | 选型 | 版本 | 选型依据 / 实际表现 |
|----|------|------|---------------------|
| 框架 | **Next.js**（App Router） | `16.2.9` | SSR/SSG + ISR + API Routes 一体；`dev` 与 `build` 均强制 `--webpack`（不用 Turbopack） |
| UI 运行时 | React | `19.2.4` | Server Components 默认、Client Components 显式标注 |
| 语言 | TypeScript | `^5`，`strict: true` | 全量 strict，路径别名 `@/* → ./src/*` |
| 样式 | **Tailwind CSS 4** | `^4.3.2` | 走 `@tailwindcss/postcss`；**无 tailwind.config.js**，主题写在 `globals.css` 的 `@theme inline` |
| 组件库 | **无**（手写） | — | `AGENTS.md` 明令禁用 shadcn/ui；图标统一 `lucide-react@1.23.0` |
| i18n | **next-intl** | `4.13.1` | `localePrefix: 'always'`、`localeDetection: false`；EN + 繁中双 JSON |
| CMS | **Sanity** | `sanity@6.3.0` / `next-sanity@13.1.1` | Studio 与站点同仓；只读拉取，`useCdn: true` |
| 数据库 / 认证 | **Supabase** | `@supabase/supabase-js@2.110.0` / `ssr@0.12.0` | Postgres + Auth（邮箱密码 + Google OAuth）+ Storage |
| 邮件 | **Resend** | `6.17.1` | 4 类事务邮件，全部做 HTML 转义 |
| 部署 | **Vercel** | — | `vercel.json` 指定 `npm ci --registry https://registry.npmmirror.com` |
| 测试 | Vitest + Playwright | `4.1.9` / `^1.61.1` | 单测 jsdom；E2E 仅 Edge channel（无 Chromium） |
| 动效 | framer-motion（**未声明**） | 见 §8.1 | ⚠️ 依赖声明缺失 |

### 2.3 架构选型的三个关键取舍

**① CMS 与业务库彻底分离（Sanity 读 / Supabase 写）**
内容类数据（product / solution / post / faq / partner / teamMember / timelineEvent / qualification / tcoCalculator）全部在 Sanity；交易类数据（users / tickets / leads / contact_submissions）全部在 Supabase。**没有任何跨库事务**。好处是内容编辑不影响业务表、CDN 便宜；代价是"内容引用业务数据"（如工单选产品）只能通过 `/api/products` 拉一次轻量列表（只返回 `_id/title/category`）。

**② 双客户端模式贯穿全站**
`lib/sanity.ts` 与 `lib/sanity.server.ts` **内容完全相同**（同 projectId、同 dataset、同 `useCdn: true`）；同理 `lib/supabase/{client,server}.ts` 分浏览器/服务端。命名表达的是"使用位置"，不是"配置差异"。

**③ 降级优先，而非失败优先**
所有外部依赖都有失败路径：Odoo 未配置 → 返回 `{success:false}` 并只记日志，表单仍成功；Gemini 无 key → 模板拼接摘要；CSE/Tavily 无 key → 只返回站内结果；TCO 配置缺失 → 页面显示"暂不可用"占位。这是"营销站不能因为 CRM 挂了就 500"的合理设计。

---

## 3. 各模块的构成及职责

按**架构层**而非按页面组织，因为页面会复用层内组件，按页面讲会重复。

### 3.1 路由层（`src/app/`）— 88 文件

**根级（4 文件）**

| 文件 | 职责 |
|------|------|
| `layout.tsx` | 最小根布局，只挂 `globals.css` 与全局 metadata，**渲染 `<>{children}</>` 不产出 `<html>`** |
| `page.tsx` | `redirect('/en')` —— 根路径落到默认语言 |
| `global-error.tsx` | 内联样式的兜底错误页（根布局不可用时使用） |
| `robots.ts` / `sitemap.ts` | SEO 产出；sitemap 动态合并 Sanity 的 post / product slug，双语言展开 |

> 注意：真正的 `<html lang>` 与 `<body>` 在 `[locale]/layout.tsx`，根 layout 是"空壳"。这是 next-intl 的标准解法，但也意味着**根 layout 无法承载全局 Provider**。

**[locale] 布局与错误处理**

| 文件 | 职责 |
|------|------|
| `[locale]/layout.tsx` | i18n Provider、Navbar/Footer、CookieConsent、ScrollToTop、ScrollReveal、HashScroll、JSON-LD、字体 preload、主题闪烁抑制脚本、Umami 注入、hreflang 生成、**未知 locale → `notFound()`** |
| `[locale]/error.tsx` / `not-found.tsx` | 段级错误边界 / 404 |
| `[locale]/page.tsx` | 仅做 `generateMetadata` + `export { default } from './home/page'` |

**页面路由（23 个 `page.tsx`，24 条可达路径）**

| 路由 | 渲染模式 | 数据来源 | 说明 |
|------|----------|----------|------|
| `/[locale]`、`/home` | Client（`'use client'`） | **纯 i18n JSON + 硬编码 partner 数组** | 首页不查 Sanity；Hero 视频 + 打字机 + 双行反向 Logo 跑马灯 |
| `/products` | RSC + `revalidate=3600` | Sanity GROQ | 列表 |
| `/products/build` `/run` `/protect` | RSC + ISR | `getAllProducts()` → 客户端过滤 | 三支柱分类页，`run` 额外按 `runSubgroups` 分组并插入 VMware 专题卡 |
| `/products/[slug]` | RSC + ISR | `getProductBySlug()` | 详情 + `ProductJsonLd` |
| `/solutions` | RSC + ISR | Sanity `solution` | 客户端 6 行业 Tab 切换 |
| `/blog` / `/blog/[slug]` | RSC + ISR | Sanity `post` | 详情页做 coverImage 三态兼容（URL 字符串 / 对象 / 缺失） |
| `/about` / `/about/timeline` | RSC（`layout.tsx` 出 metadata） | Sanity teamMember / qualification / timelineEvent | 页面本身不导出 metadata，避免覆盖 locale 标题 |
| `/compare` | Client | i18n | 7 维对比表（对 VMware 替代竞品） |
| `/vmware-alternative` | Client | i18n + `TcoCalculatorSection`（客户端 `fetch('/api/tco')`） | 5 家替代方案 + 4 步迁移 + TCO |
| `/contact` | Client | i18n + `fetch('/api/contact')` | 表单 + 办公室 + OSM iframe + WhatsApp 二维码 |
| `/help` | Client | i18n（FAQ 按 `faqCounts` 循环拼 key） | 本地搜索 + 分类过滤 + FAQAccordion |
| `/support` | Client | Supabase 浏览器客户端 + `/api/tickets` | 三 Tab：dashboard / new-ticket / my-tickets |
| `/support/login` `/register` | Client | Supabase Auth | 邮箱密码 + Google OAuth + 重置密码 |
| `/support/admin/dashboard` | **RSC 门禁 + Client 主体** | `layout.tsx` 调 `requireAdmin()`；页面 `fetch('/api/tickets/stats')` | 服务端先拦，客户端再取数 |
| `/profile` | Client | Supabase Auth `updateUser` | 改名 / 改密 |
| `/privacy` `/terms` | Client | i18n | 纯文案 |

**API 路由（12 个 `route.ts`）**

| 路由 | 方法 | 鉴权 | 限流 | 职责 |
|------|------|------|------|------|
| `/api/contact` | POST | 无 | 5/min | 校验 → Supabase `contact_submissions` → Odoo lead（失败不阻断） |
| `/api/tickets` | POST/GET | Supabase user | 10/min（仅 POST） | 建单（含 `randomUUID` 单号 + 审计 + 确认邮件）/ 列自己的单 |
| `/api/tickets/[id]` | GET/PATCH/POST | user + 归属校验 | 无 | 详情（含附件/评论）/ 乐观锁更新 + 审计 + 状态邮件 / 管理员指派 |
| `/api/tickets/stats` | GET/PATCH | admin（GET 分支降级为"我的统计"） | 无 | 聚合统计 / ≤100 条批量改状态 + 批量审计 |
| `/api/upload` | POST | user + 工单归属 | 10/min | 50MB、MIME 白名单（无 SVG）、文件名净化、DB 失败回滚存储对象 |
| `/api/auth/callback` | GET | — | — | OAuth code 换 session，**open-redirect 防护（含 decode 二次校验）** |
| `/api/auth/reset-password` | POST | — | 3/min | 发重置邮件；恒返回成功（防账号枚举） |
| `/api/search` | POST | 无 | 20/min | 站内 + CSE + Tavily 并行 → 去重 → 黑名单过滤 → Gemini 摘要 → 写 Sanity `searchLog` |
| `/api/search/lead` | POST | 无 | 3/min | 落 `leads` → 3 封内部通知 + 1 封客户确认 |
| `/api/tco` | GET | 无 | 无（`force-dynamic`） | 拉 Sanity `tcoCalculator` 全量配置 |
| `/api/products` | GET | 无 | 无 | 只返回 `_id/title/category` 供表单下拉 |
| `/api/revalidate` | POST | **自定义 secret + 恒定时比较** | 无 | 按 `_type` 精准 `revalidatePath` + `revalidateTag` |

### 3.2 组件层（`src/components/`）— 60 文件

| 分组 | 组件 | 职责与关键实现 |
|------|------|----------------|
| **layout** | `Navbar` | 固定玻璃态导航；桌面端 MegaMenu + 搜索/语言/主题/用户菜单；移动端全屏抽屉（Escape 关闭、`aria-modal`）；`aria-expanded` |
| | `MegaMenu` | hover/focus 双触发 + 150ms 延迟关闭；`activePath` 前缀匹配高亮；键盘 Escape 收起 |
| | `Footer` | 4 列深色导航 + 社交 + **订阅表单（纯前端 `setSubscribed(true)`，无后端）** |
| **hero** | `HeroSection` | 视频背景 + **鼠标位移擦洗视频时间轴**（`fastSeek` + rAF 节流 + `seeked` 锁）、打字机（38ms/字、600ms 延迟）、复制邮箱、CTA 延迟入场 |
| **auth** | `LoginForm` / `RegisterForm` | Supabase 密码登录 / 注册 / Google OAuth / 重置密码模式切换 |
| **tickets** | `TicketForm` | 选产品（拉 `/api/products`）、发生时间、800 字描述、**粘贴图片上传**、`useAutoSave` 草稿、建单后串行上传附件 |
| | `TicketList` | 状态徽章、搜索过滤、管理员多选 + 批量改状态 + CSV/导出回调、附件预览入口 |
| | `AttachmentPreview` | 附件类型分流展示 |
| **ui** | `GlobalSearch`（446 行） | 全站搜索模态：防抖、筛选面板、图片搜索入口、AI 摘要卡、外链结果、缺口 → 线索表单、空白态推荐（硬编码 VMware 卡 + Sanity 最新 3/2/2） |
| | `TcoCalculatorSection` → `TcoCalculatorClient`（371 行） | Section 负责取数/加载/降级；Client 负责输入（核/CPU/年）、场景切换、逐年累计 SVG 折线图、PNG 导出（SVG→canvas→download） |
| | `LanguageSwitcher` | 路径正则替换 `^/(en|zh)` 后 `router.push` |
| | `ThemeToggle` / `DarkModeToggle` | 三态/二态主题（两套并存，Navbar 用 ThemeToggle） |
| | `UserMenu` | `onAuthStateChange` 订阅、hover/click 双开、登出回首页 |
| | `CookieConsent` / `ScrollReveal` / `ScrollToTop` / `HashScroll` | GDPR 横幅、IntersectionObserver 进场、回顶、锚点滚动 |
| | `JsonLd` | Organization / WebSite / Product / FAQ / Breadcrumb 结构化数据 |
| | `Breadcrumb` / `Tooltip` / `HelpText` / `FAQAccordion` / `ErrorBoundary` / `QRCode` / `VendorLogo` | 通用展示件 |

### 3.3 领域层（`src/lib/`）— 28 文件

| 文件 | 职责 | 关键设计 |
|------|------|----------|
| `tco.ts` | **生产在用**的 TCO 引擎 | 两套定价模型：`subscription_per_core`（VMware/Nutanix，价×核×年）与 `buyout_per_cpu`（Sangfor，买断价×CPU + 服务费率×年×CPU）；`calcScenario` / `calcCumulative` / `fuzzPrice`（估算价取整到 $500） |
| `tco-engine.ts` | **死代码**（零生产引用，仅 `tco-engine.test.ts` 引用） | 另一套 per_core/per_node/per_socket/subscription 模型，含 `minCores/minNodes` 门槛 |
| `search/internal.ts` | Sanity GROQ 站内检索 | 中英关键词映射表（超融合→hci 等 9 组）；拉全量后内存匹配；`calculateRelevance` 加权评分（标题 0.6 / 描述 0.3 / 分词 0.1+0.05，上限 1） |
| `search/external.ts` | Google CSE + Tavily | Tavily 查询会**注入业务上下文**并清洗引号/换行（防 prompt injection）；19 条域名黑名单 + 广告词过滤；`deduplicateResults` 按 URL 去重 |
| `search/ai.ts` | Gemini 2.0 Flash 摘要 | 强制三段输出 `[RESOURCES]/[INSIGHT]/[SOURCES]`；**后处理补齐缺失段 + 域名白名单过滤（14 个）**；无 key 走模板 fallback |
| `search/capability.ts` | 能力缺口检测 | 站内结果 ≤2 且非通用词 → 判定缺口，生成文案 |
| `search/types.ts` | 搜索域类型 | `SearchRequest/SearchResult/ExternalResult/SearchFilters` |
| `api-guard.ts` | 零依赖 API 防护 | 内存滑动窗口限流（Map，5000 桶上限 + 过期清理）、同源校验（Origin 白名单）、字段校验器、JSON body 安全解析 |
| `auth-guard.ts` | 服务端路由门禁 | `requireAuth` / `requireAdmin` / `redirectIfAuthenticated`；查 `users.role` |
| `errors.ts` | 结构化错误 + 埋点 | `logServiceError`（console + 可选 `ERROR_WEBHOOK_URL` fire-and-forget，5s 超时）、`isConfigured`、`trackEvent`（Umami） |
| `odoo.ts` | Odoo CRM 集成 | `/web/session/authenticate` 拿 cookie（解析多 `Set-Cookie`）→ `/web/dataset/call_kw` 建 `crm.lead`；邮箱只记域名 |
| `resend.ts` | 事务邮件 | 4 类模板（建单 / 状态变更 / 重置密码 / 回复）；`escapeHtml` 全字段转义；懒初始化单例 |
| `sanity.ts` / `sanity.server.ts` | Sanity 只读客户端 | 两份内容一致，CDN 开启 |
| `sanity.image.ts` | 图片 URL 构建 | `urlFor()` |
| `supabase/client.ts` | 浏览器客户端 | `createBrowserClient` |
| `supabase/server.ts` | RSC/Route Handler 客户端 | `cookies()` 读写，`setAll` 包 try/catch（RSC 不可写时静默） |
| `supabase/middleware.ts` | 会话刷新 | `getUser()` 触发 token 刷新并把新 cookie 写回响应 |

### 3.4 状态与副作用层（`src/hooks/`）— 8 文件

| Hook | 用途 | 关键点 |
|------|------|--------|
| `useAutoSave` | 表单草稿存 localStorage | 30s 定时 + 版本号校验 + 挂载恢复 + `acceptDraft/discardDraft` |
| `useOfflineCache` | 缓存优先 + 后台刷新 | 首帧读缓存（`isStale=true`），fetcher 成功后覆写；解析失败即删 |
| `useOptimistic` | 乐观更新 + 回滚 | **`committedRef` 快照**，失败回滚到真实上一态（修复过 `setState(prev=>prev)` 空操作） |
| `useRetry` | 指数退避重试 | 2^n + 30% 抖动，上限 10s；卸载中断；`mountedRef` 防护 |

### 3.5 数据模型层

**Supabase（业务库）**

```
auth.users ──1:1──▶ users(id, email, role∈{customer,admin,super_admin}, ...)
                      │
                      ├──1:N──▶ tickets(user_id, ticket_number, category∈{build,run,protect},
                      │                  status∈{open,in_progress,resolved,closed},
                      │                  priority∈{low,medium,high,critical},
                      │                  assigned_to, version, occurred_at, deleted_at)
                      │            ├──1:N──▶ ticket_attachments(ticket_id, file_url, ...)
                      │            ├──1:N──▶ ticket_comments(ticket_id, user_id, is_internal)
                      │            └──1:N──▶ ticket_audit_log(ticket_id, action, old_value, new_value, performed_by)
                      │
                      └──1:N──▶ leads(assigned_to, search_query, gap_description, status, ...)

contact_submissions(name, email, company, phone, message, odoo_synced)   ← 独立表
search_logs(...)                                                        ← 建了但未使用（见 §8.3）
```

设计特征：**软删除**（`deleted_at`）、**乐观锁**（`version` 递增 + `.eq('version', current.version)`）、**全表 RLS**、`updated_at` 触发器。

**Storage**：单 bucket `ticket-attachments`，对象键 `${user.id}/${Date.now()}-${safeName}`。

**Sanity（内容库，9 个 document 类型）**

| schema | 关键字段 | 被谁消费 |
|--------|----------|----------|
| `product` | title/slug/category(3)/subcategory(8)/description(Zh)/features/relatedVendors/order | `/products*`、`/api/products`、搜索、sitemap |
| `solution` | industry(6)/challenges(Zh)/solutions(Zh)/recommendedProducts(Zh)/metricLabel(Zh)/image | `/solutions`、搜索 |
| `post` | title(Zh)/excerpt(Zh)/content(Zh)/coverImage/architectureDiagram/category(4)/tags | `/blog*`、搜索、sitemap |
| `faq` | question(Zh)/answer(Zh)/category | 搜索（`/help` 实际走 i18n，**不查 Sanity**） |
| `partner` | Logo 墙 | `/home` 实际用硬编码数组，**未查 Sanity** |
| `teamMember` / `timelineEvent` / `qualification` | 关于我们三段 | `/about`、`/about/timeline` |
| `tcoCalculator` | scenarios[].bundles[]（**校验强制每场景恰好 3 个 bundle**） | `/api/tco` |

### 3.6 支撑层

| 目录 | 职责 |
|------|------|
| `src/i18n/` | `config.ts`（locales `['en','zh']`、default `en`）、`request.ts`（动态 import 对应 JSON） |
| `src/messages/` | `en.json` 85KB / `zh.json` 77KB，19 个顶层命名空间：nav/hero/home/solutions/blog/about/contact/products/footer/privacy/vmware/auth/support/admin/error/terms/compare/whyUs/help |
| `src/test/setup.ts` | Vitest 环境装配 |
| `sanity.config.ts` | Studio 配置（projectId **硬编码** `r6ztl1oq`，dataset `production`，`structureTool`） |
| `sanity.cli.ts` | CLI projectId |
| `next.config.ts` | redirects（`case-studies` → `blog`）、images remotePatterns（6 个域名）、安全响应头、CSP、缓存头、`optimizePackageImports` |
| `vercel.json` | `next build --webpack`、`.next`、npm 镜像安装 |

### 3.7 生产/运维脚本层（非运行时）

| 位置 | 数量 | 性质 | 说明 |
|------|------|------|------|
| `tgws/scripts/` | 151 | 内容生产线 | 可归纳为 6 类：`seed-*`（入库）、`upload-*`（批量上传）、`check-*`（内容体检）、`fix-*`（i18n/封面修补）、`rewrite-*`（文案重写）、`audit-*`/`site-audit`（页面巡检）。**全部直连 Sanity API，依赖 `.env.local` 中的 `SANITY_API_TOKEN`** |
| `scripts/`（根） | 7 | 一次性注入 | `embed-svg-diagrams`、`add-locale-fields`、`verify-*`、`capture-architecture`（Playwright 截架构图） |
| 根 `*.mjs` / `*.cjs` | 7 | 一次性排查 | 博客重复封面、重复 slug、标题清单、单篇抓取 |

> 这批脚本是"工程外资产"：它们解释了为什么内容库能快速堆到 70+ 篇博客，但也意味着**内容质量与一致性依赖人工逐次跑脚本**，没有 CI 约束。

### 3.8 测试层

| 层 | 规模 | 覆盖对象 |
|----|------|----------|
| 单元/组件（Vitest + RTL） | **69 个 `*.test.ts(x)`** | 全部 lib、全部 hooks、全部 API route、几乎所有 UI 组件、关键页面 |
| E2E（Playwright，Edge） | `e2e/` 20 个 spec | 首页、导航、MegaMenu、博客、i18n 全站扫描、全局搜索、注册/登录/建单/列表/管理台 5 条用户旅程、移动端 |
| 功能测试 | `tests/functional/` 6 个 spec + HTML 报告 | 表单、导航、页面渲染、搜索、TCO、工单 |
| 审计产物 | `audit-results.json`、`coverage/`、`test-results/` | 历史快照 |

---

## 4. 模块之间的依赖与调用关系

### 4.1 分层依赖规则（实际遵守情况）

```
app/  ──────────────▶ components/ ──────▶ hooks/
  │                        │
  │                        └──────────▶ lib/（sanity, supabase/client, errors, tco）
  │
  └──────────────────▶ lib/（全部）

lib/ ──▶ 外部 SDK（@sanity/client, @supabase/*, resend）
lib/ ✗─▶ app/      （无反向依赖，正确）
lib/ ✗─▶ components/（无反向依赖，正确）
```

**实测依赖热度**（`from '@/lib/...'` 出现次数，排除测试）：

| 模块 | 次数 | 含义 |
|------|------|------|
| `@/lib/errors` | 27 | 全站错误/埋点基础设施，耦合面最广 |
| `@/lib/supabase/server` | 9 | 全部写操作 API |
| `@/lib/sanity.server` | 7 | 页面数据读取 |
| `@/lib/supabase/client` | 6 | 客户端鉴权（support / profile / UserMenu / Login / Register / admin） |
| `@/lib/sanity` | 6 | 客户端搜索与部分 RSC 页 |
| `@/lib/api-guard` | 6 | 5 个公开写接口 |
| `@/lib/tco` | 4 | TCO 页 + API |
| `@/lib/auth-guard` | 3 | admin layout、support layout 等 |
| `@/lib/search/*` | 5 | 仅 `/api/search` |
| `@/lib/resend` / `@/lib/odoo` | 2 / 1 | 仅对应业务路由 |

### 4.2 三条最关键的调用链

**① 内容读取链（读路径，SSG/ISR）**

```
[locale]/layout.tsx  ──▶ Navbar ──▶ GlobalSearch ──▶ lib/sanity.client.fetch()
                                          │
[locale]/products/page.tsx ──▶ lib/sanity.client.fetch(PRODUCT_QUERY)
                                          │
                              ProductsList（client）──▶ 渲染
                                          │
                     Next ISR 缓存（revalidate=3600）
                                          ▲
                     /api/revalidate ◀── Sanity Webhook（_type 决定失效路径）
```

**② 工单写入链（写路径，鉴权 + 审计 + 邮件）**

```
support/page.tsx (client)
  ├─ supabase.auth.getUser()                    ← 浏览器 SDK
  ├─ from('users').select('role')                ← RLS 放行本人
  └─ fetch('/api/tickets')
        │
        ▼
  api/tickets/route.ts
    requireSameOrigin → rateLimit(10/min) → auth.getUser()
    → validateFields → insert tickets（randomUUID 单号）
    → insert ticket_audit_log('created')
    → sendTicketCreatedEmail().catch(log)        ← 不阻断响应
        │
        ▼
    Response { success, data }
        │
        ▼
  TicketForm 拿到 ticket id → uploadFiles() 串行 POST /api/upload
        → Storage 写入 → 拿 publicUrl → insert ticket_attachments
```

**③ 搜索链（多源并行 + AI 融合）**

```
GlobalSearch（client）
  ├─ 空白态：Sanity 直查最新 product/solution/post（浏览器端，3+2+2）
  └─ 提交：POST /api/search
        │
        ▼
  api/search/route.ts
    rateLimit(20/min)
    ├─ searchInternal(query)  ── Sanity GROQ 全量拉取 + 内存匹配 + 评分
    ├─ searchGoogleCSE(query) ── 外部 HTTP（10 条）
    └─ searchTavily(query)    ── 外部 HTTP（5 条 + answer）
        │  Promise.all 并行
        ▼
    detectCapabilityGap（≤2 条且非通用词 → 缺口）
    deduplicateResults（按 URL 去重）
    filterExternalResults（19 域名黑名单 + 广告词）
    generateAiSummary（Gemini 2.0 Flash → 三段格式 → 后处理白名单）
        │
        ├─▶ 写 Sanity `searchLog`（失败仅记日志）
        ▼
    返回 { aiSummary, internalResults, externalResults, capabilityGap }
        │
        ▼
    gap.detected → 展示 LeadCaptureForm → POST /api/search/lead
        → 落 Supabase `leads` → Resend 3 内部 + 1 客户
```

### 4.3 模块间耦合的客观评价

| 关系 | 耦合度 | 风险 |
|------|--------|------|
| 页面 ↔ Sanity schema | **高**（GROQ 字符串里写死字段名） | schema 改名即页面静默空数据（有 try/catch → 返回 `[]`，不报错） |
| 页面 ↔ i18n JSON | **高**（`t('key')` 硬编码） | 缺键 → `MISSING_MESSAGE` 警告 + 显示 key 原文 |
| `/api/search` ↔ 4 个 search 子模块 | 低（清晰分层） | 良好 |
| 工单 API ↔ auth-guard | 中（API 内部自校验，未复用 `requireAuth`） | 两套鉴权实现并存（见 §8.4） |
| `lib/tco` ↔ `lib/tco-engine` | **零**（tco-engine 为孤岛） | 死代码维护负担 |
| 组件 ↔ 硬编码数据 | 中（home partners、shared.tsx 的 `slugToI18n`/`productIcons`） | 新产品上线必须同步改 2 处（注释已警告 `AGENTS.md rule #49`） |

---

## 5. 数据的传输与流转方式

### 5.1 传输协议与格式总览

| 通道 | 协议 / 格式 | 认证方式 | 使用位置 |
|------|-------------|----------|----------|
| RSC → Sanity | HTTPS + GROQ（GET，CDN 缓存） | projectId（公开） | 所有内容页 |
| 浏览器 → Sanity | HTTPS + GROQ（**CORS 放行的公开读**） | projectId（公开） | GlobalSearch 空白态推荐 |
| 浏览器 → Next API | HTTPS + JSON | Cookie session（Supabase） | 全部写操作 |
| 浏览器 → Supabase | HTTPS + PostgREST | JWT（`createBrowserClient` 自动带） | 鉴权、角色查询、资料更新 |
| Next API → Supabase | HTTPS + PostgREST | **用户 JWT 透传（anon key + cookie）** | 工单/线索/联系 |
| Next API → Supabase Storage | HTTPS multipart | 同上 | 附件 |
| Next API → Odoo | JSON-RPC（`call_kw`）+ Cookie | 账号密码换 session | 联系表单 |
| Next API → Resend | HTTPS JSON | API Key | 4 类邮件 |
| Next API → CSE / Tavily / Gemini | HTTPS JSON | API Key（query/header） | 搜索 |
| Sanity → Next | HTTPS POST Webhook | 自定义 `x-revalidate-secret` | ISR 失效 |

### 5.2 状态与缓存策略

| 数据类型 | 缓存位置 | 有效期 | 失效手段 |
|----------|----------|--------|----------|
| 内容页 HTML/RSC | Next ISR | `revalidate = 3600`（1h） | Sanity Webhook → `/api/revalidate` 精准路径 + tag |
| Sanity 查询结果 | Sanity CDN | 默认 CDN TTL | 同 Webhook |
| TCO 配置 | **不缓存**（`force-dynamic`） | 每次请求 | — |
| 静态资源 | Vercel CDN | `/logos/*`、`/_next/static/*` → 1 年 immutable | 文件名 hash |
| 表单草稿 | localStorage（`ticket-form-draft`） | 30s 写一次，版本号失效 | 提交成功 `clear()` |
| 搜索/离线数据 | localStorage（`useOfflineCache`） | 无 TTL，后台刷新 | 解析失败即删 |
| 主题 | localStorage（`theme`） | 永久 | 用户切换 |
| 会话 | Cookie（HttpOnly/Secure/SameSite，由 Supabase SSR 管理） | Supabase 默认 | 登出 / 刷新轮换 |

### 5.3 数据一致性设计

| 场景 | 手段 | 代码位置 |
|------|------|----------|
| 工单并发更新 | 乐观锁 `version` + `.eq('version', current.version)` | `api/tickets/[id]/route.ts` |
| 附件 DB/Storage 双写 | DB 插入失败 → `storage.remove([filePath])` 回滚 | `api/upload/route.ts` |
| 联系表单 + CRM 双写 | Supabase 先落库；Odoo 失败只记日志（**不重试、不补偿**） | `api/contact/route.ts` |
| 工单状态变更 | 更新 + 审计 + 邮件三段；审计失败只记日志 | `api/tickets/[id]/route.ts` |
| 内容删除 | 软删除 `deleted_at`，所有查询带 `.is('deleted_at', null)` | Supabase 全表 |
| 搜索日志 | 写 Sanity（失败不影响响应） | `api/search/route.ts` |

### 5.4 序列化与编码约定

- 所有 API 统一信封：成功 `{ success: true, data }`，失败 `{ success: false, error }`（`/api/contact` 的失败分支缺 `success` 字段，属不一致）。
- Sanity 图片字段存在**三种形态**：对象（`{asset:{_ref}}`）、绝对 URL 字符串、缺失。`blog/[slug]` 已做三态兼容；其他页未做。
- 审计日志的 `old_value` / `new_value` 存 **JSON 字符串**（`TEXT` 列），不是 `jsonb`。

---

## 6. UI 设计层面的结构与交互细节

### 6.1 设计系统（`DESIGN.md` + `globals.css` 双源）

**色彩：单一强调色 + 三支柱语义色**

| 角色 | 值 | 用途 | 使用约束 |
|------|-----|------|----------|
| Primary | `#00D4FF`（青） | CTA、激活态、focus ring、链接 hover | **面积 ≤10%**，禁止大面积铺底 |
| Accent | `#7B61FF`（紫） | Run 支柱、渐变辅助 | 不单独作主色 |
| Success | `#22C55E` | Protect 支柱、成功态 | — |
| Danger | `#EF4444` | 校验错误 | — |
| 浅色底 | `#F4F4F5` / 卡片 `#FAFAFA` / 文字 `#18181B` | — | — |
| 深色底 | `#09090B` / 卡片 `#18181B` / 文字 `#FAFAFA` | — | CSS `.dark` 类驱动，非 media query |

**字体**：`HelveticaNowDisplay-Medium`（标题）/ `HelveticaNowDisplayW01-Rg`（正文）/ `JetBrains Mono`（代码），均从 `db.onlinewebfonts.com` 远程加载，`layout.tsx` 内 `preload` + 双 `preconnect`。**注意：字体依赖第三方 CDN，且 CSP 中 `style-src`/`font-src` 已为其放行。**

**尺度**：`.section-title` = `clamp(2rem,5vw,3rem)`/700；`.section-subtitle` = `clamp(1rem,2vw,1.125rem)`/1.7；卡片圆角 16px、按钮全圆角 9999px、输入框 8px；内容宽 `max-w-6xl/7xl`，边距 `px-5 sm:px-8`。

**排版细节**：`h1–h6` 用 `text-wrap: balance`，`p/li` 用 `text-wrap: pretty`，`letter-spacing: -0.02em`（标题），`antialiased`。

### 6.2 布局骨架（所有页面共享）

```
<html lang={locale} class={dark?}>
  ├─ <head>  字体 preload · 主题闪烁抑制脚本(同步) · Umami(defer)
  └─ <body class="bg-[#F4F4F5] dark:bg-[#09090B]">
       ├─ <a class="skip-link">Skip to main content</a>     ← 无障碍
       ├─ Navbar（fixed，glass-nav，z-50，高 ~73px）
       ├─ <main id="main-content"> 页面内容 </main>
       ├─ Footer（深色 4 列）
       ├─ CookieConsent（首次访问横幅）
       ├─ ScrollToTop（滚动 >500px 出现）
       ├─ ScrollReveal / HashScroll（全局脚本型增强）
       └─ JSON-LD（Organization + WebSite）
```

### 6.3 关键交互细节（逐条，都是可验证的实现）

| 交互 | 实现方式 | 文件 |
|------|----------|------|
| **Hero 视频随鼠标擦洗** | 监听 `mousemove`，`deltaX+deltaY` 归一化到视口宽高 → 映射为 `video.currentTime` 增量；`fastSeek`（不支持则 `currentTime`）；`seeked` 事件解锁，避免 seek 风暴 | `HeroSection.tsx` |
| **打字机** | `setInterval` 38ms 逐字，600ms 后启动，完成置 `done` | 同上 |
| **双行反向 Logo 跑马灯** | 数组对半切分，各自 `[...row, ...row, ...row]` 三倍拼接；CSS `animate-marquee-left/right`；hover 时 `animationPlayState: paused`；两侧渐变遮罩 | `home/page.tsx` |
| **MegaMenu 防误触** | `mouseenter` 立即开、`mouseleave` 150ms 延迟关；`onFocus`/`onBlur`（`relatedTarget` 判断）支持键盘；Escape 收起 | `MegaMenu.tsx` |
| **移动端全屏导航** | `<div role="dialog" aria-modal>` + `opacity/pointer-events` 过渡；Escape 关闭；汉堡三线变 X（rotate + translate） | `Navbar.tsx` |
| **主题切换** | head 内**同步内联脚本**读 localStorage → 加 `.dark`，防 FOUC；`suppressHydrationWarning`；无存储时跟随 `prefers-color-scheme` | `[locale]/layout.tsx` |
| **语言切换** | 取 `window.location.pathname`，正则替换首段 locale，`router.push`（保留当前页路径） | `LanguageSwitcher.tsx` |
| **滚动进场** | `IntersectionObserver(threshold 0.1)` + `.scroll-reveal` → `.revealed`；`prefers-reduced-motion` 时直接显示 | `layout.tsx` 内联 + `ScrollReveal.tsx` |
| **搜索防抖与筛选** | 输入防抖后 `POST /api/search`；筛选面板可折叠（打开即展开）；结果分「站内/AI 摘要/站外」三段 | `GlobalSearch/*` |
| **TCO 实时计算** | 输入核数/CPU/年数 → `useMemo(calcScenario)`；`computed` 标志控制"计算后才出结果"；逐年累计折线图手写 SVG；PNG 导出走 `XMLSerializer → Blob → Image → canvas → toDataURL` | `TcoCalculatorClient.tsx` |
| **工单草稿自动保存** | 30s 定时写 localStorage + 版本号；重新进入提示恢复/丢弃 | `useAutoSave.ts` + `TicketForm.tsx` |
| **粘贴图片上传** | `onPaste` 读 `clipboardData.items` 中 `image/*`，`URL.createObjectURL` 预览，随单提交后串行上传 | `TicketForm.tsx` |
| **批量操作** | 管理员多选（`Set<string>`）→ `PATCH /api/tickets/stats`（≤100 条）→ 批量审计 | `TicketList.tsx` |
| **表格横向滚动** | `overflow-x-auto` 包裹，移动端不挤压列宽 | `compare/page.tsx` |

### 6.4 响应式与无障碍

**断点**：以 Tailwind 默认 `sm 640 / md 768 / lg 1024` 为主；导航在 `md` 切换桌面/移动；产品网格 `sm:2 / lg:3`；方案 Tab 移动端横向滚动。

**无障碍（PRD [S19] WCAG 2.1 AA）实测措施**：
- 跳转链接（`skip-link`）与表单跳转锚
- 表单：`aria-required` / `aria-invalid` / `aria-describedby` / `role="alert"` / `aria-live="polite"`
- 交互元素统一 `min-h-[44px]` 触控区
- 焦点环 `focus-visible` 统一 2px 青色
- `prefers-reduced-motion` 全局降级动画
- 装饰性图片 `alt=""`，语义图片有 `alt`

### 6.5 UI 层的结构性问题

1. **两套主题组件并存**：`ThemeToggle`（三态 light/dark/auto）与 `DarkModeToggle`（二态）。Navbar 用前者，`DarkModeToggle` 仍存在且有测试 —— 属未清理。
2. **首页与 `/home` 双入口**：`[locale]/page.tsx` re-export `home/page.tsx`，两套 URL 渲染同一内容但 canonical 只指向 `/{locale}`。`not-found.tsx` 的"回首页"链接却指向 `/{locale}/home`，与 canonical 不一致。
3. **首页数据硬编码**：partner 数组写在组件内（`home/page.tsx:124`），Sanity 有 `partner` schema 却未使用；`/home` 也不做 ISR（纯 client），首屏依赖 JS。
4. **`/help` 的 FAQ 不走 CMS**：Sanity 有 `faq` schema，但帮助中心按 i18n `faqCounts` 循环拼 key，内容维护要改 JSON 而非 CMS。
5. **`Footer` 订阅表单无后端**：`handleSubscribe` 只 `setSubscribed(true)`，无任何请求 —— UI 承诺与实现不符。

---

## 7. 关键入口、核心配置与主要数据流向（速查）

### 7.1 五个必须知道的文件

| 优先级 | 文件 | 为什么关键 |
|--------|------|------------|
| 1 | `tgws/src/app/[locale]/layout.tsx` | 全站唯一 `<html>/<body>`、Provider、主题脚本、SEO metadata、hreflang |
| 2 | `tgws/src/middleware.ts` | 所有非静态请求的第一道关口（i18n 重写 + Supabase 会话刷新），`matcher` 排除 `api/_next/静态文件` |
| 3 | `tgws/next.config.ts` | 安全头（CSP/HSTS/XFO）、图片白名单、ISR 重定向、包优化 |
| 4 | `tgws/src/lib/supabase/middleware.ts` | 会话续期的唯一实现点；cookie 合并逻辑直接决定登录态是否丢失 |
| 5 | `tgws/src/lib/tco.ts` | 全站唯一有真实业务算法的模块 |

### 7.2 核心配置清单

| 配置 | 位置 | 关键内容 |
|------|------|----------|
| 路由 i18n | `src/i18n/config.ts` + `middleware.ts` | `['en','zh']`，`always` 前缀，**关闭自动语言检测** |
| 安全策略 | `next.config.ts → headers()` | CSP（含 `frame-ancestors 'none'`）、HSTS 2 年 preload、`X-Frame-Options: DENY`、`Permissions-Policy` 全禁 |
| 图片域名 | `next.config.ts → images.remotePatterns` | `cdn.sanity.io`、`*.supabase.co`、自有域、`*.vercel.app`；AVIF+WebP；8 档 deviceSizes |
| 构建 | `vercel.json` | `next build --webpack`（**非 Turbopack**）、npm 国内镜像 |
| Schema | `sanity.config.ts` | projectId 硬编码 `r6ztl1oq`、dataset `production` |
| 数据模型 | `supabase/migrations/001–003` | 8 张表 + RLS + 触发器 |
| 测试 | `vitest.config.ts` / `playwright.config.ts` | jsdom + `src/**/*.test`；E2E baseURL 直指**生产域** |

### 7.3 一张图看主要数据流

```
                          ┌─────────────┐
   ①内容读（ISR 1h）       │   Sanity    │
   ───────────────────────▶│  (只读CDN)  │
                          └──────┬──────┘
                                 │ Webhook(_type)
                                 ▼
                          ┌─────────────┐
                          │ /api/       │
                          │ revalidate  │
                          └─────────────┘

   ②线索写（双通道）
   浏览器 ──/api/contact──▶ Supabase.contact_submissions ──▶ Odoo crm.lead（可失败）
   浏览器 ──/api/search/lead──▶ Supabase.leads ──▶ Resend ×4

   ③工单写（鉴权+审计+邮件）
   浏览器 ──/api/tickets──▶ Supabase.tickets ──▶ audit_log ──▶ Resend
          ──/api/upload──▶ Storage.ticket-attachments ──▶ ticket_attachments

   ④搜索读（多源并行）
   浏览器 ──/api/search──┬─▶ Sanity（站内）
                        ├─▶ Google CSE（站外）
                        ├─▶ Tavily（站外+answer）
                        └─▶ Gemini（融合摘要）──▶ 写回 Sanity.searchLog

   ⑤工具计算（纯前端）
   浏览器 ──/api/tco──▶ Sanity.tcoCalculator ──▶ calcScenario/calcCumulative
                                              ──▶ SVG 图表 ──▶ PNG 下载
```

---

## 8. 结构性问题与风险（如实列出，按严重度排序）

> 以下均为静态阅读可确认的事实，未做运行时验证；标注"待验证"的项需实际构建/联网确认。

### 8.1 【高】两个生产依赖未在 `package.json` 声明

`framer-motion`（被 `CategoryPage.tsx`、`ProductsList.tsx`、`ProductDetail.tsx` 引用）与 `date-fns`（被 `TicketList.tsx` 引用）**均不在 `dependencies` 中**，仅作为其他包的传递依赖被 hoist 到 `node_modules` 与 `package-lock.json`（`framer-motion` 出现在某包的 `dependencies` 里）。

后果：`npm ci` 目前能装（lockfile 有），但一旦上游包移除该依赖，构建会直接失败；且这是典型的"幽灵依赖"，本地能跑、干净环境未必能跑。修复成本极低（补进 `dependencies`）。

### 8.2 【高】`leads` 表 RLS 策略引用不存在的列

`supabase/migrations/003_add_search_tables.sql` 中：

```sql
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id OR assigned_to = auth.uid());
```

但 `leads` 表定义里**没有 `user_id` 列**（只有 `assigned_to`）。PostgreSQL 会在创建策略时报 `column "user_id" does not exist`，导致该迁移中**后续语句（search_logs 建表与策略、触发器）全部回滚或未执行**。

待验证：线上库可能已被手工修正。需以实际 schema 为准，但仓库里的迁移脚本本身是错的。

### 8.3 【中】搜索日志双写目标不一致

- `003` 迁移建了 `search_logs` 表（含完整 RLS）。
- 但 `/api/search` 实际写的是 **Sanity 的 `searchLog` document**（`client.create({_type:'searchLog', ...})`）。
- 全代码库**没有任何地方写 `search_logs` 表**。

结果：一张空表 + 一套为它写的 RLS + 一个未在 `sanity.config.ts` 注册的 `searchLog` 类型（Studio 里看不到，但 API 能写）。数据实际沉在 Sanity dataset 里，与"用 Supabase 存业务数据"的架构约定相悖。

### 8.4 【中】鉴权实现分裂成两套

| 位置 | 方式 | 角色默认值 |
|------|------|------------|
| `lib/auth-guard.ts`（RSC 页面门禁） | 查 `users.role`，无则 `'user'` | `'user'` |
| `api/tickets/[id]`、`/stats`（API 内部） | 各自重查 `users.role`，判断 `admin \|\| super_admin` | 无兜底 |

而数据库 `users.role` 的 `CHECK` 约束是 `('customer','admin','super_admin')` —— **没有 `'user'`**。`auth-guard` 的兜底值 `'user'` 是一个 schema 中不存在的角色。当前不写库所以不报错，但语义已经错位（"customer" vs "user"）。三处角色判断逻辑应合并为一个 `getUserRole()`。

### 8.5 【中】密码重置链接指向 API 端点

`LoginForm.tsx`：

```ts
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/api/auth/reset-password`,
})
```

`/api/auth/reset-password` 只有 `POST`（用于**发送**重置邮件），没有 `GET` 处理页面。用户点邮件里的链接会打到这个 API 端点，得到 405，而不是"设置新密码"界面。同时 `LoginForm` 自身也调用了 `resetPasswordForEmail`，与 `/api/auth/reset-password` 路由功能重复。

### 8.6 【中】`tco-engine.ts` 是完整死代码

`lib/tco-engine.ts`（约 200 行，含另一套定价模型与 `calculateTCO`）**零生产引用**，只有 `tco-engine.test.ts` 引用它。实际生产用的是 `lib/tco.ts`。两套引擎语义不同（一个按 tier 分档 + 门槛过滤，一个按 bundle 计算），保留双份会误导后续维护者。

### 8.7 【低】Sanity 客户端重复定义

`lib/sanity.ts` 与 `lib/sanity.server.ts` 内容逐字相同。命名暗示"服务端专用配置"，实际没有差异（同 `useCdn: true`）。要么合并，要么让 server 版真正关掉 CDN 以保证新鲜度。

### 8.8 【低】i18n 与 CMS 的内容源分裂

同一类内容存在两条维护路径：
- FAQ：Sanity 有 `faq` schema，但 `/help` 读 i18n JSON。
- Partner Logo：Sanity 有 `partner` schema，但首页读硬编码数组。
- 产品文案：Sanity 有 `description/descriptionZh`，但 `CategoryPage` 优先用 i18n `features.{slug}`，两处需同步（`shared.tsx` 注释已警告曾有 desync bug）。

### 8.9 【低】工程卫生

| 问题 | 证据 |
|------|------|
| 仓库含 45580 个 `node_modules` 文件 + `.next` + `coverage` + `test-results` | 工作区快照；`.gitignore` 应已排除，但目录仍在磁盘 |
| 嵌套残留目录 `tgws/tgws/test/` | 无源码，易误判为第二套代码库 |
| 根目录 7 个一次性 `*.mjs`/`*.cjs` 未归档 | `patch-dup-blog.cjs`、`fix-dup-blog-covers.mjs` 等 |
| `sanity.config.ts` 硬编码 projectId | `r6ztl1oq`（非密钥，但降低可移植性） |
| `/api/contact` 失败响应缺 `success: false` | 与其他 11 个路由信封不一致 |
| `Footer` 订阅表单无后端 | 纯本地 state |
| E2E baseURL 直指生产域 | `playwright.config.ts` → `https://www.techguru-it.asia`，本地跑测试会打生产 |

### 8.10 历史报告中的既有结论（引用，非本轮验证）

| 来源 | 结论 | 时间 |
|------|------|------|
| `ACCEPTANCE_REPORT.md` | **有条件通过，74/100**；构建通过（58/58 静态页）；ESLint 21 errors；覆盖率 15.6% | 2026-07-29 |
| `TEST_REPORT.md` | 24 页面 + 12 API 巡检；首页存在 React #418 hydration 错误；博客 77 张封面 `naturalWidth=0` | 2026-07-31 |
| 当前代码库 | 已有 **69 个单测文件**（远超报告期的覆盖水平），说明覆盖率结论可能已过时 | 本轮统计 |

> 覆盖率与 ESLint 现状需重跑 `npm run test:coverage` / `npm run lint` 才能给出当前值 —— 本轮未执行。

---

## 9. 一句话总结

**这是一个"单仓单体、内容与业务双库分离、读多写少、以营销获客为主轴、附带一条完整工单业务线"的 Next.js 16 应用。** 结构上分层清晰（app / components / hooks / lib / 双库），安全与降级意识明显强于一般营销站（CSP、RLS、限流、同源校验、恒定时比较、审计日志全都在），TCO 计算器与 AI 搜索是两个真正的差异化功能；主要技术债集中在**依赖声明不全、鉴权逻辑三处分裂、内容源双轨（i18n vs CMS）、以及一批未清理的死代码与一次性脚本**。
