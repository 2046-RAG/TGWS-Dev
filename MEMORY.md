# TGWS Project MEMORY — 真实状态源

> **职责**：本文件是 TGWS 项目的**真实状态源**（待办、进度、配置），与 `AGENTS.md`（规则约束源）、`PRD-TechGuru-Website.md`（设计权威源）三方协同。
> **更新原则**：每个 task 完成后必须更新本文件（AGENTS.md #42）；展示待办必须从本文件获取，不能从 AGENTS.md Open Items 获取（AGENTS.md #40）。
> **最近更新**：2026-07-19 — Wave 0-4 全部完成，进入 Wave 5 文档同步阶段。

---

## 1. 当前项目状态

### 1.1 总览

| 项 | 当前值 |
|----|--------|
| 项目阶段 | Wave 5 文档同步中（Wave 0-4 已完成） |
| Spec | `.trae/specs/audit-tgws-gap-optimization/` (spec.md + tasks.md + checklist.md) |
| 全项目实际加权完成度 | 约 70%（spec.md 评估为 65%，Wave 0-4 修复后接近 70-75%） |
| typecheck | ✅ 0 错误 |
| test:run | ✅ 295/295 通过 |
| i18n:audit | ✅ 923/923 keys 对齐（EN/ZH） |
| lint | ✅ 0 error |
| 生产部署 | https://www.techguru-it.asia (Vercel) |

### 1.2 Wave 执行进度

| Wave | 任务范围 | 状态 | 完成日期 |
|------|----------|------|----------|
| Wave 0 | 7 个独立修复任务（GROQ/picsum/Case 残留/Sanity client/Hero a11y/sitemap/playwright） | ✅ 完成 | 2026-07-19 |
| Wave 1 | 3 个 P0 致命任务（API 安全/Auth 中断/工单补完） | ✅ 完成 | 2026-07-19 |
| Wave 2 | 5 个 i18n + 重构任务（Breadcrumb/ProductCard/i18n 全站/hooks 集成/About Sanity） | ✅ 完成 | 2026-07-19 |
| Wave 3 | 1 个测试补全任务（M08-M11 + UI 组件 + API + a11y） | ✅ 完成 | 2026-07-19 |
| Wave 4 | 8 个 P2 体验/质量任务（Compare/VMware/Help/Legal/JsonLd/死代码/构建/globals.css） | ✅ 完成 | 2026-07-19 |
| Wave 5 | 2 个文档同步任务（W5-1 文档同步 / W5-2 PRD 反向同步） | 🟡 进行中 | 2026-07-19 |

---

## 2. 待办列表（从 spec.md / tasks.md 获取）

### 2.1 Wave 5 剩余（高优先级）

| ID | 任务 | 负责人 | 状态 |
|----|------|--------|------|
| W5-1 | 文档同步（MEMORY/README/INDEX/AGENTS/M01-M11） | 本 subagent | 🟡 进行中 |
| W5-2 | PRD 反向同步（S17 RLS / S18 idempotency+rate limit+CSRF / M02 canonical / M05 工单详情） | 另一 subagent | ⏳ 待开始 |

### 2.2 已知未解决项（需用户决策，源自 spec.md 第 12 章）

| 项 | 决策点 | 当前状态 |
|----|--------|----------|
| DarkModeToggle 设计系统冲突 | 保留三态切换（系统/浅/深）or 删除恢复纯自动切换？ | ⏳ 待用户决策；当前实现为三态 toggle |
| Hero 鼠标拖动视频进度 | a11y vs 视觉惊艳，保留 or 移除？ | ⏳ 待用户决策；当前已加 `prefers-reduced-motion` 守护 |
| `next.config.ts` CSP nonce 方案 | 实施 nonce（工作量较大） or 维持 `'unsafe-inline'`？ | ⏳ 待用户决策；当前维持 `'unsafe-inline'` |
| `vercel.json` China mirror | 保留 npmmirror.com（开发者所在地） or 移除（避免非中国区构建失败）？ | ⏳ 待用户决策；当前保留 |
| ProductJsonLd schema 类型 | 改 `Service` schema or 移除 `offers` 块？ | ⏳ 待用户决策；当前已移除 `offers` 块 |

### 2.3 后续 follow-up（部署后人工抽查）

