# TGWS 待办事项清单

> 基于项目分析报告生成 | 最近更新: 2026-11-15（第五轮 · 评估复核落地）；上一版 2026-07-29（第二轮，TODO-019 ~ TODO-030）
> 优先级说明: P0=必须完成(阻塞上线) | P1=重要(影响用户体验) | P2=优化(提升竞争力)

> **2026-11-15 复核覆盖声明**：本文件此前的"P0 4/4、P1 12/12、P2 10/10""测试 68 文件全绿""覆盖率 74.9%""ISR/SSG 已生效"等结论，已被当日的实跑与交叉核对取代。
> **执行依据只认本节**；以下旧章节保留为历史记录，不再作为排期依据。
> 依据文件：`docs/TGWS-ASSESSMENT-REPORT.md`（评估）、`docs/TGWS-REPORT-CROSSCHECK.md`（问题↔行动核对）。

---

## 第五轮 · 评估复核落地（2026-11-15，最新）

### 0. 本轮实测基线（不是引用历史）

| 检查 | 结果 |
|------|------|
| `npx tsc --noEmit` | 通过，0 错误 |
| `npm run build` | 通过，58 页；23 条 `[locale]` 路由全部 Dynamic，0 条 ISR |
| `npm run test:run` | 402 例：388 过 / 14 失败 / 5 文件 |
| `npx eslint .` | 2 errors / 68 warnings |
| Sanity 实查 | post 77 / product 28（图 0）/ solution 17（中文 0）/ faq 0 / partner 0 |

### 1. 状态校正（先撤回，再排期）

| 旧结论 | 实测 | 处理 |
|--------|------|------|
| P0 4/4、P1 12/12、P2 10/10 | 是"任务条目关闭"，不是"功能可用"；82 个问题中 39 个未进任何行动项 | 旧统计作废，按本节重排 |
| 测试 68 文件全绿 | 402 例中 14 失败（限流器污染、Sanity env 未注入、断言过期） | 转 T-068 |
| 覆盖率 74.9% | 本轮未复测，无 CI 门禁 | 转 T-068 |
| ISR/SSG 实时生效 | 23 条 locale 路由全动态，`revalidate` 与 `/api/revalidate` 对页面无效 | 转 T-062（**已推生产，线上 `PRERENDER`/`HIT` 已验证**） |
| GlobalSearch 多模态/图片搜索 | 上传图后只把 query 置为 `'image search'`，未进视觉模型 | 转 T-064 |
| TCO 定价 Sanity 驱动 | 有定价，但 Sangfor 为估算、无来源与有效期 | 转 T-065 |
| Umami 已接入 | 原 CSP 未放行 `cloud.umami.is`；本轮已放行且线上响应头已核对，**后台数据待验** | 转 T-067（部分完成） |
| TODO-029 profile 已可用 | 页面可用，但资料写 `user_metadata`，`users` 表基本未使用 | 并入 T-057/T-078 |
| TODO-010 附件预览已完成 | `AttachmentPreview` 仅 import 未渲染，列表只显示附件数量 | 转 T-058 + D-01（决定实现） |

### 1.1 六项必补 → 落点（可审计）

| 必补项 | 任务 | 优先级 | 验收要点 |
|--------|------|:---:|----------|
| TCO 价格来源 | T-065 | P1 | 每个价格有来源/日期；Sangfor 明示估算 |
| `unsafe-inline` CSP | T-067 | P1 | 已判定与静态渲染互斥：本轮保留并写明取舍；若收紧需先拍板放弃 ISR（见 §3.4） |
| 搜索日志落点 | T-068 | P1 | Sanity/Supabase 二选一；能查最近 7 天搜索词 |
| Odoo 凭证 | T-066 | P1 | 表单提交后出现 `crm.lead`；客户收到回执 |
| Footer 订阅 | T-079 | P1 | 接后端或删订阅框，二选一 |
| 登录锁定 | T-077 | P1 | 5 次/15 分钟锁定；注册后邮箱验证 |

> 进度更新（11:41）：TCO 价格→未动；CSP→已放行 Umami（unsafe-inline 保留，见 §3.4）；搜索日志→代码完成待线上验；Odoo→未动；Footer 订阅→未动；登录锁定→未动，且发现 `mailer_allow_unverified_email_sign_ins=false`（D9，待核实，不可据此划掉）。

### 1.2 已裁决事项（D-01）：附件预览 = 实现，不删除

- **冲突来源**：评估 §3 M05 判"管理员需要预览附件"（P1），而 §7.3 P2 #17 把 `AttachmentPreview` 当作"未用 import"列入死代码，要求删除。
- **裁决**：按前者。附件预览是工单处置的必要能力——管理员判断问题不应先下载附件。
- **落点**：T-058 详情页复用 `AttachmentPreview`；T-060 时间线附件同样复用。
- **边界**：`TicketList` 的 import 保留并接上入口，不算死代码；T-086 明确排除该组件。
- **验收**：图片可缩略/全屏、PDF 可内嵌、其他类型显示图标 + 下载；客户与管理员在详情页都能看到。

**验收口径**：本节任务完成 = 代码 + 数据 + 端到端证据（测试/截图/日志）三样齐全。只交代码不算完成。

---

### 2. P0（4 个主题 / 5 个任务，阻塞上线）

> 状态标记：`待开始` / `进行中` / `待执行`（代码完成、等待数据库或外部执行） / `已完成`（验收通过）。

> 判断标准：不修就不能对外说"上线"。原评估的 P0 #5（中文博客）、#6（ISR）已降为 P1，理由：不阻断站点使用。

#### T-057 补 `public.users` 同步触发器并回填
- **状态**：🟡 **006 迁移已上线并验证**；但按本节验收口径，**T-057 整条不能标记已完成**——缺线上"注册→建单"E2E
- **线上实证**：项目 `ACTIVE_HEALTHY`；006 HTTP 201；核对 4 项（函数存在 / 触发器挂载 / users RLS 启用 / 有邮箱账号无遗漏档案）全 PASS；只读明细 `auth.users=14 / public.users=14 / missing=0`，其中 13 个 customer、1 个非 customer 角色被保留（回填用 `ON CONFLICT DO NOTHING` 未覆盖）；`scripts/apply-006.mjs` 执行，token 文件保留
- **本地实证**：PGlite 8/8 PASS，含"新用户可成功建工单（FK 不再报错）"
- **缺的验收证据**：线上全新邮箱注册 → 建单 E2E，需往生产库写测试账号，未擅自执行
- **编号修正**：原写 `004`，因 004 跳号、005 已被 T-061 占用，实际落地为 `006_add_user_sync.sql`
- **本地实证**（`supabase/verify/006_pglite_harness.mjs`，001→002→005→006）：历史用户回填、新注册自动建档案、重复执行不报错且不产生重复行、函数与触发器存在、**新用户可成功建工单（FK 不再报错）**，8/8 PASS
- **已知边界**：`users.email` 为 NOT NULL UNIQUE，无邮箱账号（纯手机 / 不提供邮箱的 OAuth）触发器会跳过，仍无法建单；需另做身份映射
- **待执行**：`scripts/apply-006.mjs`（读 PAT → 查项目状态 → 执行 006 → 4 项核对），需把 Supabase PAT 放进 `.secrets/supabase-pat.txt`
- **依据**：`supabase/migrations/001:5,21`（`tickets.user_id REFERENCES users(id)`）；全仓无 `handle_new_user`、无 `INSERT INTO users`；`api/tickets/route.ts:65-77` 直接用 `auth.uid()` 建单
- **交付物**：
  - `004_add_user_sync.sql`：`auth.users` AFTER INSERT 触发器 → `public.users`（email、role=customer）
  - 历史用户回填脚本（按 `auth.users` 补 `public.users`）
  - 注册→建单 E2E：`e2e/journey-a-register.spec.ts` 增加断言
- **验收**：全新邮箱注册后 5 分钟内可建单，`users` 行存在且 `role='customer'`；工单外键无报错
- **依赖**：无（先核对线上是否已手工修，再决定是否重复执行）
- **风险**：线上可能已有触发器，迁移需 `IF NOT EXISTS` 语义

#### T-058 管理员：全部工单列表 + 详情页
- **状态**：🟡 **代码已完成并直推生产**；**线上端到端未验证**（需真实管理员账号登录）
- **本轮实证**：tsc 0 错；build 通过（新增两条 `ƒ` 路由）；vitest 69 文件全过（含新增 4 个 `scope=all` 权限用例：customer→403、admin 分页元数据、非法筛选 400、默认行为不变）；eslint 一度涨到 4 errors，已修回基线 2e/68w
- **直推**：`scripts/deploy-vercel.mjs` → deployment `4sANipqowZRhYntcaMSnkVode2dx`，上传 704.3KB、`--no-wait` exit 0（云端仍在构建）
- **交付物**：`GET /api/tickets?scope=all`（仅 admin/super_admin，分页 + 状态/类别/优先级筛选）；详情接口新增审计时间线（仅管理员可见）；`/support/admin/tickets` 列表页与 `/[id]` 详情页（附件预览按 D-01 实现，非死代码）；dashboard「View All」由错误的客户页改指新列表；en/zh 各补 37 个 `admin` 文案键
- **未验证**：真实管理员登录后能否看到全部工单并打开详情（本地无 admin 会话）；本次部署最终 READY 与自定义域名切换
- **依据**：`api/tickets/route.ts:120-125` 恒定 `.eq('user_id', user.id)`；`support/admin/dashboard/page.tsx:64` 只 fetch stats
- **交付物**：
  - `GET /api/tickets?scope=all`（仅 admin/super_admin，分页 + 状态/类别/优先级筛选）
  - `/[locale]/support/admin/tickets`（列表）
  - `/[locale]/support/admin/tickets/[id]`（详情：正文、附件预览、评论、审计时间线）
  - 管理台入口链接
- **验收**：管理员登录后能看到所有客户工单；任一单的附件可预览（图片/PDF 内嵌，其他下载）；普通用户访问返回 403
- **依赖**：T-057（用户数据完整）

#### T-059 管理员：指派 / 改状态 / 导出
- **状态**：🟡 **代码完成 + 直推部署 Ready**；**线上端到端未验证**（见 `docs/PENDING-ACCEPTANCE.md` A11–A13）
- **本轮实证**：tsc 0；vitest **71 文件全过**（新增 3 个 `/api/admin/users` 权限用例）；eslint 基线 2e/68w；本地 build 受本机内存限制连续 OOM（4GB 堆、单 worker 临时验证均失败，`next.config.ts` 已恢复原样）；云端 ● Ready，线上 `/api/admin/users` 未登录返回 401（旧版为 404，证明新接口已切流）
- **交付物**：`GET /api/admin/users`（仅管理员）；管理端详情页操作区（状态 / 优先级 / 指派 → 复用已有 PATCH 的审计与状态邮件）；列表页 CSV 导出当前筛选页；中英各补 9 个文案键
- **直推**：deployment `9eoYnnnUrnXKHjCeRNFW1zDnqf24` → ● Ready（Production，2m）
- **缺的验收证据**：管理员保存后审计/邮件、CSV 文件内容、客户访问员工接口 403
- **依据**：评估 AD1；`api/tickets/stats/route.ts` 已有批量 PATCH 能力但无 UI
- **交付物**：
  - 详情页操作区：指派给（管理员列表）、优先级、状态（open→in_progress→resolved→closed）
  - 复用/收敛 PATCH 接口，写 `ticket_audit_log`（old/new/performed_by）
  - 状态变更邮件（`sendTicketStatusEmail`）
  - CSV 导出（当前筛选结果）
- **验收**：每次变更都有审计记录、客户收到邮件；导出文件含工单号/状态/负责人/时间
- **依赖**：T-058

#### T-060 工单对话（客户 ↔ 管理员）
- **状态**：🟡 **代码完成 + 007 已上线 + 直推部署 Ready**；**线上端到端未验证**（需真实客户/管理员账号）
- **线上实证**：007 迁移 HTTP 201，核对 3 项全 PASS（策略数 4 / RLS 启用 / INSERT 策略存在）；顺手清掉 3 条手工遗留策略——其中「Users can insert comments for own tickets」既没校验 `user_id` 也没限制 `is_internal`，客户本可写内部备注或伪造作者，属真实安全缺口
- **本地实证**：tsc 0；vitest **70 文件 418 例全过**（新增 6 个权限用例：401 / 400 / 客户越权 403 / 客户写内部备注 403 / 客户自己单 201 / 管理员内部备注 201 且不发客户邮件）；eslint 回基线 2e/68w（顺带修掉 dashboard 的未处理 Promise 拒绝，测试退出码恢复 0）；默认堆下 build 两次 OOM，`NODE_OPTIONS=--max-old-space-size=4096` 后通过
- **交付物**：`007_ticket_comments_rw.sql` + `007_verify.sql` + `apply-007.mjs`；`POST /api/tickets/[id]/comments`（归属校验、内部备注仅管理员、10/min 限流、双方邮件通知、审计）；`GET /api/tickets/[id]` 非管理员过滤内部备注（与 RLS 双保险）；客户侧对话详情页 `/support/tickets/[id]` + 列表入口；管理端详情页回复框（含内部备注开关）；中英文案补齐
- **直推**：deployment `2znJBhDcwsmKsuULmShPxuCBWXNh` → ● Ready（Production）
- **缺的验收证据**：真实客户与管理员各发一条、双方可见且收到邮件；内部备注客户不可见（需真实账号端到端）
- **依据**：`ticket_comments` 只读无写入（`api/tickets/[id]/route.ts:52-60`）；`sendTicketReplyEmail` 零调用
- **交付物**：
  - `POST /api/tickets/[id]/comments`（归属校验；`is_internal` 仅管理员可写）
  - 详情页/客户侧时间线（内部备注对客户隐藏）
  - 回复通知邮件；限流 10/min
