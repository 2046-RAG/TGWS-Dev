# TGWS 全项目差距优化任务清单

> **change-id**: `audit-tgws-gap-optimization`
> **配套文档**: `spec.md`（差距评估与根因）/ `checklist.md`（验收检查点）
> **执行原则**: P0 先行 → 用户审批 → P1 批次 → P2 批次；每完成一个 task 必须更新本文档勾选状态并运行 `npm run lint && npm run typecheck && npm run test:run`

---

## P0 — 安全/数据完整性致命问题（必须立即修复）

### Task P0-1: API 安全加固
- [ ] SubTask P0-1.1: 实现 CSRF token 中间件（双重提交 cookie 模式），文件 `src/lib/csrf.ts` + `src/middleware.ts` 集成
- [ ] SubTask P0-1.2: 实现 rate limit（基于 `@upstash/redis` 或内存 Map，10 req/min/IP），文件 `src/lib/rate-limit.ts`
- [ ] SubTask P0-1.3: 修复 `src/app/api/upload/route.ts`：
  - 文件大小改 10MB（`10 * 1024 * 1024`）
  - 加文件类型白名单（image/png, image/jpeg, image/webp, image/gif, application/pdf, text/plain, application/zip）
  - 调整顺序：先校验 ticket ownership，再上传 Storage
  - 改用 `createSignedUrl`（有效期 1h）替代 `getPublicUrl`
  - 文件名 sanitize：`filename.replace(/[\/\\]/g, '_')`
- [ ] SubTask P0-1.4: 在 `src/app/api/tickets/route.ts` 和 `src/app/api/tickets/[id]/route.ts` 加：
  - 字段长度校验（subject ≤200, description ≤800）
  - enum 校验（category ∈ {build, run, protect}；status ∈ {open, in_progress, resolved, closed}；priority ∈ {low, medium, high, critical}）
  - PATCH 字段级角色白名单（非 admin 不可改 status/priority/assigned_to）
- [ ] SubTask P0-1.5: `src/app/api/contact/route.ts` 和 `src/app/api/auth/reset-password/route.ts` 加 rate limit（5 req/min/IP）
- [ ] SubTask P0-1.6: 统一错误响应格式 `{ success: false, error: { code, message } }`；不返回原始 Supabase 错误给客户端；服务端用结构化日志（`console.error` with JSON）

**验证**:
- `curl -X POST /api/contact` 无 CSRF token → 403
- `for i in {1..15}; do curl -X POST /api/contact ...; done` → 第 11 个起 429
- 上传 11MB 文件 → 413
- 上传 `.exe` 文件 → 415
- PATCH /api/tickets/[id] as customer 改 status → 403

---

### Task P0-2: 修复 M04 Solutions GROQ 致命 bug
- [ ] SubTask P0-2.1: 修改 `src/app/[locale]/solutions/page.tsx` 的 GROQ 查询，补齐字段：`challengesZh, solutionsZh, recommendedProductsZh, metricLabel, metricLabelZh`
- [ ] SubTask P0-2.2: 修复 `src/app/[locale]/solutions/SolutionsList.tsx:138` 的 `<meta.icon ... />` 小写 JSX bug，改为 `const Icon = meta.icon; <Icon ... />`
- [ ] SubTask P0-2.3: 用 Playwright Edge 截图 `/zh/solutions` 验证中文内容从 Sanity 加载

**验证**:
- `/zh/solutions` 显示的 challenges/solutions 来自 Sanity（非 i18n JSON 兜底）
- 6 个 industry tab 都能切换且图标正常渲染

---