| ID | 任务 | 依赖 | 状态 |
|----|------|------|------|
| F-1 | 部署后人工抽查 11 个模块核心流程 | Wave 5 完成 + 部署 | ⏳ 待执行 |
| F-2 | Google Search Console sitemap 提交后无错误观察（2 周） | 部署 | ⏳ 待执行 |
| F-3 | Google Rich Results Test 所有页面零 error 验证 | 部署 | ⏳ 待执行 |
| F-4 | Google PageSpeed Insights LCP < 2.5s, Lighthouse > 90 验证 | 部署 | ⏳ 待执行 |
| F-5 | 同 idempotency_key 两次提交工单返回同一工单号（线上验证） | 部署 | ⏳ 待执行 |
| F-6 | Odoo CRM 凭证配置后端到端联调 | Odoo 账号 | ⏳ 待用户配置 |
| F-7 | 社交媒体账号配置（WeChat / WhatsApp） | 账号 | ⏳ 待用户配置 |
| F-8 | 分析工具配置（Google Analytics / Umami） | 用户决策 | ⏳ 待用户决策 |
| F-9 | `next.config.ts` 中 case-studies → blog 重定向 30 天后删除（标记日期 2026-07-19，2026-08-18 可删） | 时间 | ⏳ 待执行 |
| F-10 | Sanity `caseStudy.ts` schema 残留检查（spec.md P0-6） | 已清理 | ✅ 完成 |

---

## 3. 已完成列表（Wave 0-4 所有 task）

### Wave 0（7 个独立修复）

| Task | 内容 | 验证 |
|------|------|------|
| W0-1 | 修复 M04 Solutions GROQ 致命 bug（补 5 字段 + `<meta.icon>` JSX bug） | `/zh/solutions` 中文从 Sanity 加载 |
| W0-2 | 移除所有 picsum.photos 引用（新建 `og-default.png` + 5 文件改本地兜底） | `grep -r "picsum" src/ next.config.ts` 零结果 |
| W0-3 | 清理 Case Studies 残留（sanity.config / schema / e2e / scripts） + PRD 反向同步 | sanity/ e2e/ 零残留 |
| W0-4 | Sanity client 统一（所有 RSC 用 `@/lib/sanity.server`）+ ESLint 规则 | lint 零违规 |
| W0-5 | Hero a11y 修复（prefers-reduced-motion + poster + aria-label + clipboard API） | 系统级 reduced motion 守护生效 |
| W0-6 | sitemap 补全（products/build/run/protect/[slug] + compare + 真实 lastModified） | `/sitemap.xml` 全覆盖 |
| W0-7 | playwright config 改本地（baseURL=localhost + webServer + Mobile Safari/Chrome projects） | E2E 不再污染生产 |

### Wave 1（3 个 P0 致命）

| Task | 内容 | 验证 |
|------|------|------|
| W1-1 | API 安全加固（CSRF token + rate limit + 文件类型白名单 + 10MB + signed URL + 字段校验 + 错误格式统一） | `src/lib/csrf.ts` + `src/lib/rate-limit.ts` 实现 |
| W1-2 | Auth 密码重置 + middleware 完善（`/support/reset-password` 页面 + 重定向修复 + 路由保护） | `src/components/auth/ResetPasswordForm.tsx` + `support/reset-password/page.tsx` |
| W1-3 | 工单系统补完（`/support/tickets/[id]` 详情页 + 幂等键 + 6 字符工单号 + 事务包装 + i18n 修复） | `TicketDetailClient.tsx` + `idempotency_key` 在 3 文件 |

### Wave 2（5 个 i18n + 重构）

| Task | 内容 | 验证 |
|------|------|------|
| W2-1 | Breadcrumb 组件修复（`locale` 从 `useParams()` 自动获取 + 'Home'/'首頁' 移入 i18n + 单元测试） | `Breadcrumb.test.tsx` 通过 |
| W2-2 | 抽取共享 ProductCard 组件（`src/components/products/shared.ts` 集中 slugToI18n/iconMap/tabColors/runSubgroups） | 3 文件去重 |
| W2-3 | 全站 i18n 硬编码扫描与修复（`scripts/i18n-audit.mjs` + `npm run i18n:audit` + 全模块硬编码修复） | i18n:audit 退出码 0 |
| W2-4 | hooks 集成 + 修复 useAutoSave（Odoo 用 useRetry / contact 非阻塞 / support 用 useOfflineCache / TicketForm 接入完整 API + beforeunload flush） | hooks 不再是死代码 |
| W2-5 | About 页面迁移到 Sanity（teamMember / qualification / timelineEvent schema + server component + seed 脚本 + 删 layout.tsx） | Sanity Studio 可见 3 文档类型 |

### Wave 3（1 个测试补全）

