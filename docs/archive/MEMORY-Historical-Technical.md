# Historical Technical Knowledge (S27-S42)

Extracted from MEMORY.md Discovered durable knowledge — historical entries from completed sessions, stable decisions, and dead-end learnings. Current focus is Hero AI Neural Core (S45).

## Performance test strategy (S42)
- **Static metrics > dynamic timing**: Dynamic `import()` timing in Vitest varies 200ms-1200ms depending on suite ordering and cold cache. Static file size/count checks are reliable for regression detection.
- **Budget thresholds**: globals.css < 50KB, JSON < 100KB each, component files < 50 count, test files ≥ 10, i18n key completeness (en/zh matching)

## Nav label design (S42→S43进化)
- **S42**: Page title vs nav label decoupling — "Solution Architecture" / "Architecture"
- **S43进化**: 用户否决了Architecture(内容不匹配)。最终选择"Best Practice"(nav)/"Industry Best Practice"(page title)。教训：nav标签必须准确反映页面内容，不能为了短而牺牲准确性
- **Nav视觉重设计**: 14px字号+gap-6+hover下划线+active状态。用户要求"重新美化整个nav"后实施

## T17 super admin (S42)
- **Already resolved**: Website `/en/support/register` page creates Supabase Auth accounts. No separate admin creation needed. User provided email Syed.Ong@techguru-it.asia.

## MiMoCode Session管理 (2026-07-08)
- **新session创建**: `<leader>n`快捷键（TUI内），或关闭终端重启`mimo`
- **新session继承**: MEMORY.md自动继承（Rules/待办/架构决策），session checkpoint/notes/tasks不继承
- **最佳启动方式**: 新session只需读MEMORY.md的Rules和待办，不需要恢复完整历史上下文
- **旧session处理**: 如果MEMORY.md已完整，直接关闭比挂起更干净
- **`/fork`命令存在**: TUI命令面板中有`/fork`（描述"派生会话"）。SDK确认：`POST /session/{id}/fork`，创建新session继承指定消息点之前的完整上下文。适合从分支点开始新实验
- **`/fork` vs `<leader>n`**: `<leader>n`创建全新空白session；`/fork`创建继承上下文的分支session
- **`SessionChildrenAPI`**: `GET /session/{id}/children`查询某session的所有fork子session

## S40 会话经验 (2026-07-09)
- **已完成项验证是必要步骤**: 用户明确要求"检查已标记为完成的部分，防止完成幻觉"。验证发现了3处zh.json简体字残留(换/变/华)，说明"已完成"标记不可信
- **i18n metadata转换模式**: 静态`export const metadata`→动态`generateMetadata` + `getTranslations({locale, namespace})`是Next.js App Router的标准做法。8个页面全部转换成功
- **44px触控: min-width同样重要**: globals.css原来只有min-height，缺少min-width。DarkModeToggle(36px)和TicketForm(32px)的宽度不达标。WCAG 2.5.8要求双向44px
- **ContactPage表单无样式**: 全站唯一没有Tailwind样式的表单，6个元素全部无className。根因：早期快速实现遗留
- **PortableText本地实现足够用**: 不需要@portabletext/react包，本地简易实现(支持block/h2/h3/blockquote/list)已满足需求
- **Skill是三任务框架的正确形态**: 不是MCP(已有脚本)、不是Loop(手动触发)、不是Workflow(串行流程)。Skill定义流程和标准，其他机制是执行工具
- **已完成项自动标记+待办精简**: 验证后及时更新MEMORY.md，移除已完成项，避免待办膨胀
- **用户要求"不需要通用":** 三任务框架只服务TGWS项目，不追求跨项目复用。通用化是后续独立研究任务
- **`checkpoint.fork`配置**: 控制checkpoint writer是否fork父session前缀到writer session（prefix-cache复用），需provider支持cache-breakpoint
- **项目可清理文件**: 4截图+22一次性脚本+构建产物+可选6文档，保留6个长期有用scripts