### Task P0-3: 修复 Auth 密码重置断流
- [ ] SubTask P0-3.1: 新建 `src/app/[locale]/support/reset-password/page.tsx`（设置新密码表单，调用 `supabase.auth.updateUser({ password })`）
- [ ] SubTask P0-3.2: 修改 `src/components/auth/LoginForm.tsx:50` 的 `redirectTo` 改为 `${window.location.origin}/${locale}/support/reset-password`
- [ ] SubTask P0-3.3: 修改 `src/app/api/auth/reset-password/route.ts` 重定向到 `/support/reset-password` 而非 `/support/login`
- [ ] SubTask P0-3.4: `src/app/[locale]/support/login/page.tsx` 和 `register/page.tsx` 加 "已登录则跳转 `/support`" 检查（server-side）
- [ ] SubTask P0-3.5: 单元测试覆盖密码重置完整流程

**验证**:
- 点 LoginForm "Forgot password" → 收邮件 → 点链接 → 落地 `/support/reset-password` → 输入新密码 → 登录成功
- 已登录用户访问 `/support/login` 自动跳转 `/support`

---

### Task P0-4: 工单系统补完
- [ ] SubTask P0-4.1: 新建 `src/app/[locale]/support/tickets/[id]/page.tsx`（工单详情页，含状态变更 UI for admin）
- [ ] SubTask P0-4.2: 修改 `src/components/tickets/TicketList.tsx` 行可点击 → 跳转 `/support/tickets/[id]`
- [ ] SubTask P0-4.3: 修改 `src/components/tickets/TicketForm.tsx` 生成 `idempotency_key`（uuid v4）作为 hidden field
- [ ] SubTask P0-4.4: 修改 `src/app/api/tickets/route.ts`：
  - 加 `idempotency_key` 字段查询（命中则返回原工单）
  - 工单号改 6 字符 base36 + 碰撞重试 3 次
  - 用 Supabase RPC 或 sequential 操作包装 insert + audit log + email（补偿动作：email 失败不回滚工单）
- [ ] SubTask P0-4.5: 数据库迁移 `003_add_idempotency_key.sql`：`tickets` 表加 `idempotency_key TEXT UNIQUE`、`ticket_audit_log` 加 INSERT policy、`ticket_attachments` 加 INSERT policy、`ticket_comments` 加 INSERT policy
- [ ] SubTask P0-4.6: 修复 `TicketList.tsx:65,95` 硬编码英文 + "PHT" 时区
- [ ] SubTask P0-4.7: E2E 测试 `e2e/journey-c-submit-ticket.spec.ts` 增加重试场景（同 idempotency_key 两次提交）

**验证**:
- 同一 idempotency_key 两次 POST /api/tickets → 返回同一工单号
- `/support/tickets/[id]` 显示完整工单 + 附件 + 评论
- admin 用户能改 status，customer 不能
- zh locale 下 TicketList 显示中文

---

### Task P0-5: 移除所有 picsum.photos 引用
- [ ] SubTask P0-5.1: 新建 `public/images/og-default.png`（1200×630，TechGuru 品牌 OG 图）
- [ ] SubTask P0-5.2: 修改 `src/components/ui/JsonLd.tsx:77` ArticleJsonLd image 兜底改 `/images/og-default.png`（绝对 URL `https://www.techguru-it.asia/images/og-default.png`）
- [ ] SubTask P0-5.3: 修改 `src/components/ui/JsonLd.tsx:156` ProductJsonLd image 兜底同上
- [ ] SubTask P0-5.4: 修改 `src/app/[locale]/blog/[slug]/page.tsx:43-45` OG image 兜底改 `/images/og-default.png`
- [ ] SubTask P0-5.5: 修改 `src/app/[locale]/blog/[slug]/BlogDetail.tsx:217` 同上
- [ ] SubTask P0-5.6: 修改 `next.config.ts:32-34` 移除 `picsum.photos` remotePatterns

**验证**:
- `grep -r "picsum" src/ next.config.ts` 零结果
- `npm run build` 成功
- 部署后 View Page Source 不含 picsum.photos

---

