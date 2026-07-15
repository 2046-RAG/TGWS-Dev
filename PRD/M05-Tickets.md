# TechGuru PRD - 工单系统

> 从 PRD-TechGuru-Website.md 分割
> 原始章节: L332-L407

---

## [S6] 客户工单系统

> **注意**: 本节已根据实际实现更新（2026-07-09）。

### 6.1 功能概述

已下单客户或现有客户可注册账号、登录后提交工单，查看历史工单状态，后台管理员可分配和处理工单。

### 6.2 用户认证

| 项目 | 方案 |
|------|------|
| 注册方式 | 邮箱+密码、Gmail OAuth单点登录 |
| 邮箱建议 | 强烈推荐企业邮箱（不禁止@gmail.com） |
| 认证服务 | Supabase Auth（直连，无自建API中间层） |
| 密码复杂度 | 最少8位，包含大小写字母+数字 |

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
| 附件上传 | 文件上传 | 多文件，任意格式，最大 **50MB** | ✅ |

- **自动保存：** 通过 `useAutoSave` hook 每 30 秒保存到 localStorage
- **字数统计：** 绿色→橙色(750)→红色(800) 渐变提示
- **提交后：** 自动发送 acknowledge 邮件给技术人员和客户
- **上传流程：** FormData → `/api/upload` → Supabase Storage

### 6.4 邮件通知

| 场景 | 收件人 | 内容 |
|------|--------|------|
| 工单提交 | 技术人员（可自定义邮箱）+ 客户 | 工单确认通知 |
| 状态更新 | 客户 | 工单状态变更通知 |

### 6.5 工单管理

| 角色 | 功能 |
|------|------|
| **客户** | 查看我的工单、工单列表、状态筛选（Open/In Progress/Resolved/Closed） |
| **管理员** | 工单分配、状态更新、统计报表（按周/月/季/年）、用户管理 |

### 6.6 统计维度

- 按客户统计工单数量
- 按产品/服务统计工单数量
- 按时间维度（周/月/季/年）统计

### 6.7 工单数据字段 (实际实现)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，Supabase 自动生成 |
| user_id | UUID | 外键，关联 users 表 |
| ticket_number | VARCHAR(20) | 工单编号，自动生成（TG-YYYYMMDD-XXXX） |
| category | ENUM | build / run / protect |
| product_service | VARCHAR(100) | 具体产品/服务 |
| subject | VARCHAR(200) | 工单主题 |
| description | TEXT | 问题描述 |
| occurred_at | TIMESTAMP | 问题发生时间（用户报告） |
| status | ENUM | open / in_progress / resolved / closed |
| priority | ENUM | low / medium / high / critical |
| assigned_to | UUID | 外键，分配给的管理员 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| resolved_at | TIMESTAMP | 解决时间 |

---


---