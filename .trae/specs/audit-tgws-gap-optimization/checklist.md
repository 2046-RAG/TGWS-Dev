# TGWS 全项目差距优化验收检查清单

> **change-id**: `audit-tgws-gap-optimization`
> **配套文档**: `spec.md`（差距评估）/ `tasks.md`（任务清单）
> **使用方法**: 每完成一个 task，对照本清单逐项打勾；任何一项未通过则不能进入下一 task

---

## P0 验收检查点（致命问题修复）

### Task P0-1: API 安全加固
- [ ] CSRF token 中间件实现，所有 POST/PUT/PATCH 路由受保护
- [ ] Rate limit 实现：`/api/contact` 5 req/min、`/api/tickets` 10 req/min、`/api/auth/reset-password` 5 req/min
- [ ] `/api/upload` 文件大小限制 = 10MB（与 PRD S2.5 一致）
- [ ] `/api/upload` 文件类型白名单：image/png, image/jpeg, image/webp, image/gif, application/pdf, text/plain, application/zip
- [ ] `/api/upload` 顺序：先校验 ticket ownership，再上传 Storage
- [ ] `/api/upload` 返回 signed URL（1h 有效期），非 public URL
- [ ] `/api/upload` 文件名 sanitize（移除 `..` 和 `/`）
- [ ] `/api/tickets` POST 字段长度校验：subject ≤200, description ≤800
- [ ] `/api/tickets` POST enum 校验：category ∈ {build, run, protect}
- [ ] `/api/tickets/[id]` PATCH 字段级角色白名单（非 admin 不可改 status/priority/assigned_to）
- [ ] 错误响应统一格式 `{ success: false, error: { code, message } }`
- [ ] 服务端日志不返回客户端（无堆栈泄漏）
- [ ] `curl -X POST /api/contact` 无 CSRF token → 403
- [ ] 连续 11 次 POST `/api/contact` → 第 11 个返回 429 + `Retry-After` header
- [ ] 上传 11MB 文件 → 413
- [ ] 上传 `.exe` 文件 → 415
- [ ] PATCH `/api/tickets/[id]` as customer 改 status → 403

### Task P0-2: M04 Solutions GROQ 修复
- [ ] `solutions/page.tsx` GROQ 包含 `challengesZh, solutionsZh, recommendedProductsZh, metricLabel, metricLabelZh`
- [ ] `SolutionsList.tsx:138` `<meta.icon ... />` bug 修复（改 `const Icon = meta.icon; <Icon />`）
- [ ] Playwright Edge 截图 `/zh/solutions` 显示中文内容来自 Sanity
- [ ] 6 个 industry tab 都能切换且图标正常渲染

### Task P0-3: Auth 密码重置断流修复
- [ ] 新建 `/support/reset-password` 页面（设置新密码表单）
- [ ] `LoginForm.tsx:50` redirectTo 改 `${origin}/${locale}/support/reset-password`
- [ ] `/api/auth/reset-password/route.ts` 重定向改 `/support/reset-password`
- [ ] `/support/login` + `/support/register` 已登录跳转检查（server-side）
- [ ] 端到端流程：点 Forgot password → 收邮件 → 点链接 → 落地 reset-password → 输新密码 → 登录成功
- [ ] 已登录访问 `/support/login` 自动跳 `/support`

### Task P0-4: 工单系统补完
- [ ] 新建 `/support/tickets/[id]` 工单详情页
- [ ] `TicketList.tsx` 行可点击 → 跳转详情页
- [ ] admin 状态变更 UI 实现（status / priority / assigned_to）
- [ ] `TicketForm.tsx` 生成 `idempotency_key`（uuid v4）作为 hidden field
- [ ] `/api/tickets` POST 按 `idempotency_key` 去重，命中返回原工单
- [ ] 工单号改 6 字符 base36 + 碰撞重试 3 次
- [ ] ticket insert + audit log + email 事务包装（RPC 或补偿动作）
- [ ] 数据库迁移 `003_add_idempotency_key.sql` 执行成功
- [ ] `ticket_audit_log`、`ticket_attachments`、`ticket_comments` 加 INSERT RLS policy
- [ ] `TicketList.tsx:65,95` 硬编码英文 + "PHT" 时区修复
- [ ] E2E 测试覆盖：同 idempotency_key 两次提交返回同一工单号
- [ ] E2E 测试覆盖：admin 改状态成功，customer 改状态失败