### Task P0-6: 清理 Case Studies 残留 + PRD 反向同步
- [ ] SubTask P0-6.1: 从 `tgws/sanity.config.ts` 移除 `caseStudy` import 和 types 数组项
- [ ] SubTask P0-6.2: 删除 `tgws/sanity/schemas/caseStudy.ts`
- [ ] SubTask P0-6.3: 删除 `tgws/e2e/case-studies.spec.ts`
- [ ] SubTask P0-6.4: 删除 `scripts/query-case-studies.mjs` 和 `scripts/verify-case-studies.mjs`
- [ ] SubTask P0-6.5: 更新 `PRD-TechGuru-Website.md` S11 标记为 "[已废弃 - 2026-07-12]"，S22 开放问题 #3 同步
- [ ] SubTask P0-6.6: 更新 `PRD/GLOBAL.md`（如有 Case Studies 引用）
- [ ] SubTask P0-6.7: 保留 `next.config.ts` 中 case-studies → blog 重定向（标记 30 天后删除的 TODO）

**验证**:
- `grep -ri "case-stud" tgws/sanity/ tgws/e2e/ scripts/` 零结果（除 next.config.ts 重定向）
- PRD S11 标记废弃

---

## P1 — i18n / 内容 / 集成完整性问题

### Task P1-1: 全站 i18n 硬编码扫描与修复
- [ ] SubTask P1-1.1: 新建 `scripts/i18n-audit.mjs`，扫描 `src/**/*.tsx` 中 JSX 内的英文文本（`>English text<`、`label="English"`、`title="English"` 等），输出 `i18n-audit-report.json`
- [ ] SubTask P1-1.2: 添加 `package.json` scripts: `"i18n:audit": "node scripts/i18n-audit.mjs"`
- [ ] SubTask P1-1.3: 修复 `src/app/[locale]/home/page.tsx:341,345-347,391,411,434-436` 6 处硬编码（移入 `messages/{en,zh}.json` 的 `home.*` 命名空间）
- [ ] SubTask P1-1.4: 修复 `src/app/[locale]/products/CategoryPage.tsx:163,225,235` + `ProductsList.tsx:239,350` + `ProductDetail.tsx:183,207,213,224,226` 硬编码英文
- [ ] SubTask P1-1.5: 修复 `src/app/[locale]/blog/BlogList.tsx:124,252` + `BlogDetail.tsx:80-83` 调用标签硬编码
- [ ] SubTask P1-1.6: 修复 `src/app/[locale]/contact/page.tsx:64` 面包屑 + `solutions/SolutionsList.tsx:158` 架构图标签 + `compare/page.tsx:74-80` 合作伙伴
- [ ] SubTask P1-1.7: 修复 `src/app/[locale]/help/page.tsx:102` BreadcrumbJsonLd + `privacy/page.tsx:33` 日期 + `terms/page.tsx:33` 日期
- [ ] SubTask P1-1.8: 修复 `src/components/tickets/TicketList.tsx:65,95` "Submit a ticket to get started" + "PHT" 时区（用 `Intl.DateTimeFormat` 按用户 locale 格式化）
- [ ] SubTask P1-1.9: 修复 `src/components/ui/CookieConsent.tsx:35,44` + `ErrorBoundary.tsx:51-53` 硬编码英文
- [ ] SubTask P1-1.10: 运行 `npm run i18n:audit` 退出码 0

**验证**:
- `npm run i18n:audit` 退出码 0
- 手动浏览 `/zh/*` 11 个模块，无英文残留（除品牌名、产品名）

---

### Task P1-2: Breadcrumb 组件修复
- [ ] SubTask P1-2.1: 修改 `src/components/ui/Breadcrumb.tsx`：`locale` prop 改为可选但通过 `useParams()` 自动获取（移除默认 'en'）
- [ ] SubTask P1-2.2: 'Home'/'首頁' 移入 `messages/{en,zh}.json` 的 `common.breadcrumb.home`
- [ ] SubTask P1-2.3: 全站搜索 `<Breadcrumb` 调用方，移除手动传 `locale` 的代码（如有）
- [ ] SubTask P1-2.4: 单元测试覆盖 Breadcrumb 组件（含 locale 自动获取）