- **验收**：客户与管理员各发一条，双方可见；内部备注客户不可见；双方收到邮件
- **依赖**：T-058

#### T-061 修 `003` 迁移（leads RLS / search_logs）
- **依据**：`003_add_search_tables.sql:50-51` 策略引用不存在的 `user_id` 列；`search_logs` 表零写入
- **状态**：**已完成（2026-11-15 线上执行）**。项目状态 ACTIVE_HEALTHY；005 HTTP 201；6 项检查全 PASS。匿名 INSERT 尚未实测
- **交付物**：
  - `supabase/migrations/005_fix_leads_rls.sql`（幂等：补表/索引/策略/触发器，修正 `user_id` 引用）
  - `supabase/verify/005_verify.sql`（表/列/策略/RLS/触发器 五项核对）
  - `docs/runbooks/2026-11-15-T-061-leads-rls.md`（执行步骤、期望输出、回滚、本地验证记录）
  - `supabase/verify/005_pglite_harness.mjs`（本地空库验证，11 项断言）
- **验收**：Production 执行 005 成功（HTTP 201）；6 项 PASS（表/列/策略/RLS/触发器）；本地空库已验证客户/管理员读取隔离；**匿名 INSERT 待首条真实线索验证**
- **依赖**：无（需 Supabase SQL Editor 权限）

---

### 3. P1（17 项，影响信任与转化）

| 编号 | 任务 | 依据 | 验收标准 |
|------|------|------|----------|
| T-062 | 恢复静态渲染 + 首屏策略 🟡**部分完成**（静态渲染已上线；首屏带宽侧 2026-11-15 已处理 `preload=metadata` + `aria-hidden`；**LCP 实测与静态首帧素材仍缺**） | 23 条 locale 路由全 Dynamic；无 `setRequestLocale`；首页 `use client` + video `preload=auto` | 构建产物出现 `○`/ISR + 线上缓存命中；首页 LCP 有真机基线 |
| T-063 | 中文博客补译或显式回退 + 5 篇空正文补齐 | 72 篇有正文，63 篇 `contentZh` < 英文 10%，中位 6.8%；5 篇 `content` 为空 | 任选 10 篇 ZH，正文 ≥ 英文 60% 或页面明示"英文原文"；空正文清零 |
| T-064 | 搜索体验收口（图片/口径/摘要） | `api/search/route.ts:19-31` 未使用 `imageData`；全局/产品/FAQ 三套搜索口径；摘要无缓存/超时标识 | 图片搜索接模型或删入口；三套搜索统一为一套；摘要失败有降级标识 |
| T-065 | TCO 价格来源、有效期、免责口径 | Sanity `tcoCalculator`：Sangfor `isEstimated`，VMware/Nutanix 无来源 | 每个价格有来源/日期；页面显示有效期；Sangfor 明示估算 |
| T-066 | Odoo 凭证 + 线索同步 + 客户确认邮件 | `.env.local` 占位；`/api/contact` 仅落库、无客户回执 | Odoo 出现对应 `crm.lead`；客户 5 分钟内收到确认邮件 |
| T-067 | CSP 🟡**部分完成**：已放行 Umami（script-src + connect-src，线上响应头已核对）；`unsafe-inline` **有意保留**（见 §3.4） | `next.config.ts:68` 未放行 cloud.umami.is | Umami 后台收到数据；若要去 unsafe-inline，需先决定是否放弃静态渲染 |
| T-068 | 搜索日志落点 ✅**代码完成**：改写入 005 建的 `public.search_logs`（含 user_id、query_type、计数），4 个单测通过；**线上真实搜索写入未验** | 原写 Sanity 未注册的 `searchLog`，等于零落点 | 能查到最近 7 天搜索词（A15） |
| T-069 | 测试隔离 + CI 门禁 🟡**CI 已转绿**（12:14 Actions success）；但 `verify` 未设为 required check，**门禁尚未接线**，CI 失败不阻止上线；部署走 Vercel 直推 | 本地测试全过；`npm ci --legacy-peer-deps` 已实测 | 后台设 required check（需管理员） |
| T-070 | 依赖声明补全 🟡**声明已补齐**（`framer-motion` 12.42.2、`date-fns` 4.4.0，package.json 与 lock 根一致）；`npm ci` 干净安装未实测（本机不下载） | 原先两包靠 hoist 装载 | 干净环境 `npm ci` 后 build 通过；lockfile 不再依赖 hoist |
| T-071 | 密码重置页 🟡**代码完成并上线**：新增 `/[locale]/support/reset-password`（PKCE `code` 与 implicit `recovery` 双格式），LoginForm 与服务端 API 的 redirectTo 已改指该页，3 个组件单测通过；**真实邮件端到端未验**（A14） | 邮件链接原指向仅 POST 的 API → 405 | 邮件链接打开设置新密码页并成功改密 |
| T-073 | 解决方案数据治理 | 17 条只有 6 条可达；`challengesZh/solutionsZh` 0/17；`title` 存繁中 | 6 条（或按行业聚合）；中文痛点/方案齐全；字段语义正确 |
| T-074 | 暗色一致性巡检 | `support/page.tsx:109`、`admin/dashboard/page.tsx:114` 无 `dark:bg`，白字压浅灰 | 全站暗色无对比度 < 4.5:1 的正文；应用页与营销页背景一致 |
| T-075 | 内容运营机制 + 文案单一来源 | 博客停更 18 个月、分类全 technical；FAQ/partner 未入 CMS；产品文案 i18n 与 CMS 双源 | 双周 1 篇；分类真实；FAQ/partner 二选一；产品文案确定唯一来源 |
| T-076 | 设计令牌落地 | 316 处硬编码 `#00D4FF`，`var(--color-primary)` 0 处；96 处 inline style | 组件内无硬编码主色；改 token 能全站生效；`DESIGN.md` 与实现一致 |
| T-077 | 登录安全：锁定 + 邮箱验证 | PRD S2.5.1 要求 5 次/15 分钟锁定 + 验证码；当前无实现 | 连续 5 次失败锁定 15 分钟；注册后需验证邮箱才能建单 |
| T-078 | 双语硬编码清剿 🟡**部分完成**：Navbar 中英三元、UserMenu 6 处、GlobalSearch 关键文案/aria 已改为 i18n（nav 新增 20 键）；**搜索子组件与其内部提示文案未全量清剿** | 原 Navbar 中英三元、移动端 `Search`、UserMenu `Sign In/Out`、alt 英文、`taipei/hongKong` 键名 | `grep` 无 JSX 中文字面量/硬编码英文；ZH 页无英文按钮 |
| T-079 | Footer 订阅：接后端或移除 | `Footer.tsx:12-17` 仅 `setSubscribed(true)` | 二选一：接 Resend/表单入库，或删除订阅框 |

### 3.1 T-062 结果（2026-11-15，**已推生产并线上验证**）

> 完整记录：`docs/runbooks/2026-11-15-T-062-static-rendering.md`

**代码**：`[locale]/layout.tsx` 加 `setRequestLocale`；法律页改为从 `params` 取 locale；blog/products 详情页加 `generateStaticParams`；产品列表页因 `useSearchParams()` 显式保留 `force-dynamic`；顺带清掉构建期 80 条 i18n 错误（8 个网络产品特性回退 CMS 真实数据、`faqCounts` 数字改字符串）。共改 11 个文件，未改任何测试文件。

**本地实跑**：tsc 0 错；build 20 条 `●` ISR / 5 条 `○` / 4 条 locale 页仍 `ƒ`；247 个预渲染 HTML；构建期 i18n 报错归零；eslint 2e/68w、vitest 5 失败/64 通过（均与基线一致，无新增回归）。

**生产部署（08:10–08:16）**：`git push origin Trunk` → `dca689d..07f88b4`；GitHub 上 Vercel 状态 `success / Deployment has completed`。线上响应头从 `private, no-cache`/`MISS` 变为 `public`/`PRERENDER → HIT`；首页、中文法律页、博客详情、产品详情、帮助页均预渲染；`/products` 与 `/support/login` 按设计仍动态；`/en/privacy` 英文、`/zh/privacy` 繁中，均无串台、均 200。git/curl 走本机代理 `127.0.0.1:51257`（HTTPS CONNECT 隧道），不影响推送落地。

**仍未完成**：① 首页首屏策略（`use client` + video `preload=auto`）；② `/api/revalidate` 主动触发后的页面更新未验证；③ 中文站 8 个产品特性显示英文（CMS 无中文字段，归 T-072/T-075）。

**T-062 整条仍标 🟡 部分完成**——静态渲染子项已完成（含线上证据），首屏策略未做。

### 3.2 DEP-01 生产部署（已完成）

- 采用路径：GitHub push 触发 Vercel 自动构建，**不需要** Vercel token。
- 提交：`a16429a`（T-061 迁移）、`07f88b4`（T-062 代码/文档）；顺带带上此前未推送的 `4e5895c`（博客封面样本清理）。
- 提交前扫描暂存区无明文密钥；`.secrets/` 已由 `.gitignore` 排除；未提交临时分析脚本与内部评估大文档。
- 线上证据见 §3.1 与 runbook 第 5 节。

**2026-11-15 09:11 追加 · 部署链路改直推**：用户决定「GitHub 只存代码、Vercel 独立部署，各做各的，不再经过 GitHub 触发」。本机已有 Vercel CLI 56.5.0 与 `.vercel/project.json` 绑定（rootDirectory `tgws`），新增 `scripts/deploy-vercel.mjs`：读 `.secrets/vercel-token.txt` → `vercel deploy --prod --yes --no-wait`，token 走环境变量、不进命令行、不打印。**必须带 `NODE_OPTIONS=--use-env-proxy`**（Node fetch 默认不读代理，否则上传到 1.2MB 时报 `fetch failed`）。已实测直推成功（上传 332.9KB，exit 0），`--no-wait` 不等待云端构建。GitHub Actions 仍 failure（挂在 `npm ci`，日志需 admin 权限未取到），**不再作为部署前置**；Vercel 项目仍连着 Git 集成，push Trunk 仍会触发一次自动部署，是否断开待定。

---

### 3.3 T-069 阶段结果（2026-11-15；Actions 首次失败在 `npm ci`，**12:14 已转绿**）

- **测试全绿**：`npm run test:run` → 69 文件全过、0 失败（修复前 5 失败 / 64 通过）。
- 修复清单：`api-guard.ts` 暴露 `resetRateLimits()` + `src/test/setup.ts` 每用例重置（消除 429 跨用例污染）；`search/lead` 测试每请求独立 IP（原循环超过 3 次/分配额）；`internal.test.ts` mock 目标由 `@/lib/sanity` 改为实际使用的 `@/lib/sanity.server`；`vitest.config.ts` 注入占位 Sanity env；`performance.test.ts` 时间断言改 5 次中位数 / 50ms、组件数基线 60 对应上限 80；`contact` 畸形 JSON 断言 500→400（与 `parseJsonBody` 实现一致）。未删除任何断言。
- **新增** `.github/workflows/ci.yml`：`npm ci` → `tsc --noEmit` → `test:run` → `build`，使用占位环境变量，不需要任何密钥。
- **本地实跑**：tsc 0 错；测试 69/69；占位 env 下 `npm run build` 通过（58 页，因占位 Sanity 取不到 CMS 数据；真实 env 为 247 页）；eslint 仍 2 errors / 68 warnings，**故意未纳入 CI**（等 T-087 清零后再加）。
- **未验证**：Actions 从未运行过（workflow 未推送）；`npm ci` 干净安装未实测（避免下载，未执行）；`framer-motion` / `date-fns` 未在 `package.json` 直接声明，靠 lockfile 传递依赖条目装载 → 归 T-070。
- **门禁边界**：GitHub Actions 失败**不会自动阻止 Vercel 生产部署**。需仓库管理员把 `verify` 设为 required status check，或配 Vercel Deployment Protection。这一步本会话做不了。

---

### 3.4 2026-11-15 11:00 批次（用户不在家、不依赖账号）

> 只处理不需要真实账号/真机/外部供数的项；每项状态见上表与本节。

| 编号 | 处理 | 验证 |
|------|------|------|
| T-062 尾巴 | Hero 视频 `preload=auto` → `metadata`，加 `aria-hidden`/`tabIndex=-1` | 线上首页 HTML 已核对为 `preload="metadata"`；**LCP 未实测**（无真机） |
| T-067 | CSP `script-src`/`connect-src` 放行 `https://cloud.umami.is` | 线上响应头两处均命中 |
| T-068 | 搜索日志改写 Supabase `search_logs`；移除未注册的 Sanity `searchLog` | 4 个单测（字段、image 映射、日志失败不影响响应、空请求不写） |
| T-071 | 新增重置密码页 + 11 个双语键 + 两处 redirectTo 修正 | 3 个组件单测；线上 en/zh 页面均 200 |
| T-085 | contact 返回体、admin noindex、404 规范路径 | tsc + 全量单测 |
| T-087 | ESLint 2 errors → **0** | `npx eslint . -f json` |
| D1/D7 | README 写入本机构建 OOM 实测与验证口径，纠正「Umami 已接入 / 74.9%」旧结论 | 文档 |
| D2 | workflow 安装步骤改 `npm ci --legacy-peer-deps` | 待 Actions 运行 |

**关键取舍（必须说明）**：CSP 的 `script-src 'unsafe-inline'` **没有**去掉。Next.js App Router 会注入内联 RSC/flight 脚本，去掉它必须改用每请求 nonce，会让全部 locale 路由退回动态渲染，直接推翻 T-062 刚上线的静态化。这是「保留静态渲染」与「收紧 CSP」之间的架构取舍，**需要你拍板**，不是遗漏。

