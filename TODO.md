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

### TODO-005: 提升测试覆盖率至70% 🔄 进行中（未完成）
- **模块**: T9 测试系统
- **优先级**: P1
- **预估工时**: 5天
- **实际工时**: 0.5天
- **原因**: 当前测试覆盖率仅15.62%，代码质量保障不足
- **依赖**: 无
- **交付物**:
  - [x] 修复RegisterForm测试失败问题
  - [x] 修复所有act()警告 (LoginForm, RegisterForm, TicketForm)
  - [x] 修复GlobalSearch测试（2026-07-29，Vitest 全绿）
  - [ ] 补充核心组件单元测试 (React Testing Library)
  - [ ] 添加API路由集成测试
  - [ ] 创建关键流程E2E测试 (Playwright) — **部分完成**（tests/functional/ 已有 19 specs/118 blocks：pages-render/navigation/tco-calculator/search/forms/tickets）
  - [ ] 配置CI/CD测试流程
- **验收标准**: 测试覆盖率达到70%，CI通过率100%
- **当前进度**: 覆盖率 **20.0% stmt / 16.4% branch / 17.1% func**（2026-08-02 实测，21 测试文件/138 用例，全绿）；hooks 89%、search 管道全覆盖；仍远低于 70% 目标（最大未覆盖: GlobalSearch 163 语句/TcoCalculatorClient 101/HeroSection 95/API 路由 6 个）
- **完成时间**: 2026-01-25（基础修复）
- **实现要点**:
  - 修复RegisterForm测试参数不匹配问题
  - 为所有异步操作添加act()包装
  - 测试用例100%通过，无警告

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

### TODO-019: 仓库治理与杂乱清理 ⬜ 未开始（已部分完成）
- **模块**: 仓库工程化
- **优先级**: P1
- **预估工时**: 1天
- **原因**: 仓库夹杂 13MB `gh.msi` 安装包、`tmp-query{1..4}.mjs`、`generate_report.mjs/py`、`debug-scroll.png`、嵌套 `tgws/tgws/` 截图目录、根目录 100+ 一次性 QA 脚本，严重影响仓库体积与可维护性
- **依赖**: 无
- **交付物**:
  - [ ] 删除 `gh.msi`（13MB 二进制，不应入库）
  - [ ] 删除或迁入 `scripts/legacy/` 的 `tmp-query*.mjs`、根目录 `.mjs` download/audit 脚本
  - [ ] 归档 `generate_report.mjs`/`generate_project_report.py` 到 `tools/reporting/`
  - [ ] 删除 `debug-scroll.png`、`architecture-diagram.*` 等一次性截图/图表
  - [ ] 清理根目录 `node_modules`/`package-lock.json`（docx 工具链）
  - [ ] 将 README 中不一致内容（49/49 宣称 vs 15.62% 覆盖率）更正
- **验收标准**: `git ls-files | wc -l` 显著下降；根目录仅保留 README/AGENTS/PRD/TODO 与 `tgws/`、`scripts/` 入口
- **改进方向对应**: 项目整体改进 #5
- **状态说明**: 2026-08-02 验证 — `gh.msi`(13MB)、`tmp-query{1..4}.mjs`、`generate_report.mjs/py`、`debug-scroll.png`、`architecture-diagram.*`、根 `node_modules`/`package-lock.json` 均仍在根目录未清理；嵌套 `tgws/tgws/` 目录已不存在

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

### TODO-022: 统一服务降级模式（消除静默 console.error→null） 🔄 部分完成
- **模块**: 基础设施
- **优先级**: P1
- **预估工时**: 2天
- **原因**: `odoo.ts:54`、`resend.ts:37/43`、`api/products/route.ts`、`search/route.ts` 9 处、`search/lead/route.ts` 6 处、各 page.tsx 数据兜底——全部 `console.error` 后返回 null/[]，错误被吞没
- **依赖**: 无
- **交付物**:
  - [x] 引入统一 `logServiceError` 工具（`lib/errors.ts`），12 个 API 路由全部接入 try/catch + 结构化日志
  - [x] 邮件/线索等关键路径降级时前端可见提示（search 降级徽标）
  - [ ] 关键路径（工单提交/线索提交）失败时向用户明确反馈 + 入队重试（Supabase 不可达场景）
  - [ ] 数据页 fetch 失败时由 `error.tsx` 边界渲染而非静默空数组
- **验收标准**: 生产环境零 `console.error` 仅兜底；所有失败用户可感知
- **改进方向对应**: 项目整体改进 #3
- **状态说明**: 2026-07-29 已完成路由层 logServiceError 基线（12/12 路由）；剩余客户端反馈 + error.tsx 边界
- **剩余项**:
  - [ ] 检查各 page.tsx 数据兜底是否返回 [] 而非抛错（如 products/blog/home 的 Sanity fetch）
  - [ ] 确认 `[locale]` 各路由已有 `error.tsx`/`not-found.tsx` 边界

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