**验证**:
- `/zh/compare`、`/zh/help` 显示 "首頁" 而非 "Home"

---

### Task P1-3: Sanity client 统一
- [ ] SubTask P1-3.1: 修改 `src/app/[locale]/products/page.tsx`、`blog/page.tsx`、`solutions/page.tsx` 改用 `@/lib/sanity.server`
- [ ] SubTask P1-3.2: 修改 `src/app/[locale]/products/product-data.ts` 改用 `sanity.server`
- [ ] SubTask P1-3.3: 在 `eslint.config.mjs` 加规则禁止 `src/app/[locale]/**/page.tsx` 导入 `@/lib/sanity`（用 `no-restricted-imports`）
- [ ] SubTask P1-3.4: 修复 `blog/[slug]/page.tsx:44` 硬编码 Sanity CDN URL，改用 `urlFor` from `@/lib/sanity.image`

**验证**:
- `npm run lint` 零违规
- 浏览器 bundle 不含 sanity client 代码（用 `next build` 分析）

---

### Task P1-4: 抽取共享 ProductCard 组件
- [ ] SubTask P1-4.1: 新建 `src/components/products/shared.ts`，导出 `slugToI18n`、`iconMap`、`tabColors`、`runSubgroups`
- [ ] SubTask P1-4.2: 修改 `CategoryPage.tsx`、`ProductsList.tsx`、`ProductDetail.tsx` 移除本地副本，从 `shared.ts` 导入
- [ ] SubTask P1-4.3: 评估是否进一步抽取 `<ProductCard>` 组件（如卡片 JSX 重复度高）
- [ ] SubTask P1-4.4: 统一产品路由策略：选 `/products#build`（Tab）或 `/products/build`（独立路由）其一，加 canonical 标签避免重复内容

**验证**:
- `npm run typecheck` 通过
- 修改 `slugToI18n` 一处全站生效
- Google Search Console 无重复内容警告（部署后 2 周观察）

---

### Task P1-5: 集成 useRetry/useOptimistic/useOfflineCache + 修复 useAutoSave
- [ ] SubTask P1-5.1: 修改 `src/lib/odoo.ts` 用 `useRetry` 包装 `createOdooLead`（maxRetries=3）
- [ ] SubTask P1-5.2: 修改 `src/app/api/contact/route.ts` 改为非阻塞：先入库 `contact_submissions` + 立即返回，Odoo 同步入队（用 Supabase Edge Function 或简单的 `setImmediate` + `useRetry`）
- [ ] SubTask P1-5.3: 修改 `src/app/[locale]/support/page.tsx` 工单列表用 `useOfflineCache('/api/tickets', 'tickets-cache')`，失败时显示缓存 + staleness 指示器
- [ ] SubTask P1-5.4: 修改 `src/components/tickets/TicketForm.tsx` 接入 `useAutoSave` 完整 API：mount 时检查 `restoredDraft`，弹窗询问 "Restore draft?"，`acceptDraft`/`discardDraft` 处理
- [ ] SubTask P1-5.5: 修改 `src/hooks/useAutoSave.ts` 加 `beforeunload` 事件 flush（保存最近输入）
- [ ] SubTask P1-5.6: 修改 `src/app/api/contact/route.ts` 成功后回写 `contact_submissions.odoo_synced = true`

**验证**:
- 关闭网络 → `support/page` 显示缓存的工单列表 + "Offline: showing cached data" 提示
- 填写 TicketForm 一半 → 关 tab → 重开 → 弹 "Restore draft?" → 接受 → 表单回填
- Odoo 同步失败 → 重试 3 次 → `odoo_synced` 保持 false（可后端跑 job 重试）

---