### Task P0-5: 移除 picsum.photos
- [ ] 新建 `public/images/og-default.png`（1200×630）
- [ ] `JsonLd.tsx:77` ArticleJsonLd image 兜底改本地
- [ ] `JsonLd.tsx:156` ProductJsonLd image 兜底改本地
- [ ] `blog/[slug]/page.tsx:43-45` OG image 兜底改本地
- [ ] `BlogDetail.tsx:217` 同上
- [ ] `next.config.ts:32-34` 移除 `picsum.photos` remotePatterns
- [ ] `grep -r "picsum" src/ next.config.ts` 零结果

### Task P0-6: Case Studies 残留清理 + PRD 反向同步
- [ ] `sanity.config.ts` 移除 `caseStudy` import 和 types 项
- [ ] 删除 `sanity/schemas/caseStudy.ts`
- [ ] 删除 `e2e/case-studies.spec.ts`
- [ ] 删除 `scripts/query-case-studies.mjs`、`scripts/verify-case-studies.mjs`
- [ ] `PRD-TechGuru-Website.md` S11 标记 "[已废弃 - 2026-07-12]"
- [ ] `PRD/GLOBAL.md` S22 开放问题 #3 同步
- [ ] `next.config.ts` case-studies → blog 重定向保留（标记 30 天后删除 TODO）
- [ ] `grep -ri "case-stud" tgws/sanity/ tgws/e2e/ scripts/` 零结果（除 next.config.ts 重定向）

---

## P1 验收检查点（集成完整性）

### Task P1-1: i18n 全站修复
- [ ] `scripts/i18n-audit.mjs` 实现
- [ ] `package.json` 加 `"i18n:audit"` script
- [ ] `home/page.tsx` 6 处硬编码修复
- [ ] `products/CategoryPage.tsx`、`ProductsList.tsx`、`ProductDetail.tsx` 硬编码修复
- [ ] `blog/BlogList.tsx`、`BlogDetail.tsx` 调用标签硬编码修复
- [ ] `contact/page.tsx:64` 面包屑修复
- [ ] `solutions/SolutionsList.tsx:158` 架构图标签修复
- [ ] `compare/page.tsx:74-80` 合作伙伴修复
- [ ] `help/page.tsx:102` BreadcrumbJsonLd 修复
- [ ] `privacy/page.tsx:33`、`terms/page.tsx:33` 日期修复
- [ ] `TicketList.tsx:65,95` 工单列表硬编码修复
- [ ] `CookieConsent.tsx`、`ErrorBoundary.tsx` 硬编码修复
- [ ] `npm run i18n:audit` 退出码 0
- [ ] 手动浏览 `/zh/*` 11 个模块无英文残留（除品牌名、产品名）

### Task P1-2: Breadcrumb 组件修复
- [ ] `Breadcrumb.tsx` `locale` prop 改 `useParams()` 自动获取
- [ ] 'Home'/'首頁' 移入 i18n `common.breadcrumb.home`
- [ ] 单元测试覆盖 Breadcrumb
- [ ] `/zh/compare`、`/zh/help` 显示 "首頁"

### Task P1-3: Sanity client 统一
- [ ] `products/page.tsx`、`blog/page.tsx`、`solutions/page.tsx` 改用 `sanity.server`
- [ ] `product-data.ts` 改用 `sanity.server`
- [ ] `eslint.config.mjs` 加 `no-restricted-imports` 规则禁止 RSC 导入 `@/lib/sanity`
- [ ] `blog/[slug]/page.tsx:44` 硬编码 Sanity CDN URL 改用 `urlFor`
- [ ] `npm run lint` 零违规