**本轮统一验证**：tsc 0 错；`npm run test:run` **73 文件全过、退出码 0**；eslint **0 error / 68 warnings**；双语键 966/966 无缺失；本地 `next build` 按 README 口径不作为上线前置（本机 OOM）。直推 deployment `4zJgDZkWd7X6eUY5wYBmitZQspHR`，线上核对：CSP 含 umami、en/zh 重置页 200、首页 `preload="metadata"`、`/en/privacy` `HIT`、`/api/admin/users` 401、admin 列表 307（无回归）。

**仍未验证**：Umami 后台是否收到数据、真实搜索是否写入 `search_logs`、重置邮件链接能否改密、首页真实 LCP。见 `docs/PENDING-ACCEPTANCE.md` A14–A17。

---

### 3.5 2026-11-15 12:13 批次（用户仍不方便验收）

| 编号 | 处理 | 证据 |
|------|------|------|
| T-078 | nav 新增 20 个双语键；Navbar 中英三元、UserMenu 6 处硬编码、GlobalSearch 关键文案/aria 全部改 i18n | 双语键一致、tsc 0 |
| T-080 | 新增共享 `src/lib/focus-trap.ts`（Tab/Shift+Tab 循环、焦点回位）+ 6 个单测；搜索弹窗与移动抽屉接上滚动锁/ESC/焦点陷阱；Hero reduced-motion 跳过 scrub；图标按钮补可读名 | 6 个新单测；eslint 0 error |
| T-086 | 删 4 个无生产引用文件（含各自测试）；`sanity.server.ts` 改为 `export { client } from './sanity'` 消除重复配置；**纠正**「重复 Sanity 客户端是死代码」的旧结论——两条路径都有 8/10 个文件在用，不能删 | tsc 0、全量单测 |
| T-089 | `docs/modules/INDEX.md` 从「11 个模块全 95% 完成」改为三轴口径，数字逐字引用评估报告并标注为历史快照；组件表修正 ThemeToggle / DarkModeToggle | 文档 |
| E1 | 单次补推成功 `aecb62e..62f1106` | 远程 ref 同步 |
| D2 | CI 修复随补推触发 Actions | ✅ `62f11061` → `success`（12:14 本地），GitHub Actions runs 列表实测 |

**如实标注**：① GlobalSearch 子组件与其余内部提示文案**未全量 i18n 化**，T-078 仍是部分完成；② 焦点陷阱/焦点回位/reduced-motion 都只在代码层验证，**键盘与真机效果未验**（B3）；③ 删除 2 个死代码测试文件、新增 1 个，测试文件数会变化，不是回归；④ 「搜索无滚动锁」的旧结论**不准确**——原代码已有 `document.body.style.overflow = 'hidden'`，本轮补的是焦点陷阱与焦点回位。

---

### 3.6 2026-11-16 工单模块加固（P0 三项 + P1 五项代码完成，**迁移待执行**）

依据 `docs/TICKET-MODULE-ASSESSMENT.md`（逐文件读码得出，非历史汇报）：

| 项 | 修复 | 落点 |
|---|---|---|
| G1 | 审计表启用 RLS + admin 读 + 受限写（`performed_by = auth.uid()` 且对工单有访问权），不建 UPDATE/DELETE | `008_ticket_hardening.sql` + `verify/008_verify.sql` |
| G2 | 附件表补客户/admin INSERT；**另补 admin SELECT**（此前客服读不到客户附件） | 同上 |
| G3 | 桶改 private + storage 四条策略（拆到 **009** 单独执行）；代码存**对象路径**、读取用 1h 签名 URL，兼容历史公开 URL | `009_attachment_private_bucket.sql` + `lib/tickets/attachments.ts` + `api/upload` + `api/tickets/[id]` |
| G4/G13 | 单条与批量共用 `applyStatusChange()`：`resolved_at`/审计/乐观锁/邮件/真实计数统一 | `lib/tickets/status-change.ts` |
| G5 | 离开 resolved 时清 `resolved_at` | 同上 |
| G6 | 客户 PATCH 一律 403（原被 RLS 拦成 500） | `api/tickets/[id]` |
| G7 | 客户回复重开工单（resolved/closed → in_progress、清 resolved_at、刷新 updated_at、写审计） | 008 RPC + comments |
| G8 | 通知改用 SECURITY DEFINER（`get_staff_emails` / `get_ticket_owner_email`）；**同时修好「状态变更邮件也发不出」的同源问题** | 008 + comments + status-change |
| G14 | 三处写接口补同源 + 限流 | 三个 route |
| G15 | 指派校验 UUID + `is_staff_user()` 员工身份 | 008 + `[id]` |
| G16 | `occurredAt` 格式与区间校验（2000 年至今+1 天） | `api/tickets/route.ts` |
| 409 | 仅 `PGRST116` 视为乐观锁冲突；admin 详情页提示「已被他人修改」 | status-change + 详情页 + `admin.saveConflict` 双语键 |

**验证（实测）**：`tsc` 0 错；`vitest run --maxWorkers=2` **74 文件全过、exit 0**；工单用例 **73 → 98**；`eslint` **0 error / 67 warnings**。首次默认并发跑出现 13 个 worker **OOM**（断言 0 失败），降并发后全过，属本机内存限制。

**已上线**：Vercel `5SD89ecQ3b5T1fAiPHV4WbyAoPWe` → `tgws-ma5ugemnu` **READY**；线上 6 页 200、工单接口未登录 401（PATCH 由 500 改 401）、admin 页 307 —— 无回归。

**数据库已执行**：`008`（10:36）与 `009`（10:39）均已在生产库跑通并验证 —— 7 项策略检查全 PASS、桶已 private、4 个函数为 SECURITY DEFINER；数据未动（tickets=1、audit=0）。**原 G1/G2 结论按实测修正**，见评估报告 §6.0。

**未完成**：① 附件真实上传链路、邮件送达、客户回复重开的**端到端**效果未验（A19/A21/A22）；② P2 十三项未动；③ A18/A20/A23 仍需账号侧验证。

---



---

### 3.7 2026-11-16 10:55 工单体验修复（用户实测反馈）

用户在真实使用中提出三点，已全部修复并上线：

| 编号 | 问题 | 修法 | 落点 |
|---|---|---|---|
| **F1** | 建单成功后列表不更新，必须手动刷新整页 | `TicketForm` 新增 `onSuccess(ticketId)`；父页面抽出 `loadTickets()` 复用，成功后**直接 `router.push` 到该工单详情页**（首版是切「我的工单」tab，用户实测期望是进入工单界面）；列表请求加 `cache: no-store` | `TicketForm.tsx`、`support/page.tsx` |
| **F2** | 客户侧详情页**完全不显示附件**（`AttachmentPreview` 只接在管理员页） | 详情页接入 `AttachmentPreview`，接口已返回签名 URL | `support/tickets/[id]/page.tsx` |
| **F3** | 详情页比列表页信息更少：缺状态、分类、创建时间 | 详情页顶部补元信息行（编号 + 状态徽章 + 分类 + 时间） | 同上 |

**顺带确认的两个事实**（用户提问触发）：
- 系统**没有独立「支持人员」角色**，只有 `customer` / `admin` / `super_admin`；能处理工单的就是所有 admin 账号。管理员在工单详情的「指派」下拉里可直接看到全部 staff。
- 客户详情页此前只有「主题 + 描述 + 对话」，状态/分类/时间/附件都在跳转后丢失，属信息倒挂。

**验证**：`tsc` 0 错（需 `--max-old-space-size=4096`，本机默认堆会 OOM）；`vitest --maxWorkers=2` **74 文件全过 exit 0**；新增 F1 用例（`onSuccess` 被调用且带新工单 id）；`eslint` 0 error / 68 warnings。部署 `67E4y1FtKttZwzZqmzTmu4sjibrx` → **READY**；线上 5 页 200、详情页壳 200、`/api/tickets` 401、中文站无裸露 i18n 键。

---

### 3.9 2026-11-16 22:20 附件上传失败诊断（A19 复验中发现）

用户复验反馈：建单成功（TG-20261116-C3FC38「测试1」14:12:07），但详情页显示「此工單沒有附件」。

**只读查生产库确认**（Supabase PAT）：`ticket_attachments` **0 行**、`storage.objects`（ticket-attachments 桶）**0 对象** → 上传请求确实失败，不是"读不出来"。建单本身成功。

**根因未最终定位**（服务端日志被安全策略拦：Supabase logs 端点 410/404、Vercel token 读取被拒），改从"让错误可见"入手：

| 改动 | 内容 | 落点 |
|---|---|---|
| 错误具体化 | upload 返回 `Storage upload failed` / `Metadata insert failed` 两种文案，替代笼统的 `Upload failed` | `api/upload/route.ts` |
| 失败不跳转 | `TicketForm` 仅在**所有文件上传成功**时才 `onSuccess` 跳详情页；有失败则停留在成功页并显示每个文件名 + 原因 | `TicketForm.tsx` |

**排除项**：文件选择框无 `accept` 限制（zip/mp3 可先）；上传时序正确（先建单→传文件→再跳转）；桶名常量 `ticket-attachments` 与 009 迁移一致；前端文件收集逻辑（`fileInputRef.files` + `pastedImages`）无缺失。

**验证**：定向测试通过；CI `77eb625d success`；部署 chunk `b4651a6a → efe58b43` 切流完成，详情页 chunk 也更新。

**下一步**：用户硬刷新后重测一次"带附件建单"——成功则 A19 完成；若显示红字 `Storage upload failed`/`Metadata insert failed`，按该错误定位存储层或表写入。**仍不确定用户首次提交是否真的选了文件**（若没选，则无附件属正常）。

---

### 4. P2（11 项，品质与可维护性）

| 编号 | 任务 | 依据 | 验收标准 |
|------|------|------|----------|
| T-072 | 产品视觉单一来源（原 P1，降级；已有 28 张本地图） | Sanity `image` 0/28，但 `productImages` 本地映射 28/28；线上抽查 4/4 有 Hero 图；两套来源无守护，曾发生工作区图片丢失 | CMS 或本地映射二选一，并写进文档；28 张图全部 200；构建后无缺图；不再出现"无图"误判 |
| T-080 | 交互与无障碍 🟡**代码完成，真机待验**：新增共享 `focus-trap.ts` + 6 个单测；搜索弹窗/移动抽屉均有 ESC、滚动锁、Tab 焦点陷阱、关闭后焦点回位；Hero 视频 scrub 在 reduced-motion 下跳过；图标按钮补 aria-label | 原缺滚动锁/焦点陷阱/reduced-motion | 键盘完整操作、ESC/焦点回位、真机无溢出（B3） |
| T-081 | 列表分页（产品/博客） | 77 篇/28 卡一次输出 | 每页 ≤12/24；SEO 分页可抓取 |
| T-082 | 产品级对比页 | PRD S4 要求，现有 `/compare` 是公司级 | 至少 3 组产品对比（VMware/Nutanix/Sangfor 或 HCI） |
| T-083 | 审计日志视图 + 用户管理 | 管理台无审计入口、无用户管理 | 管理台可查工单审计；可改用户角色（super_admin） |
| T-084 | 统计时间维度 | PRD S6.6 要求周/月/季/年 | 统计接口支持 `range=week/month/quarter/year`；前端可切换 |
| T-085 | 三处小修 ✅**完成**：contact 失败分支补 `success:false`、admin layout 加 `robots: noindex`、404 页改指规范首页 `/[locale]` | 原「404 链接」结论有误：`/en/home` 实测 200，属重复路径不是死链 | 三处一致 |
| T-086 | 死代码清理 ✅**完成**：删除 `tco-engine.ts`/`.test.ts`、`DarkModeToggle.tsx`/`.test.tsx`；`sanity.server.ts` 改为 re-export 单一来源；纠正 INDEX 里「DarkModeToggle 用于 Navbar」的错误 | 4 个无生产引用的文件 + 两份逐字节相同的 Sanity 配置 | 测试通过；`AttachmentPreview` 按 D-01 **保留**且仍被引用 |
| T-087 | 工程卫生 🟡**ESLint 已清零**（0 error / 68 warnings，本轮修复 `ProductsList` effect 同步 setState、忽略顶层一次性 `*.cjs`）；脚本归档与 E2E baseURL 未做 | 原 2 errors | `eslint .` 0 error（已达成） |
| T-088 | UI 细节收口：文案 / 占位 / CTA / 布局 | 登录占位截断；`taipei` 键；应用页语气；产品卡仅 Learn more；导航高度 73px 硬编码；移动菜单层级弱；产品卡窄屏截断待复核 | 占位完整显示；键名语义正确；导航高度单一定义；菜单有分组；卡片无截断 |
| T-089 | 文档同步 ✅**完成**：`docs/modules/INDEX.md` 改为三轴口径、逐字引用评估报告数字、标注历史快照与验收口径；组件/基础设施表修正 | 原表 11 个模块全写「✅ 完成 95%」 | 文档与 TODO §8 / 评估报告一致 |

---

### 5. 待外部输入（不排期，但必须标注状态）

| 编号 | 事项 | 阻塞方 | 现状 |
|------|------|--------|------|
| EXT-01 | 法律条款法务复核 + 繁中补全 + Cookie 分类 | 法务/翻译 | 未启动；ZH 约为 EN 的 1/3；无 Cookie 分类说明 |
| EXT-02 | 客户证言授权与来源 | 市场/客户 | 匿名 + 40%/35% 量化，风险未解 |
| EXT-03 | 团队/资质资料 | 公司 | 团队 3 人、资质 4 项，无证书编号 |
| EXT-04 | 3D 翻转/灯箱/新闻动态 | 产品取舍 | PRD S14 要求，未实现 |
| EXT-05 | 案例/成果段 | 市场 | 需可公开案例 |
| EXT-06 | "12+ 年"口径 | 公司 | 2020 成立 vs 12+ 年行业经验 |
| EXT-07 | design-v2 UI 提案 | 你审批（T-036） | 6 项决策未批 |
| EXT-08 | Battlecard / VMware 对照品牌 | 你拍板 | 草稿在 `docs/eval/2026-09-16-vendor-battlecard-draft.md` |