### Task P1-6: About 页面迁移到 Sanity
- [ ] SubTask P1-6.1: 完善 `tgws/sanity/schemas/teamMember.ts`（如未完善），字段：name, nameZh, role, roleZh, bio, bioZh, photo, order
- [ ] SubTask P1-6.2: 新建 `tgws/sanity/schemas/qualification.ts`，字段：title, titleZh, description, descriptionZh, icon, order
- [ ] SubTask P1-6.3: 新建 `tgws/sanity/schemas/timelineEvent.ts`，字段：year, month, title, titleZh, description, descriptionZh, order
- [ ] SubTask P1-6.4: 在 `sanity.config.ts` 注册新 schema
- [ ] SubTask P1-6.5: 修改 `src/app/[locale]/about/page.tsx` 改为 server component，从 Sanity 获取 team/qualifications/timeline
- [ ] SubTask P1-6.6: 创建 Sanity 内容 seed 脚本 `tgws/scripts/seed-about.mjs`
- [ ] SubTask P1-6.7: 删除 `about/layout.tsx`（metadata 合并到 page.tsx）

**验证**:
- Sanity Studio 中可见 Team Member / Qualification / Timeline Event 三种文档类型
- `/zh/about` 显示中文内容来自 Sanity（修改 Sanity 后无需重新部署即生效）

---

### Task P1-7: Hero a11y 修复
- [ ] SubTask P1-7.1: 修改 `src/components/hero/HeroSection.tsx` 打字机效果加 `prefers-reduced-motion` 检查（reduced motion 时直接显示完整文本，不动画）
- [ ] SubTask P1-7.2: 修改鼠标拖动视频进度加同样检查（reduced motion 时禁用 mousemove 监听）
- [ ] SubTask P1-7.3: `<video>` 加 `poster="/images/hero-poster.jpg"`（新建 1920×1080 海报图）
- [ ] SubTask P1-7.4: `<video>` 加 `aria-label="TechGuru brand video showing infrastructure and AI technology"`
- [ ] SubTask P1-7.5: 替换 `document.execCommand('copy')` 为 `navigator.clipboard.writeText` + fallback

**验证**:
- 系统设置 "Reduce motion" → 打字机直接显示完整文本，鼠标拖动禁用
- 慢网络下首次加载显示 hero-poster 而非黑屏
- 屏幕阅读器读出 video aria-label

---

### Task P1-8: sitemap 补全
- [ ] SubTask P1-8.1: 修改 `src/app/sitemap.ts` 加 `/products/build`、`/products/run`、`/products/protect`、`/compare`
- [ ] SubTask P1-8.2: 从 Sanity 拉取所有 product slugs，生成 `/products/[slug]` 条目
- [ ] SubTask P1-8.3: `lastModified` 用真实数据（products 用 `_updatedAt`，blog 用 `publishedAt`，静态页用构建时间）
- [ ] SubTask P1-8.4: 加 `/api/*` 到 robots.txt disallow

**验证**:
- 访问 `/sitemap.xml` 包含所有产品 + 博客 + 静态页 URL
- Google Search Console 提交后无 "未发现 URL" 警告

---

### Task P1-9: middleware 完善
- [ ] SubTask P1-9.1: 修改 `src/middleware.ts` 合并 headers 和 status（不只 cookies）
- [ ] SubTask P1-9.2: 修改 `src/lib/supabase/middleware.ts` 增加路由保护：
  - `/support/*`（除 `/support/login`、`/support/register`、`/support/reset-password`）未登录 → 跳 `/support/login?redirect=${pathname}`
  - `/support/login`、`/support/register` 已登录 → 跳 `/support`
- [ ] SubTask P1-9.3: 修改 `src/app/[locale]/support/page.tsx` 移除客户端 auth gate（中间件已处理）

**验证**:
- 未登录访问 `/support` → 中间件 302 跳 `/support/login?redirect=/zh/support`
- 已登录访问 `/support/login` → 跳 `/support`
- 加载 `/support` 不再闪 loading spinner

---

