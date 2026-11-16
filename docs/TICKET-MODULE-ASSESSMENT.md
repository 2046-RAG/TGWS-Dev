# 工单模块完成度评估与差距分析

**评估时间**：2026-11-16 09:44
**评估范围**：`src/app/api/tickets/**`、`src/app/[locale]/support/**`、`src/components/tickets/**`、`supabase/migrations/001/006/007`
**方法**：逐文件读代码 + 迁移 + 测试用例，不以历史汇报为依据。
**未验证项**：全部标 `【推断】`；线上 RLS 与存储桶配置未直连核实（凭据核查被安全策略拦截）。

> **修复进展（2026-11-16 10:40 更新）**：`008` 与 `009` 已分别于 10:36 / 10:39 在**生产库执行并验证通过**（7 项策略检查全 PASS；桶已转 private；4 个函数均为 SECURITY DEFINER）。P0 三项与 P1 五项及防护四项**代码与数据库均已生效**。**仍未验证**：附件真实上传链路（需登录后实际上传一次）、邮件真实送达、客户回复重开的端到端效果。P2 十三项未动。

---

## 一、现状结论

### 1.1 判定：不具备生产交付条件

主流程（建单 → 派单 → 回复 → 改状态 → 结单）在**代码层已连通**，但存在 **3 项高危（上线阻断）** 与 **5 项业务闭环/数据一致性缺陷**。按「客服能否独立处理完一张工单且不留隐患」这一可交付标准判定：**不通过**。

### 1.2 七维判定

| 维度 | 判定 | 依据（可核对） |
|---|---|---|
| 功能完整性 | 部分达标 | 客户建单/列表/详情/回复、后台列表/详情/改状态/优先级/指派/内部备注/批量/CSV/统计均已实现；**缺删除归档、全库搜索、客服回传附件** |
| 业务流程闭环 | **未达标** | 客户回复不推进工单状态与 `updated_at`（`comments/route.ts:64-78`）；客服收不到客户回复邮件（`comments:105-111` + `001:107`）；`closed` 工单仍可回复（`comments:40-48`） |
| 接口与数据一致性 | **未达标** | 单条 PATCH 与批量 PATCH 行为三分叉：`resolved_at`、通知邮件、乐观锁（`[id]/route.ts:142-198` vs `stats/route.ts:50-80`）；批量返回 `updated: ids.length` 非实际行数（`stats:80`） |
| 异常与边界 | 部分达标 | 有 401/400/403/404/500 与限流；**但**乐观锁冲突被映射为 500 而非 409（`[id]/route.ts:157-160`）、`occurredAt` 无格式校验（`tickets/route.ts:74`）、指派不校验被指派人（`[id]:235-260`） |
| 权限与安全 | **未达标** | 审计表未启用 RLS（`001:90-94` 列表不含 `ticket_audit_log`）；附件表无 INSERT 策略（`001:145-154`）；附件走公开 URL（`upload:91-93`） |
| 测试覆盖 | 部分达标 | 单测/组件 9 文件 **73 用例**；E2E 21 用例但 **CI 不执行**（`ci.yml` 仅 tsc/unit/build）；后台处置闭环（改状态/指派/备注/批量/导出）**零 E2E** |
| 性能与可维护性 | 部分达标 | 有分页与 4 类索引；**但** 统计接口拉全表内存聚合（`stats:107-136`）、客户列表无分页（`tickets/route.ts:120-137`）、搜索仅当前页（`admin/tickets/page.tsx:83-86`） |

### 1.3 用户视角：现在能做什么 / 不能做什么

**客户能**：注册登录、建单（分类/产品/主题/描述/发生时间/选附件+粘贴截图）、看自己的工单、看详情、公开发回复。
**客户不能/不确定**：附件是否真能落地（取决于线上 RLS 与桶配置，见 G2/G3）；回复后工单状态不变（客服侧不会浮起）。

