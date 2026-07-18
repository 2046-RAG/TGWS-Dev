# TGWS 全项目差距优化任务清单（优化版 v2）

> **change-id**: `audit-tgws-gap-optimization`
> **配套文档**: `spec.md`（差距评估与根因）/ `checklist.md`（验收检查点）
> **版本**: v2 — 6 Wave 优化排序（2026-07-19）
> **执行原则**: 每个 Wave 内任务尽量并行；每完成一个 task 必须更新本文档勾选状态并运行 `npm run lint && npm run typecheck && npm run test:run`

---

## Wave 0 — 立即并行（无依赖，7 个独立任务同时启动）

### Task W0-1: 修复 M04 Solutions GROQ 致命 bug  [原 P0-2]
- [ ] SubTask W0-1.1: 修改 `src/app/[locale]/solutions/page.tsx` 的 GROQ 查询，补齐字段：`challengesZh, solutionsZh, recommendedProductsZh, metricLabel, metricLabelZh`
- [ ] SubTask W0-1.2: 修复 `src/app/[locale]/solutions/SolutionsList.tsx:138` 的 `<meta.icon ... />` 小写 JSX bug，改为 `const Icon = meta.icon; <Icon ... />`
- [ ] SubTask W0-1.3: 用 Playwright Edge 截图 `/zh/solutions` 验证中文内容从 Sanity 加载

**验证**:
- `/zh/solutions` 显示的 challenges/solutions 来自 Sanity（非 i18n JSON 兜底）
- 6 个 industry tab 都能切换且图标正常渲染

---

### Task W0-2: 移除所有 picsum.photos 引用  [原 P0-5]
- [ ] SubTask W0-2.1: 新建 `public/images/og-default.png`（1200×630，TechGuru 品牌 OG 图）
- [ ] SubTask W0-2.2: 修改 `src/components/ui/JsonLd.tsx:77` ArticleJsonLd image 兜底改 `/images/og-default.png`（绝对 URL `https://www.techguru-it.asia/images/og-default.png`）
- [ ] SubTask W0-2.3: 修改 `src/components/ui/JsonLd.tsx:156` ProductJsonLd image 兜底同上
- [ ] SubTask W0-2.4: 修改 `src/app/[locale]/blog/[slug]/page.tsx:43-45` OG image 兜底改 `/images/og-default.png`
- [ ] SubTask W0-2.5: 修改 `src/app/[locale]/blog/[slug]/BlogDetail.tsx:217` 同上
- [ ] SubTask W0-2.6: 修改 `next.config.ts:32-34` 移除 `picsum.photos` remotePatterns

**验证**:
- `grep -r "picsum" src/ next.config.ts` 零结果
- `npm run build` 成功
- 部署后 View Page Source 不含 picsum.photos

---

### Task W0-3: 清理 Case Studies 残留 + PRD 反向同步  [原 P0-6]
- [ ] SubTask W0-3.1: 从 `tgws/sanity.config.ts` 移除 `caseStudy` import 和 types 数组项
- [ ] SubTask W0-3.2: 删除 `tgws/sanity/schemas/caseStudy.ts`
- [ ] SubTask W0-3.3: 删除 `tgws/e2e/case-studies.spec.ts`
- [ ] SubTask W0-3.4: 删除 `scripts/query-case-studies.mjs` 和 `scripts/verify-case-studies.mjs`
- [ ] SubTask W0-3.5: 更新 `PRD-TechGuru-Website.md` S11 标记为 "[已废弃 - 2026-07-12]"，S22 开放问题 #3 同步
- [ ] SubTask W0-3.6: 更新 `PRD/GLOBAL.md`（如有 Case Studies 引用）
- [ ] SubTask W0-3.7: 保留 `next.config.ts` 中 case-studies → blog 重定向（标记 30 天后删除的 TODO）

**验证**:
- `grep -ri "case-stud" tgws/sanity/ tgws/e2e/ scripts/` 零结果（除 next.config.ts 重定向）
- PRD S11 标记废弃

---