### Task P1-10: 测试补全
- [ ] SubTask P1-10.1: 为 M08-M11 添加单元测试：
  - `src/app/[locale]/compare/compare.test.tsx`
  - `src/app/[locale]/vmware-alternative/vmware-alt.test.tsx`
  - `src/app/[locale]/help/help.test.tsx`
  - `src/app/[locale]/privacy/privacy.test.tsx`
  - `src/app/[locale]/terms/terms.test.tsx`
- [ ] SubTask P1-10.2: 为 UI 组件添加测试（8 个）：
  - `Breadcrumb.test.tsx`、`CookieConsent.test.tsx`、`DarkModeToggle.test.tsx`、`ErrorBoundary.test.tsx`、`JsonLd.test.tsx`、`ScrollToTop.test.tsx`、`Tooltip.test.tsx`、`FAQAccordion.test.tsx`
- [ ] SubTask P1-10.3: 扩展 `src/test/api-integration.test.ts` 覆盖 `/api/tickets` CRUD、`/api/tickets/[id]` PATCH、`/api/tickets/stats`、`/api/upload`、`/api/auth/reset-password`、`/api/revalidate`
- [ ] SubTask P1-10.4: 安装 `@axe-core/playwright`，在 `e2e/accessibility.spec.ts` 中扫描 11 个模块首页
- [ ] SubTask P1-10.5: 配置 `vitest.config.ts` 加 coverage threshold（statements/branches/functions/lines ≥ 60%）
- [ ] SubTask P1-10.6: 删除 `e2e/case-studies.spec.ts`（与 P0-6 合并）

**验证**:
- `npm run test:run` 通过且覆盖率 ≥ 60%
- `npm run test:e2e` 通过（含 a11y 扫描零 critical）

---

## P2 — 体验/SEO/代码质量提升

### Task P2-1: M08 Compare 重构
- [ ] SubTask P2-1.1: 删除 `src/app/[locale]/compare/page.tsx:38-68` 内联表格，改用 `<CompareTable />`
- [ ] SubTask P2-1.2: 修复 `src/components/compare/CompareTable.tsx:81` 重复条件 bug
- [ ] SubTask P2-1.3: 加 `<caption>` 和 `aria-label` 到 table
- [ ] SubTask P2-1.4: 改 TechGuru 列从颜色区分改为 `<th scope="col" aria-label="TechGuru">` + 图标标识

**验证**: 屏幕阅读器能正确读出表格结构

---

### Task P2-2: M09 VMware 修复
- [ ] SubTask P2-2.1: 修改 `src/app/[locale]/vmware-alternative/page.tsx:60-72` phone CTA 改 `tel:+63xxxxxxxxx`
- [ ] SubTask P2-2.2: 修改 `vmware-alternative/layout.tsx` 加 `alternates.canonical` 和 `alternates.languages`
- [ ] SubTask P2-2.3: 厂商品牌色集中到 `src/lib/vendor-colors.ts`

**验证**: hero 两个 CTA 行为不同（一个跳联系页，一个拨号）

---

### Task P2-3: M10 Help 修复
- [ ] SubTask P2-3.1: 修改 `src/app/[locale]/help/page.tsx:101` FAQJsonLd 接收 `filteredFaqs` 改为 `faqItems`（全部）— SEO 应反映全部内容
- [ ] SubTask P2-3.2: 修改空状态文案分场景：搜索为空 + 类目无 FAQ → "No FAQs in this category yet"；搜索非空 + 无结果 → "No results for '{query}'"
- [ ] SubTask P2-3.3: 搜索加 300ms debounce

**验证**: 搜索 "vmware" 不触发每次按键重渲染

---

### Task P2-4: M11 Legal 增强
- [ ] SubTask P2-4.1: 修改 `privacy/page.tsx` 和 `terms/page.tsx` last-updated 改 `process.env.BUILD_DATE` 或 `commit-hash`
- [ ] SubTask P2-4.2: 新建 `src/lib/config.ts` 集中 `SUPPORT_EMAIL`、`CONTACT_PHONE`、`WHATSAPP_URL`、`LINKEDIN_URL`
- [ ] SubTask P2-4.3: 加 TOC 侧边栏（桌面）+ 折叠菜单（移动）
- [ ] SubTask P2-4.4: 加 `@media print` 样式 + "Print this page" 按钮
- [ ] SubTask P2-4.5: 删除 `solutions/layout.tsx` 和 `about/layout.tsx`（metadata 合并到 page.tsx）

