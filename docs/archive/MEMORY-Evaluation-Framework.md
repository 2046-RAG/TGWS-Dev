# TGWS — 三任务评估框架 & 审计结果 (Historical)

Extracted from MEMORY.md. Completed S27-S28 work, stable and unlikely to be revisited.

## 三任务评估框架 (S27, v4 DevOps最终版)
- **任务1: 内容质量评估** — 23维度(完整度/准确性/真实性/可落地性/定位关联性/语气适当性/品牌一致性/差异化/信任信号/CTA有效性/信息密度/用户旅程/行业相关性/多语言/新鲜度/SEO/GEO/AI双故事线/合作伙伴信息/价格信息/法律合规)
- **任务2: 前后端一致性** — 17个页面全覆盖(首页/关于/产品/解决方案/案例列表/案例详情/博客列表/博客详情/联系/支持/登录/注册/帮助/VMware替代/隐私/条款/home)
- **任务3: UI/UX评估+设计适配性** — 25维度5层(第一印象4+信息传达5+交互体验8+品牌一致性3+设计适配性5)
- **执行顺序**: 串行 任务1→任务2→任务3（数据正确→前后端一致→设计匹配）
- **DevOps双重含义**: (1)流程分工(角色分离、交接节点、反馈闭环) (2)代码健康自责(修完自己测、是屎山就迭代、通过才交付)
- **角色分工**: Agent=开发者+测试者+运维者 / 用户=业务验收者
- **自测循环**: 每次修复后必须跑npm run lint + typecheck + build + test，不通过不交付
- **一维度一工具**: 每个评估维度只分配一个主工具，不允许两个工具评同一件事
- **Skill边界划分**: content-modeling管架构原则/sanity管实现细节；seo-aeo管可发现性/writing管可读性；design-taste管反模板细节/impeccable管UX整体；critique评设计好坏/audit评技术对错
- **MCP/Skill无冲突解决**: 每个任务的MCP(数据工具)和Skill(评估规范)分工明确——MCP负责查数据(Sanity脚本/linecount/grep)，Skill负责定标准(impeccable/Sanity最佳实践/SEO规范)。冲突风险通过"一维度一工具"原则消除：每个维度只分配一个主工具，两个工具不评同一件事
- **厂商信息验证**: 涉及Sangfor/Fortinet/Nutanix等厂商时必须去官网查询，找不到报告用户，禁止幻想
- **GEO优化**: 内容是否针对AI搜索引擎(Google AI Overview/ChatGPT/Perplexity)优化
- **完整度维度**: 检查每个大类下是否覆盖了应有的品牌、技术、产品
- **三支柱定义**: Build.Run.Protect.是客户IT旅程（Build=AI应用构建，Run=基础设施承载，Protect=安全防护），AI子故事线是Build的一部分
- **impeccable只用审计命令**: critique(UX评审) + audit(技术检查)，其他20+命令是实施用的，评估阶段不用
- **未使用的skill解释**: frontend-design与impeccable重叠80%、web-design-guidelines与impeccable审计维度重叠、vercel系列是性能/成本优化不是UI/UX评估
- **30个虚构案例处理方案**: 转换为"典型应用场景和方案架构设计"（围绕Sangfor/Fortinet/Nutanix等合作厂商） [2026-07-07]
- **任务3子代理分工**: 3个并行subagent——第一印象层(design-taste-frontend)+信息传达层(impeccable critique)+设计适配性(impeccable critique)。交互体验层(8维度)+品牌一致性层(3维度)后续补充spawn [2026-07-07]
- **任务3评估结果汇总**（2026-07-08，25维度重新评估）:
  - A.第一印象: 2.63/4 (吸睛度2.5, 美感2.8, 质感2.2, 配色3.0)
  - B.信息传达: 3.2/4 (视觉层次3, 信息传递3.5, 排版3, 信息架构3.5, 信息密度3)
  - C.交互体验: 2.75/4 (动效3, 反馈3, 导航2, 表单4, 响应式3, 无障碍3, 错误处理3, 暗色模式1)
  - D.品牌一致性: 2.0/4 (品牌叙事2, CTA按钮2, 卡片样式2)
  - E.设计适配: 2.55/4 (内容差异化3, 密度匹配3, 交互差异化3, 双故事线1, 节奏感2)
  - **综合评分**: 2.63/4（需显著改进）
