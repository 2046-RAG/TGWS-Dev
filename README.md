# TechGuru Network & Data Solutions Website

泰谷网数科技官方网站

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入真实的API密钥

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 技术栈

| 组件 | 选择 |
|------|------|
| 框架 | Next.js (App Router) |
| CMS | Sanity |
| 数据库 | Supabase |
| 邮件 | Resend |
| 样式 | Tailwind CSS + shadcn/ui |
| 部署 | Vercel |

## 项目结构

- `PRD-TechGuru-Website.md` - 需求文档（22个章节）
- `2026-06-29-techguru-full-site.md` - 实施计划（17个Task）
- `AGENTS.md` - AI助手行为规范和Harness约束
- `execution-plan.md` - 4-Session执行方案与进度追踪

## 开发进度

| Session | 内容 | 状态 |
|---------|------|------|
| Session 1 | 基础骨架（i18n, Sanity, Supabase, Layout, Theme, Security） | ✅ 已完成 |
| Session 2 | 并行页面开发（Hero, Products, Solutions/Blog/About, Contact） | ✅ 已完成 |
| Session 3 | 工单系统 + 集成（Auth, Tickets, Odoo CRM） | ✅ 已完成 |
| Session 4 | 测试 + 文档 + 部署 | ✅ 已完成 |

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # 代码检查
npm run typecheck    # 类型检查
```

## 多语言

- 英文: `/en/...`
- 繁中: `/zh/...`
- 默认访问 `/` 会跳转到 `/en`

## 部署

项目已绑定 Vercel (prj_LHKlb8B4Q7eUtBri3zkeSz3vK9Mu)。
推送代码到 main 分支会自动部署。
当前状态：代码已完成，待配置服务密钥后即可上线。

## 待办

| 优先级 | 任务 | 状态 |
|--------|------|------|
| P0 | 创建 Supabase 项目 + 执行 schema | ⏸️ 阻塞 |
| P0 | 创建 Sanity 项目 + 配置 Schema | ⏸️ 阻塞 |
| P0 | 填入 .env.local 真实密钥 | ⏸️ 等待密钥 |
| P1 | Resend 域名验证 | 待执行 |
| P1 | 自定义域名 DNS 配置 | 待执行 |
| P1 | 真实内容填充 | 待执行 |
| P2 | Odoo CRM 凭证 | 可选 |
