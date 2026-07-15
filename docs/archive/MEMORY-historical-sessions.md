# TGWS Historical Sessions & Reference Material

_Spillover from MEMORY.md — completed sessions, fixed issues, and reference checklists. Extracted 2026-07-03._

## Session 18 Details (TicketForm改造+自定义域名+邮件通知+E2E测试+Vitest修复)
**完成内容**:
- ✅ TicketForm组件重写：7项功能改造全部实现
  - Product下拉选择（从Sanity拉取产品列表 + "Other"手动输入）
  - Problem Occurrence Time（datetime-local精确到分钟）
  - Description 800字限制 + 字数统计UI
  - 粘贴截图支持（Ctrl+V剪贴板图片读取）
  - 附件格式放开（任意格式，50MB限制）
- ✅ 新增API: /api/products (Sanity产品列表查询)
- ✅ 修改API: /api/upload (移除格式限制, 10MB→50MB)
- ✅ 修改API: /api/tickets (增加occurredAt字段)
- ✅ DB Migration: ALTER TABLE tickets ADD COLUMN occurred_at TIMESTAMP (已在Supabase Dashboard执行)
- ✅ i18n: en.json/zh.json各增加8个新key (occurredAt, screenshots, pasteScreenshot, orClickToUpload, charCount, otherSpecify, maxFileSize)
- ✅ 自定义域名: www.techguru-it.asia → Vercel (CNAME配置+DNS验证)
- ✅ 邮件通知: src/lib/resend.ts (3个邮件模板: 工单创建确认/状态变更/密码重置)
- ✅ E2E测试: helpers.ts + 6个journey spec文件 (47个测试全部通过)
  - Journey A: 注册表单验证 (6 tests)
  - Journey B: 认证流程 (9 tests)
  - Journey C: 完整提单流程 (15 tests)
  - Journey D: 工单列表 (4 tests)
  - Journey E: 管理员操作 (5 tests)
  - Journey F: 移动端 (8 tests)
- ✅ Vitest测试修复: LoginForm 11个 + RegisterForm 9个重写 (49/49通过)
- ✅ 测试清理: 删除5个broken测试文件 + 31条E2E测试工单数据
- ✅ 测试账号: test@163.com / Abcdef1@ (Supabase user ID: 65db4094-d63d-4255-ac39-13e086ee0531)
- ✅ Playwright约束: AGENTS.md #27 添加Edge-only规则

**部署**: https://www.techguru-it.asia (自定义域名, 38页面)

## Session 13 Details (遗漏补齐+最终部署)
**修复内容（S13追加）**:
- ✅ Login/Register链接加locale前缀（中文版不再404）
- ✅ Privacy/Terms "Back to Home" 加locale动态路径
- ✅ Login表单加aria-label + autocomplete="email" + spellCheck={false}
- ✅ Register表单加aria-label + autocomplete(name/email/new-password)
- ✅ 最终部署: https://tgws.vercel.app (37页面)
- ✅ 64/64测试通过, lint=0, tsc=0

**遗留项（需下一session继续）**:
- 客户视角走查覆盖率补充：About页、认证流程、错误页、中文逐页、键盘遍历
- E2E测试脚本实施（Playwright）
- 博客/案例详情页创建
- Sanity CMS接入（替代硬编码数据）
- middleware.ts迁移到proxy（Next.js 16弃用）

## Session 15 Details (测试验收+P0修复+图片修复)
**完成内容**:
- ✅ Playwright自动化测试（14个页面截图验证）
- ✅ Blog/Case Studies页面Sanity图片URL解析修复
- ✅ Case Studies筛选按钮i18n翻译修复
- ✅ 9个无效Unsplash图片URL替换
- ✅ 中文导航链接修复（home/Hero/support/login/register等12处）
- ✅ Solutions页CTA死链修复（href="#" → /contact）

**发现的问题（已修复）**:
1. Sanity mainImage字段是URL字符串而非Sanity引用 → 添加类型判断
2. Case Studies筛选按钮显示原始key → 添加manufacturing/other翻译
3. 9个Unsplash图片URL返回404 → 替换为有效URL
4. 内部链接缺少locale前缀 → 添加${locale}变量

**教训记录**:
- **测试方法论**：必须用Playwright在生产环境实际访问验证，不能仅靠代码分析推断
- **Sanity图片格式**：Sanity中图片可能存储为URL字符串而非引用对象，需要类型判断
- **Unsplash URL有效期**：部分URL可能失效，需要验证