### Task W0-4: Sanity client 统一  [原 P1-3]
- [ ] SubTask W0-4.1: 修改 `src/app/[locale]/products/page.tsx`、`blog/page.tsx`、`solutions/page.tsx` 改用 `@/lib/sanity.server`
- [ ] SubTask W0-4.2: 修改 `src/app/[locale]/products/product-data.ts` 改用 `sanity.server`
- [ ] SubTask W0-4.3: 在 `eslint.config.mjs` 加规则禁止 `src/app/[locale]/**/page.tsx` 导入 `@/lib/sanity`（用 `no-restricted-imports`）
- [ ] SubTask W0-4.4: 修复 `blog/[slug]/page.tsx:44` 硬编码 Sanity CDN URL，改用 `urlFor` from `@/lib/sanity.image`

**验证**:
- `npm run lint` 零违规
- 浏览器 bundle 不含 sanity client 代码（用 `next build` 分析）

---

### Task W0-5: Hero a11y 修复  [原 P1-7]
- [ ] SubTask W0-5.1: 修改 `src/components/hero/HeroSection.tsx` 打字机效果加 `prefers-reduced-motion` 检查（reduced motion 时直接显示完整文本，不动画）
- [ ] SubTask W0-5.2: 修改鼠标拖动视频进度加同样检查（reduced motion 时禁用 mousemove 监听）
- [ ] SubTask W0-5.3: `<video>` 加 `poster="/images/hero-poster.jpg"`（新建 1920×1080 海报图）
- [ ] SubTask W0-5.4: `<video>` 加 `aria-label="TechGuru brand video showing infrastructure and AI technology"`
- [ ] SubTask W0-5.5: 替换 `document.execCommand('copy')` 为 `navigator.clipboard.writeText` + fallback

**验证**:
- 系统设置 "Reduce motion" → 打字机直接显示完整文本，鼠标拖动禁用
- 慢网络下首次加载显示 hero-poster 而非黑屏
- 屏幕阅读器读出 video aria-label

---

### Task W0-6: sitemap 补全  [原 P1-8]
- [ ] SubTask W0-6.1: 修改 `src/app/sitemap.ts` 加 `/products/build`、`/products/run`、`/products/protect`、`/compare`
- [ ] SubTask W0-6.2: 从 Sanity 拉取所有 product slugs，生成 `/products/[slug]` 条目
- [ ] SubTask W0-6.3: `lastModified` 用真实数据（products 用 `_updatedAt`，blog 用 `publishedAt`，静态页用构建时间）
- [ ] SubTask W0-6.4: 加 `/api/*` 到 robots.txt disallow

**验证**:
- 访问 `/sitemap.xml` 包含所有产品 + 博客 + 静态页 URL
- Google Search Console 提交后无 "未发现 URL" 警告

---

### Task W0-7: playwright config 改本地  [原 P2-8.4-8.5，提前]
- [ ] SubTask W0-7.1: 修改 `playwright.config.ts` baseURL 改 `http://localhost:3000`
- [ ] SubTask W0-7.2: 加 `webServer: { command: 'npm run start', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120000 }`
- [ ] SubTask W0-7.3: 加 playwright project：Mobile Safari (iPhone 14)、Mobile Chrome (Pixel 7) emulation
- [ ] SubTask W0-7.4: 加 `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`

**验证**:
- `npm run test:e2e` 在本地 build 上运行通过（不再访问生产）
- Mobile project 能执行

---

## Wave 1 — P0 致命问题（依赖 Wave 0 完成）

### Task W1-1: API 安全加固  [原 P0-1]
- [ ] SubTask W1-1.1: 实现 CSRF token 中间件（双重提交 cookie 模式），文件 `src/lib/csrf.ts` + `src/middleware.ts` 集成
- [ ] SubTask W1-1.2: 实现 rate limit（基于内存 Map，10 req/min/IP），文件 `src/lib/rate-limit.ts`
- [ ] SubTask W1-1.3: 修复 `src/app/api/upload/route.ts`：
  - 文件大小改 10MB（`10 * 1024 * 1024`）
  - 加文件类型白名单（image/png, image/jpeg, image/webp, image/gif, application/pdf, text/plain, application/zip）
  - 调整顺序：先校验 ticket ownership，再上传 Storage
  - 改用 `createSignedUrl`（有效期 1h）替代 `getPublicUrl`
  - 文件名 sanitize：`filename.replace(/[\/\\]/g, '_')`