**验证**: Ctrl+P 弹出打印预览样式正确

---

### Task P2-5: JsonLd 修复
- [ ] SubTask P2-5.1: 修改 `src/components/ui/JsonLd.tsx:32` `OrganizationJsonLd.sameAs` 填 `[LinkedIn_URL, WhatsApp_URL]`
- [ ] SubTask P2-5.2: 移除 `ProductJsonLd` 的 `offers` 块（lines 162-170）或改用 `Service` schema
- [ ] SubTask P2-5.3: ArticleJsonLd image 兜底改本地（与 P0-5 合并）
- [ ] SubTask P2-5.4: WebSiteJsonLd 的 `SearchAction` 指向 `/blog?q=` — 实现该搜索功能或移除 SearchAction

**验证**: https://search.google.com/test/rich-results 验证所有页面零 error

---

### Task P2-6: globals.css token 化
- [ ] SubTask P2-6.1: 修改 `src/app/globals.css:35` body color 改 `var(--color-foreground)`
- [ ] SubTask P2-6.2: 修改 `.section-title` color 改 `var(--color-foreground)`
- [ ] SubTask P2-6.3: 修改 `.card` background 改 `var(--color-surface)`；`.btn-secondary` border 改 `1px solid var(--color-border, rgba(0,0,0,0.15))`
- [ ] SubTask P2-6.4: 加 `@media (prefers-reduced-motion: reduce)` 全局禁用 animation/transition
- [ ] SubTask P2-6.5: Playwright 截图 light + dark 模式 11 个模块首页，对比修改前后视觉差异最小化

**验证**: light 模式视觉无差异；dark 模式自动切换正确

---

### Task P2-7: 死代码清理
- [ ] SubTask P2-7.1: 删除 `src/app/[locale]/contact/ContactPage.tsx`（及对应 `ContactPage.test.tsx`）
- [ ] SubTask P2-7.2: 删除 `src/lib/resend.ts:132` `sendTicketReplyEmail`（如不接入则删）
- [ ] SubTask P2-7.3: 删除 `src/app/[locale]/support/page.tsx:7` 死 `Breadcrumb` import
- [ ] SubTask P2-7.4: 删除 `src/hooks/useOfflineCache.ts`（如 P1-5 接入则保留）
- [ ] SubTask P2-7.5: 评估 `src/app/[locale]/blog/[slug]/BlogDetail.tsx` 中 `architectureDiagram` 渲染逻辑，加 fallback

**验证**: `npm run build` 成功且 bundle size 减小

---