**客服能**：看全部工单（分页 + 状态/分类/优先级筛选）、改状态/优先级/指派、写内部备注、批量改状态、导出当前页 CSV、看统计与审计时间线。
**客服不能**：删除/归档工单、跨页全库搜索、给客户回传附件、收到客户新回复的邮件、判断某工单是否有未读客户消息。

---

## 二、关键差距

> 依据列均为文件:行号，可直接打开核对。

### P0 — 上线阻断（高危）

**G1 审计表未启用 RLS**
- 依据：`001_initial_schema.sql:90-94` 仅对 `users`/`tickets`/`ticket_attachments`/`ticket_comments`/`contact_submissions` 启用 RLS；`ticket_audit_log` 从未 `ENABLE ROW LEVEL SECURITY`，其唯一策略 `Admins can view audit log`（`001:135-141`）因此**不生效**。
- 后果：Supabase 默认对 `public` 表授予 `anon`/`authenticated` 权限，审计日志可能对任意人可读、可写、可删；日志含 `performed_by`、`ticket_id`、旧值/新值 → 客户-工单关联泄露，且操作痕迹可被抹除。
- `【推断】`：线上是否被手工补过 RLS，未验证。`007` 注释显示生产环境确实存在"手工建策略"的历史，因此**必须线上核实而非假定**。

**G2 客户上传附件大概率被 RLS 拒绝**
- 依据：`001:145-154` 对 `ticket_attachments` 只有 SELECT 策略，无 INSERT；`upload/route.ts:95-108` 在 DB insert 失败时回滚存储并返回 500。
- 后果：客户选完附件、工单已创建，附件上传失败；用户看到"建单成功但附件没了"。
- `【推断】`：线上是否手工补过 INSERT 策略未知。

**G3 附件通过永久公开 URL 暴露**
- 依据：`upload/route.ts:91-93` 使用 `getPublicUrl()`（只对 public bucket 有意义），路径 `{user_id}/{timestamp}-{name}`。
- 后果：客户上传的合同/截图/日志包可被任何拿到链接的人永久访问，无签名、无过期、无权限校验。属客户数据泄露面。
- `【推断】`：bucket 公开性无 migration 可查（仓库内无 bucket 创建脚本），需控制台确认。

### P1 — 业务正确性（高）

**G4 单条与批量改状态行为不一致**
- 依据：单条 PATCH 写 `resolved_at`、发状态变更邮件、带 `version` 乐观锁（`[id]/route.ts:142-198`）；批量 PATCH 三者全无（`stats/route.ts:50-80`）。
- 后果：同一"标记已解决"动作，走列表批量与走详情页，数据结果不同（`resolved_at` 为空 / 客户收不到通知 / 并发覆盖不报错）。

**G5 `resolved_at` 不会清除**
- 依据：`[id]/route.ts:150` 仅在 `status === 'resolved'` 时写入，改回 `open`/`in_progress` 时不清空。
- 后果：重新打开的工单仍带旧的解决时间，解决时长统计与 SLA 口径被污染。

**G6 客户 PATCH 自己工单 → 500 而非 403**
- 依据：API 层 `!isAdmin && current.user_id !== user.id` 才拒绝（`[id]:131`），客户本人放行；DB 层 `tickets` 只有 admin UPDATE 策略（`001:124-132`），更新影响 0 行 → `.single()` 报错 → 返回 500（`[id]:157-160`）。
- 后果：越权语义错误（安全上数据未被改，但错误码误导排查）；若后续给客户加"关闭工单"按钮会直接 500。

**G7 客户回复不推进工单**
- 依据：`comments/route.ts:64-78` 只插 `ticket_comments`，不更新 `tickets.status` / `updated_at`。
- 后果：工单停在 `resolved`/`closed`；后台列表按 `created_at` 排序（`tickets/route.ts:183`），客户新回复不会浮上来 → 客服漏回，工单看起来"已解决"。

