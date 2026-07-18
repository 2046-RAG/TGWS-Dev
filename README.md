# TechGuru Network & Data Solutions Website

泰谷网数科技官方网站

> **状态声明**：本表完成度基于源码事实评估（2026-07-19），非 PRD 标记。详见 `MEMORY.md` §1.1 与 `.trae/specs/audit-tgws-gap-optimization/spec.md`。

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
| 语言 | TypeScript | ^5 |
| CMS | Sanity | v3 |
| 数据库 | Supabase | - |
| 邮件 | Resend | ^6.17.1 |
| i18n | next-intl | ^4.13.1 |
| 样式 | Tailwind CSS（components 手写，无 shadcn/ui） | 4.x |
| 测试 | Vitest + Playwright + @axe-core/playwright | - |
| 部署 | Vercel | - |

## 项目结构

```
TGWS/
├── PRD-TechGuru-Website.md     # 设计权威源（22 个章节）
├── AGENTS.md                   # 规则约束源（60 条规则 + 教训记录）
├── MEMORY.md                   # 真实状态源（待办/进度/配置）
├── README.md                   # 项目说明（本文件）
├── PRODUCT.md                  # 产品文案
├── PROJECT-REVIEW-REPORT.md   # 2026-07-12 文件清理报告（已归档）
├── .trae/specs/
│   └── audit-tgws-gap-optimization/
│       ├── spec.md             # 差距评估（2026-07-19）
│       ├── tasks.md            # 任务清单（6 Wave / 26 tasks）
│       └── checklist.md        # 验收检查点
├── docs/modules/               # 11 模块详情
│   ├── INDEX.md
│   └── M01-Home.md ~ M11-Legal.md
├── PRD/                        # PRD v2.0 模块化分割
│   ├── GLOBAL.md + M01-M07 + S07 + S08
└── tgws/                       # Next.js 应用
    ├── src/
    │   ├── app/                # App Router (11 模块 + API)
    │   ├── components/         # 共享组件
    │   ├── hooks/              # 自定义 hooks
    │   ├── lib/               # 工具（含 csrf/rate-limit/config/vendor-colors）
    │   └── messages/          # i18n (en.json + zh.json)
    ├── sanity/schemas/        # Sanity schema
    ├── tests/                  # E2E 测试
    ├── playwright.config.ts
    ├── vitest.config.ts
    └── package.json
```

## 开发进度（基于源码事实）

> 评估方法：4 个并行子代理读取全部 11 个模块源代码，对照 PRD v1.2 / AGENTS.md / Sanity schema / 数据库迁移逐项核实。
> Wave 0-4（26 个 task）已全部完成；Wave 5（文档同步）进行中。

### 全项目加权完成度：约 70%（非 100%）

| 维度 | 完成度 | 说明 |
|------|--------|------|
| M01 Home | 80% | Hero a11y 修复（W0-5），仍含 framer-motion 幽灵依赖 |
| M02 Products | 80% | ProductCard 共享组件抽取（W2-2），canonical 标签已加 |
| M03 Blog | 80% | picsum 移除（W0-2），PortableText 增强完成 |
| M04 Solutions | 75% | GROQ 字段补齐（W0-1），`<meta.icon>` bug 修复 |
| M05 Tickets | 75% | 工单详情页 + 幂等键 + 事务包装（W1-3） |
| M06 Contact | 80% | Odoo 非阻塞（W2-4），ContactPage 死代码清理（W4-6） |
| M07 About | 80% | Sanity 迁移完成（W2-5），3 schema 注册 |
| M08 Compare | 80% | CompareTable 启用 + a11y（W4-1） |
| M09 VMware Alt | 85% | phone CTA + canonical + 厂商色集中（W4-2） |
| M10 Help | 85% | FAQJsonLd + 空状态分场景 + debounce（W4-3） |
| M11 Legal | 80% | last-updated 构建时 + TOC + 打印（W4-4） |
| Auth | 80% | 密码重置完整流程（W1-2），middleware 路由保护 |
| API Routes | 80% | CSRF + rate limit + 文件白名单 + signed URL（W1-1） |
| Hooks | 75% | useRetry/useOptimistic/useOfflineCache 已集成（W2-4） |
| 全局基建 | 90% | sitemap 全覆盖（W0-6），globals.css token 化（W4-8） |
| 测试 | 80% | 295 passing，coverage ≥ 60%，含 a11y（W3-1） |
| 构建配置 | 85% | poweredByHeader / reactStrictMode / lint plugins（W4-7） |

### 实际已实现 ✅