### Task P2-8: 构建配置修复
- [ ] SubTask P2-8.1: 修改 `next.config.ts` 加 `poweredByHeader: false`、`reactStrictMode: true`
- [ ] SubTask P2-8.2: 评估 CSP nonce 方案替代 `'unsafe-inline'`（用 `next.config.ts` nonce generation 中间件）
- [ ] SubTask P2-8.3: 修改 `vercel.json` 移除 `npmmirror.com`（或加 `regions: ["hkg1"]` 配合中国镜像）
- [ ] SubTask P2-8.4: 修改 `playwright.config.ts` baseURL 改 `http://localhost:3000`，加 `webServer: { command: 'npm run start', url: 'http://localhost:3000', reuseExistingServer: true }`
- [ ] SubTask P2-8.5: 加 playwright project：Mobile Safari (iPhone 14)、Mobile Chrome (Pixel 7) emulation
- [ ] SubTask P2-8.6: 修改 `tsconfig.json` 加 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`、`forceConsistentCasingInFileNames`
- [ ] SubTask P2-8.7: 修改 `eslint.config.mjs` 加 `eslint-plugin-jsx-a11y`、`eslint-plugin-security`
- [ ] SubTask P2-8.8: 修改 `sanity.config.ts` 加 `visionTool` 插件

**验证**:
- `npm run build` 成功
- `npm run lint` 零违规
- `npm run test:e2e` 在本地 build 上运行通过

---

### Task P2-9: 文档同步
- [ ] SubTask P2-9.1: 新建 `MEMORY.md`（AGENTS.md 多处引用但缺失），记录当前状态 + 待办 + 核心规则
- [ ] SubTask P2-9.2: 更新 `README.md` 完成度表（按本 spec 实际评估）
- [ ] SubTask P2-9.3: 更新 `docs/modules/INDEX.md` 状态（按本 spec 实际评估）
- [ ] SubTask P2-9.4: 更新 `AGENTS.md` 教训记录，新增 2026-07-19 教训："完成度声明必须基于源码事实，不能基于 PRD 标记"
- [ ] SubTask P2-9.5: 更新 `docs/modules/M01-M11.md` 各模块详情

**验证**: 三方文档（MEMORY / AGENTS / PRD）状态一致

---

### Task P2-10: PRD 反向同步
- [ ] SubTask P2-10.1: 更新 `PRD-TechGuru-Website.md` S11 标记 "[已废弃 - 2026-07-12]"（与 P0-6 合并）
- [ ] SubTask P2-10.2: 更新 `PRD/GLOBAL.md` S22 开放问题表对齐当前状态（Case Studies 标记已删）
- [ ] SubTask P2-10.3: 更新 `PRD/GLOBAL.md` S17 数据模型补 RLS policy 备注（标注哪些表缺 INSERT policy）
- [ ] SubTask P2-10.4: 更新 `PRD/GLOBAL.md` S18 API 设计补 idempotency_key、rate limit、CSRF 说明
- [ ] SubTask P2-10.5: 更新 `PRD/M02-Products.md` 补 canonical 标签要求
- [ ] SubTask P2-10.6: 更新 `PRD/M05-Tickets.md` 补工单详情页、幂等键、事务安全要求

**验证**: PRD 反向同步检查清单（AGENTS #41）全部通过

---

## Task Dependencies

```
P0-1 (API 安全) ──┐
P0-2 (M04 GROQ)  ─┤
P0-3 (Auth 修复) ─┼─→ P1-1 (i18n) ──→ P1-2 (Breadcrumb)
P0-4 (工单补完) ──┤                ↗
P0-5 (picsum)    ─┤
P0-6 (Case 残留) ─┘

P1-3 (Sanity client) ──→ P1-4 (ProductCard 抽取)
P1-5 (hooks 集成) ──→ P0-4 (工单补完，依赖 useRetry)
P1-6 (About Sanity) 独立
P1-7 (Hero a11y) 独立
P1-8 (sitemap) 独立
P1-9 (middleware) ──→ P0-3 (Auth 修复)
P1-10 (测试) ──→ 所有 P0 + P1 任务先完成

P2-* 大多独立，可并行
P2-9 (文档同步) 依赖所有 P0 + 大部分 P1 完成
P2-10 (PRD 同步) 与 P0-6 合并
```

## 执行顺序建议

**Wave 1**（P0 致命问题，1-2 周内）:
P0-1 → P0-2 → P0-3 → P0-4 → P0-5 → P0-6（部分可并行：P0-2、P0-5、P0-6 独立）

**Wave 2**（P1 集成完整性，2-3 周内）:
P1-3 → P1-4 → P1-1 → P1-2 → P1-5 → P1-6 → P1-7 → P1-8 → P1-9 → P1-10

**Wave 3**（P2 体验/质量，2-3 周内）:
P2-1 → P2-2 → P2-3 → P2-4 → P2-5 → P2-6 → P2-7 → P2-8 → P2-9 → P2-10

**总工作量估算**: 5-8 周（单人），如 2-3 人并行可压缩到 3-4 周