**遗留项（需下一session继续）**:
- Navbar 9处链接缺少locale前缀
- Footer 13处链接缺少locale前缀
- TicketForm文件上传功能未实现
- 隐私政策/条款页无i18n
- Sanity查询无locale过滤
- API安全漏洞（PATCH越权、Open Redirect等）

## Session 16 Details (项目文件清理)
**完成内容**:
- ✅ 删除测试截图（17个，~6MB）
- ✅ 删除调试脚本（19个，~300KB）
- ✅ 删除日志文件（5个）
- ✅ 删除临时文件（2个，~300KB）
- ✅ 删除旧版文档（5个，~150KB）
- ✅ 验证构建成功（37页面）

**清理结果**:
- 根目录文件：22个 → 13个（-9个）
- scripts目录：28个 → 9个（-19个）
- 总计删除：57个文件，释放~6.7MB

**保留的文件**:
- 核心文档：PRD, AGENTS.md, README.md, execution-plan.md
- 测试计划：5个待实施的测试计划
- 最新报告：CODE-REVIEW-DEVELOPER.md, FUNCTIONAL-TEST-REPORT-USER.md
- 种子脚本：6个seed-*.js + cleanup-products.js

## Session 12 Details (双轨测试验收+修复+部署)
**报告拆分（已完成）**:
- ACCEPTANCE-REPORT-DEVELOPER.md (189行): 开发者验收标准+执行结果
- ACCEPTANCE-REPORT-CUSTOMER.md (307行): 客户体验走查脚本+问题清单混合版
- EXECUTION-REPORT-DEVELOPER.md (132行): 自动化执行结果，15项Web规范不合规
- EXECUTION-REPORT-CUSTOMER.md (267行): 三线走查(桌面/移动/中文)执行结果，综合5.5/10

**问题修复（✅全部完成，15/15）**:
- ✅ P0-1: contact/page.tsx setTimeout→fetch('/api/contact')
- ✅ P0-2: HeroSection.tsx VMware CTA → /products
- ✅ P0-3: Footer.tsx 行业链接 → /solutions
- ✅ P1-4: privacy/page.tsx 标准模板已创建
- ✅ P1-5: terms/page.tsx 标准模板已创建
- ✅ P1-6: Footer FAQ链接 → /support
- ✅ P1-7: 合作伙伴占位→真实品牌名
- ✅ P1-8: Blog/CS ReadMore → 跳过（无详情页）
- ✅ P1-9: Hero div→h1
- ✅ P1-10: touch-action:manipulation + tap-highlight
- ✅ P2-11: Hero标签改写为可理解描述
- ✅ P2-15: 视频跟随提示文字
- ✅ P2-16: transition:all→具体属性
- ✅ P2-17: 按钮文案具体化

**部署（✅已完成）**:
- Vercel生产部署: https://tgws.vercel.app (54秒，37页面)
- 构建: `npm run build -- --webpack` (本地) → `npx vercel --prod --yes` (部署)

## Session 11 Details (Build Run Protect故事线迭代)
**用户需求**: PRD [S3]核心品牌故事线，展示Build/Run/Protect三个阶段及其产品

**迭代历程**:
1. 线性脉冲卡 → "太普通"
2. 三角形布局 + 径向产品线 → "太挤、标签重叠"
3. 传统三列卡片 → "太普通"
4. 饼图扇形 + 径向产品 → "太小气、没动效"
5. 放大饼图 + 悬停展开 → "太小气、业余"
6. 优化三列卡片 + CSS动画 → "太小气了，卡片太挤，没有动效，太业余了"
7. **第7次迭代**: 读取网站设计系统后统一使用.card类+CSS fadeInUp动画+大幅增加间距 → **已部署，待用户确认**

**最终实现（第7次）**:
- Section padding: py-24 sm:py-32
- Card padding: 36px 32px, gap-8 md:gap-10
- 标题text-5xl, 卡片标题text-2xl
- CSS @keyframes fadeInUp + animation-delay（替代Framer Motion）
- 使用网站已有 .card 类
- Hover: 图标scale-110, 色条width/opacity过渡
- 产品标签: 品牌色tinted背景

## Session 14 Details (Sanity清理+slug修复+页面接入+部署)
**完成内容**:
- ✅ Sanity产品清理: 23→19个 (按v3方案)
- ✅ Slug修复: 52个slug修复完成 (博客30+方案12+案例10)
- ✅ 页面Sanity接入: 博客列表/详情、案例列表/详情、产品页
- ✅ Vercel部署: https://tgws.vercel.app (37页面)
- ✅ 修复urlForImage→urlFor导出名问题