- [ ] SubTask W1-1.4: 在 `src/app/api/tickets/route.ts` 和 `src/app/api/tickets/[id]/route.ts` 加：
  - 字段长度校验（subject ≤200, description ≤800）
  - enum 校验（category ∈ {build, run, protect}；status ∈ {open, in_progress, resolved, closed}；priority ∈ {low, medium, high, critical}）
  - PATCH 字段级角色白名单（非 admin 不可改 status/priority/assigned_to）
- [ ] SubTask W1-1.5: `src/app/api/contact/route.ts` 和 `src/app/api/auth/reset-password/route.ts` 加 rate limit（5 req/min/IP）
- [ ] SubTask W1-1.6: 统一错误响应格式 `{ success: false, error: { code, message } }`；不返回原始 Supabase 错误给客户端；服务端用结构化日志
- [ ] SubTask W1-1.7: 单元测试覆盖 CSRF、rate limit、文件上传白名单

**验证**:
- `curl -X POST /api/contact` 无 CSRF token → 403
- `for i in {1..15}; do curl -X POST /api/contact ...; done` → 第 11 个起 429
- 上传 11MB 文件 → 413
- 上传 `.exe` 文件 → 415
- PATCH /api/tickets/[id] as customer 改 status → 403

---

### Task W1-2: Auth 密码重置 + middleware 完善（合并） [原 P0-3 + P1-9]
- [ ] SubTask W1-2.1: 修改 `src/middleware.ts` 合并 headers 和 status（不只 cookies）
- [ ] SubTask W1-2.2: 修改 `src/lib/supabase/middleware.ts` 增加路由保护：
  - `/support/*`（除 `/support/login`、`/support/register`、`/support/reset-password`）未登录 → 跳 `/support/login?redirect=${pathname}`
  - `/support/login`、`/support/register` 已登录 → 跳 `/support`
- [ ] SubTask W1-2.3: 新建 `src/app/[locale]/support/reset-password/page.tsx`（设置新密码表单，调用 `supabase.auth.updateUser({ password })`）
- [ ] SubTask W1-2.4: 修改 `src/components/auth/LoginForm.tsx:50` 的 `redirectTo` 改为 `${window.location.origin}/${locale}/support/reset-password`
- [ ] SubTask W1-2.5: 修改 `src/app/api/auth/reset-password/route.ts` 重定向到 `/support/reset-password` 而非 `/support/login`
- [ ] SubTask W1-2.6: 修改 `src/app/[locale]/support/page.tsx` 移除客户端 auth gate（中间件已处理）
- [ ] SubTask W1-2.7: 单元测试覆盖密码重置完整流程 + middleware 路由保护

**验证**:
- 点 LoginForm "Forgot password" → 收邮件 → 点链接 → 落地 `/support/reset-password` → 输入新密码 → 登录成功
- 已登录用户访问 `/support/login` 自动跳转 `/support`
- 未登录访问 `/support` → 中间件 302 跳 `/support/login?redirect=/zh/support`
- 加载 `/support` 不再闪 loading spinner

---

### Task W1-3: 工单系统补完  [原 P0-4]
- [ ] SubTask W1-3.1: 新建 `src/app/[locale]/support/tickets/[id]/page.tsx`（工单详情页，含状态变更 UI for admin）
- [ ] SubTask W1-3.2: 修改 `src/components/tickets/TicketList.tsx` 行可点击 → 跳转 `/support/tickets/[id]`
- [ ] SubTask W1-3.3: 修改 `src/components/tickets/TicketForm.tsx` 生成 `idempotency_key`（uuid v4）作为 hidden field
- [ ] SubTask W1-3.4: 修改 `src/app/api/tickets/route.ts`：
  - 加 `idempotency_key` 字段查询（命中则返回原工单）
  - 工单号改 6 字符 base36 + 碰撞重试 3 次
  - 用 Supabase RPC 或 sequential 操作包装 insert + audit log + email（补偿动作：email 失败不回滚工单）
