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

**测试状态**: Vitest 68 测试文件全绿 ✅ | Playwright 功能测试套件（6个spec文件，见 tgws/tests/functional/）
**代码覆盖率**: 74.9%（2026-08-02，超过 70% 目标；此前 62-73% 波动为 vitest 并发 worker OOM 假象，已用 singleFork 修复）

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

完整待办见 [TODO.md](TODO.md)。当前真实剩余：

| 优先级 | 任务 | 状态 |
|--------|------|------|
| P1 | 测试覆盖率 15.6% → 70% | ✅ 已完成 74.9%（TODO-005） |
| P1 | 仓库治理（已清理 gh.msi/tmp-query*/generate_report + 2 死代码文件） | ✅ 已完成（TODO-019） |
| P1 | 工单/线索提交失败的用户反馈 + error.tsx 边界 | ✅ 已完成（TODO-022） |
| P2 | Help Center 内容（FAQ 20 条，走 i18n 架构） | ✅ 已完成（TODO-028） |
| P2 | Umami 分析已接入（NEXT_PUBLIC_UMAMI_WEBSITE_ID） | ✅ 已完成（TODO-026） |
| P2 | Odoo CRM 凭证（.env.local 占位符） | 待用户填写 |