| Task | 内容 | 验证 |
|------|------|------|
| W3-1 | 测试补全（M08-M11 单测 + 8 个 UI 组件测试 + API 集成测试扩展 + `@axe-core/playwright` + coverage threshold 60%） | test:run 295/295 通过 |

### Wave 4（8 个 P2 体验/质量）

| Task | 内容 | 验证 |
|------|------|------|
| W4-1 | M08 Compare 重构（删除内联表格 + 启用 CompareTable + 修复重复条件 bug + `<caption>` + `aria-label`） | 屏幕阅读器读出表格结构 |
| W4-2 | M09 VMware 修复（phone CTA 改 `tel:` + canonical/alternates + `src/lib/vendor-colors.ts`） | hero 两 CTA 行为不同 |
| W4-3 | M10 Help 修复（FAQJsonLd 接收全部 faqItems + 空状态分场景 + 300ms debounce） | 搜索不每次按键重渲染 |
| W4-4 | M11 Legal 增强（last-updated 改构建时 + `src/lib/config.ts` 集中联系信息 + TOC + `@media print` + 打印按钮） | Ctrl+P 打印预览正确 |
| W4-5 | JsonLd 修复（OrganizationJsonLd.sameAs 填 LinkedIn/WhatsApp + ProductJsonLd 移除 offers + ArticleJsonLd image 改本地 + SearchAction 实现/移除） | Rich Results Test 零 error（待线上验证） |
| W4-6 | 死代码清理（删除 ContactPage.tsx + sendTicketReplyEmail + support/page.tsx 死 import + BlogDetail architectureDiagram fallback） | bundle size 减小 |
| W4-7 | 构建配置修复（poweredByHeader: false + reactStrictMode: true + vercel.json regions + tsconfig 严格选项 + eslint-plugin-jsx-a11y/security + sanity visionTool） | build + lint + test:e2e 全绿 |
| W4-8 | globals.css token 化（body/.section-title/.card/.btn-secondary 改用 CSS 变量 + `@media (prefers-reduced-motion: reduce)` 全局禁动画） | light 模式视觉无差异 |

---

## 4. 核心规则（高频引用）

> 完整规则集见 `AGENTS.md` Harness Constraints（60 条）。本节仅列高频引用规则。

### 4.1 工作流核心规则

- **#32 禁止启动 dev server 做测试** — `npm run dev` 启动耗时过长，分析问题用静态分析或 `npx next build --webpack`；运行时验证用 `webfetch` 访问线上部署地址。
- **#33 修 bug 不要动正常功能** — 只改与问题直接相关的代码，不顺手"清理"或"优化"其他代码。
- **#36 事实核查必须读源码** — 待办梳理/差距评估禁止仅凭文件树、旧评估报告、PRD 原始设计推断；必须逐页 `read` 源代码确认实际内容。
- **#42 Task 完成后自动 doc-sync** — 每个 task 完成后必须运行 doc-sync 检查 MEMORY/AGENTS/PRD 三方一致性。
- **#24 No unauthorized deployment** — 未经用户明确批准不得部署。

### 4.2 dev server 端口冲突处理

```bash
# 启动 dev server 前先检查并清理旧进程
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3000
Stop-Process -Id <PID> -Force
```

**根因**：bash 工具超时后 node 进程未被正确清理，仍占用 3000 端口；新启动尝试 EADDRINUSE 失败。

### 4.3 文档同步检查清单（AGENTS #41）

执行文档同步时必须检查：

1. AGENTS.md Open Items 与 MEMORY.md 是否一致
2. PRD [S22] 状态是否与 MEMORY.md 一致
3. MEMORY.md 待办是否标记最新状态
4. 是否有过期文档需要标记

### 4.4 安全/数据完整性（AGENTS #6-#20）

- 所有写操作必须幂等（idempotency_key）
- 多步操作必须事务包装（RPC 或补偿动作）
- Supabase 不可达时显示缓存数据 + staleness 指示器（非错误页）
- 长表单每 30s 自动保存到 localStorage
- 工单状态变更必须记 audit_log（who/when/what）
- 软删除（`deleted_at`），不硬删用户数据
- 工单更新使用乐观锁（version 字段）

### 4.5 视觉/图片规则（AGENTS #57-#60）

- 禁止 picsum.photos 等随机图片服务
- 视觉元素必须与内容语义匹配（AI 用代码/数据可视化、安全用盾牌/监控、基础设施用服务器/网络）
- 多个产品共享同一张图片是严重错误
- 分析与执行必须一致（不能说"效果图"却用"风景照"）

### 4.6 Playwright 约束