- [ ] SubTask W1-3.5: 数据库迁移 `003_add_idempotency_key.sql`：`tickets` 表加 `idempotency_key TEXT UNIQUE`、`ticket_audit_log` 加 INSERT policy、`ticket_attachments` 加 INSERT policy、`ticket_comments` 加 INSERT policy
- [ ] SubTask W1-3.6: 修复 `TicketList.tsx:65,95` 硬编码英文 + "PHT" 时区（用 `Intl.DateTimeFormat` 按用户 locale 格式化）
- [ ] SubTask W1-3.7: E2E 测试 `e2e/journey-c-submit-ticket.spec.ts` 增加重试场景（同 idempotency_key 两次提交）

**验证**:
- 同一 idempotency_key 两次 POST /api/tickets → 返回同一工单号
- `/support/tickets/[id]` 显示完整工单 + 附件 + 评论
- admin 用户能改 status，customer 不能
- zh locale 下 TicketList 显示中文

---

## Wave 2 — i18n + 重构（依赖 Wave 1）

### Task W2-1: Breadcrumb 组件修复  [原 P1-2，提前]
- [ ] SubTask W2-1.1: 修改 `src/components/ui/Breadcrumb.tsx`：`locale` prop 改为可选但通过 `useParams()` 自动获取（移除默认 'en'）
- [ ] SubTask W2-1.2: 'Home'/'首頁' 移入 `messages/{en,zh}.json` 的 `common.breadcrumb.home`
- [ ] SubTask W2-1.3: 全站搜索 `<Breadcrumb` 调用方，移除手动传 `locale` 的代码（如有）
- [ ] SubTask W2-1.4: 单元测试覆盖 Breadcrumb 组件（含 locale 自动获取）

**验证**:
- `/zh/compare`、`/zh/help` 显示 "首頁" 而非 "Home"

---

### Task W2-2: 抽取共享 ProductCard 组件  [原 P1-4，提前]
- [ ] SubTask W2-2.1: 新建 `src/components/products/shared.ts`，导出 `slugToI18n`、`iconMap`、`tabColors`、`runSubgroups`
- [ ] SubTask W2-2.2: 修改 `CategoryPage.tsx`、`ProductsList.tsx`、`ProductDetail.tsx` 移除本地副本，从 `shared.ts` 导入
- [ ] SubTask W2-2.3: 评估是否进一步抽取 `<ProductCard>` 组件（如卡片 JSX 重复度高）
- [ ] SubTask W2-2.4: 统一产品路由策略：选 `/products#build`（Tab）或 `/products/build`（独立路由）其一，加 canonical 标签避免重复内容

**验证**:
- `npm run typecheck` 通过
- 修改 `slugToI18n` 一处全站生效
- Google Search Console 无重复内容警告（部署后 2 周观察）

---

### Task W2-3: 全站 i18n 硬编码扫描与修复  [原 P1-1，依赖 W2-1 + W2-2]
- [ ] SubTask W2-3.1: 新建 `scripts/i18n-audit.mjs`，扫描 `src/**/*.tsx` 中 JSX 内的英文文本，输出 `i18n-audit-report.json`
- [ ] SubTask W2-3.2: 添加 `package.json` scripts: `"i18n:audit": "node scripts/i18n-audit.mjs"`
- [ ] SubTask W2-3.3: 修复 `src/app/[locale]/home/page.tsx:341,345-347,391,411,434-436` 6 处硬编码
- [ ] SubTask W2-3.4: 修复 `src/app/[locale]/products/CategoryPage.tsx:163,225,235` + `ProductsList.tsx:239,350` + `ProductDetail.tsx:183,207,213,224,226` 硬编码英文（依赖 W2-2 完成的 shared.ts）
- [ ] SubTask W2-3.5: 修复 `src/app/[locale]/blog/BlogList.tsx:124,252` + `BlogDetail.tsx:80-83` 调用标签硬编码
- [ ] SubTask W2-3.6: 修复 `src/app/[locale]/contact/page.tsx:64` 面包屑（依赖 W2-1） + `solutions/SolutionsList.tsx:158` 架构图标签 + `compare/page.tsx:74-80` 合作伙伴
- [ ] SubTask W2-3.7: 修复 `src/app/[locale]/help/page.tsx:102` BreadcrumbJsonLd + `privacy/page.tsx:33` 日期 + `terms/page.tsx:33` 日期
- [ ] SubTask W2-3.8: 修复 `src/components/ui/CookieConsent.tsx:35,44` + `ErrorBoundary.tsx:51-53` 硬编码英文
- [ ] SubTask W2-3.9: 运行 `npm run i18n:audit` 退出码 0

