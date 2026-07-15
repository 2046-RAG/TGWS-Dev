# MEMORY Rules Spillover
_Extracted from MEMORY.md ## Rules to stay under token budget. Core operational rules remain in main file; these are historical evaluation methodology, completed task details, tool-specific findings, and one-off technical notes._

## Evaluation Methodology (S27-S29)
- **Solutions页分析教训**: 之前对Solutions页的评价是基于手动阅读代码，没调用工具。正确做法：impeccable子命令评估UI/UX + Sanity脚本查询数据 [2026-07-07]
- **Sanity MCP对本项目无价值**: Token+脚本能力严格超过MCP。MCP只是面向Agent的便利层，已有token和脚本不需要MCP [2026-07-07]
- **三任务执行顺序**: 内容质量评估(任务1) → 前后端一致性(任务2) → UI/UX+设计适配(任务3)，串行执行 [2026-07-07]
- **Sanity技能完整性**: 需要sanity-best-practices + content-modeling-best-practices + seo-aeo-best-practices三个技能组合 [2026-07-06]
- **content-quality-auditor不存在**: 来源`aaron-he-zhu/seo-geo-claude-skills@content-quality-auditor`，安装失败(无有效SKILL.md)，已放弃 [2026-07-06]
- **Sanity MCP vs Skill区别**: MCP是工具(远程，可读写数据)，Skill是知识(本地，只读规范)，两者需配合使用 [2026-07-06]
- **任务2维度扩展**: 从5个维度扩展到17个(一致性/真实性/合理性/质量度/可落地性+吸睛度/定位关联性/语气适当性/差异化/信任信号/CTA有效性/信息密度/用户旅程/行业相关性/多语言/新鲜度/SEO) [2026-07-06]
- **任务3不只是数据匹配**: 还要检查设计是否适配内容，是否存在"一刀切"问题(不同内容类型是否有差异化UI/UX设计) [2026-07-06]
- **真实性和可落地性需要交互确认**: 不做单方面判断，而是"发现→提问→确认"的循环，用户最了解真实情况 [2026-07-06]
- **DevOps双重含义**: DevOps融合包含两部分——(1)流程分工(角色分离、交接节点、反馈闭环) (2)代码健康自责(修完自己测、是屎山就迭代、通过才交付) [2026-07-07]
- **一维度一工具原则**: 每个评估维度只分配一个主工具，不允许两个工具评同一件事，避免重复评分和冲突 [2026-07-07]
- **Skill对比结论**: content-modeling vs sanity互补(架构vs实现)；seo-aeo vs writing互补(可发现性vs可读性)；design-taste vs impeccable互补(反模板细节vs UX整体)；critique vs audit互补(设计好坏vs技术对错) [2026-07-07]