- **任务3 P0修复完成**（2026-07-08）:
  - em-dash: i18n文件78处全部替换(en.json/zh.json)
  - CTA统一: Solutions/Compare/Contact 3页面改用btn-primary CSS类
  - 卡片统一: 新增card-compact类，Blog/CaseStudies改用card-compact
  - 三条故事线: Hero底部+首页新增Build.Run.Protect/AI Journey/VMware Alternatives区块
  - 构建验证: 49/49测试通过
- **任务3修复优先级**: P0✅(em-dash/CTA/卡片/三条故事线) → P1✅(暗色模式/面包屑/无障碍) → P2✅(T3.3产品tab URL/T3.1 Blog/CaseStudies差异化/T3.2首页中段优化) [2026-07-08]
- **"24/7支持"措辞**: 是宣传用语，实际人力(10人)达不到，需调整为更真实的承诺 [2026-07-07]
- **合作伙伴扩展**: 从8个扩展到19个(Sophos/Hillstone/StarWind/H3C/Arcfra/Alibaba/ByteDance/Veeam/Dell/HP/Lenovo) [2026-07-07]
- **PRD [S15]免费额度**: 是建站成本信息(Vercel/Sanity/Supabase/Resend免费层)，非客户面向内容，标记PRD待修订 [2026-07-07]

### Blog/CaseStudies差异化布局 (T3.1, 2026-07-08)
- **Blog = 编辑/杂志风格**: Featured post用full-width hero + gradient overlay, 剩余文章用2-column grid with category color bars, 标签/作者/阅读时间突出
- **Case Studies = 商业/成果风格**: Featured case用industry-colored gradient overlay + metrics row, 剩余案例用2-column grid with industry color top bar + color-coded badge
- **颜色系统**: Blog用categoryColors(news=#00D4FF, technical=#7B61FF, case-study=#22C55E, industry=#F59E0B), Case Studies用industryColors(healthcare=#EF4444, finance=#3B82F6, retail=#F59E0B, etc.)
- **两个页面使用相同数据结构但视觉完全不同**

### 首页中段优化 (T3.2, 2026-07-08)
- **AI Journey**: 从vertical timeline改为3-column horizontal cards, Step 2包含3个sub-items with checkmarks and descriptions
- **VMware Alternatives**: 添加3-step migration flow (Assess → Start at Edge → Migrate on Schedule), 保留vendor list + CTA
- **两个区块都增加了内容密度和结构化信息**

### 三条故事线设计决策 (S33)
- **AI子故事线位置不动**: 用户明确要求AI Journey保持在Build tab下，不创建独立页面/Tab。通过动效和视觉元素在原位展开叙事
- **三条故事线并列展示**: Hero底部+首页分别展示Build.Run.Protect / AI Journey / VMware Alternatives三条线
- **视觉区分策略**: Build.Run.Protect用半透明背景+标准卡片，AI Journey用紫色渐变+glow脉冲动效，VMware用深色背景+shimmer效果
- **em-dash全面清除**: i18n文件→逗号，源码注释保留（注释不影响用户界面）
- **CSS类统一策略**: 新增.card-compact变体（12px圆角+16px padding）而非手动内联，确保全站卡片样式一致

### 全站impeccable审计 (S24)
- **触发原因**: Sanity内容审计完成(96+文档)但前端未适配，出现严重UI/UX问题
- **审计框架**: impeccable skillsets — 20维度差距评估 + 大白话解释
- **评估得分**: 25/40 (Acceptable — 需显著改进)
- **阶段1完成**: blog mainImage→coverImage修复 + 首页7→3区块重设计 + 移动端39问题修复
- **阶段2完成**: 帮助系统(FAQ页面+组件) + 错误处理(ErrorBoundary+useAutoSave+useRetry) + 差异化组件(Tooltip/HelpText/FAQAccordion)
- **阶段3完成**: i18n补全(auth namespace + Mega Menu 15标签) + 设计系统文档(DESIGN.md+COMPONENTS.md) + 性能优化(next.config.ts+layout.tsx预加载)
- **Mega Menu i18n**: Navbar.tsx 15个硬编码英文标签改为i18n (build/run/protect/healthcare/finance/retail/logistics/education/government/allIndustries/allPosts/technical/industry/caseStudy)
- **Vercel部署成功**: https://www.techguru-it.asia 42页面构建成功
- **核心发现**: 博客Schema用`coverImage`但前端查`mainImage`导致图片不显示