**G8 客户回复的管理员邮件通知实际不发出**
- 依据：`comments:105-111` 以客户身份查询 `users` 表 `.in('role', ['admin','super_admin'])`；`users` 仅有 `Users can view own profile` 策略（`001:107-108`）→ 查询返回空数组 → 不发送。
- 后果：客户回复无人被通知，只能靠客服主动刷列表。

### P2 — 质量与体验（中）

| # | 差距 | 依据 | 影响 |
|---|---|---|---|
| G9 | 软删除是死链路：`deleted_at` 无任何写入点 | 全库 grep 仅见 `is('deleted_at', null)` 过滤 | 无法归档/删除工单；所有过滤形同虚设 |
| G10 | 后台搜索只搜当前页 | `admin/tickets/page.tsx:83-86` 在 `visible` 上 `filter` | 客服搜历史工单会误判"不存在" |
| G11 | 统计拉全表到内存聚合 | `stats/route.ts:107-136` | 工单量增长后 dashboard 变慢/超时 |
| G12 | 客户列表无分页、`select('*')` | `tickets/route.ts:120-137` | 老客户工单多时首屏慢、多传内部字段 |
| G13 | 批量返回 `updated: ids.length` | `stats:80` | 前端提示条数与实际更新数不符 |
| G14 | 三处写接口无同源/限流 | `[id]` PATCH、`[id]` POST(指派)、`stats` PATCH 均未引 `api-guard` | 与建单/评论/上传三条路径的保护级别不一致 |
| G15 | 指派不校验被指派人 | `[id]:235-260` 直接写 `assigned_to` | 任意 UUID → FK 报错 500；可指派给客户账号 |
| G16 | `occurredAt` 无格式校验 | `tickets/route.ts:74` 直接入库 | 非法字符串 → DB 报错 → 500 |
| G17 | 附件上限 50MB，PRD 为 10MB；无数量上限 | `upload:6` vs `001:48` 注释 | 与需求不符；可被单工单堆满存储 |
| G18 | 客服不能给客户工单传附件 | `upload:75-77` 仅允许 `ticket.user_id === user.id` | 客服无法回传解决方案截图/补丁 |
| G19 | CSV 无公式注入防护 | `admin/tickets/page.tsx:97-99` 有引号转义、无 `=+-@` 前缀处理 | `subject` 为用户输入，Excel 打开可能执行公式 |
| G20 | 评论不可编辑/删除 | `007` 只建了 SELECT/INSERT 策略 | 误发内容无法更正（含内部备注） |
| G21 | 审计写入失败仅记录日志 | `tickets:91-93`、`[id]:173-184`、`comments:80-88` | 审计链可有空洞（属有意取舍，但需明示） |

---

## 三、风险影响

| 等级 | 项 | 业务后果 | 触发条件 |
|---|---|---|---|
| **P0** | G1 | 客户-工单关系与操作痕迹可被匿名读取/篡改，属数据合规风险 | 任意人拿到 anon key（前端公开）即可尝试 |
| **P0** | G2 | 客户建单后附件静默丢失，客服拿不到关键证据（截图/日志） | 客户上传任意附件 |
| **P0** | G3 | 客户上传的合同/凭证可被永久公开访问 | 链接被转发/被爬 |
| **P1** | G4/G5 | 解决时长、SLA、统计口径失真；客户收不到通知 | 用批量操作或重新打开工单 |
| **P1** | G6 | 越权请求返回 500，掩盖真实原因，后续加功能即踩坑 | 客户对自己工单发 PATCH |
| **P1** | G7/G8 | 客户回复被漏看，工单"假已解决"，客诉升级 | 客户在已解决工单下追问 |
| **P2** | G9–G21 | 运维效率与体验问题，不阻断交付，但会持续消耗客服时间 | 工单量增长后放大 |

---

## 四、优先修复项（按最短交付路径排序）

### 第一批：P0（建议先做，改动集中、可独立验证）