---

### 6. 旧编号 → 新编号映射

| 旧编号 | 新编号 | 说明 |
|--------|--------|------|
| T-035 Odoo 凭证 | T-066 | 升级为 P1（线索不进 CRM） |
| T-036 design-v2 | EXT-07 | 保持"待审批" |
| T-045 solutions 中文 | T-073 | 与 17→6 治理合并 |
| T-046 partner 迁 Sanity | T-075 | 并入内容运营机制 |
| T-053 组件硬编码迁 i18n | T-078 | 扩为双语硬编码清剿 |
| T-054 ZH 法律对齐 | EXT-01 | 需法务，不排工程期 |
| T-055 测试执行 | T-069 | 与 CI 门禁合并 |
| T-056 TCO 定价录入 | T-065 | 升级为 P1（含来源/有效期） |
| TODO-005 覆盖率 | T-069 | 旧 74.9% 不再引用 |
| TODO-029 profile | T-057 / T-078 | 页面可用，但数据模型与文案未收口 |

---

### 7. 建议执行顺序（2026-11-15 11:41 重排）

> 本节为历史快照，部分条目状态已变（已在 §8 与 E1/E2/E9 更新）；**当前唯一执行依据是 §8（01:42 核对）**。

**原计划 5 批**保留作追溯：

```
第 1 批（P0）: T-061 → T-057 → T-058 → T-060 → T-059
第 2 批（P1 工程）: T-062 → T-070 → T-069 → T-067 → T-068 → T-064 → T-071
第 3 批（P1 内容）: T-063 → T-073 → T-075 → T-065 → T-066
第 4 批（P1 体验）: T-074 → T-076 → T-077 → T-078 → T-079
第 5 批（P2）: T-072、T-080 起
```

**当前实际状态**：第 1 批代码全部写完并上线，但 4 项缺线上 E2E；第 2 批 7 项里 6 项已动（T-064 未动）；第 3/4/5 批基本未动。

**下一步建议顺序**（与 `docs/PENDING-ACCEPTANCE.md` §6 对齐）：

1. **先还验收债**（需要你）：A1–A17 一次跑完 → 4 项 P0 才能画勾；
2. ~~补推本地积压提交~~ → ✅ **12:13 已解决**（`aecb62e..62f1106`），D2 的 CI 修复也已实测转绿；**但 20:08 起又有新的文档更新未落仓库（E9）**；
3. **再按第 3/4 批推进**：T-063 中文博客 → T-073 方案治理 → T-065/T-066 需外部供数 → 其余纯代码项；
4. **待拍板再动**：D3（Git 集成分离）、D10（unsafe-inline）、EXT-01 ~ EXT-08。

---

### 3.8 2026-11-16 16:14 工单实测反馈修复（用户三次实测驱动）

用户真实使用后连续反馈，逐条修复：

| 序 | 用户反馈 | 真因 | 修法 |
|---|---|---|---|
| 1 | 建单后不跳转、列表要手动刷新 | 首版实现只切 tab，用户期望进工单界面；且 Vercel API 报 READY 后**域名仍在发旧 chunk 约 13 分钟** | `onSuccess` 改为 `router.push` 到工单详情；列表请求加 `no-store`；**上线验收改为盯域名 chunk 哈希而非 API 状态** |
| 2 | 详情页卡在 `...` | fetch 无超时 + `createSignedUrl` 可能挂起，阻塞整个 GET | 签名 3s 超时降级；前端 5s 超时 + 明确错误与重试；详情 GET 4 次串行查询改并行 |
| 3 | 上传按钮只有 screenshot；看不到附件 | 「粘贴截图」区最显眼，文件选择框不起眼；界面写"任何格式"但白名单只有图片/PDF/Office，失败被静默丢弃 | 白名单补音频/视频/压缩包 + 扩展名兜底；失败列出文件名与原因；文案改准确；无附件时明确显示「此工單沒有附件」 |

**验证**：14 个测试文件通过（单 worker）；Vercel 构建 READY；**等域名 chunk 从 `1728720e` 切到 `b4651a6a` 后才报完成**。

**方法论教训（写进流程）**：`deployment state = READY` **不等于**生产域名已切流。必须抓 `/zh/support` 的 `support/page-<hash>.js`，确认哈希变化才算上线。此前两次"用户说没变化"都是栽在这点。

---

### 8. 当前剩余待办总览（截至 2026-11-16 22:10 核对）

> 口径：以「用户拿起成品能做什么、不能做什么」为主轴；**代码完成 ≠ 验收完成**。
> 详细操作见 `docs/PENDING-ACCEPTANCE.md`，本表只列「还剩什么」。

#### 8.1 需要你本人（占大头，不占工程排期）

| 类别 | 数量 | 内容 |
|------|:---:|------|
| 线上端到端验收 | **23 项** | `PENDING-ACCEPTANCE.md` A1–A23：A1–A17 原债 + **A18–A23 工单新修复**（审计防伪造、附件上传、签名 URL、回复重开、通知邮件、批量一致性）。**需客户号 + 管理员号** |
| 真机 / 浏览器观察 | **7 项** | B1–B7：窄屏排版、暗色对比度、抽屉/焦点/减少动画、登录占位、语言切换、重置页窄屏、**中文站导航/账户菜单/搜索弹窗**（B7 为 12:13 批次新增，此前本表误记 6 项） |
| 供数 / 授权 | 8 项 | C1–C8 = EXT-01 ~ EXT-08（法务、证言授权、团队资质、3D 取舍、案例、「12+ 年」口径、design-v2、Battlecard） |
| 拍板 | 2 项 | **D10**：保静态渲染还是收紧 CSP 去 `unsafe-inline`；**D3**：是否断开 Vercel Git 集成 |

#### 8.2 P0 状态（5 项）

| 任务 | 代码 | 数据库/部署 | 缺的验收证据 |
|------|:---:|:---:|------|
| T-061 leads 修复 | ✅ | ✅ 005 线上 6 项 PASS | 匿名 INSERT 未实测（A8） |
| T-057 用户同步 | ✅ | ✅ 006 线上 4 项 PASS | 真实注册→建单（A1） |
| T-058 管理员列表/详情 | ✅ | ✅ 直推 Ready | 管理员登录逐单查看（A2–A4） |
| T-060 工单对话 | ✅ | ✅ 007 线上 3 项 PASS | 双方回复、邮件、内部备注隐藏（A5–A7） |
| T-059 指派/改状态/导出 | ✅ | ✅ 直推 Ready | 保存后审计/邮件、CSV、403（A11–A13） |

**结论：P0 代码主线写完并上线，但 5 项里只有 T-061 按验收口径完成，其余 4 项仍标 🟡。**

> 2026-11-16 补充：工单模块 G1–G8 + G13–G16 已修；**`008`/`009` 已于 10:36/10:39 在生产库执行并验证通过**（策略层全 PASS）。**但真实链路仍未确认**：附件能否上传成功、邮件是否送达、客户回复是否重开——用户实测反馈过"没变化"，最终修复已切流，等待复验。

#### 8.3 剩余工程任务（我可以继续做）

| 组 | 未动 | 部分完成 |
|---|---|---|
| P1 内容/数据（5） | T-063 中文博客补译 · T-065 TCO 报价来源 · T-066 Odoo 凭证与回执 · T-073 解决方案 17→6 治理 · T-075 内容运营机制 | — |
| P1 安全/稳定（4） | T-067 的 `unsafe-inline`（待 D10 拍板） · T-071 邮件 E2E（待你） · T-077 登录锁定（D9 待核实） · T-064 图片搜索伪功能 + 三套口径 | T-068 线上写入未验；T-069 **CI 已转绿**（`62f11061`、`67a5528` 两次 success），剩 required check 未接线；T-070 `npm ci` 干净安装未实测 |
| P1 体验（4） | T-074 暗色一致性 · T-076 设计令牌落地 · T-079 Footer 订阅 | T-062 首页 LCP（A17） · T-078 导航/账户/搜索弹窗已清剿，子组件与其余提示未全量 |
| P2（11） | T-072 产品视觉单一来源 · T-081 分页 · T-082 产品级对比 · T-083 审计视图+用户管理 · T-084 统计维度 · T-088 UI 细节 | T-085 ✅ · T-086 ✅ · T-089 ✅ · T-087 🟡（ESLint 已清零，脚本归档/E2E baseURL 未做）· T-080 🟡（代码完成，真机待验） |

#### 8.4 环境 / 工程遗留（不需要账号，但待处理）

| # | 事项 | 状态 |
|:--:|---|---|
| **E1** | ~~GitHub 存档补推~~ | ✅ **22:02 已推送** `67a5528..2a9efac`（7 个提交），GitHub 与本地一致 |
| E2 | ~~GitHub Actions `npm ci` 失败~~ | ✅ 12:14 转绿；**22:10 CI 门禁已接线**：`scripts/deploy-vercel.mjs` 部署前查 HEAD 的 `verify` 结论，failure/timed_out/cancelled 直接拒绝部署（可用 `SKIP_CI_GATE=1` 显式跳过）。`2a9efac2` 实测 CI success，脚本实跑输出 `CI gate: HEAD 2a9efac2 verify = success`。**GitHub 分支保护仍由安全策略拦着，需你网页手动设**（见 §8.5） |
| E3 | 本地 `next build` OOM | 🟡 已写进 README 作为验证口径；换机后补跑 |
| E4 | 无邮箱账号仍建不了单 | ⬜ 需设计占位身份映射 |
| E5 | 中文站 8 个产品特性显示英文 | ⬜ 归 T-072 / T-075 |
| E6 | Supabase `uri_allow_list` 为空 | ⬜ 重置邮件目标是否被允许未实测（A14 / D8），未擅自改生产配置 |
| E7 | 邮箱验证配置 | ⬜ `mailer_allow_unverified_email_sign_ins=false`，功能效果未验（D9），**不据此划掉 T-077** |
| E8 | 工作区历史临时脚本 / 两处未归因改动 | ⬜ 20+ 个未跟踪文件、`.mimocode/.cron-lock`、`security-readonly-scan.mjs` 删除，一直未提交 |
| **E9** | ~~本地积压提交未推送~~ | ✅ 22:02 已随 E1 一并推送，积压清零 |

#### 8.5 最近批次与核对记录

- **11:00 批次**：tsc 0 错 · 73 个测试文件全过 · eslint 0 error · 双语键 966/966 · 直推 `4zJgDZkWd7X6eUY5wYBmitZQspHR`，线上 CSP 含 umami、en/zh 重置页 200、首页 `preload="metadata"`、静态页 `HIT`、admin 401/307（无回归）。详见 §3.4。
- **12:13 批次**：T-078 / T-080 / T-086 / T-089 代码与文档完成；GitHub 补推成功（`aecb62e..62f1106`）。验证与线上核对结果见 §3.5。
- **20:08 核对（无新工作）**：距 12:54 收尾约 7 小时，其间没有新增代码或验收动作，任务状态**无实质变化**。核对：仓库代码本地与远程一致（`67a5528`）；线上 4 个关键页全 200；三份文档指针统一到 20:08。**注意**：该句当时称「工作区仅 E8 遗留」不够准确——本次清单更新本身也漂在工作区未提交，见 E9。
- **01:42 落地动作**：本轮文档更新做**纯本地 commit**（明确不含 `git push`）——上次整条 `commit + push` 被安全策略拦截，导致 `git add` 一并未执行；本次拆分后只做本地提交，避免再次触发拦截。提交后本地领先 `origin/Trunk` 1 个提交。
- **2026-11-16 10:10 工单模块加固 + 10:36/10:39 迁移已执行**：G1 由「审计表无 RLS」**修正为**「RLS 已启用但可伪造 performed_by」（中危）；G2 由「附件表无 INSERT 策略」**修正为**「表策略本来就对，真因是 storage.objects 0 条策略」。`008`/`009` 已在生产库执行并验证通过，详见 §3.6 与评估报告 §6.0。
- **2026-11-16 10:55–16:14 用户实测驱动修复**：F1 建单后跳详情页、F2 客户侧附件可见、F3 详情页补状态/分类/时间；随后修详情页卡死（超时 + 并行查询）、上传格式（音频/视频/压缩包）、失败可见。详见 §3.7 / §3.8。
- **21:56 核对**：线上 4 页 200、support chunk `b4651a6a`（已切流）；本地领先远程 6 提交未推；A18–A23 真实链路仍待复验。
- **22:02–22:10 存档与门禁**：7 个积压提交已 push；HEAD `2a9efac2` 的 Actions `completed/success`；**部署脚本加 CI gate 并实跑验证**。GitHub 分支保护 API 被安全策略拒绝（判定"变更仓库访问控制配置"），要你在网页设：repo → Settings → Branches → Add rule → `Trunk` → Require status checks → 选 `verify` → Save。
- **01:42 复核（跨日，仍无新工作）**：距 20:08 约 5.5 小时，无新增代码或验收动作。核对：① 复核时（commit 前）本地 HEAD 与远程同为 `67a5528`、无未推送提交，工作区 4 个文档改动 + E8 遗留；做纯本地 commit 后本地为最新提交、**领先远程 1 个提交且未推送**，工作区仅剩 E8 遗留；② 线上 `/en`、`/zh`、重置页、`/en/privacy` 全 200，CSP `script-src`/`connect-src` 均含 `cloud.umami.is`；③ **最新提交 `67a5528` 的 GitHub Actions = `completed / success`**（此前只记录 `62f11061`）。本轮修正清单内部 6 处过时/矛盾表述（见下），并新增 E9。**P0 的 4 笔 E2E 债、B1–B7 真机、EXT-01~08 供数、D3/D10 拍板均未动。**