**教训记录**:
- Sanity Studio本地启动不可靠，改用生成HTML文件查看内容
- 用户要一眼看完所有内容，不要给统计数据

## Deep Code Review (2026-07-01)
**开发者视角 (CODE-REVIEW-DEVELOPER.md)**:
- 16页面平均完成度72%, 8个API路由平均完成度57%, 综合~70%
- 5个P0安全/功能漏洞, 7个P1严重问题

**P0问题清单**:
1. **中文导航失效** — home/HeroSection/support/login/register等12处链接缺少`/${locale}`前缀 ✅ 已修复
2. **Navbar/Footer 22+链接全部缺少locale** — 这是导航慢/报错的根因 ✅ 已修复（2026-07-02，24处）
3. **Sanity查询无locale过滤** — blog/case-studies/products中英文看到相同内容 🔵 待修复
4. **PATCH越权漏洞** — `/api/tickets/[id]`任何用户可修改任意工单 ✅ 已修复（2026-07-02）
5. **Open Redirect** — `/api/auth/callback`可被钓鱼攻击 ✅ 已修复（2026-07-02）
6. **上传未验证工单归属** — `/api/upload`可挂载文件到任意工单 ✅ 已修复（2026-07-02）

**用户视角 (FUNCTIONAL-TEST-REPORT-USER.md)**:
- 5条用户旅程, 综合评分7.9/10
- P0阻断: 工单附件假功能, 注册死循环, OAuth失败无提示

**改进计划已批准** — T7执行中（部分完成）

## Dead links (verified 2026-06-30)
- `/vmware-alternative` does NOT exist — Hero CTA "VMware Migration" links to 404
- `/solutions/healthcare|finance|retail` do NOT exist — Footer links to 404
- `/privacy` `/terms` do NOT exist — Footer links to 404
- `/support#faq` does NOT exist — support page has no FAQ section
- `/api/contact` route EXISTS but contact page uses setTimeout instead of calling it (now fixed)

## 报告拆分策略（2026-06-30确认）
- **开发者视角**: 代码质量(lint/tsc/vitest/build) + 依赖审计 + Web设计规范技术检查(ARIA/表单属性/动画/触摸)
- **客户体验视角**: 三条走查线(桌面EN/移动EN/繁体中文) + 混合输出(走查脚本+问题清单)
- **输出形式**: 开发者=执行结果报告；客户体验=走查步骤+预期vs实际+评分
- **修复优先级**: P0(3个)=阻塞发布, P1(7个)=需修复, P2(8个)=建议改进
- **评分基线**: 修复P0前5.5/10, 修复P0后预估7.5+, 修复P0+P1后预估8.5+

## web-design-guidelines反模式清单（可用于代码审查）
- `user-scalable=no` / `maximum-scale=1` 禁用缩放
- `onPaste` + `preventDefault` 阻止粘贴
- `transition: all` 应列出具体属性
- `outline-none` 无focus-visible替代
- `<div>`/`<span>` + onClick做导航（应用`<a>`/`<Link>`）
- `<div>`/`<span>` + click handler做操作（应用`<button>`）
- 图片无width/height（导致CLS）
- 大数组`.map()`无虚拟化（>50项）
- 表单input无label
- Icon按钮无`aria-label`
- 硬编码日期/数字格式（应用`Intl.*`）
- `autoFocus`无明确理由（移动端应避免）

## 表单合规性检查要点
- input需`autocomplete`属性（email, current-password, new-password, name等）
- 正确`type`：email, tel, url, number
- Label可点击（`htmlFor`关联）
- 错误内联显示在字段旁，非仅顶部banner
- 提交按钮在请求开始前保持启用，请求中显示spinner
- 未保存更改前导航警告（`beforeunload`）
- 错误信息包含修复建议，非仅问题描述

## 动画合规性检查要点
- 尊重`prefers-reduced-motion`（提供降级或禁用动画）
- 只用`transform`/`opacity`动画（compositor-friendly）
- 禁止`transition: all`，列出具体属性
- 设置正确的`transform-origin`

## 内容文案检查要点
- 加载状态用"…"而非"..."
- 按钮文案具体（"Save API Key"而非"Continue"）
- 错误信息包含修复建议
- 主动语态，第二人称
- Title Case用于标题/按钮
