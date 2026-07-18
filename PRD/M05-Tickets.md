# TechGuru PRD - 工单系统

> 从 PRD-TechGuru-Website.md 分割
> 原始章节: L332-L407
> **v1.3（2026-07-19）**：补工单详情页 / 幂等键 / 事务安全 / RLS policy 说明（W1-2 + W1-3 反向同步）

---

## [S6] 客户工单系统

> **注意**: 本节已根据实际实现更新（2026-07-09；2026-07-19 W1-2 + W1-3 反向同步补完）。

### 6.1 功能概述

已下单客户或现有客户可注册账号、登录后提交工单，查看历史工单状态，后台管理员可分配和处理工单。Wave 1（W1-2 + W1-3）补完密码重置完整流程、工单详情页、幂等键、事务安全、RLS policy。

### 6.2 用户认证

| 项目 | 方案 |
|------|------|
| 注册方式 | 邮箱+密码、Gmail OAuth单点登录 |
| 邮箱建议 | 强烈推荐企业邮箱（不禁止@gmail.com） |
| 认证服务 | Supabase Auth（直连，无自建API中间层） |
| 密码复杂度 | 最少8位，包含大小写字母+数字 |
| 密码重置流程 | （W1-2）`LoginForm` "Forgot password" → POST `/api/auth/reset-password` → Supabase 发邮件（`redirectTo` 指向 `/support/reset-password`） → 用户点链接 → 落地 `/support/reset-password` → 输入新密码 → `supabase.auth.updateUser({password})` → 重定向登录 |
| 路由保护 | （W1-2）中间件层 `/support/*` 保护：未登录访问受保护路由 → 302 跳 `/support/login?redirect=...`；已登录访问 `/support/login` / `/support/register` → 跳 `/support`；公开路由仅 `/support/login` / `/support/register` / `/support/reset-password` |

### 6.3 工单提交

| 字段 | 类型 | 说明 | 状态 |
|------|------|------|------|
| 分类 (category) | 下拉选择 | build / run / protect | ✅ |
| 产品/服务 (product) | 下拉选择 | 从 Sanity 动态获取 + "Other" 选项 | ✅ |
| 其他产品 (productOther) | 文本 | 选择 "Other" 时显示 | ✅ |
| 发生时间 (occurredAt) | datetime-local | 问题实际发生时间，默认当前时间 | ✅ |
| 主题 (subject) | 文本 | 最多 200 字符 | ✅ |
| 问题描述 (description) | textarea | 纯文本，最多 800 字符，实时字数统计 | ✅ |
| 截图粘贴 | 粘贴区域 | 支持剪贴板粘贴图片 + 点击上传 | ✅ |
| 附件上传 | 文件上传 | 多文件，**10MB / 文件**，**11 项 MIME 白名单**（png/jpeg/webp/gif/pdf/text/plain/zip/xls/xlsx/doc/docx，W1-1） | ✅ |
| idempotency_key | 隐藏字段 | UUID v4，前端生成，跨重试稳定，成功后重置（W1-3） | ✅ |

- **自动保存：** 通过 `useAutoSave` hook 每 30 秒保存到 localStorage
- **字数统计：** 绿色→橙色(750)→红色(800) 渐变提示
- **提交后：** 自动发送 acknowledge 邮件给技术人员和客户
- **上传流程：** FormData → `/api/upload`（先校验 ticket ownership，再上传 Storage，返回 1h Signed URL） → Supabase Storage
- **幂等保证：** 同一 `idempotency_key` 重复提交返回原工单号（详见 6.9）

### 6.4 邮件通知

| 场景 | 收件人 | 内容 |
|------|--------|------|
| 工单提交 | 技术人员（可自定义邮箱）+ 客户 | 工单确认通知 |
| 状态更新 | 客户 | 工单状态变更通知 |
| 评论回复 | 工单 owner（仅当 commenter 不是 owner 且评论非内部） | 工单回复通知 |

### 6.5 工单管理

| 角色 | 功能 |
|------|------|
| **客户** | 查看我的工单、工单列表、状态筛选（Open/In Progress/Resolved/Closed）、查看工单详情、追加评论、补充 description |
| **管理员** | 工单分配、状态更新、统计报表（按周/月/季/年）、用户管理、查看所有评论（含 internal）、添加内部评论 |