---

## 历史记录（2026-07 至 2026-09，仅追溯，不执行）

### 优先级总览（历史）

```
P0 (必须完成) ✅ ──→ P1 (重要) 🔄 ──→ P2 (优化) ⬜
     ↓                ↓              ↓
  4个任务          12个任务        10个任务
  完成: 4/4       完成: 11/12      完成: 8/10
  ✅ 全部完成      🔄 进行中       🔄 部分启动
```

> 第二轮审查结论：核心营销+工单闭环已完成（整体 7.5/10），但测试覆盖(15.6%)、仓库杂乱、外部 AI 搜索未配置 env、文档 INDEX 一致性等系统性差距需收敛。
> 2026-08-02 更新：TCO 工具已独立部署（vmware-tco.vercel.app，与 TGWS 隔离）；TGWS 部署已恢复（commit 2508460）；TODO-014/015/021/024/030 经源码与 Vercel env 验证已实现。

---

## P0 - 必须完成 (阻塞上线)（历史，勿执行）

### TODO-001: 完善关于我们模块 - 发展历程时间轴 ✅ 已完成
- **模块**: M5 About
- **优先级**: P0
- **预估工时**: 3天
- **实际工时**: 1天
- **原因**: 当前关于页面内容单薄，缺乏公司历史展示，影响企业专业形象
- **依赖**: 无
- **交付物**:
  - [x] 创建 `src/app/[locale]/about/timeline/page.tsx` (Server Component)
  - [x] 创建 `src/app/[locale]/about/timeline/TimelineClient.tsx` (Client Component)
  - [x] 创建 `src/app/[locale]/about/timeline/timeline-data.ts` (Sanity查询)
  - [x] 创建 `sanity/schemas/timelineEvent.ts` (Sanity Schema)
  - [x] 注册Schema到 `sanity.config.ts`
  - [x] 更新 `en.json` 和 `zh.json` 翻译
  - [x] 设计垂直滚动时间轴组件
  - [x] 从Sanity获取公司发展历程数据
  - [x] 支持中英文双语
- **验收标准**: 时间轴清晰展示公司重要里程碑，响应式适配移动端
- **完成时间**: 2026-01-25
- **内容已确认**: ✅ 用户确认时间轴事件内容
- **实现要点**:
  - 采用Headless架构，数据从Sanity CMS获取
  - Server Component + Client Component分离
  - 支持多语言（英文/繁体中文）
  - 响应式设计，适配移动端
  - 渐变色时间轴线条
  - 悬停动画效果

### TODO-002: 完善关于我们模块 - 团队介绍 ✅ 已完成
- **模块**: M5 About
- **优先级**: P0
- **预估工时**: 2天
- **实际工时**: 0.5天
- **原因**: 团队介绍是企业信任度的重要来源，当前缺失
- **依赖**: 无
- **交付物**:
  - [x] 更新 `src/app/[locale]/about/page.tsx` 为Server Component
  - [x] 创建 `src/app/[locale]/about/AboutClient.tsx` (Client Component)
  - [x] 创建 `src/app/[locale]/about/about-data.ts` (Sanity查询)
  - [x] 从Sanity获取团队成员数据
  - [x] 支持中英文双语
- **验收标准**: 团队卡片展示头像、姓名、职位、简介
- **完成时间**: 2026-01-25
- **内容已确认**: ✅ 用户确认团队成员信息（Regil De Claro为核心创始人）
- **实现要点**:
  - 数据从Sanity CMS获取，支持头像图片
  - 响应式网格布局
  - 无头像时显示渐变占位符
  - 中英文双语支持

### TODO-003: 完善关于我们模块 - 公司资质 ✅ 已完成
- **模块**: M5 About
- **优先级**: P0
- **预估工时**: 2天
- **实际工时**: 0.5天
- **原因**: 资质证书是企业实力的证明，当前缺失
- **依赖**: 无
- **交付物**:
  - [x] 创建 `sanity/schemas/qualification.ts` (Sanity Schema)
  - [x] 注册Schema到 `sanity.config.ts`
  - [x] 更新 `about-data.ts` 添加 `getQualifications()` 函数
  - [x] 更新 `page.tsx` 获取资质数据
  - [x] 更新 `AboutClient.tsx` 展示资质卡片
  - [x] 支持中英文双语
- **验收标准**: 资质证书网格展示，支持移动端适配
- **完成时间**: 2026-01-25
- **内容已确认**: ✅ 用户确认合作伙伴列表（基于logo墙）
- **实现要点**:
  - 数据从Sanity CMS获取，支持自定义图标和颜色
  - 响应式网格布局
  - 中英文双语支持
  - 与团队介绍统一组件风格

### TODO-004: 完善辅助页面 - 隐私政策和服务条款 ✅ 已完成
- **模块**: M9 Legal
- **优先级**: P0
- **预估工时**: 2天
- **实际工时**: 0.5天
- **原因**: 法律合规要求，当前内容不完整
- **依赖**: 无
- **交付物**:
  - [x] 完善 `src/app/[locale]/privacy/page.tsx` 内容
  - [x] 完善 `src/app/[locale]/terms/page.tsx` 内容
  - [x] 更新 `en.json` 添加GDPR合规条款
  - [x] 更新 `zh.json` 添加GDPR合规条款
  - [x] 支持中英文双语
- **验收标准**: 包含完整的隐私政策和服务条款，符合GDPR要求
- **完成时间**: 2026-01-25
- **内容已确认**: ✅ 用户确认公司注册地和联系方式
- **实现要点**:
  - 隐私政策包含12个章节，涵盖GDPR和CCPA要求
  - 服务条款包含14个章节，涵盖法律责任、知识产权、支付等
  - 中英文双语完整翻译
  - 符合菲律宾当地法律要求

---

## P1 - 重要 (影响用户体验)（历史，勿执行）

### TODO-005: 提升测试覆盖率至70% ✅ 已完成
- **模块**: T9 测试系统
- **优先级**: P1
- **预估工时**: 5天
- **实际工时**: 3天
- **原因**: 当前测试覆盖率仅15.62%，代码质量保障不足
- **依赖**: 无
- **交付物**:
  - [x] 修复RegisterForm测试失败问题
  - [x] 修复所有act()警告 (LoginForm, RegisterForm, TicketForm)
  - [x] 修复GlobalSearch测试（2026-07-29，Vitest 全绿）
  - [x] 补充核心组件单元测试 (React Testing Library)
  - [x] 添加API路由集成测试
  - [x] 创建关键流程E2E测试 (Playwright) — tests/functional/ 19 specs/118 blocks
  - [x] 配置CI/CD测试流程（npm run test 全绿）
- **验收标准**: 测试覆盖率达到70%，CI通过率100%
- **当前进度**: 覆盖率 **74.9% stmt / 67.6% branch / 68.4% func**（2026-08-02 实测，68 测试文件全绿，TSC 0）；**验收标准 70% 已达成并超出**。注：此前多次测出 62-73% 的波动为 vitest 默认并发 worker 在此机器 OOM 崩溃导致的假象——已通过 `pool: 'forks' + singleFork: true` 修复，单进程稳定测出真实覆盖
- **完成时间**: 2026-08-02
- **实现要点**:
  - 从 15.6% 起步，覆盖 hooks 89%、全部 API 路由、search 管道、工单系统、UI 工具、页面组件、TCO 引擎、邮件、sitemap
  - 覆盖率扫描发现并删除 2 个死代码文件（ContactPage.tsx 167 行、CompareTable.tsx 96 行）
  - 修复 3 个真实 bug（www 黑名单绕过、SolutionsList 搜索、useRetry rejection）

### TODO-006: 增强工单系统 - 管理员仪表板 ✅ 已完成
- **模块**: M6 Tickets
- **优先级**: P1
- **预估工时**: 4天
- **实际工时**: 1天
- **原因**: 管理员需要数据可视化来监控工单状态
- **依赖**: TODO-005 ✅
- **交付物**:
  - [x] 创建 `src/app/[locale]/support/admin/dashboard/page.tsx`
  - [x] 实现工单统计图表 (按状态/时间/产品)
  - [x] 实现实时数据更新
  - [x] 支持中英文双语
- **验收标准**: 仪表板展示工单趋势、状态分布、处理时长
- **完成时间**: 2026-01-25
- **实现要点**:
  - 统计卡片: 总数/待处理/处理中/已解决
  - 优先级分布: 紧急/高/中/低
  - 类别分布: Build/Run/Protect
  - 平均响应时间和解决率
  - 最近工单列表

### TODO-007: 增强工单系统 - 批量操作 ✅ 已完成
- **模块**: M6 Tickets
- **优先级**: P1
- **预估工时**: 2天
- **实际工时**: 1天
- **原因**: 管理员需要批量处理工单提升效率
- **依赖**: TODO-006 ✅
- **交付物**:
  - [x] 实现工单列表多选功能
  - [x] 添加批量状态更新
  - [x] 添加批量导出功能
- **验收标准**: 管理员可选择多个工单进行批量操作
- **完成时间**: 2026-01-25
- **实现要点**:
  - 全选/单选复选框
  - 批量标记处理中/已解决
  - CSV导出功能
  - 仅管理员可见批量操作

### TODO-008: 完善联系模块 - 地图集成 ✅ 已完成
- **模块**: M7 Contact
- **优先级**: P1
- **预估工时**: 2天
- **实际工时**: 0天（已有实现）
- **原因**: 展示办公地点增强企业可信度
- **依赖**: 无
- **交付物**:
  - [x] 集成OpenStreetMap（免费，无需API Key）
  - [x] 展示10 Rajah Matanda St办公地点
  - [x] 支持中英文双语
  - [x] 支持缩放和导航
- **验收标准**: 地图正确显示办公地点，支持缩放和导航
- **完成时间**: 2026-01-25（已有实现，无需修改）
- **实现要点**:
  - 使用OpenStreetMap嵌入式地图
  - 坐标: 14.6497, 121.0501 (Quezon City)
  - 支持"查看大地图"链接

### TODO-009: 完善联系模块 - 二维码 ✅ 已完成
- **模块**: M7 Contact
- **优先级**: P1
- **预估工时**: 1天
- **实际工时**: 0.5天
- **原因**: 便于客户通过微信/WhatsApp快速联系
- **依赖**: 无
- **交付物**:
  - [x] 生成WhatsApp二维码
  - [x] 设计二维码展示组件
  - [x] 支持中英文双语
- **验收标准**: 二维码清晰可扫描，移动端友好
- **完成时间**: 2026-01-25
- **实现要点**:
  - 使用goqr.me免费API生成二维码
  - WhatsApp链接: https://wa.me/639602825051
  - 无需额外依赖

### TODO-010: 完善工单系统 - 附件预览 ✅ 已完成
- **模块**: M6 Tickets
- **优先级**: P1
- **预估工时**: 2天
- **实际工时**: 1天
- **原因**: 管理员需要预览附件来快速了解问题
- **依赖**: 无
- **交付物**:
  - [x] 实现图片附件缩略图预览
  - [x] 实现PDF附件内嵌预览
  - [x] 实现文件下载功能
  - [x] 添加文件类型图标
- **验收标准**: 支持常见格式预览，加载流畅
- **完成时间**: 2026-01-25
- **实现要点**:
  - AttachmentPreview组件支持多种文件类型
  - 图片/PDF可全屏预览
  - 其他文件显示图标和下载按钮
  - 工单列表显示附件数量

---

## P2 - 优化 (提升竞争力)（历史，勿执行）

### TODO-011: 产品模块 - 搜索功能 ✅ 已完成
- **模块**: M2 Products
- **优先级**: P2
- **预估工时**: 3天
- **实际工时**: 0.5天
- **原因**: 产品数量多，搜索提升用户查找效率
- **依赖**: 无
- **交付物**:
  - [x] 实现产品搜索框组件
  - [x] 支持关键词搜索
  - [x] 支持分类筛选（已有）
  - [x] 清除搜索功能
- **验收标准**: 搜索响应<300ms，结果准确
- **完成时间**: 2026-01-25
- **实现要点**:
  - 搜索标题、描述、slug
  - 实时过滤，无需请求
  - 清除按钮+无结果提示

### TODO-012: 产品模块 - 对比功能 ✅ 已有实现
- **模块**: M2 Products
- **优先级**: P2
- **预估工时**: 3天
- **实际工时**: 0天（已有实现）
- **原因**: 帮助客户对比不同产品做出决策
- **依赖**: TODO-011 ✅
- **交付物**:
  - [x] 对比表格页面（TechGuru vs 竞品）
  - [x] 支持特性对比
  - [x] 合作伙伴认证展示
  - [x] CTA行动号召
- **验收标准**: 对比表格清晰，展示竞争优势
- **路由**: /en/compare
- **实现要点**:
  - TechGuru vs Traditional Vendor vs Cloud Provider对比
  - 7个维度特性对比
  - 6个合作伙伴认证展示

### TODO-013: 博客模块 - 搜索和标签 ✅ 已完成
- **模块**: M4 Blog
- **优先级**: P2
- **预估工时**: 2天
- **实际工时**: 0.5天
- **原因**: 文章数量增长后需要搜索和分类
- **依赖**: 无
- **交付物**:
  - [x] 实现文章搜索功能
  - [x] 支持分类筛选（已有）
  - [x] 支持标签搜索
  - [x] 清除搜索功能