### Task P1-4: 抽取共享 ProductCard 组件
- [ ] `src/components/products/shared.ts` 创建
- [ ] `slugToI18n`、`iconMap`、`tabColors`、`runSubgroups` 集中
- [ ] `CategoryPage.tsx`、`ProductsList.tsx`、`ProductDetail.tsx` 移除本地副本
- [ ] 产品路由策略统一（Tab 或独立路由二选一）+ canonical 标签
- [ ] `npm run typecheck` 通过

### Task P1-5: hooks 集成 + useAutoSave 修复
- [ ] `lib/odoo.ts` 用 `useRetry` 包装
- [ ] `/api/contact` 改非阻塞（Odoo 入队）
- [ ] `support/page.tsx` 工单列表用 `useOfflineCache`
- [ ] `TicketForm.tsx` 接入 `useAutoSave` 完整 API（含还原流程）
- [ ] `useAutoSave.ts` 加 `beforeunload` flush
- [ ] `/api/contact/route.ts` 成功后回写 `odoo_synced = true`
- [ ] 关闭网络 → `support/page` 显示缓存 + staleness 指示器
- [ ] 填 TicketForm 一半 → 关 tab → 重开 → 弹 "Restore draft?"

### Task P1-6: About 页面迁移到 Sanity
- [ ] `teamMember.ts` schema 完善
- [ ] `qualification.ts` schema 新建
- [ ] `timelineEvent.ts` schema 新建
- [ ] `sanity.config.ts` 注册新 schema
- [ ] `about/page.tsx` 改 server component + Sanity 获取
- [ ] `seed-about.mjs` 脚本创建
- [ ] 删除 `about/layout.tsx`
- [ ] Sanity Studio 可见 3 种新文档类型
- [ ] `/zh/about` 中文内容来自 Sanity

### Task P1-7: Hero a11y 修复
- [ ] 打字机效果加 `prefers-reduced-motion` 检查
- [ ] 鼠标拖动视频进度加同样检查
- [ ] `<video>` 加 `poster` 属性
- [ ] `<video>` 加 `aria-label`
- [ ] `document.execCommand('copy')` 替换为 `navigator.clipboard.writeText`
- [ ] 系统设置 "Reduce motion" → 打字机直接显示完整文本
- [ ] 慢网络首次加载显示 poster 而非黑屏

### Task P1-8: sitemap 补全
- [ ] `sitemap.ts` 加 `/products/build`、`/products/run`、`/products/protect`、`/compare`
- [ ] 从 Sanity 拉 product slugs 生成 `/products/[slug]` 条目
- [ ] `lastModified` 用真实数据
- [ ] `robots.ts` 加 `/api/*` disallow
- [ ] `/sitemap.xml` 包含所有产品 + 博客 + 静态页 URL

### Task P1-9: middleware 完善
- [ ] `middleware.ts` 合并 headers 和 status
- [ ] `lib/supabase/middleware.ts` 加路由保护逻辑
- [ ] `/support/*`（除 login/register/reset-password）未登录跳 `/support/login?redirect=...`
- [ ] `/support/login`、`/support/register` 已登录跳 `/support`
- [ ] `support/page.tsx` 移除客户端 auth gate
- [ ] 加载 `/support` 不闪 loading spinner

### Task P1-10: 测试补全
- [ ] M08-M11 单元测试添加（5 文件）
- [ ] UI 组件测试添加（8 文件）
- [ ] `api-integration.test.ts` 扩展覆盖所有 `/api/*` 路由
- [ ] `@axe-core/playwright` 安装
- [ ] `e2e/accessibility.spec.ts` 扫描 11 个模块首页
- [ ] `vitest.config.ts` 加 coverage threshold ≥ 60%
- [ ] `npm run test:run` 通过且覆盖率 ≥ 60%
- [ ] `npm run test:e2e` 通过（含 a11y 扫描零 critical）