**验证**:
- `npm run i18n:audit` 退出码 0
- 手动浏览 `/zh/*` 11 个模块，无英文残留（除品牌名、产品名）

---

### Task W2-4: hooks 集成 + 修复 useAutoSave  [原 P1-5]
- [ ] SubTask W2-4.1: 修改 `src/lib/odoo.ts` 用 `useRetry` 包装 `createOdooLead`（maxRetries=3）
- [ ] SubTask W2-4.2: 修改 `src/app/api/contact/route.ts` 改为非阻塞：先入库 `contact_submissions` + 立即返回，Odoo 同步入队（用 `setImmediate` + `useRetry`）
- [ ] SubTask W2-4.3: 修改 `src/app/[locale]/support/page.tsx` 工单列表用 `useOfflineCache('/api/tickets', 'tickets-cache')`，失败时显示缓存 + staleness 指示器
- [ ] SubTask W2-4.4: 修改 `src/components/tickets/TicketForm.tsx` 接入 `useAutoSave` 完整 API：mount 时检查 `restoredDraft`，弹窗询问 "Restore draft?"，`acceptDraft`/`discardDraft` 处理
- [ ] SubTask W2-4.5: 修改 `src/hooks/useAutoSave.ts` 加 `beforeunload` 事件 flush（保存最近输入）
- [ ] SubTask W2-4.6: 修改 `src/app/api/contact/route.ts` 成功后回写 `contact_submissions.odoo_synced = true`
- [ ] SubTask W2-4.7: 单元测试覆盖 useRetry、useOfflineCache、useAutoSave 完整流程

**验证**:
- 关闭网络 → `support/page` 显示缓存的工单列表 + "Offline: showing cached data" 提示
- 填写 TicketForm 一半 → 关 tab → 重开 → 弹 "Restore draft?" → 接受 → 表单回填
- Odoo 同步失败 → 重试 3 次 → `odoo_synced` 保持 false（可后端跑 job 重试）

---

### Task W2-5: About 页面迁移到 Sanity  [原 P1-6]
- [ ] SubTask W2-5.1: 完善 `tgws/sanity/schemas/teamMember.ts`，字段：name, nameZh, role, roleZh, bio, bioZh, photo, order
- [ ] SubTask W2-5.2: 新建 `tgws/sanity/schemas/qualification.ts`，字段：title, titleZh, description, descriptionZh, icon, order
- [ ] SubTask W2-5.3: 新建 `tgws/sanity/schemas/timelineEvent.ts`，字段：year, month, title, titleZh, description, descriptionZh, order
- [ ] SubTask W2-5.4: 在 `sanity.config.ts` 注册新 schema（依赖 W0-3 清理完成）
- [ ] SubTask W2-5.5: 修改 `src/app/[locale]/about/page.tsx` 改为 server component，从 Sanity 获取 team/qualifications/timeline
- [ ] SubTask W2-5.6: 创建 Sanity 内容 seed 脚本 `tgws/scripts/seed-about.mjs`
- [ ] SubTask W2-5.7: 删除 `about/layout.tsx`（metadata 合并到 page.tsx）+ 删除 `solutions/layout.tsx`（同样合并）

**验证**:
- Sanity Studio 中可见 Team Member / Qualification / Timeline Event 三种文档类型
- `/zh/about` 显示中文内容来自 Sanity（修改 Sanity 后无需重新部署即生效）

---

## Wave 3 — 测试补全（依赖 Wave 1-2）