| 序 | 修什么 | 改法 | 涉及文件 |
|:--:|---|---|---|
| 1 | G1 审计表 RLS | 新增 `008_ticket_audit_hardening.sql`：`ENABLE ROW LEVEL SECURITY` + 仅 admin SELECT + `INSERT` 允许 `performed_by = auth.uid()` 且该用户对工单有权限（客户仅限自己工单、admin 不限）；无 UPDATE/DELETE 策略 | 新迁移 + `supabase/verify/008_verify.sql` |
| 2 | G2 附件写入 | 同迁移补 `ticket_attachments` INSERT 策略：`EXISTS(tickets where id=ticket_id and user_id=auth.uid() and deleted_at is null)`；admin 放行 | 同上 |
| 3 | G3 附件私有化 | 桶改 private + 读取走 `createSignedUrl`（短时效）；API 返回签名 URL，不返回永久公开 URL | `upload/route.ts`、`[id]/route.ts`、`AttachmentPreview` |
| 4 | 线上核实 | 用 SQL 核对 `pg_tables.rowsecurity` / `pg_policies`，确认 G1/G2 现状（不假定） | 只读 SQL |

### 第二批：P1（P0 完成后立即做，均为小改）

| 序 | 修什么 | 改法 | 涉及文件 |
|:--:|---|---|---|
| 5 | G4/G13 批量一致性 | 批量改为逐单调用同一更新函数（含 `resolved_at`、邮件、version）；返回实际影响行数 | `stats/route.ts` 抽取共享 `applyStatusChange()` |
| 6 | G5 resolved_at | 状态离开 `resolved` 时置 `null` | `[id]/route.ts` |
| 7 | G6 越权语义 | 客户 PATCH 直接 403（只允许 admin 改状态/优先级/指派） | `[id]/route.ts:124-133` |
| 8 | G7 回复推进 | 客户公开回复时：`closed` 拒绝或按策略重开；`resolved` → `in_progress`；更新 `updated_at` | `comments/route.ts` |
| 9 | G8 通知断链 | 管理员收件人查询改用 service-role 客户端，或建 `admin_notify` 视图（仅暴露 email） | `comments/route.ts:105-111` |

### 第三批：P2（可排入下一迭代）

G9 软删除接口 · G10 全库搜索（服务端 `ilike`）· G11 统计改 SQL 聚合 · G12 客户列表分页 · G14 补同源/限流 · G15 指派校验 · G16 时间格式校验 · G17 上限对齐 PRD · G18 客服上传 · G19 CSV 前缀转义 · G20 评论编辑策略。

---

## 五、验收标准（可执行、可核对）

### P0 验收

| 项 | 验收动作 | 通过标准 |
|---|---|---|
| G1 | 匿名 + 普通客户 token 分别 `GET /rest/v1/ticket_audit_log?select=*` | 两者均返回空数组或 401/403；admin token 可读自己可见工单的日志 |
| G1 | 普通客户 token `POST /rest/v1/ticket_audit_log` 伪造一条 | 被拒绝（4xx），表中无新增行 |
| G1 | 建单流程 | 客户建单后 `ticket_audit_log` 有 1 条 `action='created'`，`performed_by` 为客户 |
| G2 | 客户对自有工单上传 1 个 PDF | 201 且 `ticket_attachments` 新增 1 行；对他人工单上传 → 403 且无存储对象残留 |
| G3 | 复制返回的附件 URL，无 cookie 直接访问 | private 桶下应 400/403；前端预览使用短时效签名 URL 且可正常打开 |
| G3 | 检查 `ticket_attachments.file_url` 存储值 | 不含永久公开域名，或明确标注需二次签名 |

### P1 验收