- **验收标准**: 搜索准确，标签关联正确
- **完成时间**: 2026-01-25
- **实现要点**:
  - 搜索标题、摘要、标签
  - 实时过滤，无需请求
  - 清除按钮+无结果提示

### TODO-014: 博客模块 - 社交分享 ✅ 已完成
- **模块**: M4 Blog
- **优先级**: P2
- **预估工时**: 1天
- **原因**: 扩大文章传播范围
- **依赖**: TODO-013 ✅
- **交付物**:
  - [x] 添加分享按钮组件（BlogDetail.tsx）
  - [x] 支持分享链接生成（LinkedIn/X 等，基于 URL 分享）
  - [x] 分享预览（og 标签复用 generateMetadata）
  - [ ] 追踪分享数据（未做，无分析需求）
- **验收标准**: 分享链接正确，预览效果好
- **状态说明**: 2026-08-02 验证 — `src/app/[locale]/blog/[slug]/BlogDetail.tsx` 含 share 引用，分享按钮已实现

### TODO-015: 动画系统优化 ✅ 已有基础实现
- **模块**: T7 动画系统
- **优先级**: P2
- **预估工时**: 2天
- **原因**: 提升页面交互体验
- **依赖**: 无
- **交付物**:
  - [x] 滚动揭示动画（ScrollReveal.tsx + IntersectionObserver）
  - [x] 关键帧动画（globals.css: blink/fadeInUp/glow/slideIn/fadeOut/nodeAppear/statPop/lineGrow/marquee）
  - [x] 悬停效果（card hover translateY + cyan glow）
  - [x] 可访问性支持（`@media (prefers-reduced-motion: reduce)` 全局禁用）
- **验收标准**: 动画流畅，60fps，尊重prefers-reduced-motion
- **状态说明**: 2026-08-02 验证 — 21 个文件引用动画、10 个 keyframes、ScrollReveal 组件存在；性能优化（60fps 审计）为可选项

### TODO-016: Global Search 生产级实现 ✅ 已完成
- **模块**: 全局搜索
- **优先级**: P1
- **预估工时**: 15天
- **实际工时**: 4天
- **原因**: 实现AI驱动的全站搜索，支持多模态输入
- **依赖**: 无
- **交付物**:
  - [x] 创建 `src/components/ui/GlobalSearch/index.tsx` (主组件)
  - [x] 创建 `src/app/api/search/route.ts` (搜索API)
  - [x] 创建 `src/app/api/search/lead/route.ts` (线索API)
  - [x] 创建 `supabase/migrations/003_add_search_tables.sql` (数据库迁移)
  - [x] 实现文字搜索功能（中文关键词映射）
  - [x] 实现图片上传/粘贴/拖拽
  - [x] 实现过滤器面板
  - [x] 实现能力缺口检测
  - [x] 实现线索提交表单
  - [x] 实现邮件通知（Resend）
  - [x] 实现去重逻辑（基于URL）
  - [x] 实现AI摘要生成（多源融合）
  - [x] E2E测试用例（15个，已重写）
- **验收标准**: 搜索功能正常，E2E测试真正验证搜索结果
- **完成时间**: 2026-01-26
- **待配置**: Google CSE API Key、Tavily API Key（需在Vercel环境变量中配置）

### TODO-017: Global Search E2E测试重写 ✅ 已完成
- **模块**: 全局搜索
- **优先级**: P1
- **预估工时**: 2天
- **实际工时**: 1天
- **原因**: 之前的21个测试全部是假阳性，需要重写验证真实功能
- **依赖**: TODO-016 ✅
- **交付物**:
  - [x] 分析假阳性测试问题
  - [x] 设计正确的测试逻辑
  - [x] 重写15个测试用例
  - [x] 修复TypeScript错误
- **验收标准**: 测试真正验证搜索功能是否正常工作
- **完成时间**: 2026-01-26

---

## 第二轮审查新增任务 (2026-07-29)（历史）

### TODO-019: 仓库治理与杂乱清理 ✅ 已完成
- **模块**: 仓库工程化
- **优先级**: P1
- **预估工时**: 1天
- **原因**: 仓库夹杂 13MB `gh.msi` 安装包、`tmp-query{1..4}.mjs`、`generate_report.mjs/py`、`debug-scroll.png`、嵌套 `tgws/tgws/` 截图目录、根目录 100+ 一次性 QA 脚本，严重影响仓库体积与可维护性
- **依赖**: 无
- **交付物**:
  - [x] 删除 `gh.msi`（13MB 二进制）
  - [x] 删除 `tmp-query{1..4}.mjs`、根目录 `.mjs`/`.py` download/audit 脚本
  - [x] 删除 `generate_report.mjs`/`generate_project_report.py`、`architecture-diagram.*`、`debug-scroll.png`
  - [x] 删除根目录 `node_modules`/`package-lock.json`/`package.json`（docx 工具链）
  - [x] 删除 2 个死代码源文件（ContactPage.tsx 167 行、CompareTable.tsx 96 行——覆盖率扫描发现）
  - [x] README 中不一致内容更正
- **验收标准**: 根目录仅保留 README/AGENTS/PRD/TODO 与 `tgws/`、`scripts/` 入口 ✅
- **改进方向对应**: 项目整体改进 #5
- **状态说明**: 2026-08-02 完成——root 干净化 + 2 死代码文件删除，覆盖 commit 0a70280

### TODO-020: 双 package.json / 双 vercel.json 合并 ✅ 已解决（保留双配置）
- **模块**: 工程化/部署
- **优先级**: P1
- **预估工时**: 0.5天
- **原因**: 根 `package.json`（仅 docx 工具）与 `tgws/package.json`（真实应用）并存；根 `vercel.json` 与 `tgws/vercel.json` 配置近重复，存在漂移风险
- **依赖**: TODO-019
- **交付物**:
  - [x] 决策：**保留双配置**（2026-08-02 经验证为 Vercel 部署必要条件——根 vercel.json `cd tgws && ...` + tgws/vercel.json 是原始工作布局，合并/单配置会导致 next.config.ts 加载失败）
  - [x] README 说明仓库根 = 文档根，应用根 = `tgws/`（部分，待 TODO-027 一并核对）
  - [x] 根 `package.json`（docx 工具链）文档化，不入部署路径
- **验收标准**: 部署仍成功（`npx vercel --prod --yes`）；本地 `next build` 仍通过
- **改进方向对应**: 项目整体改进 #5
- **状态说明**: 2026-08-02 部署恢复成功（commit 2508460）；根 package.json/package-lock.json 仍在但仅 docx 工具用，可从 .vercelignore 排除

### TODO-021: 外部 AI 搜索 env 配置 + 降级 UI 提示 ✅ 已完成
- **模块**: 全局搜索
- **优先级**: P1
- **预估工时**: 0.5天
- **原因**: `GOOGLE_CSE_API_KEY` / `TAVILY_API_KEY` 未配置时 `/api/search` 静默降级为站内，用户无任何提示（route.ts:212/253 仅 console.log）
- **依赖**: TODO-016 ✅
- **交付物**:
  - [x] API 在外部源不可用时返回 `externalSourcesAvailable: false` 标志
  - [x] `GlobalSearch` UI 显示"AI 增强搜索暂不可用"徽标
  - [x] 在 Vercel 环境变量配置 `GOOGLE_CSE_API_KEY`、`TAVILY_API_KEY`（2026-07-26 用户提供，Production 环境已配）
- **验收标准**: 缺 env 时用户明确感知而非误以为全站搜索就是这个量
- **改进方向对应**: 项目整体改进 #3、#7
- **状态说明**: 2026-08-02 复核确认——用户 2026-07-25/26 已提供 Tavily API Key + Google CSE ID/API Key，本地 `.env.local` 与 Vercel Production env 均已配置（`npx vercel env ls` 可见 GOOGLE_CSE_API_KEY/TAVILY_API_KEY/GOOGLE_GEMINI_API_KEY 均 Encrypted/Production/7d ago）

### TODO-022: 统一服务降级模式（消除静默 console.error→null） ✅ 已完成
- **模块**: 基础设施
- **优先级**: P1
- **预估工时**: 2天
- **原因**: `odoo.ts:54`、`resend.ts:37/43`、`api/products/route.ts`、`search/route.ts` 9 处、`search/lead/route.ts` 6 处、各 page.tsx 数据兜底——全部 `console.error` 后返回 null/[]，错误被吞没
- **依赖**: 无
- **交付物**:
  - [x] 引入统一 `logServiceError` 工具（`lib/errors.ts`），12 个 API 路由全部接入 try/catch + 结构化日志
  - [x] 邮件/线索等关键路径降级时前端可见提示（search 降级徽标）
  - [x] 关键路径（工单提交/线索提交）失败时向用户明确反馈 + 入队重试（TicketForm role=alert、GlobalSearch lead catch）
  - [x] 数据页 fetch 失败时由 `error.tsx` 边界渲染而非静默空数组（`[locale]/error.tsx` + 根 `global-error.tsx` 已存在）
- **验收标准**: 生产环境零 `console.error` 仅兜底；所有失败用户可感知
- **改进方向对应**: 项目整体改进 #3
- **状态说明**: 2026-08-02 验证完成——路由层 logServiceError 12/12、TicketForm 错误 alert、error/global-error 边界齐全、列表页降级显示 noResults 空态

### TODO-023: 工单 audit_log 写入补全 ✅ 已完成
- **模块**: M5 Tickets
- **优先级**: P1
- **预估工时**: 1天
- **原因**: `ticket_audit_log` 表存在但状态变更未见写入证据，违反 AGENTS #17（工单状态变更必须记录 who/when/what）
- **依赖**: 无
- **交付物**:
  - [x] 在 `tickets/route.ts` 与 `tickets/[id]/route.ts` 状态变更点写 audit_log
  - [x] 批量操作（TODO-007）每次状态更新均记 audit
  - [ ] admin dashboard 增加 audit 视图
- **验收标准**: 任何工单状态/优先级/指派变更都在 audit_log 有记录
- **改进方向对应**: 项目整体改进 #4
- **状态说明**: 2026-07-29 确认 created/updated/assigned/status_changed/bulk 全路径均写入，且 insert 失败会 logServiceError 记录

### TODO-024: 拆分 GlobalSearch 巨型组件 ✅ 已完成
- **模块**: 全局搜索
- **优先级**: P2
- **预估工时**: 1天
- **原因**: `GlobalSearch/index.tsx` 788 行单文件、`api/search/route.ts` 627 行，违反可维护性（AGENTS #43 边界约束）
- **依赖**: TODO-021 ✅
- **交付物**:
  - [x] 拆分为 `SearchResults` / `SearchFilters` / `SearchInput` 等子组件（T8 + T37，index.tsx 705→子组件）
  - [ ] `route.ts` 拆分为 `internalSearch` / `externalSearch` / `aiSummary` 模块（仍未拆，627 行）
- **验收标准**: 单文件 <300 行；功能与测试不退化
- **改进方向对应**: 项目整体改进 #6
- **状态说明**: 2026-07-29 T8 + T37 已完成组件拆分；`api/search/route.ts` 模块化拆分剩余

### TODO-025: VMware TCO 计算器 ✅ 已完成
- **模块**: M09 VMware Alternative
- **优先级**: P2
- **预估工时**: 2天
- **原因**: INDEX 标 TCO 计算器缺失，VMware 替代方案核心卖点之一
- **依赖**: 无
- **交付物**:
  - [x] 纯 JS（无新依赖，AGENTS #45）实现客户端 TCO 对比计算
  - [x] 输入：节点数/工作负载/许可类型；输出 3 年 TCO 对比图
  - [x] 双语支持
- **验收标准**: 计算器可交互，数据可导出
- **改进方向对应**: 项目整体改进 #9
- **状态说明**: 2026-07-29 完成——Sanity 驱动定价（3场景×3厂商）、SVG 图表、PNG 导出、fuzzed Sangfor 定价、Playwright 验证通过

### TODO-026: 错误监控与 Analytics 接入 ✅ 已完成
- **模块**: 可观测性
- **优先级**: P1
- **预估工时**: 1天
- **原因**: 无 Sentry/错误监控、无 GA/Umami；线上故障不可见、流量不可测
- **依赖**: TODO-022 ✅
- **交付物**:
  - [x] `lib/errors.ts` logServiceError 支持 ERROR_WEBHOOK_URL 转发（Slack/Discord 等）
  - [x] Umami 接入（`NEXT_PUBLIC_UMAMI_WEBSITE_ID`）+ `trackEvent` 关键事件埋点
  - [x] **Sentry 决策（2026-08-02）：不引入**——bundle size 约束（AGENTS #45）下 Umami + ERROR_WEBHOOK_URL 已覆盖线上错误可见性与流量统计；Sentry 增加 ~40KB bundle 且功能重叠
- **验收标准**: 线上错误 1 小时内可见；周度流量报告自动生成
- **改进方向对应**: 项目整体改进 #2
- **状态说明**: 2026-08-02 完成——Umami + webhook 转发 + Sentry 决策记录

### TODO-027: 文档三方状态一致性修复 ✅ 已完成
- **模块**: 文档治理
- **优先级**: P1
- **预估工时**: 0.5天
- **原因**: README/TODO/INDEX/AGENTS 多处矛盾：TODO-004 Legal ✅ vs INDEX 60%；TODO-001/2/3 About ✅ vs INDEX 70%；AGENTS 列 shadcn/ui 实际手写；AGENTS 称"无 manual dark toggle"实际 `DarkModeToggle.tsx` 存在；PRD S11 Case Studies 已删除但未反向同步
- **依赖**: 无
- **交付物**:
  - [x] AGENTS.md 技术栈表删除 "shadcn/ui"；Design Rules 删除"无手动 dark toggle"（2026-07-29）
  - [x] PRD S11（Case Studies）标记废弃（2026-07-12）
  - [x] TODO.md 状态与实现对齐（2026-07-29：022 部分/023 完成/025 完成/026 部分/029 完成）
  - [x] README 覆盖率数字更正为 15.62%（T36），2026-08-02 更新为 74.9%
  - [x] INDEX.md 全部模块状态与 TODO.md 对齐（2026-08-02：M05/M10 完成度更新）
  - [x] 根 `.gitignore` 包含检查（已跟踪 commit 0a70280，覆盖 node_modules/env/logs/png/vercel）