### Task W3-1: 测试补全  [原 P1-10]
- [ ] SubTask W3-1.1: 为 M08-M11 添加单元测试（5 文件）
  - `src/app/[locale]/compare/compare.test.tsx`
  - `src/app/[locale]/vmware-alternative/vmware-alt.test.tsx`
  - `src/app/[locale]/help/help.test.tsx`
  - `src/app/[locale]/privacy/privacy.test.tsx`
  - `src/app/[locale]/terms/terms.test.tsx`
- [ ] SubTask W3-1.2: 为 UI 组件添加测试（8 文件）
  - `Breadcrumb.test.tsx`（如 W2-1 未覆盖）、`CookieConsent.test.tsx`、`DarkModeToggle.test.tsx`、`ErrorBoundary.test.tsx`、`JsonLd.test.tsx`、`ScrollToTop.test.tsx`、`Tooltip.test.tsx`、`FAQAccordion.test.tsx`
- [ ] SubTask W3-1.3: 扩展 `src/test/api-integration.test.ts` 覆盖 `/api/tickets` CRUD、`/api/tickets/[id]` PATCH、`/api/tickets/stats`、`/api/upload`、`/api/auth/reset-password`、`/api/revalidate`
- [ ] SubTask W3-1.4: 安装 `@axe-core/playwright`，在 `e2e/accessibility.spec.ts` 中扫描 11 个模块首页
- [ ] SubTask W3-1.5: 配置 `vitest.config.ts` 加 coverage threshold（statements/branches/functions/lines ≥ 60%）
- [ ] SubTask W3-1.6: 删除 `e2e/case-studies.spec.ts`（如 W0-3 未删除）

**验证**:
- `npm run test:run` 通过且覆盖率 ≥ 60%
- `npm run test:e2e` 通过（含 a11y 扫描零 critical）

---

## Wave 4 — P2 体验/质量（依赖 Wave 1-3）

### Task W4-1: M08 Compare 重构  [原 P2-1]
- [ ] SubTask W4-1.1: 删除 `src/app/[locale]/compare/page.tsx:38-68` 内联表格，改用 `<CompareTable />`
- [ ] SubTask W4-1.2: 修复 `src/components/compare/CompareTable.tsx:81` 重复条件 bug
- [ ] SubTask W4-1.3: 加 `<caption>` 和 `aria-label` 到 table
- [ ] SubTask W4-1.4: 改 TechGuru 列从颜色区分改为 `<th scope="col" aria-label="TechGuru">` + 图标标识

**验证**: 屏幕阅读器能正确读出表格结构

---

### Task W4-2: M09 VMware 修复  [原 P2-2]
- [ ] SubTask W4-2.1: 修改 `src/app/[locale]/vmware-alternative/page.tsx:60-72` phone CTA 改 `tel:+63xxxxxxxxx`
- [ ] SubTask W4-2.2: 修改 `vmware-alternative/layout.tsx` 加 `alternates.canonical` 和 `alternates.languages`
- [ ] SubTask W4-2.3: 厂商品牌色集中到 `src/lib/vendor-colors.ts`

**验证**: hero 两个 CTA 行为不同（一个跳联系页，一个拨号）

---

### Task W4-3: M10 Help 修复  [原 P2-3]
- [ ] SubTask W4-3.1: 修改 `src/app/[locale]/help/page.tsx:101` FAQJsonLd 接收 `filteredFaqs` 改为 `faqItems`（全部）— SEO 应反映全部内容
- [ ] SubTask W4-3.2: 修改空状态文案分场景：搜索为空 + 类目无 FAQ → "No FAQs in this category yet"；搜索非空 + 无结果 → "No results for '{query}'"
- [ ] SubTask W4-3.3: 搜索加 300ms debounce

**验证**: 搜索 "vmware" 不触发每次按键重渲染

---

### Task W4-4: M11 Legal 增强  [原 P2-4，去除 layout 删除部分]
- [ ] SubTask W4-4.1: 修改 `privacy/page.tsx` 和 `terms/page.tsx` last-updated 改 `process.env.BUILD_DATE` 或 `commit-hash`
- [ ] SubTask W4-4.2: 新建 `src/lib/config.ts` 集中 `SUPPORT_EMAIL`、`CONTACT_PHONE`、`WHATSAPP_URL`、`LINKEDIN_URL`
- [ ] SubTask W4-4.3: 加 TOC 侧边栏（桌面）+ 折叠菜单（移动）
- [ ] SubTask W4-4.4: 加 `@media print` 样式 + "Print this page" 按钮