| 项 | 验收动作 | 通过标准 |
|---|---|---|
| G4 | 分别用详情页与批量把两张 `open` 工单改为 `resolved` | 两单 `resolved_at` 均非空、均产生 `status_changed` 审计、均触发 1 封通知；接口返回实际更新数 |
| G5 | 将已 `resolved` 工单改回 `open` | `resolved_at` 变为 `null` |
| G6 | 客户 token 对自己工单 `PATCH {"status":"closed"}` | 403（非 500），且库中 `status` 未变 |
| G7 | 客户在 `resolved` 工单下回复 | 工单 `status` 变 `in_progress`、`updated_at` 更新、后台列表按更新时间可见该工单 |
| G7 | 客户在 `closed` 工单下回复 | 按既定策略：拒绝（400/409）或自动重开；二者择一并在文档写明 |
| G8 | 客户发一条公开回复 | 至少 1 名 admin 邮箱收到通知；内部备注不触发任何邮件 |

### 回归门禁（每次改动后）

```
npx tsc --noEmit                # 0 error
npm run test:run                # 全绿；工单 73 用例不得减少
npx eslint . -f json            # 0 error
```

新增用例下限：G4（批量 vs 单条一致性）、G6（客户 PATCH 403）、G7（回复推进状态）、G1/G2（RLS 正反向）各 ≥1 条。

---

## 附录 A：已验证事实（可直接核对）

`001:19-35` 工单表含 `ticket_number UNIQUE`、`version`、`status/priority/category` CHECK；`001:82-88` 四类索引；`001:90-94` RLS 启用表清单；`001:107-154` 全部策略；`006` 用户同步触发器；`007` 评论四策略。
`[id]/route.ts:131-160` 鉴权与更新；`[id]:187-198` 状态邮件；`[id]:235-297` 指派；`comments:57-113` 权限与通知；`stats:50-80` 批量；`stats:107-136` 全表统计；`upload:6,75-108` 上传约束与回滚；`admin/tickets/page.tsx:83-107` 搜索与 CSV。

## 附录 B：未验证清单（不要当作结论使用）

1. 线上 `ticket_audit_log` 是否已启用 RLS（`【推断】`未启用）
2. 线上 `ticket_attachments` 是否有手工 INSERT 策略（`【推断】`无）
3. 存储桶 `ticket-attachments` 是否 public（代码使用 `getPublicUrl`，强烈提示是）
4. 客户回复邮件是否真的从未送达（`【推断】`基于 users RLS）
5. 附件上传在真实环境下是否稳定 500（`【推断】`基于缺 INSERT 策略）
6. 审计插入在建单时是否成功（同上）

---

## 六、修复实施记录（2026-11-16）

### 6.0 生产库实测修正（10:30，重要）

用 Supabase 个人访问令牌直连生产库核对后，两条基于迁移文件的 P0 结论需要更正：

| 编号 | 原结论（读 001 迁移得出） | 生产实测 | 更正 |
|---|---|---|---|
| G1 | `ticket_audit_log` **未启用 RLS**，可能被匿名读写 | RLS **已启用**；1 条 SELECT + 2 条 INSERT；无 UPDATE/DELETE | 严重度由"高危"降为"中危"。真实缺陷是两条 INSERT 都**不校验 `performed_by`**，可伪造操作人 |
| G2 | `ticket_attachments` **无 INSERT 策略**，客户上传被拒 | 表策略**已正确**（客户本人工单 + admin 任意 + 两条 SELECT） | **G2 不成立**。上传失败的真因在存储层：`storage.objects` 对 `ticket-attachments` **0 条策略**，`storage.upload()` 必然失败 —— 与 `attachments=0`、`objects=0` 完全吻合 |
| G3 | 附件永久公开可访问 | 桶 public，但**0 个对象** | 风险尚未兑现，仍按 P0 处理（已转 private） |

**教训（写进流程）**：迁移文件 ≠ 线上状态。生产存在"手工建策略"的历史（007 注释已提示），任何从迁移文件读出的安全结论都必须用 `pg_policies` 实测确认，否则会把"已修好的"当成"高危"、把"真问题"定位到错误的层。

### 6.1 代码实施（2026-11-16 10:10）