- **#27 只允许 Microsoft Edge**（`executablePath: 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'`，禁止 Chromium）
- **#37 并发标签页 ≤ 3**（超出排队，防内存溢出）
- **#38 UI 页面审计必须用 Playwright 截图**（Sanity 脚本只能查数据正确性，无法验证视觉）
- **#39 数据正确不等于视觉正确**（必须同时查数据 + 视觉）

---

## 5. 配置

### 5.1 环境变量（`.env.local`，不入仓）

> 所有凭证存于 `tgws/.env.local`，禁止提交。复制 `.env.local.example` 后填入真实值。

| 变量 | 用途 | 来源 |
|------|------|------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity 项目 ID | Sanity dashboard |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (默认 production) | Sanity dashboard |
| `SANITY_API_READ_TOKEN` | Sanity 服务端只读 token | Sanity manage |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key（浏览器） | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role（服务端，绕 RLS） | Supabase dashboard |
| `RESEND_API_KEY` | Resend 邮件 API key | Resend dashboard |
| `RESEND_FROM_EMAIL` | 默认发件人 `TechGuru Support <support@techguru-it.asia>` | 验证域名后配置 |
| `ODOO_URL` / `ODOO_DB` / `ODOO_USERNAME` / `ODOO_PASSWORD` | Odoo CRM 凭证（可选） | Odoo 实例 |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL `https://www.techguru-it.asia` | 部署域名 |
| `BUILD_DATE` | 构建时间戳（用于 legal 页 last-updated） | CI 注入 |

### 5.2 Sanity 配置

| 项 | 值 |
|----|----|
| Project ID | `r6ztl1oq` |
| Dataset | `production` |
| Studio | `tgws/sanity.config.ts` |
| Schemas | products / posts / solutions / faq / partners / teamMember / qualification / timelineEvent |
| 已删除 schema | `caseStudy.ts`（2026-07-12 删除） |
| Plugins | `visionTool`（W4-7 启用） |
| Webhook | ISR revalidation → `/api/revalidate` |
| Image builder | `@/lib/sanity.image.ts` (`urlFor`) |

### 5.3 Supabase 配置

| 项 | 值 |
|----|----|
| Tables | `users`, `tickets`, `ticket_attachments`, `ticket_comments`, `ticket_audit_log`, `contact_submissions` |
| RLS | 启用（all tables） |
| Storage | 工单附件 bucket（signed URL，1h 有效期） |
| Auth | Gmail OAuth + email/password |
| Migrations | `001_init.sql`, `002_add_audit_log.sql`, `003_add_idempotency_key.sql`（W1-3） |
| 服务端 client | `@/lib/supabase/server.ts` |
| 浏览器 client | `@/lib/supabase/client.ts` |
| Middleware | `@/lib/supabase/middleware.ts`（含路由保护，W1-2 完善） |

### 5.4 Vercel 部署配置

| 项 | 值 |
|----|----|
| 生产 URL | https://www.techguru-it.asia |
| Project ID | `prj_LHKlb8B4Q7eUtBri3zkeSz3vK9Mu` |
| 配置文件 | `tgws/vercel.json` |
| Build command | `npx next build --webpack`（强制 Webpack） |
| Install command | `npm install --registry https://registry.npmmirror.com`（中国镜像，待用户决策是否保留） |
| Region | 待配置（建议 `hkg1` 配合中国镜像） |
| 部署命令 | `npx vercel --prod --yes`（仅在用户明确批准后执行） |

### 5.5 测试配置

| 项 | 值 |
|----|----|
| 单元测试 | Vitest ^4.1.9 |
| E2E | Playwright ^1.61.1（仅 Microsoft Edge，W0-7 改本地 baseURL + webServer） |
| Coverage threshold | ≥ 60%（W3-1 配置于 `vitest.config.ts`） |
| a11y 扫描 | `@axe-core/playwright`（W3-1 引入） |
| 当前测试数 | 295 passing |
| i18n audit | `npm run i18n:audit`（923/923 keys 对齐） |
| Playwright projects | Desktop Edge + Mobile Safari (iPhone 14) + Mobile Chrome (Pixel 7) |

### 5.6 设计 token（来自 `globals.css`）

| Token | Value | Role |
|-------|-------|------|
| `--color-primary` | `#00D4FF` | CTAs, links, focus rings |
| `--color-accent` | `#7B61FF` | Secondary accent (Run pillar) |
| `--color-surface` | `#FAFAFA` | Card backgrounds |
| `--color-background` | `#F4F4F5` | Page background |
| `--color-foreground` | `#18181B` | Primary text |