**验证**: Ctrl+P 弹出打印预览样式正确

---

### Task W4-5: JsonLd 修复  [原 P2-5]
- [ ] SubTask W4-5.1: 修改 `src/components/ui/JsonLd.tsx:32` `OrganizationJsonLd.sameAs` 填 `[LinkedIn_URL, WhatsApp_URL]`
- [ ] SubTask W4-5.2: 移除 `ProductJsonLd` 的 `offers` 块（lines 162-170）或改用 `Service` schema
- [ ] SubTask W4-5.3: ArticleJsonLd image 兜底改本地（与 W0-2 合并验证）
- [ ] SubTask W4-5.4: WebSiteJsonLd 的 `SearchAction` 指向 `/blog?q=` — 实现该搜索功能或移除 SearchAction

**验证**: https://search.google.com/test/rich-results 验证所有页面零 error

---

### Task W4-6: 死代码清理  [原 P2-7]
- [ ] SubTask W4-6.1: 删除 `src/app/[locale]/contact/ContactPage.tsx`（及对应 `ContactPage.test.tsx`）
- [ ] SubTask W4-6.2: 删除 `src/lib/resend.ts:132` `sendTicketReplyEmail`（如不接入则删，或接入到工单回复流程）
- [ ] SubTask W4-6.3: 删除 `src/app/[locale]/support/page.tsx:7` 死 `Breadcrumb` import
- [ ] SubTask W4-6.4: 评估 `src/hooks/useOfflineCache.ts`（如 W2-4 接入则保留）
- [ ] SubTask W4-6.5: 评估 `src/app/[locale]/blog/[slug]/BlogDetail.tsx` 中 `architectureDiagram` 渲染逻辑，加 fallback

**验证**: `npm run build` 成功且 bundle size 减小

---