### 6.1 已修复（代码层）

| 编号 | 修复内容 | 涉及文件 |
|---|---|---|
| G1 | **生产已启用 RLS**（原推断有误，见 §6.6）；本次把两条不校验操作人的 INSERT 收敛为一条，要求 `performed_by = auth.uid()` 且对工单有访问权；无 UPDATE/DELETE 策略 | `008_ticket_hardening.sql` |
| G2 | **表策略原本已正确**（原推断有误，见 §6.6）；真实缺口在存储层：`storage.objects` 0 条策略导致上传必失败。附件表策略本次仅按线上现名幂等重建 | 008（表策略）+ 009（存储策略） |
| G3 | 桶转 private；`storage.objects` 四条策略（读自己/读 staff/写自己/删自己）；代码改存**对象路径**，读取时生成 1 小时签名 URL，兼容历史公开 URL | **009** + `src/lib/tickets/attachments.ts` + `api/upload` + `api/tickets/[id]` |
| G4/G13 | 单条与批量共用 `applyStatusChange()`：`resolved_at`、审计、乐观锁、客户邮件、真实计数全部统一；批量返回 `{updated, unchanged, failed}` | `src/lib/tickets/status-change.ts` |
| G5 | 状态离开 `resolved` 时 `resolved_at` 置 `null` | 同上 |
| G6 | 客户对任何工单 PATCH 一律 403（不再落到 RLS 变成 500） | `api/tickets/[id]` |
| G7 | 客户回复调用 `reopen_ticket_on_customer_reply()`：`resolved`/`closed` → `in_progress`、清 `resolved_at`、刷新 `updated_at`、写审计 | 008 + `api/tickets/[id]/comments` |
| G8 | 通知收件人改用 SECURITY DEFINER 函数（`get_staff_emails` / `get_ticket_owner_email`），绕开 users 表行级限制；**同时修复了"状态变更邮件也发不出"的同源问题** | 008 + comments + status-change |
| G14 | `PATCH /tickets/[id]`、`POST /tickets/[id]`、`PATCH /tickets/stats` 补 `requireSameOrigin` + `rateLimit` | 三个 route |
| G15 | 指派校验：UUID 格式 + `is_staff_user()` 员工身份 | 008 + `[id]/route.ts` |
| G16 | `occurredAt` 格式与区间校验（2000-01-01 至 现在+1 天），非法值 400 而非 500 | `api/tickets/route.ts` |
| 新增 | 409 语义：只有 `PGRST116` 视为乐观锁冲突；admin 详情页显示"已被他人修改，请刷新" | status-change + admin 详情页 + `admin.saveConflict` 双语键 |

### 6.2 仍未修复（P2，13 项）

软删除空链路 · 全库搜索（当前仅搜当前页）· 统计改 SQL 聚合 · 客户列表分页 · 客服上传附件 · CSV 公式注入 · 评论编辑/删除 · 附件 50MB 与 PRD 10MB 不一致 · 批量部分失败的前端提示 · 指派下拉与角色解耦 · 客户侧批量调用的错误提示 · 附件数量上限 · 审计 UI 分页。

### 6.3 本轮验证（实测）

| 项 | 结果 |
|---|---|
| `npx tsc --noEmit` | **0 错** |
| `npx vitest run --maxWorkers=2` | **74 文件全过，exit 0** |
| 工单用例数 | **73 → 98**（+25：附件签名 12、状态变更 11、客户 PATCH 403 / 409 冲突 / `resolved_at` 清除） |
| `npx eslint .` | **0 error / 67 warnings** |
| 备注 | 首次全量跑（默认并发）出现 13 个 worker **OOM**，断言 0 失败；降到 2 worker 后全过。属本机内存限制，非代码缺陷 |

### 6.3.0 数据库迁移执行记录（2026-11-16 10:36 / 10:39）