### 6.6 统计维度

- 按客户统计工单数量
- 按产品/服务统计工单数量
- 按时间维度（周/月/季/年）统计

### 6.7 工单数据字段 (实际实现)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，Supabase 自动生成 |
| user_id | UUID | 外键，关联 users 表 |
| ticket_number | VARCHAR(20) | 工单编号，6 字符 base36 + `TG-` 前缀（如 `TG-A3F9K2`），碰撞重试 3 次（W1-3） |
| category | ENUM | build / run / protect |
| product_service | VARCHAR(100) | 具体产品/服务 |
| subject | VARCHAR(200) | 工单主题 |
| description | TEXT | 问题描述 |
| occurred_at | TIMESTAMP | 问题发生时间（用户报告） |
| status | ENUM | open / in_progress / resolved / closed |
| priority | ENUM | low / medium / high / critical |
| assigned_to | UUID | 外键，分配给的管理员 |
| idempotency_key | TEXT | 幂等键，UNIQUE 部分索引（W1-3） |
| version | INTEGER | 乐观锁版本号（W1-3） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| resolved_at | TIMESTAMP | 解决时间 |
| deleted_at | TIMESTAMP | 软删除时间戳（NULL = 未删除） |

### 6.8 工单详情页（W1-3 新增）

> 路径：`/support/tickets/[id]`（locale-prefixed：`/{locale}/support/tickets/[id]`）

#### 6.8.1 页面能力

- **服务端渲染**：`force-dynamic`（用户态相关数据，不缓存）
- **数据加载**：server component 直接通过 `createClient()` 从 Supabase 拉取 ticket + attachments + comments
- **权限校验**：
  - 未登录 → `notFound()`（middleware 兜底，正常应已被中间件 302 跳转）
  - 已登录但非 owner / 非 admin → `notFound()`（不暴露工单存在性）
  - admin 可查看任意工单；customer 仅可查看自己的工单
- **评论可见性**：customer 仅可见 `is_internal = false` 的评论；admin 可见全部
- **assigned_to 显示**：仅 admin 可见 assigned_to 对应的 email（customer 不可见）
- **状态变更 UI**：admin 可见状态变更控件；customer 不可见
- **SEO**：`robots: { index: false, follow: false }`（工单详情不应被索引）

#### 6.8.2 客户端交互（`TicketDetailClient.tsx`）

- 添加评论（content + 可选 is_internal for admin）
- 状态变更（admin only）：触发 PATCH `/api/tickets/[id]`
- 乐观锁：UI 显示当前 version，PATCH 时携带 expected version；冲突 → 409 + 提示用户刷新

### 6.9 幂等键（W1-3 新增）

#### 6.9.1 设计目标

- 网络抖动 / 用户多次点击 "提交" 时，同一工单不应被创建多次
- 重新打开表单（"提交另一个工单"）应生成新 key，允许创建新工单
- 后端兜底：即使前端 bug 导致 key 重复使用，DB UNIQUE 索引也能保证只有一条插入成功

#### 6.9.2 实现细节

| 层 | 实现 |
|----|------|
| 前端生成 | `TicketForm.tsx` 首次提交时 `crypto.randomUUID()` 生成 UUID v4，存入 React state |
| 跨重试稳定 | 网络失败重试时复用同一 key（不重新生成） |
| 隐藏字段 | `<input type="hidden" name="idempotency_key" value={key} readOnly aria-hidden="true" />` |
| 成功后重置 | `setSuccess(true)` 时 `setIdempotencyKey(null)`，下一次"提交新工单"会生成新 key |
| 后端查询 | POST `/api/tickets` 收到 `idempotency_key` 后先 `.eq('idempotency_key', key).maybeSingle()` 查询 |
| 命中 replay | 返回原工单 + `idempotent_replay: true` 标记 |
| 并发安全 | UNIQUE 部分索引 `WHERE idempotency_key IS NOT NULL`；并发插入冲突 → 23505 错误 → 降级为查询并返回 replay |
| 向后兼容 | 若 migration 003 未应用（字段不存在，PostgreSQL 42703 错误），API 降级为非幂等模式而不是失败 |