- ✅ 11 个模块页面（Home / Products / Blog / Solutions / Tickets / Contact / About / Compare / VMware Alt / Help / Legal）
- ✅ 多语言 EN/ZH（next-intl，923/923 keys 对齐）
- ✅ Sanity CMS（8 个 schema：products / posts / solutions / faq / partners / teamMember / qualification / timelineEvent）
- ✅ Supabase Auth（Gmail OAuth + email/password + 密码重置完整流程）
- ✅ 工单系统（提交 + 列表 + 详情 + 状态变更 UI + 幂等键 + 事务包装 + audit_log）
- ✅ API 安全（CSRF + rate limit + 文件类型白名单 + signed URL + 字段校验 + 错误格式统一）
- ✅ 联系表单 + Odoo 非阻塞同步 + Resend 邮件
- ✅ SEO（sitemap 全覆盖 + robots.txt + JsonLd 结构化数据 + canonical/alternates）
- ✅ a11y（prefers-reduced-motion + axe-core 扫描 + Breadcrumb a11y + Compare table caption）
- ✅ 暗色模式（自动 + 手动三态 toggle）
- ✅ 测试（Vitest 295/295 + Playwright E2E + a11y 扫描）
- ✅ Vercel 部署 https://www.techguru-it.asia

### 待实现 ⏳

| 项 | 状态 | 依赖 |
|----|------|------|
| DarkModeToggle 设计系统冲突决策 | ⏳ 待用户决策 | 用户确认保留三态 or 删除 |
| Hero 鼠标拖动视频进度是否保留 | ⏳ 待用户决策 | a11y vs 视觉惊艳权衡 |
| CSP nonce 方案（替代 `'unsafe-inline'`） | ⏳ 待用户决策 | 工作量较大 |
| vercel.json China mirror 是否保留 | ⏳ 待用户决策 | 开发者所在地 |
| ProductJsonLd 改 Service schema | ⏳ 待用户决策 | 当前已移除 offers 块 |
| Odoo CRM 真实凭证配置 | ⏳ 待用户配置 | Odoo 账号 |
| 社交媒体账号（WeChat / WhatsApp） | ⏳ 待用户配置 | 账号申请 |
| 分析工具（Google Analytics / Umami） | ⏳ 待用户决策 | 选型 |
| 真实内容填充（更多案例、博客） | ⏳ 待内容运营 | 内容生产 |
| 部署后人工抽查 11 个模块 | ⏳ 待执行 | Wave 5 完成 + 部署 |
| Google Search Console / PageSpeed 验证 | ⏳ 待执行 | 部署 |
| case-studies → blog 重定向删除 | ⏳ 2026-08-18 可执行 | 30 天保留期 |

## 开发命令

```bash
cd tgws
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # 代码检查（ESLint）
npm run typecheck    # 类型检查（TypeScript）
npm run test         # 单元测试 (Vitest, watch 模式)
npm run test:run     # 单元测试 (Vitest, 单次运行)
npm run test:coverage # 单元测试 + 覆盖率报告
npm run test:e2e     # 端到端测试 (Playwright, 本地 build + webServer)
npm run i18n:audit   # i18n 硬编码审计（退出码 0 表示无遗漏）
```

## 测试状态

| 类型 | 当前 | 门槛 | 状态 |
|------|------|------|------|
| 单元测试 | 295 passing | ≥ 60% coverage | ✅ |
| i18n key 对齐 | 923/923 (EN/ZH) | 100% | ✅ |
| TypeScript | 0 error | 0 error | ✅ |
| ESLint | 0 error | 0 error | ✅ |
| E2E (Playwright) | 本地 build | 不污染生产 | ✅ |
| a11y 扫描 | @axe-core | 零 critical | ✅ |

## 多语言

- 英文: `/en/...`
- 繁中: `/zh/...`
- 默认访问 `/` 会跳转到 `/en`
- 全部用户可见文案走 i18n（`messages/{en,zh}.json`）
- 多语言内容管理走 Sanity（teamMember / qualification / timelineEvent 等）

## 部署

**已上线**: https://www.techguru-it.asia

- Vercel 项目: prj_LHKlb8B4Q7eUtBri3zkeSz3vK9Mu
- 推送代码到 main 分支会自动部署
- 手动部署命令：`npx vercel --prod --yes`（仅在用户明确批准后执行，AGENTS.md #24）

## 文档导航

| 文档 | 用途 |
|------|------|
| `MEMORY.md` | 真实状态源（待办 / 进度 / 配置）— 改动后先看这里 |
| `AGENTS.md` | 规则约束源（60 条规则 + 教训记录）— 开发前必读 |
| `PRD-TechGuru-Website.md` | 设计权威源（22 章节）— 功能需求追溯 |
| `docs/modules/INDEX.md` | 11 模块索引 |
| `docs/modules/M01-M11.md` | 各模块详情 |
| `.trae/specs/audit-tgws-gap-optimization/` | 2026-07-19 差距评估 + 任务清单 + 验收点 |
| `tgws/DESIGN.md` | 设计系统（色彩 / 字体 / 动画 / 响应式） |
| `tgws/COMPONENTS.md` | 组件清单 / props / 模式 |