## Vercel部署经验
- **旧部署不污染当前版本**: 每个部署是独立快照，生产域名始终指向最新部署 [2026-07-07]
- **client组件无法export metadata**: 需创建layout.tsx或用generateMetadata [2026-07-07]
- **测试环境useParams返回null**: 组件使用useParams()会在测试中报错，改用prop传参解决 [2026-07-07]
- **i18n内容比硬编码更可靠**: compare页面从硬编码重写为i18n后内容完整度大幅提升 [2026-07-07]

## Sanity API查询格式 (S43发现)
- **GET格式可用**: `https://{pid}.api.sanity.io/v2021-10-21/data/query/production?query={encoded}` — 正常工作
- **POST格式404**: `https://{pid}.api.sanity.io/v2024-01-01/data/production` 返回 "No dataset given"
- **无需认证的读操作**: Sanity GET查询不需要Authorization头，dataset production公开可读
- **教训**: Sanity脚本优先用GET v2021-10-21格式，不要用POST或更新版API

## Sanity图片上传经验
- **PNG/JPG上传可行**: 通过client.assets.upload('image', buffer, {filename, contentType})上传，SVG不行（asset引用损坏）[2026-07-08]
- **dotenv在ESM中不工作**: .mjs脚本需手动fs.readFileSync+.env.local+regex匹配token [2026-07-08]
- **https不跟随重定向**: picsum.photos返回302，需递归调用https.get(res.headers.location) [2026-07-08]
- **批量上传限速**: Sanity API 25 req/sec，建议150ms间隔避免429 [2026-07-08]

## 厂商产品命名
- **Fortinet产品名**: FortiGate(NGFW)/FortiWeb(WAF)/FortiEDR(EDR)/FortiNDR(NDR)，不是通用名 [2026-07-07]
- **Sangfor Cloud Platform缺失**: TGWS没有列出Sangfor的云平台产品 [2026-07-07]
- **Nutanix未突出**: TGWS通过"HCI"分类间接提及，未用Nutanix品牌名 [2026-07-07]

## 统计数据策略
- **用可验证数据**: 28 Products/19 Partners/6 Solutions/6 Markets，不用虚构数字 [2026-07-07]
- **客户评价替代方案**: 公司成立时间短(2023)，无真实评价，改为展示合作伙伴认证徽章 [2026-07-07]
- **认证厂商**: Sangfor/Fortinet/Nutanix/Ruijie/Huawei/Sundray [2026-07-07]

## 部署策略
- **前端vs Sanity**: i18n+代码改动部署后立即可见；Sanity内容改动需额外步骤写入 [2026-07-07]
- **Vercel旧部署**: 20+个生产部署，不清理（Hobby计划无限部署，无实际收益） [2026-07-07]

## 技能使用策略 (S27)
- **impeccable技能覆盖全面**: 27个子命令覆盖craft/shape/audit/polish/bolder/quieter/distill/harden/animate/colorize/typeset/layout/delight/overdrive/clarify/adapt/optimize/live等，已覆盖其他UI/UX技能80%以上维度
- **UI/UX技能冲突风险**: 同时加载4个UI/UX技能(impeccable/design-taste-frontend/web-design-guidelines/frontend-design)会导致规则冲突和上下文膨胀
- **正确技能使用策略**: 分层使用——impeccable作为主力审计工具，design-taste-frontend仅在需要时按需加载，避免同时使用
- **Sanity技能组合**: sanity-best-practices(12个集成指南+12个主题指南) + content-modeling-best-practices(内容建模原则) + seo-aeo-best-practices(SEO元数据评估)
- **content-modeling-best-practices核心原则**: "内容是数据而非页面"、"单一真相源"、"面向未来"、"以编辑者为中心"
- **Sanity MCP不需要**: Token+脚本能力严格超过MCP，本项目不安装 [2026-07-07]
- **content-quality-auditor不存在**: 来源`aaron-he-zhu/seo-geo-claude-skills@content-quality-auditor`，安装失败(无有效SKILL.md)，已放弃 [2026-07-06]
- **手动阅读代码不能做评价**: 手动阅读源代码只能发现"现象"（如字段名不匹配），不能做出"评价"（如设计质量、内容优劣）。这是Solutions页分析的教训 [2026-07-07]