#### 6.9.3 验证场景

- 同一 `idempotency_key` 两次 POST `/api/tickets` → 返回同一工单号 + `idempotent_replay: true`
- 不同 `idempotency_key` 两次 POST → 创建两个工单
- 不带 `idempotency_key` POST → 正常创建（向后兼容）

### 6.10 事务安全（W1-3 新增）

#### 6.10.1 工单创建流程

```
POST /api/tickets
  ├─ 1. 字段校验（长度 + enum）
  ├─ 2. idempotency_key 查询（命中则 replay 返回）
  ├─ 3. ticket_number 生成（6 字符 base36，碰撞重试 3 次）
  ├─ 4. INSERT tickets（含 idempotency_key 若有）
  │     └─ 失败处理：
  │        ├─ 23505 + idempotency_key 冲突 → 查询并返回 replay
  │        ├─ 23505 + ticket_number 冲突 → 重试（最多 3 次）
  │        └─ 42703（字段不存在）→ 降级模式：strip idempotency_key 重试
  ├─ 5. INSERT ticket_audit_log（action='created'，best-effort）
  │     └─ 失败：console.warn，不回滚工单
  ├─ 6. sendTicketCreatedEmail（best-effort，非阻塞）
  │     └─ 失败：console.warn，不回滚工单
  └─ 7. 返回 { success: true, data: inserted }
```

#### 6.10.2 工单更新流程

```
PATCH /api/tickets/[id]
  ├─ 1. 字段校验 + 字段级角色白名单
  ├─ 2. 查询 current ticket + user role
  ├─ 3. 乐观锁校验（version 字段匹配）
  │     └─ 不匹配 → 409 version_conflict
  ├─ 4. UPDATE tickets（含 version+1）
  │     └─ 失败：23505 → 409 version_conflict
  ├─ 5. INSERT ticket_audit_log（每个变更字段一条，best-effort）
  ├─ 6. （可选）INSERT ticket_comments（若 PATCH body 含 comment）
  ├─ 7. （可选）sendTicketStatusEmail（若 status 变更，best-effort）
  ├─ 8. （可选）sendTicketReplyEmail（若 comment 非 internal 且 commenter 不是 owner，best-effort）
  └─ 9. 返回 { success: true, data, comment? }
```

#### 6.10.3 补偿动作说明

- **email 失败**：不回滚工单创建 / 状态变更；console.warn 记录；后续可由后端 job 重发
- **audit_log 失败**：不回滚工单变更；console.warn 记录；接受审计日志缺失（best-effort）
- **comment insert 失败**：不回滚工单变更；console.warn 记录；响应中不含 comment 字段
- **Supabase RPC 未使用**：当前未用 Postgres RPC 包装多步操作，靠 best-effort + 补偿动作保证最终一致性；未来可考虑用 RPC 提升原子性

### 6.11 RLS Policy 说明（W1-3 migration 003）

> migration 003 为 `ticket_audit_log` / `ticket_attachments` / `ticket_comments` 补 INSERT policy。详见 `PRD/GLOBAL.md` S17.7。

| 表 | 缺失前状态 | migration 003 补充 |
|----|----------|------------------|
| `ticket_audit_log` | 仅依赖默认 SELECT policy，customer 无法插入审计日志 | INSERT policy × 2（admin 任意 / customer 仅自己工单） |
| `ticket_attachments` | customer 无法插入附件 | INSERT policy × 2（admin 任意 / customer 仅自己工单）+ SELECT policy（admin 全部） |
| `ticket_comments` | customer 无法插入评论 | INSERT policy × 2（admin 任意 / customer 仅自己工单）+ SELECT policy（admin 全部，含 internal） |
| `tickets` | 已有 customer INSERT policy | 补 admin INSERT policy（"Admins can create tickets"） |

**重要约束**：
- 所有 policy 均要求 `users.deleted_at IS NULL`（软删除用户无权限）
- 所有外键校验均检查 `tickets.deleted_at IS NULL`（防止为已删除工单追加记录）
- migration 003 文件已创建但**未自动执行**，需手动 `supabase db push`；代码层已做向后兼容处理

---


---
