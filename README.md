# TechGuru Network & Data Solutions Website

泰谷网数科技官方网站

## 快速开始

```bash
# 1. 进入项目目录
cd tgws

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入真实的API密钥

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 技术栈

| 组件 | 选择 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.x |
| UI库 | React | 19.x |
| CMS | Sanity | v3 |
| 数据库 | Supabase | - |
| 邮件 | Resend | - |
| 样式 | Tailwind CSS（组件手写，未使用 shadcn/ui） | 4.x |
| 测试 | Vitest + Playwright | - |
| 部署 | Vercel | - |

## 项目结构

```
TGWS/
├── PRD-TechGuru-Website.md  # 需求文档（22个章节）
├── AGENTS.md                # AI助手行为规范和Harness约束
└── tgws/                    # Next.js 应用
    ├── src/                 # 源代码
    ├── tests/               # 测试文件
    └── ...
```

## 开发进度

| PRD章节 | 内容 | 状态 |
|---------|------|------|
| [S1]-[S4] | 项目概述、技术架构、产品归类、网站架构 | ✅ 已完成 |
| [S5]-[S8] | Hero、工单系统、Odoo CRM、CMS | ✅ 已完成 |
| [S9]-[S14] | 设计规范、行业方案、博客、联系、关于（案例展示已废弃 2026-07-12） | ✅ 已完成 |
| [S15]-[S21] | 免费额度、VMware替代、数据模型、API、无障碍、兼容性、测试 | ✅ 已完成 |

**测试状态**: Vitest 76/76 通过 ✅ | Playwright 功能测试套件（6个spec文件，见 tgws/tests/functional/）
**代码覆盖率**: 15.62%（目标 70%）

## 开发命令

```bash
cd tgws
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # 代码检查
npm run typecheck    # 类型检查
npm run test         # 单元测试 (Vitest)
npm run test:e2e     # 端到端测试 (Playwright)
```

## 多语言

- 英文: `/en/...`
- 繁中: `/zh/...`
- 默认访问 `/` 会跳转到 `/en`

## 部署

**已上线**: https://www.techguru-it.asia

- Vercel 项目: prj_LHKlb8B4Q7eUtBri3zkeSz3vK9Mu
- 推送代码到 main 分支会自动部署

## 待办

| 优先级 | 任务 | 状态 |
|--------|------|------|
| P1 | 真实内容填充（案例、博客文章） | 待执行 |
| P1 | 社交媒体账号配置（WeChat、WhatsApp） | 待执行 |
| P2 | Odoo CRM 凭证 | 可选 |
| P2 | 分析工具配置（Google Analytics / Umami） | 可选 |