## 三任务依赖关系 (S27)
- **任务1(UI/UX评估)和任务2(内容质量评估)可并行执行**: 无前后依赖
- **任务3(前后端一致性)必须串行执行**: 需要任务1和任务2的评估结果作为基准
- **任务2要求"两者结合"**: 需要调用Sanity脚本查询原始CMS数据，再对比前端展示
- **任务2维度扩展**: 从5个维度扩展到17个，新增吸睛度/定位关联性/语气适当性/差异化/信任信号/CTA有效性/信息密度/用户旅程/行业相关性/多语言/新鲜度/SEO
- **任务3扩展**: 不只是数据匹配，还要检查设计是否适配内容，是否存在"一刀切"问题
- **交互验证流程**: 真实性和可落地性不做单方面判断，而是"发现→提问→确认"循环

## AI架构恢复 (S26)
- **AI产品线逻辑关系**: AI Adoption(入口) → AIGC/Coding/Liberacy(三选一) → Agent(高级) — 从历史对话中恢复
- **三支柱定义**: Build.Run.Protect.是客户IT旅程（Build=AI应用构建，Run=基础设施承载，Protect=安全防护），AI子故事线是Build的一部分
- **AI功能待实现**: 全站搜索/工单助手/智能表单 — 依赖Cloudflare Workers AI
- **AI管理后台**: 类似53AI Hub的Agent管理界面 — 待设计，无具体方案

## 验证标准改进 (2026-07-08)
- **根因**: lint/typecheck/build/test只检查代码健康，不检查数据值准确性。webfetch验证只检查"页面能加载"，不检查JsonLd/sitemap/robots的具体内容
- **改进**: 修复电话号码/邮箱/域名后，必须grep验证全站一致，不能只靠编译通过
- **任务完成判定**: 代码健康 + 数据准确性，缺一不可

## Double-nested html/body白屏问题 (2026-07-08, 已修复)
- **根因**: `src/app/layout.tsx`(root layout)和`src/app/[locale]/layout.tsx`(locale layout)都输出了`<html>/<body>`标签，导致DOM出现非法嵌套结构
- **表现**: SSR直接访问正常（浏览器容错解析），但客户端路由导航触发React hydration mismatch → 白屏
- **修复执行**: root layout移除`<html>/<body>`，改为`<>{children}</>`Fragment。字体链接/scroll-reveal脚本/back-to-top按钮迁移到locale layout
- **教训**: Next.js App Router中，只有最外层layout应该输出`<html>/<body>`，嵌套layout不能重复输出

## Static metadata blocks locale awareness (S39发现)
- **问题**: `export const metadata: Metadata = {...}`是静态导出，无法根据locale切换内容
- **解决方案**: 改为`export async function generateMetadata({ params })` + `getTranslations({ locale, namespace })` from `next-intl/server`
- **已转换页面**: blog/page.tsx, products/page.tsx, case-studies/page.tsx
- **未转换页面**: home/page.tsx (static metadata), 4个layout.tsx (about/contact/help/solutions — 也是static metadata)
- **影响**: zh路由下的页面metadata描述仍然是英文，SEO和社交分享显示错误语言

## zh.json残留简体字排查经验 (S39)
- **简单字符扫描误报多**: 很多"简体"字符(面/门/头/机等)在繁体中文中也使用，需要区分"共用字"和"真正简体字"
- **真正需修复的**: 换→換, 变→變, 华→華 (这3个字的简体和繁体形态不同)
- **共用字不需要修复**: 面/门/头/机/时/体等在繁体中文中正常使用