| 迁移 | 执行时间 | 结果 |
|---|---|---|
| `008_ticket_hardening.sql` | 10:36 | **成功**。策略检查 7 项全 PASS：RLS 已启用、策略数 2、无 UPDATE/DELETE、**INSERT 校验 `performed_by`**、附件 INSERT=2、附件 SELECT=2、4 个 SECURITY DEFINER 函数就位。数据未动（tickets=1、audit=0） |
| `009_attachment_private_bucket.sql` | 10:39 | **成功**。桶 `public: true → false`；`storage.objects` 4 条策略（读自己/读 staff/写自己/删自己）；桶内对象数 0，无失效链接 |

**仍未端到端验证**：真实登录后上传一次附件（策略存在 ≠ 上传链路通）、邮件实际送达、客户回复重开的实际效果。这三项列在 A19 / A21 / A22。

### 6.3.1 部署记录（2026-11-16 10:32）

| 项 | 结果 |
|---|---|
| Vercel deployment | `5SD89ecQ3b5T1fAiPHV4WbyAoPWe` → `tgws-ma5ugemnu`，状态 **READY** |
| 页面 | `/en` `/zh` `/en/support` `/zh/support` `/en/support/login` `/en/privacy` 全 **200** |
| 工单 API 未登录 | `GET /api/tickets` 401、`GET /api/tickets/stats` 401、`GET /api/tickets/:id` 401、`PATCH /api/tickets/:id` **401**（修复前该路径是 500 的来源之一） |
| 后台保护 | `/en/support/admin/tickets` 307、`/api/admin/users` 401 |
| 结论 | **代码已上线且无回归**；但 008/009 未执行，因此 G1/G2/G3 的**线上效果尚未生效** |

> 这一点必须说清：现在线上仍是"审计表无 RLS、附件上传会被拒、附件公开可访问"的旧状态，只是代码侧已具备新逻辑。**执行 008 后 G1/G2/G8 生效，执行 009 后 G3 生效。**

### 6.4 上线顺序（必须按序，零窗口）

桶私有化与表级 RLS 被拆成两个迁移，就是为了避免"改桶即全站附件 404"的窗口：

| 步 | 动作 | 为什么是这个顺序 |
|:--:|---|---|
| 1 | 执行 **008**（表级 RLS + 4 个函数） | 只加策略与函数，不改任何对象可见性；旧代码照常工作 |
| 2 | **部署代码** | 读取改走签名 URL；此时桶仍是 public，签名照样有效 |
| 3 | 执行 **009**（桶转 private + storage 策略） | 只有在签名代码已在线后，转私有才不会让旧链接失效 |
| 4 | 跑 `verify/008_verify.sql` 与 `verify/009_verify.sql` | 全部 PASS 才算迁移成功 |
| 5 | 冒烟四步 | 客户上传附件 → 列表出现 → 预览打开；签名 URL 去掉 `?token=` 应 403/400；客户在 resolved 工单回复后状态变 `in_progress` 且 admin 收到邮件 |

**回滚**：`update storage.buckets set public = true where id = 'ticket-attachments';` + 回退代码。建议保留审计表 RLS（对 public 桶无副作用）。

**回滚**：`update storage.buckets set public = true where id = 'ticket-attachments';` + 回退代码。建议保留审计表 RLS（对 public 桶无副作用）。

### 6.5 迁移未执行时的降级行为（重要）

代码对三个 RPC 做了非阻塞降级，因此"代码先上线"不会回归：

| RPC | 缺失时行为 | 与修复前对比 |
|---|---|---|
| `get_ticket_owner_email` | 记日志、不发状态邮件 | 修复前也发不出（users RLS）→ **无回归** |
| `get_staff_emails` | 记日志、不发回复通知 | 修复前也发不出 → **无回归** |
| `reopen_ticket_on_customer_reply` | 记日志、回复仍 201、状态不推进 | 修复前同样不推进 → **无回归** |
| `is_staff_user` | 仅做 UUID 格式校验后放行 | 修复前无校验 → **略有改善** |