---

## P2 验收检查点（体验/质量提升）

### Task P2-1: M08 Compare 重构
- [ ] `compare/page.tsx` 内联表格删除，启用 `CompareTable`
- [ ] `CompareTable.tsx:81` 重复条件 bug 修复
- [ ] table 加 `<caption>` 和 `aria-label`
- [ ] TechGuru 列加 `<th scope="col" aria-label="TechGuru">` + 图标

### Task P2-2: M09 VMware 修复
- [ ] phone CTA 改 `tel:`
- [ ] metadata 加 `alternates.canonical` 和 `alternates.languages`
- [ ] 厂商品牌色集中到 `lib/vendor-colors.ts`
- [ ] hero 两个 CTA 行为不同

### Task P2-3: M10 Help 修复
- [ ] FAQJsonLd 接收全部 `faqItems`
- [ ] 空状态文案分场景
- [ ] 搜索加 300ms debounce

### Task P2-4: M11 Legal 增强
- [ ] last-updated 改 `process.env.BUILD_DATE`
- [ ] `lib/config.ts` 集中联系信息
- [ ] 加 TOC 侧边栏（桌面）+ 折叠菜单（移动）
- [ ] 加 `@media print` 样式 + 打印按钮
- [ ] 删除 `solutions/layout.tsx`、`about/layout.tsx`
- [ ] Ctrl+P 打印预览样式正确

### Task P2-5: JsonLd 修复
- [ ] `OrganizationJsonLd.sameAs` 填 `[LinkedIn_URL, WhatsApp_URL]`
- [ ] `ProductJsonLd` 移除 `offers` 块或改 `Service` schema
- [ ] `ArticleJsonLd` image 兜底改本地
- [ ] WebSiteJsonLd 的 `SearchAction` 实现 `/blog?q=` 或移除
- [ ] https://search.google.com/test/rich-results 验证所有页面零 error

### Task P2-6: globals.css token 化
- [ ] body color 改 `var(--color-foreground)`
- [ ] `.section-title` color 改 `var(--color-foreground)`
- [ ] `.card` background 改 `var(--color-surface)`
- [ ] `.btn-secondary` border 改 CSS 变量
- [ ] 加 `@media (prefers-reduced-motion: reduce)` 全局禁动画
- [ ] Playwright 截图 light + dark 11 个模块对比视觉差异最小化

### Task P2-7: 死代码清理
- [ ] 删除 `contact/ContactPage.tsx` + `ContactPage.test.tsx`
- [ ] 删除 `lib/resend.ts:132` `sendTicketReplyEmail`（或接入）
- [ ] 删除 `support/page.tsx:7` 死 import
- [ ] 评估 `useOfflineCache.ts`（如 P1-5 接入则保留）
- [ ] `BlogDetail.tsx` architectureDiagram 渲染加 fallback
- [ ] `npm run build` 成功且 bundle size 减小