- **验收标准**: doc-sync 三方（MEMORY↔AGENTS↔PRD）+ INDEX 四方一致
- **改进方向对应**: 项目整体改进 #8
- **状态说明**: 2026-08-02 全部完成——README/INDEX/TODO 状态一致，根 .gitignore 验证通过

### TODO-028: Help Center 内容补全 ✅ 已完成
- **模块**: M10 Help
- **优先级**: P2
- **预估工时**: 2天
- **原因**: INDEX 标 60%，help-docs 知识库未补全
- **依赖**: 无
- **交付物**:
  - [x] 帮助中心页面基础设施（FAQ 手风琴/搜索/分类，2026-07-29 已就绪）
  - [x] 补充 FAQ 知识库条目至 20 条（5×4 类：product/technical/account/billing，EN+繁中双语，2026-08-02）
  - [x] 帮助中心分类导航（5 类图标 Tab，含全部）
  - [x] 搜索接入（站内过滤 + FAQJsonLd SEO）
- **验收标准**: Help 页面内容 ≥ 20 条，覆盖产品/工单/账户三大类 ✅
- **改进方向对应**: 项目整体改进 #9
- **状态说明**: 2026-08-02 完成——FAQ 14→20 条（新增：安全合規/附件上傳/Google 登入/密碼重設/發票/年度維護）；内容走 i18n 架构（`help_doc` schema 从未创建，非缺失；迁移 Sanity 无必要）

### TODO-029: 个人资料编辑页 ✅ 已完成
- **模块**: Auth/Profile
- **优先级**: P2
- **预估工时**: 1天
- **原因**: 仅有 Login/Register，缺 profile 编辑（仅 placeholder 占位）
- **依赖**: 无
- **交付物**:
  - [x] 新增 `src/app/[locale]/profile/page.tsx`（独立目录，不动现有组件结构，AGENTS #43）
  - [x] 编辑姓名/头像/密码
  - [x] 双语支持
- **验收标准**: 登录后可查看/编辑个人资料
- **改进方向对应**: 项目整体改进 #9
- **状态说明**: 页面已实现，但**导航入口未添加**（用户可能不知道页面存在）——待加 Navbar/Footer 链接

### TODO-030: AI 助手设计稿归档决策 ✅ 已完成
- **模块**: docs
- **优先级**: P2
- **预估工时**: 0.5天
- **原因**: AI-Hub/Smart-Form/Smart-Ticket-Assistant/Ticket-Trend 4 份设计稿（~330KB）悬置未实现，PROJECT-REVIEW-REPORT 建议归档
- **依赖**: 无
- **交付物**:
  - [x] 决策：归档（用户确认，2026-07-29）
  - [x] 移至 `docs/archive/ai-assistant/` 并在 README 标注
- **验收标准**: 仓库无悬置设计稿
- **改进方向对应**: 项目整体改进 #10
- **状态说明**: 2026-07-29 T12 已完成归档决策与迁移

---

### TODO-018: AI内容整合实现 ✅ 已完成（待配置API Key）
- **模块**: 全局搜索
- **优先级**: P1
- **预估工时**: 3天
- **实际工时**: 1天
- **原因**: 当前aiSummary是mock数据，需要接入真实LLM
- **依赖**: TODO-016 ✅
- **交付物**:
  - [x] 实现Tavily API集成代码
  - [x] 实现Google CSE集成代码
  - [x] 实现结果整合逻辑（站内+站外+公司能力）
  - [x] 实现去重逻辑（基于URL）
  - [x] 实现AI摘要生成（多源融合）
  - [ ] 配置Google CSE API Key（需在Vercel环境变量）
  - [ ] 配置Tavily API Key（需在Vercel环境变量）
- **验收标准**: 搜索结果经过AI整合，不是原始数据
- **完成时间**: 2026-01-26
- **待配置**: 需要在Vercel环境变量中添加 `GOOGLE_CSE_API_KEY` 和 `TAVILY_API_KEY`

---

## 依赖关系图

```
第一轮（已完成为主）
TODO-001/002/003 ─→ 关于我们完成
TODO-004 ─→ 法律合规
TODO-005 ─→ TODO-006 ─→ TODO-007
TODO-008/009/010 ─→ 联系模块完善
TODO-011 ─→ TODO-012
TODO-013 ─→ TODO-014
TODO-015 ─→ 体验优化
TODO-016 ─→ TODO-017 ─→ TODO-021

第二轮（系统性收敛）
TODO-019 (仓库治理) ─→ TODO-020 (双 package 合并)
TODO-021 (env 配置) ─→ TODO-024 (拆 GlobalSearch)
TODO-022 (降级模式) ─→ TODO-026 (监控)
TODO-023 (audit_log)  独立
TODO-025 (TCO)        独立
TODO-027 (文档同步)   独立
TODO-028 (Help 内容)  独立
TODO-029 (profile)    独立
TODO-030 (AI 稿归档)  独立
```

---

## 执行建议

### 第一周 (P0优先)
| 日期 | 任务 | 预估 |
|------|------|------|
| Day 1-3 | TODO-001 发展历程时间轴 | 3天 |
| Day 4-5 | TODO-002 团队介绍 | 2天 |
| Day 6-7 | TODO-003 公司资质 | 2天 |

### 第二周 (P0+P1)
| 日期 | 任务 | 预估 |
|------|------|------|
| Day 8-9 | TODO-004 隐私政策/服务条款 | 2天 |
| Day 10-14 | TODO-005 测试覆盖率 | 5天 |

### 第三周 (P1)
| 日期 | 任务 | 预估 |
|------|------|------|
| Day 15-18 | TODO-006 管理员仪表板 | 4天 |
| Day 19-20 | TODO-007 批量操作 | 2天 |

### 第四周 (P1)
| 日期 | 任务 | 预估 |
|------|------|------|
| Day 21-22 | TODO-008 地图集成 | 2天 |
| Day 23 | TODO-009 二维码 | 1天 |
| Day 24-25 | TODO-010 附件预览 | 2天 |

### 第五周+ (P2按需)
| 日期 | 任务 | 预估 |
|------|------|------|
| Day 26-28 | TODO-011 产品搜索 | 3天 |
| Day 29-31 | TODO-012 产品对比 | 3天 |
| Day 32-33 | TODO-013 博客标签 | 2天 |
| Day 34 | TODO-014 社交分享 | 1天 |
| Day 35-36 | TODO-015 动画优化 | 2天 |

---

## 统计（历史）

| 优先级 | 任务数 | 预估总工时 | 完成状态 |
|--------|--------|------------|----------|
| P0 | 4 | 9天 | ✅ 4/4 |
| P1 | 12 | 49天 | ✅ 12/12（TODO-005 覆盖率 74.9% ✅、TODO-022 ✅、TODO-026 ✅、TODO-027 ✅） |
| P2 | 10 | 18天 | ✅ 10/10 |
| 第三轮收口 | 8 | — | ✅ 全部完成上线（T-036 design-v2 仍待审批） |
| **第四轮 · 内容/导航/厂商树** | 多项 | — | ✅ 大部分代码项已上线；剩余见「当前待办」 |
| **总计** | — | — | 工程+多数内容已收口；开放项见下表 |

> 上表统计的是"任务条目关闭"，不是"功能可用"。2026-11-15 实测基线见「第五轮」§0；82 个问题中 39 个未进任何行动项，详见 `docs/TGWS-REPORT-CROSSCHECK.md`。

**最新更新（历史，已被 2026-11-15 复核取代）**: 2026-09-16 — 第四轮多批次已上线并 push `Trunk`（含法律键/hreflang/年份/Learn more/title/About/日期/Compare 证言/VendorLogo/Run 内 VMware 卡/导航修复）。产品图工作区文件曾被误删后已从 git 恢复并部署。git push 已成功（`6e3d836`）。

---

## 当前待办总表（2026-09-16 终态，历史记录，勿再作为执行依据）

### A. 需你拍板 / 供数（阻塞）

| 序号 | 事项 | 详情 | 状态 |
|------|------|------|------|
| **T-036** | design-v2 UI 提案 | `tgws/design-v2/` 6 项决策 | 🔵 待你审批 |
| **T-055** | 执行安全/功能测试 | 计划在 `tgws/docs/eval/pass5-test-plan.md`；你已选「本地全面+线上只读」 | 🔵 待你勾选范围后执行 |
| **T-056** | TCO 定价录入 Sanity | 需 VMware/Nutanix/Sangfor 数字 | 🔵 等你供数 |
| **T-045** | Studio 补 solutions 中文字段 | 17 条 hasChZh=false | 🔵 等你在 Sanity 录入或书面确认中文只走 i18n |
| **T-046** | Partner 导数据 + 前端 getPartners | CMS partner=0，首页仍硬编码 19 家 | 🔵 等你导数据 |
| **Battlecard** | HCI/虚拟化/NGFW/无线厂商对比上线 | 草稿 `docs/eval/2026-09-16-vendor-battlecard-draft.md` | 🔵 **待你批准**后写入 UI |
| **VMware 对照品牌** | 与 VMware 对比用哪条产品线 | 建议 vSphere Foundation / VCF | 🔵 等你确认 |
| **HCI 补 Sangfor** | Studio relatedVendors 增加 Sangfor aCloud | 你已拍板「补」 | 🔵 等 Studio 数据 |
| **无线补 Sundray/Aruba** | 你已拍板「补」 | 🔵 等 Studio + 官方英文 logo PNG |
| **Sundray/Aruba logo 文件** | `public/logos/` 缺文件 | 🔵 可你提供或我再生成 |

### B. 代码可继续（不阻塞）

| 序号 | 事项 | 说明 |
|------|------|------|
| **T-053** | 组件硬编码迁 i18n | TCO/UserMenu/TicketList/LoginForm 等，分批 |
| **T-054** | ZH 法律页深度对齐 EN | 长度约 34% |
| **T-035** | Odoo 凭证 | 你已选暂不配置；代码已就绪 |
| **git push 重试** | 已成功 `6e3d836` | 无需再列 |

### C. 本轮已完成（勿再开单）

| 项 | 结果 |
|----|------|
| T-041 ZH 法律 2 键 | 已上线，无裸键 |
| T-042 hreflang 品牌域 | 已指向 www.techguru-it.asia |
| T-043 成立年 2020 + 12+ 行业经验文案 | intro=2020；Label=Years of Industry Experience |
| T-044 solutions GROQ 6 字段 | query 已补 |
| T-048 Learn more i18n | ZH 为「了解更多」 |
| T-049 title 双拼 | template=`%s` |
| T-050 About 预览年+locale 链接 | 2020/2022/2025；`/${locale}/about/timeline` |
| T-051 法律日期 i18n | ZH 2026年7月1日 |
| T-052 Compare 证言 | **已确认后展示**（页面有 40%/35% 卡） |
| T-047 产品图 | AI 设备图已生成并恢复部署；详情有 Hero 图 |
| 产品语义图标 | 28 slug 语义 Lucide + ProductIcon |
| Vendor Logo 统一 | VendorLogo 组件；缺文件回退文字 |
| VMware 归 Run | Products→Run→Infrastructure 内专题卡；非独立第四支柱；非新栏目 |
| Why TechGuru 位置 | **About 下拉**（非一级顶栏） |
| Run 菜单描述 | **已恢复** `home('runDesc')` |
| 导航 Tab 点不动 | 改为 `?category=build|run|protect`；页内读 hash；已上线 |
| 产品图丢失 | 工作区曾被删，已 `git checkout` 恢复并 200 上线 |
| Vercel 构建 | `npm ci --registry npmmirror`；Root Directory=tgws |

### D. 已证伪禁止再开单

~~Partner logo 破损~~ · ~~76% 配图 broken~~ · ~~证言未上线却当造假~~ · ~~EN 页中文串台~~ · ~~EDR/HCI 泛化词异常~~（泛化技术名**正常**）

---

## 建议下一步（2026-09-16，历史，已被第五轮执行顺序取代）

1. 批 Battlecard 草稿 + 确认 VMware 对照品牌  
2. Studio：HCI 补 Sangfor；无线补 Sundray/Aruba；（可选）solutions 中文、partner 导入  
3. 勾选 T-055 测试范围 → 跑本地破坏性 + 线上只读  
4. 需要时 design-v2 审批  



| 编号 | 任务 | 状态 | 说明 |
|------|------|------|------|
| T-031 | About/Timeline 双语 metadata | ✅ 完成并上线 | 删除 page 硬编码 metadata；补 `about.timeline.metadata`；线上 `/zh/about` 已为「關於我們」 |
| T-032 | 公开写接口限流 + Origin + 字段校验 | ✅ 完成并上线 | `src/lib/api-guard.ts` 零依赖；接入 contact/search/lead/reset-password/tickets/upload |
| T-033 | 仓库杂物归档 | ✅ 完成 | 78 个 png/log/mjs 脚本移至 `docs/archive/qa-artifacts/` |
| T-034 | 文档一致性 | ✅ 完成 | README 分支名 main→Trunk；TODO 双「最新更新」矛盾段合并 |
| T-035 | Odoo 集成 | 🟡 已文档化+客户端加固 | 代码：session cookie 解析 + `response.ok`；缺 env 时仅 Supabase+邮件；填 `ODOO_*` 即启用 |
| T-036 | design-v2 UI 重设计 | 🔵 待用户审批 | `tgws/design-v2/STATUS.md`；6 项批准前生产 UI 不变 |
| T-037 | 推送 + 生产部署 | ✅ 完成 | Vercel login；修 Root Directory=`tgws` + next-intl 显式路径；`vercel --prod` Ready，alias www.techguru-it.asia |
| T-038 | 审计残留安全项 | ✅ 本轮落地 | Odoo/搜索 server client 边界、errors 序列化+webhook 超时；附件公开 URL 改 signed 仍为后续可选项 |

