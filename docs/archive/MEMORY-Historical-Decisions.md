# TGWS Historical Decisions & Stable Rules

> Extracted from MEMORY.md to stay under token budget. Content is stable, historical, unlikely to be revisited.

## Older Stable Rules (S44-S50)

- **修复必须彻底验证**: 用户反复强调"我们前面不是讨论了这部分内容吗，为什么还是不对"。任何修复完成后必须逐项验证所有相关字段（不仅是主要修复点），确保不遗漏。案例修复不能只改content不改clientName，命名修复不能只改标题不改内容格式 [2026-07-09]
- Playwright只允许Edge (AGENTS.md #27)
- 任务清单≠实际状态
- Sanity脚本手动解析.env.local
- 待办定义要精确（外部依赖不算待办）
- skill工具中文路径失败需用read工具绕过
- **行动前必须查阅约束**: 每次执行操作前，必须先查阅AGENTS.md中的约束条件
- **评估必须用工具，不能手动判断**: UI/UX/内容质量/一致性评估必须调用MCP工具或skill，不能仅凭阅读源代码下结论。手动阅读只能发现"现象"，不能做出"评价" [2026-07-06]
- **skill是规范不是工具**: skill提供评估规范(只读)，MCP提供数据能力(读写)。评估时必须两者配合：skill定标准，MCP查数据 [2026-07-06]
- **事实核查必须读源码**: 做待办梳理或差距评估时，禁止仅凭文件树、旧评估报告、PRD原始设计推断当前实现状态。必须逐页 read 源代码确认实际内容。教训：2026-07-09 因未读 about/page.tsx 就断言"内容单薄、缺时间线"，实际上时间线/团队/资质三个板块早已实现 [2026-07-09]
- **语言一致性必须创建前检查**: 批量创建Blog文章时，必须在创建前运行`scripts/check-language-consistency.mjs`检查语言混杂问题。英文文章不能有中文，中文文章不能有英文句子（技术术语除外）。教训：2026-07-10批量创建11篇文章后才发现52处语言混杂问题 [2026-07-10]
- **Best Practice与Blog内容必须明确区分**: Best Practice=深度架构设计指南(持久性参考文档+架构图)，Blog=时效性技术动态/新闻/案例分享。创建新内容前必须检查是否与现有Blog内容重叠 [2026-07-10]
- **零收费零依赖**: Blog内容创作相关资源必须免费，不安装任何npm包。架构图用SVG图片(Excalidraw/Mermaid Live/Draw.io)，去AI化靠写作规范+人工审核，排版用CSS扩展 [2026-07-10]
- **语言一致性检查**: 英文文章禁止中文字符(技术术语除外)，中文文章禁止英文句子(技术术语除外)。技术术语(VMware/FortiGate等)、缩写(API/SDK等)、代码片段、人名公司名例外 [2026-07-10]
- **Sanity批量创建可靠模式**: `@sanity/client`的`createOrReplace` + 自定义`_id: 'post-{slug}'`(幂等) + `.js`模块导出内容(非.json) + `.env.local`用`node -e fs.readFileSync`读取 [2026-07-11]
- **Sanity API URL必须v前缀**: `/v2024-01-01/`不是`/2024-01-01/`，raw fetch静默失败 [2026-07-11]
- **去AI化写作规范**: 避免"Furthermore/Moreover/Additionally"等正式连接词，避免"In today's world..."等套话，用具体场景/数据开头，口语化表达。详见`tgws/WRITING-GUIDELINES.md` [2026-07-10]
- **grep工具中文路径失败需用Select-String**: ripgrep下载失败时，PowerShell Select-String可替代 [2026-07-08]
- **edit工具需要先read**: 在同一会话中编辑文件前必须先read，否则报错"has not been read" [2026-07-08]
- **Turbopack内存分配失败需用webpack**: `npm run build`在win32上Turbopack可能失败，改用`npx next build --webpack` [2026-07-08]
- **部署验证是必要步骤**: 部署后必须webfetch验证sitemap/robots/JsonLd的具体值，不能只看"部署成功" [2026-07-08]

## Architecture Decisions

### Best Practice彻底删除，归入Blog (S46→S47, 用户最终决策, ✅ 已执行)
- **用户推翻S46方案**: 之前设计的30个主题+新bestPractice schema+架构设计定位被否决
- **用户原话**: "把Best Practice去掉吧，他里面的内容其实本质上都可以归类为blog下面，把空间留出来给其他模块吧"
- **✅ 已执行完成**: 301重定向(/en/case-studies → /en/blog) + MegaMenu清理 + sitemap清理 + 删除页面目录
- **Sanity数据**: 保留caseStudy schema和数据(不删除)，前端不再展示
- **战略意义**: 释放导航空间给更有价值的模块(客户评价/招聘/产品详情)，简化内容管理，消除与Blog重叠
- **验证**: curl确认308→200重定向生效
- **历史演变**: S42改名Solution Architecture→S43改名Best Practice→S46尝试重构(被推翻)→S47直接删除
- **最佳实践**: 数据正确≠视觉正确，UI审计必须用Playwright截图 (约束#38/#39)

### 内容质量提升方案 — 零收费零依赖 (S47, 用户最终确认)
- **架构图**: 用免费工具(Excalidraw/Mermaid Live/Draw.io)生成SVG，上传Sanity Assets，不安装mermaid npm包
- **去AI化**: 写作规范+人工审核，不安装Grammarly等工具
- **排版设计**: CSS扩展(在globals.css中添加.article-content)，不安装新依赖。S50已优化间距：h2 mt 3.5rem / p mb 1.5rem mb / line-height 1.85 / font-size 1.05rem / 移动端h2 1.35rem h3 1.15rem p 1rem
- **PortableText空block处理**: 空字符串block渲染为`<div className="h-4" />`视觉间隔
- **CaseStudy同步**: CaseStudyDetail.tsx也应用article-content CSS类
- **语言一致性**: 英文无中文，中文无英文，技术术语除外
- **写作规范文档**: `tgws/WRITING-GUIDELINES.md`
- **Plan文件**: `.mimocode/plans/1783626327163-mighty-meadow.md`

### Blog定位：技术大杂烩 + 72篇三等分规划 (S47, 用户最终确认)
- **Blog定位**: 用户明确"Blog的定位可以说是大杂烩，内容其实没有特定限制，哪怕是一个很细小的技术点，也可以单独拎出来做讨论"
- **分类简化**: technical/industry/news三个分类，标签系统灵活筛选
- **内容深度**: 300字快速提示 → 5000字深度指南
- **三等分策略**: 基础架构(24篇)/网络安全(24篇)/AI-AIGC-Agent-Legacy改造(24篇)
- **频率**: 每2周1篇，3年72篇
- **SEO/GEO/AEO要求**: 每篇必须含标题关键词+开头直接答案+H2/H3结构化+列表表格+FAQ+JSON-LD Article+作者署名
- **虚假案例不如中立技术文章**: 公司成立时间短无真实案例，编造虚假案例有法律风险且损害EEAT
- **Plan文件**: `.mimocode/plans/1783626327163-mighty-meadow-blog-60.md`
- **状态**: 方案已提交，等待用户审批后执行

### 分析工具选择: Umami > GA4 (S42)
- **对比维度**: 免费额度/功能深度/性能影响/维护人力/隐私合规
- **推荐Umami**: 免费开源、2KB script(GA 45KB)、零维护(SaaS版)、无需Cookie Consent、天然GDPR合规
- **GA4备选**: 仅在需要广告归因或深度用户行为分析时添加
- **部署方式**: Umami Cloud(免费层10万事件/月)或Railway/Vercel自托管

### Hero视频scrubbing (S46最终方案，S43→S44→S45→S46四次迭代)
- **用户意图**: "我的本意是展示人工智能技术，并且可以跟随鼠标的移动而移动，具备鼠标跟随特效"
- **S43决策**: Three.js粒子网络(神经网络可视化)
- **S44实现** (已被S45替代): 80粒子 + Spatial grid + 鼠标吸引
- **S45 AI Neural Core** (已被S46替代): 5层结构(GLSL shader+轨道+连线+粒子+网格)
- **S46最终决策**: 回退到视频scrubbing
  - 用户反馈: "完全换方案" — Three.js调试成本过高，效果不达标
  - 保留改进: P2(无模糊)+P4(卡片流式)+P5(3个CTA)+P6(渐变遮罩)
  - 视频scrubbing: 鼠标左右移动控制视频播放进度
  - 渐变遮罩: `from-black/60 via-black/30 to-transparent` 增强文字可读性
  - Commit: `f6f9585`
- **依赖**: Three.js已移除，无WebGL依赖
- **当前状态**: ✅ 已部署，视频内容(复古电脑)不匹配AI主题，正在从Mixkit下载替代素材供用户逐个审查
- **视频素材搜索**: Mixkit.co可用(Pexels/Pixabay被Cloudflare拦截)
- **视频下载**: Playwright网络拦截提取真实mp4 URL（`assets.mixkit.co/videos/{id}/{id}-720.mp4`），page.evaluate提取失败(被重定向)
- **第4批AI/IT主题视频**: 搜索8分类(robot/ai/cyber/future-city/data-center/vr-ar/machine/space) → 175页面 → 30个下载完成(机器人/大脑扫描/赛博朋克/编程/VR) → `public/videos/`
- **用户审美**: "中心点位于右侧"+"强IT/AI属性"(机器人/科幻生命体/未来城市)，拒绝抽象数据流
- **Scrubbing closure陷阱**: useEffect中`const video = videoRef.current`会捕获旧引用，新视频duration=0时闭包变量不更新 → 必须每次从videoRef.current实时获取

### 当前Hero视频URL
- `VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4'`
- CloudFront CDN托管，内容是复古GoldStar电脑

### 邮件模板4套体系 (S42)
- **sendTicketCreatedEmail**: 工单创建确认(工单号+分类+主题)
- **sendTicketStatusEmail**: 状态变更通知(旧状态→新状态)
- **sendPasswordResetEmail**: 密码重置(1小时链接)
- **sendTicketReplyEmail**: 回复通知(作者+内容+查看链接)
- **FROM**: `TechGuru Support <support@techguru-it.asia>` (Resend域名已验证)

### 全站内容审计完成 (S23)
- **7个Batch全部完成**: Hero/首页 → 产品(AI产品线) → 行业方案 → 案例/博客 → 关于/联系 → 支持/VMware → 全局元素
- **三支柱定义**: Build.Run.Protect.是客户整个IT旅程的三个阶段（Build=AI应用构建，Run=基础设施承载，Protect=安全防护）
- **AI子故事线**: Build下面的子故事线，AI落地旅程是Build的一部分（不是独立故事线）
- **AI产品线**: AI Adoption(入口) → AIGC/Coding/Legacy(三选一) → Agent(高级)
- **行业方案结构**: Solutions页使用i18n版本，结构为name/description/painPoints[]/solutions[]/products[]数组
- **WiFi/路由交换全覆盖**: 6个行业全部覆盖WiFi和路由交换产品

### TechGuru AI战略定位
- **决策**: TechGuru是IT集成商，不是AI公司。产品描述不能暗示有开发团队或AI专家
- **策略**: 绑定阿里云百炼+字节跳动火山引擎，从免费PoC开始证明能力
- **核心价值**: 基础设施+多厂商集成+运维托管，不是AI研发
- **不碰金融核心**: 不做core banking/trading，Legacy AI可用于CRM/报表/文档
- **AI产品线5个Sanity产品已创建**: ai-adoption-services, ai-generated-content-aigc, ai-assisted-coding, ai-agent-development, enterprise-legacy-system-ai-augmentation
- **AI功能技术选型**: Cloudflare Workers AI (免费层10K/天)，需CSP配置Cloudflare域名

- **案例匿名化**: Sanity中30个案例使用真实公司名(BDO/Metrobank/GCash等)无授权，有法律风险。已通过anonymize-case-studies.mjs脚本批量替换为"某大型商业银行"等通用描述。**但根本问题是案例本身是虚构的** — TechGuru 2023年成立，没有真实案例。用户决定：转换为"典型应用场景和方案架构设计"（围绕Sangfor/Fortinet/Nutanix等合作厂商），如"基于Sangfor HCI的Active-Standby DR架构设计" [2026-07-07]

### VMware迁移文案策略
- **渐进式迁移**: 双Hypervisor架构，先迁移边缘/非核心业务
- **minimal downtime**: 不承诺zero downtime
- **StarWind**: 作为第5个替代方案加入(Proxmox/Sangfor/Nutanix/StarWind/H3C)
- **保护生态**: 强调保护Veeam/Veritas(Cohesion)备份投资

### 网络产品分类 (S28确认)
- **路由器/交换机/WiFi**: 属于Run（承载业务的基础设施），不是Protect
- **SD-WAN**: 混合品类（网络优化+安全），可归Protect
- **防火墙/EDR/NDR**: 属于Protect（保护业务的安全产品）
- **分类逻辑**: Run=承载业务的基础设施，Protect=保护业务的安全产品

### Finance架构限制 (S29确认)
- **不碰金融核心**: 不做core banking/trading系统
- **可做企业级负载**: CRM、报表、文档管理、Cheque Image System、Document Management System
- **用户指定场景**: "比如chequeImage system,document management system"

### 24/7措辞策略 (S28执行)
- **公司级承诺**: 移除或改为更真实措辞（Managed security/Continuous monitoring/Proactive monitoring）
- **Vendor产品描述**: 保留24/7（MDR SOC确实是vendor提供的24/7服务）
- **Client pain points**: 保留24/7（是客户需求描述，不是我们的承诺）

### AI产品线详细架构 (S22确定, S26恢复)
```
AI Adoption (入口层)
├── "不确定AI怎么用？从这里开始"
├── 评估企业AI就绪度 + 制定AI路线图
└── Sanity slug: ai-adoption-services
    │
    ▼
AIGC / Coding / Legacy (三选一)
├── AIGC: Text-to-Video, Image-to-Video
│   └── 合作伙伴: 字节跳动(Seedance/即梦) + 阿里云百炼(HappyHorse/Wan/CosyVoice)
│   └── 模式: 托管云服务，不使用客户算力
├── AI-Assisted Coding: 开发者AI工具安全使用
│   └── Sanity slug: ai-assisted-coding
└── Legacy AI: ERP/CRM/OA现有系统AI赋能
    └── Sanity slug: enterprise-legacy-system-ai-augmentation
    │
    ▼
AI Agent (高级层)
└── 自主Agent处理复杂任务
    └── 基于阿里云百炼/火山引擎
    └── Sanity slug: ai-agent-development
```

### 待实现AI功能 (Cloudflare Workers AI)
- **CSP配置**: 集成AI API前需添加Cloudflare域名到connect-src
- **Cloudflare Workers AI**: 免费层每日10,000次请求，成本$0
- **AI第一部分: 网站AI能力** — 全站搜索+工单助手+智能表单
- **AI第二部分: 管理后台** — 类似53AI Hub的Agent管理界面(待设计)

## Older Discovered Knowledge

### S35 Live Review 发现 (2026-07-09)
- **AXA Philippines真名泄露**: anonymize脚本遗漏了部分occurrences，AXA Philippines在案例slug和display中仍以真名出现
- **Solutions AI产品占位文本**: Healthcare tab有2个通用"AI-powered automation"占位文字，需替换为具体产品名。扩展发现: 5/6行业都有generic placeholders (Finance 1个, 其他各2个)
- **zh繁体中文不一致**: AI Journey区块使用了简体中文("选择路径"应为"選擇路徑")，在i18n源文件中。扩展: "AIGC文本/图像/视频生成"/"AI Coding开发者AI辅助"/"Legacy AI现有系统AI赋能"也是简体
- **Blog作者虚构**: David Chen/Sarah Wong/Marcus Lee均为虚构名字，非真实TechGuru员工
- **About创始人匿名**: 3位co-founder无真实姓名，仅显示"CoFounder"通用标题
- **Products page只显示Build tab**: Run/Protect tab内容在webfetch中未可见（client-side JS交互，预期行为）

### S36 修复执行 (2026-07-09)
- **5 fix tasks created**: T1(Solutions AI products+24/7) / T2(zh simplified Chinese) / T3(Case Studies titles) / T4(filter+stats) / T5(co-founder names, blocked on user)
- **T1+T2 started**: Agent reading en.json/zh.json i18n files to begin edits
- **Solutions products placeholder data mapped**: en.json products[] array — Healthcare 2/3 generic, Finance 1/3 generic, Retail 2/3 generic, Logistics 2/3 generic, Education 2/3 generic, Government 2/3 generic. Specific products to assign: Healthcare→Legacy AI(HIS/LIS), Finance→Legacy AI(CRM/compliance), Retail→AIGC(product imagery), Logistics→AI Agent(route optimization), Education→AIGC(course materials), Government→Legacy AI(OA/documents)

### S37 修复完成 (2026-07-09)
- **6 tasks completed**: T1(Solutions AI products) + T2(zh→繁体) + T3(Case Studies 11篇标题) + T4(Stats dedup) + T6(co-founder fictional names). T5 abandoned.
- **Case Studies title fix via Sanity API**: Created scripts (fix-case-titles-v2/v3/v5.mjs) to update titles via Sanity client. Initial approach (ID prefix matching) caused misassignment; fixed by matching on clientName field instead.
- **Co-founder fictional names**: User explicitly said "我暂时不想透露真名，先编写一个合理的看起来像真人的吧". Names: Marco Reyes (CEO), Rafael Santos (CTO), Adrian Mendoza (VP BD).

### S38 push+deploy成功+Case Studies问题分析+框架v5 (2026-07-09)
- **git push成功**: 创建GitHub仓库`2046-RAG/TG-Website-Development`后HTTPS push成功。根因是仓库不存在而非port 443。
- **Vercel部署成功**: `npx vercel --prod --yes` → https://www.techguru-it.asia
- **Case Studies审计完成**: 用户要求"自行浏览Case Studies那一页的内容并尝试发生问题，然后总结问题以及根因，解决方案给我审批"
- **Sanity脚本扫描结果(36篇)**:
  - 11/36篇content含中文匿名文字(AXA/BDO/Bench/GCash/Jollibee/Metrobank/PGH/Robinsons/SM Retail/St.Luke's/UnionBank)
  - 6/36篇clientName为占位值("sector client")
  - 5/36篇Results格式混乱(重复"3x"/"Yes"布尔残留/"GDPR"标签混入)
  - 0/36篇缺summaryZh
- **5个问题已提交用户审批**: Critical(中文匿名文字) / High(占位clientName) / Medium(Results格式+ZH标题英文) / Low(面包屑i18n)
- **三任务评估框架v5进化**: 用户要求"把这次的教训合并进入任务1，2，3的框架里面，使其进化"
  - 更新文件: `.mimocode/plans/1783322903936-misty-lagoon.md` (434行)
  - 新增核心约束#7(维度评分不能替代实现级审查)/#8(必须深入详情页检查)
  - 新增"实现级审查层": 按页面类型检查清单+脚本模板+双轨评估输出格式
  - 任务2检查清单升级: 案例详情/博客详情标记为必须深入检查
  - git commit e70b5b6已创建但未push(网络不通)

### S39 完成项验证+i18n修复+元数据本地化 (2026-07-09)
- **完成项验证(防幻觉)**: blog coverImage 30/30✓, Solutions AI产品6行业全specific✓, 联系信息全站一致✓, case studies无残留中文✓, 5项未暂存clean i18n改进✓
- **zh.json繁体修复**: 3处残留简体→繁体(L148 换→換, L523 变→變, L776 华→華)
- **Case Studies i18n**: 5文件添加titleZh字段(locale-aware标题+metadata+GROQ查询+Breadcrumb home label)
- **case-studies/error.tsx i18n**: 从硬编码英文重写为useTranslations('error')+useLocale()
- **Blog slug metadata修复**: generateMetadata现在接受locale，title/excerpt按locale切换
- **Metadata本地化**: en.json/zh.json添加blog/products/caseStudies metadata段，3个page.tsx从静态metadata转为generateMetadata+getTranslations
- **清理**: 7个一次性Sanity修复脚本已删除
- **Commits**: `062d0f1` zh+case-studies i18n / `e205f3c` error.tsx+blog slug
- **未提交**: en.json/zh.json metadata keys + 3 page.tsx generateMetadata (需build验证+commit)

### Sanity MCP服务器（不需要安装）
- **地址**: https://mcp.sanity.io
- **结论**: Token+脚本能力严格超过MCP，本项目不需要安装
- **状态**: 发现但未安装，也不会安装

### Sanity schema directory path
- Sanity schemas are at `tgws/sanity/schemas/` (NOT `tgws/src/sanity/schemas/`) — confirmed in T5 subagent progress [S42]

### vi.hoisted() for vi.mock references
- When vi.mock references external variables, `vi.hoisted()` is required — vi.mock is hoisted to file top, const declarations come after, causing "Cannot access before initialization" [T9, S42]
- Pattern: `const mockFoo = vi.hoisted(() => vi.fn())` then use `mockFoo` in vi.mock factory

### Sanity integration pattern (confirmed T8)
- Server component (page.tsx) fetches Sanity data via GROQ → passes to client component (List component). Same pattern for blog, products, solutions pages
- `sanity.ts` and `sanity.server.ts` are identical; `@/lib/sanity` works in both client and server contexts

### Three.js + React Three Fiber (S44→S45发现)
- **Canvas需要Suspense**: `@react-three/fiber` Canvas必须包裹`<Suspense>`，否则SSR hydration报错
- **WebGL检测**: `document.createElement('canvas').getContext('webgl2')` — 失败返回false
- **PointsMaterial > instancedMesh**: 小粒子用`pointsMaterial`+`sizeAttenuation`比instanced sphere高效得多(80顶点 vs 5,120三角面)
- **Spatial grid O(n)**: 网格单元2.0 + ±1邻居查找，将120²=14,400次检查降到~800次/帧
- **lineBasicMaterial opacity是uniform**: 顶点透明度必须烘焙到vertex colors，不能用material.opacity
- **BufferAttribute args**: R3F要求`args={[array, itemSize]}`，不是单独的`count`/`array`/`itemSize` props
- **TypeScript陷阱**: `state.camera.raycaster`不存在；`.array = x`是只读属性需用`.array.set(x)`；`onPointerMove`不是有效JSX需用window事件监听
- **GLSL shader in R3F**: 自定义ShaderMaterial通过uniforms传递时间/颜色，vertex shader传递vNormal/vPosition/vUv给fragment shader
- **simplex noise in GLSL**: 3D simplex noise函数(经典实现)用于生成旋转能量纹理，不需要外部噪声库
- **fresnel效果**: `pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0)` — 边缘更亮，中心更暗，适合发光球体
- **R3F Canvas camera**: `camera={{ position: [0, 0, 6], fov: 50 }}` — camera.position可通过`useThree()`获取
- **gridHelper**: R3F中`<gridHelper args={[size, divisions, color1, color2]}`渲染网格，material透明度需单独设置
- **webfetch无法评估Three.js渲染**: SSR HTML只包含容器元素，canvas是客户端渲染，无法通过webfetch看到视觉效果

### Playwright截图验证 (S45→S46)
- **Playwright CAN capture Three.js canvas**: Edge headless渲染完整页面包括WebGL canvas
- **脚本**: `screenshot-hero.mjs` — Edge, 1440x900, `waitUntil:'networkidle'` + 3s额外等待
- **webfetch只返回SSR HTML**: 无法看到canvas/WebGL/动画内容
- **正确方法**: 视觉验证必须用Playwright截图，不能用webfetch
- **S45截图结果**: 粒子(cyan小点)可见，但核心shader球体/连线/背景网格/数据脉冲均不可见
- **结论**: 5层设计中只有L4(外层粒子)部分可见，其他4层因参数问题(太透明/太淡/太小)不可见
- **S46结果**: 用户放弃Three.js，回退到视频scrubbing

### 免费视频素材来源 (S46)
- **Mixkit.co**: ✅ 免费AI/数据/科技视频，Playwright可访问(无Cloudflare验证)
- **Pexels**: ❌ Cloudflare验证拦截，自动截图不可行
- **Pixabay**: ❌ Cloudflare验证拦截，自动截图不可行
- **Mixkit分类**: AI(机器人/大脑/神经网络) / Data(代码/仪表盘/可视化) / Futuristic(VR/霓虹隧道)
- **截图脚本**: `mixkit-capture.mjs` — Edge, 1280x900, 3分类各5s等待

### Mixkit视频URL提取方法 (S46)
- **Playwright网络拦截**: `page.on('response', handler)` 捕获`.mp4`响应 → 真实URL格式 `https://assets.mixkit.co/videos/{id}/{id}-720.mp4`
- **page.evaluate提取失败**: 页面DOM中的下载链接被重定向到Apple Safari页面，不可用
- **视频页面结构**: `<video>`元素 + 多个Envato预览(带水印) + assets.mixkit.co CDN无水印720p
- **扫描结果**: 4分类(AI/Data/Futuristic/Server) → 15个视频页面
- **下载问题**: slice(0,8)限制访问8个 → 网络拦截只捕获3个URL → 另外5个页面可能视频未触发加载/等待不足
- **已下载**: 21053(彩色数据 1.38MB)/18774(数字隧道 5.37MB)/50498(蓝色激光 3.01MB)
- **用户否决**: "三个都是垃圾"，需重新搜索下载全部15个候选
- **video-urls.json不可用**: downloadUrl字段全是Safari重定向，需重新用网络拦截提取

### HeroSection SSR必须开启
- **问题**: `dynamic(() => ..., { ssr: false })`导致页面加载时先显示下方内容再加载Hero，浏览器滚动恢复加剧问题 [2026-07-07]
- **解决方案**: 移除ssr:false，让HeroSection在服务端也能渲染 [2026-07-07]