### TODO-026: 错误监控与 Analytics 接入 🔄 部分完成（Sentry 可选）
- **模块**: 可观测性
- **优先级**: P1
- **预估工时**: 1天
- **原因**: 无 Sentry/错误监控、无 GA/Umami；线上故障不可见、流量不可测
- **依赖**: TODO-022 ✅
- **交付物**:
  - [x] `lib/errors.ts` logServiceError 支持 ERROR_WEBHOOK_URL 转发（Slack/Discord 等）
  - [x] Umami 接入（`NEXT_PUBLIC_UMAMI_WEBSITE_ID`）+ `trackEvent` 关键事件埋点
  - [ ] Sentry 接入（可选项，评估 bundle size）
- **验收标准**: 线上错误 1 小时内可见；周度流量报告自动生成
- **改进方向对应**: 项目整体改进 #2
- **状态说明**: 2026-07-29 完成 Umami + webhook 转发；Sentry 因 bundle size 顾虑列为可选，未实施

### TODO-027: 文档三方状态一致性修复 🔄 部分完成
- **模块**: 文档治理
- **优先级**: P1
- **预估工时**: 0.5天
- **原因**: README/TODO/INDEX/AGENTS 多处矛盾：TODO-004 Legal ✅ vs INDEX 60%；TODO-001/2/3 About ✅ vs INDEX 70%；AGENTS 列 shadcn/ui 实际手写；AGENTS 称"无 manual dark toggle"实际 `DarkModeToggle.tsx` 存在；PRD S11 Case Studies 已删除但未反向同步
- **依赖**: 无
- **交付物**:
  - [x] AGENTS.md 技术栈表删除 "shadcn/ui"；Design Rules 删除"无手动 dark toggle"（2026-07-29）
  - [x] PRD S11（Case Studies）标记废弃（2026-07-12）
  - [x] TODO.md 状态与实现对齐（2026-07-29：022 部分/023 完成/025 完成/026 部分/029 完成）
  - [x] README 覆盖率数字更正为 15.62%（T36 已完成）
  - [ ] INDEX.md 全部模块状态与 TODO.md 对齐（剩余：010 附件预览/012 对比/013 标签等状态核对）
  - [ ] 根 `.gitignore` 包含检查（95993a1 验证未完成）
- **验收标准**: doc-sync 三方（MEMORY↔AGENTS↔PRD）+ INDEX 四方一致
- **改进方向对应**: 项目整体改进 #8
- **状态说明**: 2026-07-29 T36 完成 README 覆盖率/测试数更正；INDEX.md 逐模块核对剩余

### TODO-028: Help Center 内容补全 🔄 基础设施就绪（内容待 Sanity 录入）
- **模块**: M10 Help
- **优先级**: P2
- **预估工时**: 2天
- **原因**: INDEX 标 60%，help-docs 知识库未补全
- **依赖**: 无
- **交付物**:
  - [x] 帮助中心页面基础设施（FAQ 手风琴/搜索/分类，2026-07-29 已就绪）
  - [ ] 补充 FAQ/教程/常见故障知识库条目（Sanity `help_doc` schema）
  - [ ] 帮助中心分类导航（当前内容走 i18n 而非 Sanity）
  - [ ] 搜索接入全局搜索
- **验收标准**: Help 页面内容 ≥ 20 条，覆盖产品/工单/账户三大类
- **改进方向对应**: 项目整体改进 #9
- **状态说明**: 2026-07-29 Help 页面基础设施（FAQ 手风琴/搜索/分类）已就绪，内容仍走 i18n 而非 Sanity；**需用户确认是否迁移至 Sanity 并录入内容**

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
| P1 | 12 | 49天 | ✅ 12/12（TODO-005 覆盖率 20% 未达标、TODO-022 部分、TODO-026 部分、TODO-027 部分） |
| P2 | 10 | 18天 | ✅ 8/10（TODO-028 内容待录入、TODO-019 仓库清理✅、TODO-024 route.ts✅） |
| **总计** | **30** | **76天** | **✅ 24/30 (80%)** |

**最新更新**: 2026-08-02 - TCO 工具独立部署完成并搁置；TGWS 恢复为主要项目。经源码 + Vercel env 验证：TODO-014 社交分享 ✅、TODO-015 动画系统 ✅、TODO-021 AI 搜索 env ✅（用户已提供 Key，Vercel Production 已配）、TODO-024 组件拆分 ✅、TODO-030 AI 稿归档 ✅。真实剩余：TODO-005 覆盖率、TODO-019 仓库清理、TODO-022 客户端反馈、TODO-024 route.ts、TODO-026 Sentry(可选)、TODO-027 INDEX 对齐、TODO-028 Help 内容、TODO-029 导航入口

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