### Task W4-7: 构建配置修复（剩余）  [原 P2-8，去除 W0-7 已做部分]
- [ ] SubTask W4-7.1: 修改 `next.config.ts` 加 `poweredByHeader: false`、`reactStrictMode: true`
- [ ] SubTask W4-7.2: 评估 CSP nonce 方案替代 `'unsafe-inline'`（用 `next.config.ts` nonce generation 中间件）
- [ ] SubTask W4-7.3: 修改 `vercel.json` 移除 `npmmirror.com`（或加 `regions: ["hkg1"]` 配合中国镜像）
- [ ] SubTask W4-7.4: 修改 `tsconfig.json` 加 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`、`forceConsistentCasingInFileNames`
- [ ] SubTask W4-7.5: 修改 `eslint.config.mjs` 加 `eslint-plugin-jsx-a11y`、`eslint-plugin-security`
- [ ] SubTask W4-7.6: 修改 `sanity.config.ts` 加 `visionTool` 插件

**验证**:
- `npm run build` 成功
- `npm run lint` 零违规
- `npm run test:e2e` 在本地 build 上运行通过

---

### Task W4-8: globals.css token 化（最后做）  [原 P2-6，移到 Wave 4 末尾]
- [ ] SubTask W4-8.1: 修改 `src/app/globals.css:35` body color 改 `var(--color-foreground)`
- [ ] SubTask W4-8.2: 修改 `.section-title` color 改 `var(--color-foreground)`
- [ ] SubTask W4-8.3: 修改 `.card` background 改 `var(--color-surface)`；`.btn-secondary` border 改 `1px solid var(--color-border, rgba(0,0,0,0.15))`
- [ ] SubTask W4-8.4: 加 `@media (prefers-reduced-motion: reduce)` 全局禁用 animation/transition
- [ ] SubTask W4-8.5: Playwright 截图 light + dark 模式 11 个模块首页，对比修改前后视觉差异最小化

**验证**: light 模式视觉无差异；dark 模式自动切换正确

---

## Wave 5 — 文档同步（最后）

### Task W5-1: 文档同步  [原 P2-9]
- [ ] SubTask W5-1.1: 新建 `MEMORY.md`（AGENTS.md 多处引用但缺失），记录当前状态 + 待办 + 核心规则
- [ ] SubTask W5-1.2: 更新 `README.md` 完成度表（按本 spec 实际评估）
- [ ] SubTask W5-1.3: 更新 `docs/modules/INDEX.md` 状态（按本 spec 实际评估）
- [ ] SubTask W5-1.4: 更新 `AGENTS.md` 教训记录，新增 2026-07-19 教训："完成度声明必须基于源码事实，不能基于 PRD 标记"
- [ ] SubTask W5-1.5: 更新 `docs/modules/M01-M11.md` 各模块详情

**验证**: 三方文档（MEMORY / AGENTS / PRD）状态一致

---

### Task W5-2: PRD 反向同步（仅未覆盖部分）  [原 P2-10，去除与 W0-3 重叠部分]
- [ ] SubTask W5-2.1: 更新 `PRD/GLOBAL.md` S17 数据模型补 RLS policy 备注（标注哪些表缺 INSERT policy）
- [ ] SubTask W5-2.2: 更新 `PRD/GLOBAL.md` S18 API 设计补 idempotency_key、rate limit、CSRF 说明
- [ ] SubTask W5-2.3: 更新 `PRD/M02-Products.md` 补 canonical 标签要求
- [ ] SubTask W5-2.4: 更新 `PRD/M05-Tickets.md` 补工单详情页、幂等键、事务安全要求

**验证**: PRD 反向同步检查清单（AGENTS #41）全部通过

---

## Task Dependencies（优化版）

```
Wave 0（7 个独立任务并行）
  W0-1 M04 GROQ ─────────┐
  W0-2 picsum 移除 ──────┤
  W0-3 Case 残留 ────────┼─→ Wave 1
  W0-4 Sanity client ────┤
  W0-5 Hero a11y ────────┤
  W0-6 sitemap ──────────┤
  W0-7 playwright config ┘

Wave 1（3 个 P0 致命任务并行）
  W1-1 API 安全 ─────────┐
  W1-2 Auth + middleware ┼─→ Wave 2
  W1-3 工单补完 ─────────┘

Wave 2（5 个 i18n + 重构任务，部分串行）
  W2-1 Breadcrumb ─────┐
  W2-2 ProductCard ────┤
  W2-4 hooks 集成 ─────┼─→ W2-3 i18n 全站（依赖 W2-1 + W2-2）
  W2-5 About Sanity ───┘   (依赖 W0-3 + W0-4)

Wave 3（测试集中补全）
  W3-1 测试补全（依赖所有 Wave 1-2 任务）

Wave 4（8 个 P2 任务并行，globals.css 最后）
  W4-1 ~ W4-7 并行 ──→ W4-8 globals.css token（最后）

Wave 5（文档同步）
  W5-1 文档同步 ─┐
  W5-2 PRD 同步 ─┘  (依赖所有 Wave 1-4)
```

---

## 执行顺序总结

| Wave | 任务数 | 并行度 | 预估周期（单人） | 预估周期（2-3 人并行） |
|------|--------|--------|------------------|------------------------|
| Wave 0 | 7 | 全并行 | 2-3 天 | 1 天 |
| Wave 1 | 3 | 全并行 | 5-7 天 | 2-3 天 |
| Wave 2 | 5 | 4 并行 + 1 串行 | 7-10 天 | 3-5 天 |
| Wave 3 | 1 | 集中 | 3-5 天 | 2-3 天 |
| Wave 4 | 8 | 7 并行 + 1 串行 | 5-7 天 | 2-3 天 |
| Wave 5 | 2 | 全并行 | 2-3 天 | 1 天 |
| **总计** | **26** | — | **3-5 周** | **2-3 周** |

**对比原 v1 排序（5-8 周）**：优化后单人周期从 5-8 周 → 3-5 周（节省 ~40%），并行周期从 3-4 周 → 2-3 周（节省 ~25%）。