## 44px触控目标审计 (S39)
- **globals.css原来只有min-height**: 移动端触控规则`min-height: 44px`但缺少`min-width: 44px`，导致窄按钮(DarkModeToggle 36px, TicketForm remove 32px)宽度不达标
- **DarkModeToggle.tsx 36x36px**: `w-9 h-9`改为`w-11 h-11`(44px)，placeholder div同步修改
- **TicketForm.tsx图片删除按钮32px**: `w-8 h-8`改为`w-11 h-11`(44px)，hover触发不影响布局
- **ContactPage.tsx表单无样式**: 5个input+submit按钮零className，渲染为浏览器默认样式。添加Tailwind类与其他表单一致:bg-gray-50/border/rounded-lg/py-3/focus:border-[#00D4FF]
- **其他页面均已达标**: CaseStudiesList/BlogList/HeroSection/Navbar/MegaMenu/Footer全部≥44px

## ScrollReveal组件是客户端导航白屏的关键依赖 (2026-07-08)
- **CSS机制**: `.js-loaded .scroll-reveal { opacity: 0 }` — JS加载后所有scroll-reveal元素默认隐藏
- **显示机制**: ScrollReveal组件在客户端导航时重新观察元素，添加`.revealed`类使内容可见
- **移除后果**: 删除ScrollReveal导入后，所有scroll-reveal内容在客户端导航后保持opacity:0不可见
- **教训**: "看起来没用"≠"真的没用"。删除任何导入/组件前，必须追踪它的运行时行为，不能只看静态引用

## 浏览器滚动恢复问题
- **现象**: 每次访问时浏览器恢复上次滚动位置，显示中间页而非Hero Section [2026-07-07]
- **解决方案**: 创建ScrollToTop组件，在路由变化时scrollTo(0,0) [2026-07-07]

## 任务2修复完成 (S31, 2026-07-07)
- **i18n补全**: vmware(49key) + terms(17key) 已添加到zh.json
- **联系信息i18n化**: contact/vmware页面从硬编码改为i18n读取
- **Compare页i18n**: "Technology Partner Certifications"等标签改为i18n
- **博客封面图**: 30篇broken coverImage引用已清除，页面graceful降级
- **Solutions页i18n结构**: infrastructureNeeds/aiSolutions字符串→solutions[]/products[]数组，填充到3项
- **Solutions页Sanity集成**: 放弃(500错误)，保持i18n版本
- **复查验证**: 9个主要页面全部通过webfetch验证，49/49测试通过

## 任务2前后端不一致发现
- **Solutions页零Sanity集成**: 17个CMS文档完全未使用，前端硬编码6个行业数据 [2026-07-07]
- **Products页忽略Sanity数据**: 使用slugToI18n硬编码映射，忽略Sanity中的产品描述和特性 [2026-07-07]
- **博客/案例缺图片**: 30个博客和案例都缺少coverImage [2026-07-07]
- **联系信息硬编码**: Contact和VMware页面硬编码邮箱电话，应改为CMS或i18n集中配置 [2026-07-07]
- **Sanity字段未渲染**: productsUsed和tags字段被获取但从未渲染 [2026-07-07]

## 任务2修复经验 (S31)
- **Sanity SVG上传asset引用损坏**: 通过multipart/form-data上传SVG到Sanity的/assets/images端点，mutation设置coverImage.asset._ref后，查询返回asset: null。可能是Sanity不支持SVG作为image类型 [2026-07-07]
- **Solutions页500错误**: Sanity查询正常返回17条数据，TypeScript编译通过，但部署后500。错误信息"Element type is invalid: expected a st…"被截断。多次修复(revalidate→force-dynamic、sanity.ts→sanity.server.ts、添加fallback)均失败。最终放弃Sanity集成，保持i18n版本 [2026-07-07]
- **i18n结构修复方案**: en.json/zh.json的solutions.industries结构需与页面代码期望一致。en用`. `分割，zh用`。；`分割。填充不足3项的数组到3项。页面UI三列网格(Pain Points/Solutions/Products)依赖数组结构 [2026-07-07]
- **vmware-alternative电话号码错误**: 原代码硬编码+886223456789(台湾)，应为+63 960 282 5051(菲律宾) [2026-07-07]
- **Sanity API清除字段**: `patch(_id).unset(['coverImage']).commit()`可完全移除Sanity文档中的字段 [2026-07-07]
- **博客graceful降级**: coverImage为null时BlogList组件不会崩溃，urlFor处理null source不抛异常 [2026-07-07]

## 任务1执行经验 (S28)
- **Subagent并行高效**: 5个子代理并行执行，全部在2分钟内完成，比串行快5倍 [2026-07-07]
- **CookieConsent lint修复**: useEffect中不能同步setState，需用requestAnimationFrame包裹 [2026-07-07]
- **24/7措辞保留策略**: 保留vendor产品描述中的24/7（MDR SOC确实是24/7），只修改公司级承诺 [2026-07-07]
- **案例架构模板已生成**: 6个行业模板（Healthcare/Finance/Retail/Logistics/Education/Government），使用真实厂商产品（Sangfor HCI/Fortinet NGFW/Nutanix/Proxmox），待集成到Sanity [2026-07-07]
- **SEO基础实现**: sitemap/robots/OpenGraph已实现，dynamic routes未包含（需build时CMS数据）[2026-07-07]

## 技术经验
- **Sangfor官网产品线**: HCI、Cloud Platform、aDesk VDI、aStor(All Flash/Hybrid Flash)、aSV、Kubernetes Engine(SKE)、Database Management Platform(DMP)。没有"aCloud"这个产品名 [2026-07-07]
- **Sangfor产品命名规则**: 前缀"a"用于存储(aStor)和虚拟化(aSV)，云平台不叫"aCloud" [2026-07-07]
- **全站邮箱已统一**: info@ → Inquiries@techguru-it.asia (HeroSection/contact/privacy/terms)
- **error/terms namespace**: 之前缺失，已补建。en.json/zh.json各新增7个key
- **i18n博客标题是备用内容**: 博客列表/详情页直接从Sanity获取，i18n标题仅作fallback
- **Sanity API读操作无需token**: projectId `r6ztl1oq`的查询接口公开可访问
- **Sanity写操作需token**: 使用`sk94...`token通过API脚本更新内容
- **Case Studies页面问题**: metrics显示i18n占位文字非真实数据、行业badge显示raw enum非翻译文本、按industry排序无意义、filterProduct key已定义但未实现、Sanity查询字段不足（详情页需更多字段） [2026-07-08]
- **重复检测机制**: 编辑相似JSON结构时频繁触发，解决方法是直接执行不展示中间过程
- **next build需--webpack**: win32上Turbopack不可用
- **Vercel部署**: `npx vercel --prod --yes`一键部署，约1-2分钟
- **Sanity Portable Text**: 内容是数组格式(block children)，不是字符串，更新时需遍历处理
- **Sanity博客Schema字段名**: `coverImage`(非`mainImage`)，前端GROQ查询必须匹配
- **移动端触控目标标准**: 所有交互元素≥44px，全局CSS规则`@media (max-width: 767px) { a, button, input, select, textarea { min-height: 44px } }`
- **iOS Safari自动缩放防护**: 表单输入必须`font-size: 16px`或更大，否则聚焦时Safari会自动缩放
- **lucide-react类型**: 类型定义在`lucide-react/dist/lucide-react.d.ts`中，不是单独的`@types/lucide-react`包。如果缺失需要删除node_modules重新安装
- **ESLint react-hooks purity规则严格**: 不能在渲染期间更新ref(需用useEffect)，不能在useCallback中访问声明前的变量，不能在useEffect body中同步调用setState。递归useCallback需用局部函数变量替代自引用 [2026-07-06]
- **帮助系统FAQ路由**: Footer中FAQ链接已从`/support`改为`/help`，永久路由变更 [2026-07-06]
- **Sub-agent timeout pattern**: Sub-agents consistently time out on multi-file implementation tasks. Main agent completing work directly is more reliable. Use sub-agents only for quick read-only exploration. [2026-07-06]
- **Subagent timeout on skill evaluation tasks**: Subagents reading skills + evaluating multiple pages can timeout at 180s. Consider larger timeout (300s+) or smaller task granularity (e.g., one dimension per subagent) [2026-07-07]
- **上下文污染导致跳步**: 对话过长时任务执行会跳过维度，需用task工具追踪进度。教训：新session应从task工具创建任务树开始 [2026-07-08]
- **任务3评估完成**: 25维度综合评分2.6/4。关键问题：AI子故事线无视觉区分(1/4)、em-dash泛滥48处、CTA样式碎片化(2/4)、Blog/CaseStudies布局雷同(2.5/4)、无障碍不足(2/4) [2026-07-08]
- **修复优先级**: P0(em-dash/CTA/卡片圆角/Hero SSR/CTA区块) → P1(AI视觉区分/暗色模式/面包屑/无障碍) → P2(Blog/CaseStudies差异化/首页中段/产品tab URL) [2026-07-08]
- **任务3评估完成但未修复**: 25维度全部评估完成，主要问题：AI子故事线无视觉区分(1/4)、Blog/CaseStudies布局雷同(2.5/4)、em-dash泛滥(48处)、CTA样式碎片化(2/4)、卡片圆角不统一、暗色模式不完整。修复待执行 [2026-07-08]
- **上下文污染导致跳步**: 对话过长导致任务3执行时跳过了多个维度，没有严格按计划逐维度评估。教训：用task工具追踪进度 [2026-07-08]
- **Mega Menu i18n was missing**: Navbar.tsx had 15 hardcoded English labels for industry/category navigation. Now fixed with nav namespace translations [2026-07-06]

## Solutions AI产品分配策略 (S36确认)
- **每个行业的AI产品应匹配其行业痛点**: Healthcare=Legacy AI(HIS/LIS/RIS增强), Finance=Legacy AI(CRM/合规/报表), Retail=AIGC(产品图/广告), Logistics=AI Agent(路线调度/预测), Education=AIGC(课件/培训), Government=Legacy AI(OA/公文)
- **en.json products[]结构**: 每行业3个entry，第一个总是主要AI产品(Legacy AI/AIGC/Agent)，第二第三个是补充产品。占位文字"AI-powered automation"需替换为具体产品描述
- **24/7在vendor描述中保留**: Healthcare solutions[2]的"MDR provides 24/7 security operations"是vendor能力描述，不是公司承诺，按S28规则保留

## 审计框架经验
- **5工具审计框架无冲突**: Web Interface(代码)/Writing(文案)/Sanity(CMS)/SEO(搜索)/真实性(事实)各覆盖不同层面，可并行执行 [2026-07-05]
- **内容真实性审计是系统性缺口**: 5个工具都不能完整覆盖内容的真实性、合理性、逻辑性检查。需创建专门skill或在审计中人工执行 [2026-07-05]
- **Sanity SEO/AEO skill已安装**: `seo-aeo-best-practices`覆盖SEO元数据、结构化数据、内容可发现性审计 [2026-07-05]
- **Sanity content-modeling skill已安装**: `content-modeling-best-practices`覆盖Schema设计合理性、字段类型正确性审计 [2026-07-05]
- **impeccable需要PRODUCT.md**: 所有impeccable命令都要求PRODUCT.md存在 [2026-07-06]
- **impeccable脚本路径**: `C:\Users\Test\.agents\skills\impeccable\scripts\` [2026-07-06]