### Task P2-8: 构建配置修复
- [ ] `next.config.ts` 加 `poweredByHeader: false`、`reactStrictMode: true`
- [ ] CSP nonce 方案评估（如可行则实施）
- [ ] `vercel.json` 移除 `npmmirror.com`（或加 `regions: ["hkg1"]`）
- [ ] `playwright.config.ts` baseURL 改 `http://localhost:3000` + `webServer`
- [ ] 加 Mobile Safari + Mobile Chrome playwright project
- [ ] `tsconfig.json` 加 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`、`forceConsistentCasingInFileNames`
- [ ] `eslint.config.mjs` 加 `eslint-plugin-jsx-a11y`、`eslint-plugin-security`
- [ ] `sanity.config.ts` 加 `visionTool`
- [ ] `npm run build` 成功
- [ ] `npm run lint` 零违规
- [ ] `npm run test:e2e` 在本地 build 通过

### Task P2-9: 文档同步
- [ ] 新建 `MEMORY.md`（当前状态 + 待办 + 核心规则）
- [ ] 更新 `README.md` 完成度表
- [ ] 更新 `docs/modules/INDEX.md` 状态
- [ ] 更新 `AGENTS.md` 教训记录（新增 2026-07-19 教训）
- [ ] 更新 `docs/modules/M01-M11.md` 各模块详情
- [ ] 三方文档（MEMORY / AGENTS / PRD）状态一致

### Task P2-10: PRD 反向同步
- [ ] PRD S11 标记 "[已废弃 - 2026-07-12]"（与 P0-6 合并）
- [ ] PRD S22 开放问题表对齐当前状态
- [ ] PRD S17 数据模型补 RLS policy 备注
- [ ] PRD S18 API 设计补 idempotency_key、rate limit、CSRF 说明
- [ ] PRD M02-Products 补 canonical 标签要求
- [ ] PRD M05-Tickets 补工单详情页、幂等键、事务安全要求
- [ ] PRD 反向同步检查清单（AGENTS #41）全部通过

---

## 全局最终验收（所有任务完成后）

### 代码质量门槛
- [ ] `npm run lint` 零 error
- [ ] `npm run typecheck` 零 error
- [ ] `npm run test:run` 通过且覆盖率 ≥ 60%
- [ ] `npm run test:e2e` 通过（基于本地 build，非生产）
- [ ] `npm run build` 成功（Webpack 模式）
- [ ] `npm run i18n:audit` 退出码 0
- [ ] `grep -r "picsum" src/ next.config.ts` 零结果
- [ ] `grep -ri "case-stud" tgws/sanity/ tgws/e2e/ scripts/` 零结果（除 next.config.ts 重定向）

### 部署验证
- [ ] 部署 https://www.techguru-it.asia 成功
- [ ] 11 个模块首页 Playwright Edge 截图（light + dark）
- [ ] 11 个模块首页 axe-core a11y 扫描零 critical
- [ ] Google Search Console 提交 sitemap 后无错误
- [ ] Google Rich Results Test 所有页面零 error
- [ ] Google PageSpeed Insights LCP < 2.5s, FID < 100ms, CLS < 0.1, Lighthouse > 90

### 功能端到端验证
- [ ] 注册 → 收确认邮件 → 登录 → 提交工单 → 收工单创建邮件 → 查看工单详情 → admin 改状态 → 收状态变更邮件
- [ ] 同 idempotency_key 两次提交工单返回同一工单号
- [ ] 联系表单提交 → 入库 + Odoo 异步同步 + 邮件通知
- [ ] EN/ZH 切换所有页面无英文残留
- [ ] 暗色模式自动切换正确（light + dark 截图对比）
- [ ] prefers-reduced-motion 开启后所有动画禁用
- [ ] 离线模式下 `/support` 显示缓存的工单列表 + staleness 指示器
- [ ] 工单表单填一半关 tab → 重开弹 "Restore draft?" → 接受 → 表单回填

### 文档同步验证
- [ ] MEMORY.md / AGENTS.md / PRD 三方状态一致
- [ ] README.md 完成度表反映实际状态
- [ ] docs/modules/INDEX.md 状态反映实际
- [ ] AGENTS.md 教训记录新增 2026-07-19 条目

### 已知未解决项（需用户决策）
- [ ] DarkModeToggle 设计系统冲突解决（保留三态切换 or 删除）
- [ ] Hero 鼠标拖动视频进度是否保留（a11y vs 视觉惊艳）
- [ ] `next.config.ts` CSP nonce 方案是否实施（工作量较大）
- [ ] `vercel.json` China mirror 是否保留（开发者所在地决策）
- [ ] ProductJsonLd 改 Service schema 还是移除 offers 块