---

## 6. 关键文件路径

### 6.1 文档源（三方状态）

| 文件 | 角色 | 路径 |
|------|------|------|
| **MEMORY.md** | 真实状态源（本文件） | `/workspace/MEMORY.md` |
| **AGENTS.md** | 规则约束源（60 条规则 + 教训记录） | `/workspace/AGENTS.md` |
| **PRD-TechGuru-Website.md** | 设计权威源（22 章节） | `/workspace/PRD-TechGuru-Website.md` |
| PRD v2.0 模块化 | 设计模块化分割 | `/workspace/PRD/{GLOBAL,M01-M07,S07,S08}.md` |
| spec.md | 差距评估 | `/workspace/.trae/specs/audit-tgws-gap-optimization/spec.md` |
| tasks.md | 任务清单 | `/workspace/.trae/specs/audit-tgws-gap-optimization/tasks.md` |
| checklist.md | 验收检查点 | `/workspace/.trae/specs/audit-tgws-gap-optimization/checklist.md` |

### 6.2 模块文档

| 模块 | 路径 |
|------|------|
| 索引 | `/workspace/docs/modules/INDEX.md` |
| M01-M11 | `/workspace/docs/modules/M01-Home.md` ~ `M11-Legal.md` |

### 6.3 关键代码入口

| 入口 | 路径 |
|------|------|
| Next.js App | `/workspace/tgws/src/app/[locale]/` |
| API Routes | `/workspace/tgws/src/app/api/` |
| 共享组件 | `/workspace/tgws/src/components/` |
| Hooks | `/workspace/tgws/src/hooks/` |
| Lib | `/workspace/tgws/src/lib/`（含 csrf.ts / rate-limit.ts / config.ts / vendor-colors.ts） |
| Sanity schemas | `/workspace/tgws/sanity/schemas/` |
| 数据库迁移 | `/workspace/supabase-schema.sql` + 迁移脚本 |
| Vitest 配置 | `/workspace/tgws/vitest.config.ts` |
| Playwright 配置 | `/workspace/tgws/playwright.config.ts` |
| i18n 文案 | `/workspace/tgws/messages/{en,zh}.json` |

---

## 7. 历史教训索引

> 完整教训记录见 `AGENTS.md` "教训记录"章节。本节仅索引关键字以备检索。

| 日期 | 教训 | AGENTS 规则 |
|------|------|-------------|
| 2026-07-09 | 事实核查必须读源码（about 页面时间线误判） | #36 |
| 2026-07-10 | UI 审计必须用 Playwright 截图 | #38, #39 |
| 2026-07-11 | 文档职责划分（MEMORY/AGENTS/PRD 三方） | #40, #41, #42 |
| 2026-07-12 | i18n 映射多文件同步 + Hook 完整状态机 | #49-#52 |
| 2026-07-14 | 评估必须完整列出具体缺陷 + PRD 必须反向同步 + 一次性穷极所有方面 | #54, #55, #56 |
| 2026-07-15 | dev server 端口冲突处理 | 本文件 §4.2 |
| 2026-07-15 | 分析与执行脱节 + 随机图片填充 | #57-#60 |
| **2026-07-19** | **完成度声明必须基于源码事实，不能基于 PRD 标记**（README/INDEX 全标 ✅ 与实际差距） | **#36（强化）** |

---

## 8. 过期/归档文档清单

| 文件 | 状态 | 备注 |
|------|------|------|
| `PROJECT-REVIEW-REPORT.md` | 已归档（2026-07-12） | 文件清理报告，已执行 |
| `UI-UX-GAP-ASSESSMENT.md` | 已过期（2026-07-05） | 部分问题已修复，不应作为状态源 |
| AGENTS.md Open Items | PRD 阶段原始设计 | 不应作为待办源（AGENTS #40），待办以本文件 §2 为准 |
| `MEMORY-Historical-*.md` | 历史记录 | 不再作为状态源 |
| `MEMORY-Rules-Spillover.md` | 历史规则 | 已合并入 AGENTS.md |
| `AI-Hub-Integration-Design.md` 等 4 个未来功能设计文档 | Draft（未实现） | 不影响当前状态 |
| `next.config.ts` 中 case-studies → blog 重定向 | 标记 30 天后删除 | 2026-08-18 可删 |

---

## 9. Changelog

| 日期 | 变更 |
|------|------|
| 2026-07-19 | 新建 MEMORY.md（W5-1.1）；记录 Wave 0-4 全部完成；记录 Wave 5 进行中；记录待办/已完成/配置/规则 |