## Tool Paths & Dead Ends
- **impeccable脚本路径**: `C:\Users\Test\.agents\skills\impeccable\scripts\`，不是`.opencode/skills/impeccable/scripts/` [2026-07-06]
- **impeccable需要PRODUCT.md**: 所有impeccable命令都要求PROJECT.md存在，context.mjs返回NO_PRODUCT_MD时会阻塞 [2026-07-06]
- **UI/UX技能分层使用**: impeccable作为主力，其他技能按需加载，避免同时使用导致冲突 [2026-07-06]
- **em-dash实际数量85处**: 评估时报告48处，实际搜索发现78处i18n + 7处源文件 = 85处。i18n文件是重灾区(92%) [2026-07-08]

## Historical Technical Findings
- **编辑相似JSON结构时n-gram匹配敏感度过高**: 直接执行不展示过程可减少重复检测触发 [2026-07-05]
- **网络产品分类**: 路由器/交换机/WiFi属于Run（承载基础设施），不是Protect。SD-WAN是混合品类可归Protect [2026-07-07]
- **24/7措辞策略**: 保留vendor产品描述中的24/7（MDR SOC确实是24/7），只修改公司级承诺 [2026-07-07]
- **Sanity SVG上传不可行**: multipart上传SVG到Sanity后asset引用损坏，需用PNG/JPG格式 [2026-07-07]
- **Solutions页i18n结构**: en.json的solutions.industries需要solutions[]和products[]数组，不是infrastructureNeeds/aiSolutions字符串 [2026-07-07]
- **zh.json双em-dash**: 中文i18n使用`——`（双em-dash），替换时需单独处理 [2026-07-08]
- **scroll-reveal白屏的完整链条**: CSS `.js-loaded .scroll-reveal { opacity: 0 }` + inline脚本只在首次加载运行 + 客户端导航不重新运行 → 新页面元素永远opacity:0。ScrollReveal组件是客户端导航的关键依赖，不能删除 [2026-07-08]
- **嵌套html标签是Next.js App Router常见坑**: 根layout和locale layout都输出`<html><body>`导致嵌套。SSR容错渲染正常，客户端hydration崩溃白屏。检查方法：webfetch看HTML是否有多个`<html`标签 [2026-07-08]
- **Sanity图片上传PNG/JPG可行，SVG不可行**: multipart上传SVG到Sanity后asset引用损坏，PNG/JPG正常。批量上传脚本需处理https重定向（picsum.photos会302） [2026-07-08]
- **Case Studies页面遗漏教训**: 评估时按维度打分（"信息密度2.5/4"）掩盖了具体bug（空指标标签、行业名英文、URL不同步、无分页）。维度评估≠实现审查，两者都要做 [2026-07-08]
- **语言不一致是Sanity数据层问题**: 11篇案例标题含中文匿名文字（"某国际保险集团 Achieves..."），36篇标题无titleZh字段。根因：anonymize脚本把中文拼进英文标题+Sanity schema缺中文字段 [2026-07-08]
- **server component不能用useTranslations**: page.tsx是server component，不能调用hook。Breadcrumb label和metadata需要其他方式处理i18n（props传递或generateMetadata） [2026-07-08]
- **error boundary的locale获取**: error.tsx在客户端运行，不能用useParams。需用window.location.pathname提取locale，或固定/en fallback [2026-07-08]
- **三支柱定义不能凭记忆**: Build=AI应用构建，Run=基础设施承载，Protect=安全防护。Build.Run.Protect.是客户IT旅程，AI子故事线是Build的一部分。介绍项目架构时必须查i18n源文件验证，不能凭记忆 [2026-07-08]
- **CTA/卡片是设计系统孤岛**: globals.css定义了.btn-primary和.card类，但全站仅首页使用，其他页面用内联Tailwind复制品。统一策略：新增变体类(.card-compact)而非手动内联 [2026-07-08]
- **class-based暗色模式优于media query**: 用户可手动切换(Light/Dark/System三态)，需suppressHydrationWarning+内联脚本防SSR闪烁 [2026-07-08]
- **暗色模式切换按钮位置**: 放在Navbar紧邻LanguageSwitcher处，用户习惯位置 [2026-07-08]
- **面包屑导航策略**: 所有子页面统一添加Breadcrumb组件，但support(dashboard布局)例外 [2026-07-08]
- **CookieConsent需ARIA角色**: WCAG 2.1要求可感知UI组件有role=dialog+aria-label [2026-07-08]
- **产品tab URL同步**: useSearchParams+router.replace实现tab状态URL同步，支持深链接和浏览器前进/后退 [2026-07-08]

## Git & Deployment (Historical)
- **GitHub网络连接不稳定(中国大陆)**: git clone/push可能因Connection reset失败。HTTPS port 443被阻断，SSH需先配置host key。持续失败需用户手动push或使用VPN。**但gh CLI可用** — `gh auth status`成功(keyring auth)，gh可能使用不同网络路径(GitHub API端点/OS代理)，push时优先尝试gh credential helper注入token [2026-07-09]
- **push失败先查仓库是否存在**: `Repository not found`错误说明仓库不存在，不是网络问题。先用`gh repo create`创建仓库再push [2026-07-09]
- **git push前必须确认**: 推送是影响远程仓库的可见操作，必须先问用户确认，不能直接执行 [2026-07-09]

## Session & Workflow Management
- **审批通过前不许实施**: 用户要求整理计划必须先提交审批，通过后才能执行 [2026-07-09]
- **上下文污染处理**: 对话过长时应主动拆分session，用task工具追踪进度，避免跳步执行。新session应从task工具创建任务树开始 [2026-07-08]
- **重复检测处理规则**: 系统提示"重复检测"时，禁止用不同措辞重复相同内容。直接跳过该部分，继续下一个话题 [2026-07-05]
- **功能任务自动分解**: 用户规划功能添加/修改时，自动进入任务分解：(1)目标 (2)前置依赖 (3)子任务列表(文件/改动点/验证) (4)执行顺序，直到无可再分 [2026-07-09]

## Evaluation Tool Attribution
- **评估维度必须记录工具归属**: 每个评估维度完成后，必须在checkpoint中记录"维度X → 工具Y → 评分/结论Z"，确保可追溯 [2026-07-08]
- **维度级评估会漏掉实现级bug**: 评估时必须按页面逐项检查具体实现，不能只打维度分 [2026-07-08]

## Download & Media Tasks
- **下载/采集任务不要人为限制数量**: `slice(0,N)`或"先下3个试试"会遗漏大量候选。用户期望看到全部候选后再选择。应下载所有找到的候选项 [2026-07-10]
- **Playwright子代理会卡在权限请求**: 子代理执行Playwright脚本时，每个网络请求都可能触发权限确认，导致卡死。批量下载任务必须在主代理中用Node.js fetch直接执行，禁止用子代理运行Playwright [2026-07-10]
- **批量下载用Node.js fetch，不用Playwright**: Playwright需要浏览器、内存占用高、每个请求触发权限确认。直接用`fetch(url)`+`Buffer.from()`下载文件，简单高效 [2026-07-10]

## i18n Historical
- **Static metadata无法i18n**: `export const metadata`是静态的，zh路由下仍显示英文。locale-aware页面必须用`export async function generateMetadata({ params })` + `getTranslations()` [2026-07-09]