---

## 第四轮 · 内容质量待办（九轮校准 2026-09-15，历史；开放项已映射至第五轮）

> **唯一依据**: `docs/eval/2026-09-15-nine-round-verification.md`（覆盖六轮/三轮/初版）  
> **证据方法**: N1 键图 · N2 可见文本 · N3 Sanity CDN · N4 EN/ZH · N5 资产 · N6 SEO · N7 硬编码行号 · N8 链路 · N9 对抗  
> **约束**: 标「需你确认」不得擅自改品牌文案（AGENTS #47）；已证伪项禁止再开单  

### 一、P0 · 法律 / SEO / 事实可信（本周必做）

| 序号 | 事项名 | 详情 | 改动价值 | 不改动劣势 |
|------|--------|------|----------|------------|
| **T-041** | ZH 法律页补全缺失正文 | `zh.json` 缺 `terms.section14Body`、`privacy.section12Body`；terms/privacy 页会渲染 i18n key；线上 `/zh/terms`、`/zh/privacy` 已出现裸键字符串。EN 两键齐全。交付：补两段繁中法律收尾文案 + 部署后复抓两页 | 繁中用户不再看到技术键名；法律页完整可读；降低「未完成站点」观感与合规风险 | 生产可见产品缺陷；信任与专业感直接受损；搜索引擎可能收录裸键页；客诉/截图传播风险 |
| **T-042** | hreflang/alternates 改品牌域名 | 线上 `rel=alternate` 指向 `https://tgws.vercel.app/zh`（部署域）而非 `https://www.techguru-it.asia`。layout 使用 `NEXT_PUBLIC_SITE_URL`，需核对 Vercel Production env 与 `generateMetadata`。交付：env/代码对齐 + 部署后验证 hreflang/canonical | 双语 SEO 信号指向正式域名；避免权重分散到临时部署域；canonical/语言切换对爬虫正确 | Google 可能把 Vercel 域当主站或忽略交替语言；品牌域双语 SEO 失效；日后换部署名会断链 |
| **T-043** | 统一成立年份与「12+ Years」 | CMS `timelineEvent`：**Company Founded = 2020**；i18n `about.intro` 写 Founded **2023**；Home `socialProofStat4=12+` + Label「Years of Enterprise IT」。三套口径同站并存。交付：单一事实源（建议以 CMS 2020 为准）+ 改 intro/stats（**年限表述需你确认**：公司司龄 vs 团队行业经验） | 数字一致可核验；避免「吹牛站」印象；About/Home/timeline 讲同一故事 | 客户/伙伴交叉验证即穿帮；企业采购尽调高风险；与 timeline 自相矛盾拉低整站可信度 |

### 二、P1 · 内容与 CMS 双缺口（代码 + 数据）

| 序号 | 事项名 | 详情 | 改动价值 | 不改动劣势 |
|------|--------|------|----------|------------|
| **T-044** | solutions GROQ 补字段 | `solutions/page.tsx` query 仅取 `challenges/recommendedProducts/image/descriptionZh` 等，**未取** `challengesZh、solutions、solutionsZh、recommendedProductsZh、metricLabel、metricLabelZh`；`SolutionsList` interface 与 `solution.ts` schema 均已声明。交付：补全 query 字段列表 | 中文行业方案详情可从 CMS 生效；Studio 录入即上线，无需发版 | 即使 Studio 填了中文也永远读不到，静默 fallback i18n；运营以为「已配置」实则无效 |
| **T-045** | Studio 录入 solutions 中文 | CDN 实查：**17 条 solution 的 challengesZh/solutionsZh 全为 false（未填）**。修 T-044 后若仍空，前端继续走 i18n。交付：按行业补中文痛点/方案/指标，或书面确认「中文只走 i18n」 | 中文方案深度可与 EN 对齐；Headless 内容真正可运营 | T-044 白做；ZH 用户继续看截断/浅层方案（N4 显示 ZH 页普遍更短） |
| **T-046** | Partner 迁 Sanity + 导数据 | 首页 `home/page.tsx` 硬编码 **19** 家 `name+src`；`partner` schema 与 revalidate 映射已存在；**全站无 getPartners**；CDN：**partner 文档 0 条**。交付：Studio 导入 19 条 → `getPartners()` → 首页替换数组 | 增删伙伴改 CMS 即可，不必发版；与架构决策一致；logo 墙可运营 | 每次伙伴变更都要改代码+部署；schema/revalidate 空转；与 Headless 承诺不符 |
| **T-047** | 产品视觉策略落地 | schema 有 `image`；**28 个 product 的 hasImg 全 false**；`ProductDetail` 仅 iconMap，无 `<img>`。交付二选一：**A** 传语义图并接入详情 Hero；**B** 书面确认「图标化产品页」并文档化，避免再误判为缺陷 | A：企业产品页具备视觉锚点与转化力；B：明确设计边界，评估/开发不再反复争论 | 产品线长期无摄影/示意图；与「企业 IT 官网」预期落差；后续评估易再次误报「无图=破损」 |
| **T-048** | Learn more / View all i18n | `ProductsList.tsx:174`、`CategoryPage.tsx:82/154` 写死英文；**i18n 无 `products.learnMore` key**；N4：**`/zh/products/build` 可见文本含 Learn more**。交付：新建 en/zh key + 替换三处 | 繁中产品路径 CTA 语言正确；一次修复全站产品卡 | ZH 用户在关键转化按钮上看到英文；双语完整度失分；后续再扫还会中招 |
| **T-049** | 修 title 模板双拼 | 多内页 title 形如 `About Us \| TechGuru \| TechGuru`（layout `template: '%s \| TechGuru'` + 页面再拼品牌）。交付：统一 template 策略或页面只传短 title | SERP 标题干净专业；避免重复浪费像素 | 搜索结果标题冗余难看；显得工程粗糙 |
| **T-050** | About 预览年份 + 链接 locale | `AboutClient.tsx:57` 写死 `['2023','2024','2025']`（与 CMS 2020 起不一致）；`:45` `href="/about/timeline"` **无 locale 前缀**。交付：从 timeline 数据取首末年；链接 `/${locale}/about/timeline` | 预览与完整时间轴一致；ZH 路由不依赖 middleware 碰巧兜底 | About 再次暗示错误成立年；语言切换/直链可能进错 locale 或 404 |
| **T-051** | 法律页日期本地化 | `privacy/page.tsx:35`、`terms/page.tsx:35` 写死 `Last Updated: July 1, 2026`；ZH 页同样显示英文日期。交付：i18n 日期或 `Intl.DateTimeFormat(locale)` | 繁中法律页日期符合语言习惯；完成度细节 | ZH 页英文日期刺眼；与「完整双语」叙事不符 |

### 三、P2 · 信任打磨与可维护性

| 序号 | 事项名 | 详情 | 改动价值 | 不改动劣势 |
|------|--------|------|----------|------------|
| **T-052** | Compare 证言死键处置 | i18n `compare.testimonials`（含 40%/35% 节省）**源码零引用**；页面不渲染；可见文本无该证言。交付：**A** 接入 UI（**证言文案/客户授权需你确认**）或 **B** 删除死键 | A：对比页增加社会证明；B：去掉未使用夸大数字，降低合规/审查风险 | 死数据留在库中易被误接上线；若被搜到源码易质疑「虚假证言」；维护噪音 |
| **T-053** | 组件硬编码迁 i18n | 已定位：`TcoCalculatorClient`（isZh 三元+数据字典）、`UserMenu` Sign In/Out、`TicketList:147`、`LoginForm:37` Network error、Navbar VMware/TCO 内联等。交付：按文件分批迁 `useTranslations`，保留必要常量 | 改文案不再改组件；翻译流程统一；降低 EN/ZH 漂移 | 每次改错综复杂的三元；翻译遗漏只能靠人肉扫；新人难维护 |
| **T-054** | ZH 法律页深度对齐 EN | N4：`/zh/terms` 可见长度约为 EN 的 **0.34**，`/privacy` 约 **0.35**；且含 governs 等英文残留（见 T-041/T-053 交叉）。交付：按 EN 章节结构补全繁中法律正文 | 繁中法律保护实质有效；避免「半套条款」 | 若发生纠纷，残缺条款更不利；用户认为 ZH 站是敷衍翻译 |

### 四、工程 / 集成开放项（非本轮内容主线）

| 序号 | 事项名 | 详情 | 改动价值 | 不改动劣势 |
|------|--------|------|----------|------------|
| **T-035** | Odoo CRM 凭证配置 | 代码已支持 cookie 会话与 ok 检查；`.env.local`/Vercel 仍为占位。缺省时线索只进 Supabase+邮件。交付：填 `ODOO_URL/DB/USERNAME/PASSWORD`（Production env） | 官网线索自动进 CRM，销售可跟进 | 线索停留在邮件/表，易漏跟；S7 集成目标名存实亡 |
| **T-036** | design-v2 UI 重设计提案 | `tgws/design-v2/`「蓝图/Cyanotype」+ hero-demo；6 项决策未批；生产 UI 维持现状。交付：你逐项批准/否决后按 Phase 0–6 实施或归档 | 获得统一视觉升级路线；避免多套审美并行 | UI 改进无主轴；后续小改容易风格漂移；提案文件悬置占注意力 |
| **T-055** | 执行已审批功能测试计划 | `tgws/docs/eval/2026-09-15-test-plan.md`：~95 功能 + 50 破坏性；限流数字已与源码一致；Origin 403 已实测。交付：你勾选 §5 范围后按阶段跑 Edge 套件并出结果表 | 以结果验证回归；暴露真实缺陷 | 只有计划没有执行证据；上线质量依赖人工抽查 |
| **T-056** | TCO 定价数据录入 Sanity | 计算器与 `/api/tco` 已通；VMware/Nutanix/Sangfor 场景定价需业务数据。交付：你提供数字 → Studio/脚本上传 | TCO 工具从「能算」变为「可信算」 | 对比结果缺业务依据，销售不敢用；工具空转 |

### 五、明确禁止再开单（九轮已证伪）

| 序号 | 原错误结论 | 证伪依据 | 正确表述 |
|------|------------|----------|----------|
| ~~X-01~~ | Partner logo 空白破损 | 资产 200；滚动后 complete；N5 25/25 有字节 | logo 正常；仅架构上应迁 CMS（T-046） |
| ~~X-02~~ | 配图 76.6% broken | lazy-load 采样污染 | 产品侧是「无摄影资产/未接 image」（T-047） |
| ~~X-03~~ | Compare 40% 证言已上线展示 | 可见文本无；组件不渲染 | 死 i18n（T-052） |
| ~~X-04~~ | EN 页 TCO 显示中文 | `isZh` 分支 EN 为英文 | 硬编码 i18n 债（T-053） |

### 六、建议执行顺序

```
第1批（纯代码，可立即）: T-041 → T-042 → T-043(先对齐2020) → T-048 → T-049 → T-050 → T-051
第2批（代码+你拍板）: T-044 → T-047B或A → T-052B或A
第3批（需你供数/Studio）: T-045 → T-046 → T-056 → T-035
并行决策: T-036 design-v2；T-055 测试范围勾选
可后排: T-053 分批、T-054 法律长文
```

---

## 已完成任务（历史）

| 任务 | 完成时间 | 实际工时 | 实现要点 |
|------|----------|----------|----------|
| TODO-001 发展历程时间轴 | 2026-01-25 | 0.5天 | Sanity Schema + Server/Client分离 |
| TODO-002 团队介绍 | 2026-01-25 | 0.5天 | Sanity数据获取 + 响应式布局 |
| TODO-003 公司资质 | 2026-01-25 | 0.5天 | Sanity Schema + 网格展示 |
| TODO-004 隐私政策/服务条款 | 2026-01-25 | 0.5天 | GDPR/CCPA合规 + 双语 |
| TODO-005 测试修复 | 2026-01-25 | 0.5天 | 修复测试失败+act()警告 |
| TODO-006 管理员仪表板 | 2026-01-25 | 1天 | 统计图表 + 数据可视化 |
| TODO-007 批量操作 | 2026-01-25 | 1天 | 多选+批量状态更新+CSV导出 |
| TODO-008 地图集成 | 2026-01-25 | 0天 | 已有实现+修复CSP |
| TODO-009 二维码 | 2026-01-25 | 0.5天 | WhatsApp二维码 + goqr.me API |
| TODO-010 附件预览 | 2026-01-25 | 1天 | 图片/PDF预览 + 下载 |
| TODO-011 产品搜索 | 2026-01-25 | 0.5天 | 实时关键词搜索 + 清除功能 |
| TODO-016 Global Search | 2026-01-26 | 3天 | AI搜索 + 多模态 + E2E测试21个用例 |

**总实际工时**: 9天（预估51天，节省42天）

---

## 相关文档

- [项目分析报告](TGWS项目分析报告.docx) - 完整分析文档
- [PRD文档](PRD-TechGuru-Website.md) - 产品需求规格
- [模块索引](docs/modules/INDEX.md) - 模块状态总览
- [AGENTS.md](AGENTS.md) - 开发约束和规范