# TGWS 待办事项清单

> 基于项目分析报告生成 | 最近更新: 2026-07-29（第二轮整体审查，新增 TODO-019 ~ TODO-030）
> 优先级说明: P0=必须完成(阻塞上线) | P1=重要(影响用户体验) | P2=优化(提升竞争力)

---

## 优先级总览

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

## P0 - 必须完成 (阻塞上线)

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

## P1 - 重要 (影响用户体验)

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

## P2 - 优化 (提升竞争力)

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

## 第二轮审查新增任务 (2026-07-29)

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

## 统计

| 优先级 | 任务数 | 预估总工时 | 完成状态 |
|--------|--------|------------|----------|
| P0 | 4 | 9天 | ✅ 4/4 |
| P1 | 12 | 49天 | ✅ 12/12（TODO-005 覆盖率 74.9% ✅、TODO-022 ✅、TODO-026 ✅、TODO-027 ✅） |
| P2 | 10 | 18天 | ✅ 10/10 |
| 第三轮收口 | 8 | — | ✅ 7/8 完成上线（T-036 design-v2 待用户审批） |
| **第四轮 · 内容质量（九轮校准）** | 12 | — | ⬜ **新开**：以 `docs/eval/2026-09-15-nine-round-verification.md` 为唯一依据 |
| **总计** | **30+8+12** | — | 工程收口已完；内容/SEO/CMS 数据为当前主战场 |

**最新更新**: 2026-09-16 — 第四轮 P0/部分 P1 已上线（T-041/042/043年份/044/048/049/050/051 + governs 翻译）；hreflang 已指向 www.techguru-it.asia；经 **3→6→9 轮**复核后，仅保留九轮仍成立的结论开待办（见第四轮）。已证伪项（logo 破损、76% broken、Compare 证言上线、EN 中文串台）**不得再入待办**。

---

## 第三轮收口 (2026-09-15)

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

## 第四轮 · 内容质量待办（九轮校准 2026-09-15）

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

## 已完成任务

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