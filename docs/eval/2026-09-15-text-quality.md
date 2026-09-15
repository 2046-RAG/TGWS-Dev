# 全站文案质量评估报告

> **2026-09-15 三轮复核勘误**（详见 `2026-09-15-verification-matrix.md`）：  
> 1. 「Compare 40%/35% 线上展示」→ **证伪**：i18n 有、`compare/page.tsx` 不渲染 testimonials。  
> 2. 「EN 页 TCO 显示中文」→ **证伪**：`isZh ? 中 : 英`，EN 走英文；真问题是硬编码未进 i18n。  
> 3. 法律裸键、年份/数字矛盾、Learn more 硬编码、July 1, 2026 日期 → **复核成立**。

**评估日期**: 2026-09-15  
**评估范围**: home / products(+build/run/protect) / solutions / blog / about(+timeline) / contact / support(+login/register) / help / compare / vmware-alternative / privacy / terms / profile  
**语言**: en + zh（繁中）  
**证据来源**: 源码 `tgws/src/**`、i18n `src/messages/en.json` & `zh.json`、线上 `https://www.techguru-it.asia/{en,zh}/**`（webfetch 实抓）  
**约束遵守**: #36 读源码/实页；#54 完整列出具体缺陷；#56 一次性穷极；#32 未启动 dev server

---

## 1. 总览评分表（按页面 × 维度）

评分：1=不可用 / 2=严重缺陷 / 3=可用但有明显问题 / 4=良好 / 5=优秀

| 页面 | 文案质量 | 逻辑性 | 合理性 | 相关性 | 双语一致性 | 综合 | 关键证据 |
|------|---------|--------|--------|--------|-----------|------|----------|
| **Home** | 3 | 3 | **2** | 3 | 3 | 2.8 | `home/page.tsx:466` 简体「计算」；i18n `home.socialProofStat4=12+` vs 成立 2020/2023；hero 死键 `cta.cases` |
| **Products 列表** | 3 | 3 | 3 | 3 | **2** | 2.8 | `ProductsList.tsx:174` 英文硬编码「Learn more」；EN/ZH `features.ai-assisted-coding` 语义完全不同 |
| **Products/build** | 3 | **2** | 3 | 3 | **2** | 2.6 | 标题+Story 渲染两次（header + 描述卡）；ZH 实页「Learn more」「View all products」英文残留 |
| **Products/run** | 3 | 2 | 3 | 3 | 2 | 2.6 | 同上重复渲染；metadata 用「建構/運行」正文用「構建/承載」 |
| **Products/protect** | 3 | 2 | 3 | 3 | 2 | 2.6 | 同上；ZH `云安全` vs 正文 `雲端安全` 不统一 |
| **Solutions** | 3 | 3 | 3 | 3 | **2** | 2.8 | EN 行业方案一条含完整 Build/Run/Protect；ZH 被拆短截断；finance 含「We avoid core banking」像免责声明 |
| **Blog 列表** | 3 | 3 | 3 | 3 | 3 | 3.0 | 列表标题与 detail 标题不一致（art1 列表「Hybrid Cloud Architecture Design Guide」vs detail「Building Resilient Hybrid Cloud Architecture」） |
| **About** | **2** | **2** | **2** | 3 | 3 | 2.4 | intro「Founded in **2023**」vs timeline「**2020** founded」；预览硬编码 2023–2025 漏掉 2020–2022；i18n 团队名「Co-Founder」占位 |
| **About/timeline** | 3 | 3 | **2** | 3 | 3 | 2.8 | 事件写 2020 成立、25+ 伙伴、200+ 客户；页脚 stats 写 Founded **2023**、20+ vendors、100+ clients——同页自相矛盾 |
| **Contact** | 3 | 3 | 3 | 3 | 3 | 3.0 | i18n key 名 `taipei`/`hongKong` 值却是马尼拉总部/联系方式，命名错误遗留 |
| **Support** | 3 | 3 | 3 | 3 | **2** | 2.8 | `TicketList.tsx:147` 硬编码「Submit a ticket to get started」；导航 EN「Tickets」vs ZH「客戶支持」语义不等 |
| **Login/Register** | 3 | 3 | 3 | 3 | 3 | 3.0 | `LoginForm.tsx:37,59` 硬编码「Network error…」；auth.i18n `noEmail`：「Didn receive the email?」缺撇号 |
| **Help** | **4** | 4 | 3 | **4** | **4** | 3.8 | FAQ 结构完整双语齐全；但对菲律宾公司宣称 GDPR/CCPA 合规略显模板化 |
| **Compare** | 2 | 3 | **1** | 3 | 3 | 2.4 | 客户证言「saved us 40%」「cut annual IT costs by 35%」无具名客户；竞品列是稻草人「Traditional Vendor」 |
| **VMware-alternative** | **4** | 4 | 3 | **4** | 3 | 3.6 | 信息架构清晰；「计算你的 TCO」简体；VCF 9 2027-10 说法需持续核实 |
| **Privacy** | 4 | 4 | 3 | 4 | **2** | 3.4 | **缺 `privacy.section12Body`（ZH）**；`Last Updated: July 1, 2026` 英文硬编码（`privacy/page.tsx:35`） |
| **Terms** | 3 | 4 | 3 | 4 | **1** | 3.0 | **线上 ZH 显示裸键 `terms.section14Body`**；正文残留英文 `governs`/`defending、indemnify 並 hold harmless`；简体「包括但不限于」「信息」 |
| **Profile** | **2** | 3 | 3 | 2 | **2** | 2.4 | 无 `profile` i18n 命名空间，全靠 `locale==='zh'?…` 硬编码；错误文案纯英文 |

**维度均分（全站）**: 文案质量 3.0 / 逻辑性 2.9 / 合理性 2.6 / 相关性 3.1 / 双语一致性 2.4  
**结论**: 相关性与结构尚可；**合理性与双语一致性是最大短板**，存在生产环境可见的裸键、事实矛盾与未翻译法律文本。

---

## 2. 严重问题清单（P0 / P1 / P2）

### P0 — 生产可见错误 / 法律页破损 / 事实硬冲突（必须立即修）

| # | 位置 | 现状 | 建议 |
|---|------|------|------|
| P0-1 | `zh.json` 缺 `terms.section14Body`；线上 `https://www.techguru-it.asia/zh/terms` | ZH 服务条款第 14 节直接渲染 **裸 i18n key** `terms.section14Body`（webfetch 实证） | 在 `zh.json` 补全：「如您對本服務條款有任何疑問，請聯絡我們：」 |
| P0-2 | `zh.json` 缺 `privacy.section12Body`；对照 `en.json:962` | ZH 隐私政策第 12 节同样缺正文（与 P0-1 同类） | 补「如您對本隱私權政策有任何疑問，請聯絡我們：」 |
| P0-3 | `about` i18n `intro` vs `timeline.events[0]` vs `AboutClient.tsx:57` vs 线上 timeline stats | **成立年份四套说法**：intro「Founded in **2023**」；events「**2020**: TechGuru founded in Manila」；About 预览硬编码 `['2023','2024','2025']`；timeline 页脚 stats「**2023** Founded」但事件流从 2020 起 | 统一为一个事实源（建议以 timeline 2020 为准或反过来改 events），同步 intro、About 预览年份、timeline stats |
| P0-4 | `zh.json` `terms.intro` / `terms.section9Body` | ZH 条款正文混入未翻译英文：「本服務條款（「條款」） **governs** 您對…」；「您同意 **defending、indemnify 並 hold harmless** TechGuru…」 | 整句重译为繁中法律用语（「管轄您…」「同意對…進行抗辯、賠償並使其免受損害」） |
| P0-5 | `terms/page.tsx:35`、`privacy/page.tsx:35` | `Last Updated: **July 1, 2026**` 英文写死，ZH 页面显示英文日期 | 日期迁入 i18n 或按 locale 格式化（2026年7月1日） |
| P0-6 | Home social proof `home.socialProofStat4=12+ / Years of Enterprise IT` | 与 2020 成立（约 6 年）或 2023 成立（约 3 年）均矛盾，企业站夸大风险高 | 改为可验证数字（如 6+ / Since 2020），或改为「12+ 年行业经验」并指向团队个人履历而非公司年龄 |

### P1 — 信任/双语/转化损伤（本迭代应修）

| # | 位置 | 现状 | 建议 |
|---|------|------|------|
| P1-1 | `ProductsList.tsx:174`、`CategoryPage.tsx:82`、线上 `/zh/products/build` | 卡片 CTA **硬编码英文**「Learn more」；ZH 品类页还有「← View all products」英文 | 加入 i18n（`products.learnMore` / `products.viewAllProducts`），双语文案 |
| P1-2 | `en.json` vs `zh.json` → `products.features['ai-assisted-coding']` | **不是翻译关系**：EN 是落地服务五步（Readiness/Tool deployment/Training/Governance/Rollout）；ZH 是通用能力五项（代碼生成/自動化測試/…） | 以 EN 为源重译 ZH，或确认产品定义后两边同步改写 |
| P1-3 | `compare` i18n `testimonials.items` | 证言「saved us **40%**」「cut annual IT costs by **35%**」，作者仅职位/行业，无姓名/公司；线上 compare 同内容 | 改为可核验案例（客户名+授权）或降级为匿名但去掉精确百分比；否则删除 |
| P1-4 | `compare` 对比表 | 竞品列为虚构标签「Traditional Vendor」「Cloud-Only Provider」，几乎全是 TechGuru 全胜 | 改为与真实替代路径对比（自建/纯公有云/原厂续约），或改为「决策维度自查表」避免树稻草人 |
| P1-5 | `AboutClient.tsx:57` | 时间线预览写死 `2023, 2024, 2025`，与完整 timeline 2020–2025 不一致，About 页误导成立时间 | 从 timeline 数据动态取首末年，或改为 2020–2025 |
| P1-6 | `AboutClient.tsx:45` | 「View Full Timeline」链接 `href="/about/timeline"` **缺 locale 前缀** | 改为 `/${locale}/about/timeline` |
| P1-7 | `UserMenu.tsx:123,136,145` | 「Sign Out」「Sign In」「Create Account」硬编码英文，ZH 导航用户菜单英文 | 接入 `useTranslations('nav'/'auth')` |
| P1-8 | `TicketList.tsx:147` | 「Submit a ticket to get started」硬编码 | 用已有 `support.submitTicketHint` |
| P1-9 | `LoginForm.tsx:37,59`、`profile/page.tsx:50-51` | 网络错误、密码不匹配等提示硬编码英文 | 迁入 auth i18n |
| P1-10 | `auth.noEmail` | 「Didn **receive** the email?」缺 `t` | 改为「Didn't receive the email?」 |
| P1-11 | 全站 nav/footer | EN「**Tickets**」vs ZH「**客戶支持**」——同一入口两种语义；EN 丢失 Support 品牌词 | EN 改为「Support」或「Support Tickets」，与 ZH 对齐 |
| P1-12 | ZH 术语体系 | **構建/建構** 混用；**承載/運行** 混用；产品页标题「Build，構建…」中英夹杂；metadata 用「建構 — AI驅動」正文用「構建」 | 建立术语表（建议：構建 / 承載 / 保護），全库替换并做一次 i18n lint |
| P1-13 | ZH 简体残留 | `home/page.tsx:466` 与 `HeroSection.tsx:295`、`vmware-alternative/page.tsx:196`、`TcoCalculator*`：「**计算**」；`zh.json:184`「可靠的**基础**設施」；terms「包括**不**过」式简体「包括但不限于」「信息」；products features「代碼/網絡/支持」 | 全面简→繁校对（計算/基礎/包括但不限於/資訊/程式碼/網路/支援） |
| P1-14 | S11 废弃残留 | `hero.cta.cases` = 「View Case Studies / 查看案例」仍存在；HeroSection 当前 ctaLinks 已不用该键 | 删除死键，避免后续误接 |
| P1-15 | `CategoryPage` 标题区 + 描述卡 | `buildTitle`/`buildStory` **渲染两次**（`CategoryPage.tsx:92-93` 与 106-111），线上 `/en/products/build` 实证重复段落 | 去掉重复描述卡或改用不同短摘要 |
| P1-16 | About 团队 | i18n fallback 两名「**Co-Founder**」占位；Sanity 实数据已是 Marcus Tan / Danielle Reyes（线上 about 实证） | 更新 i18n 为真实姓名或改为无 fallback 展示逻辑 |
| P1-17 | 数字口径不一致 | Home「19 Technology Partners」；compare「20+ vendor」；timeline 事件「25+ vendor partnerships」；timeline stats「20+ Vendor Partners」 | 统一伙伴计数口径与展示数字 |
| P1-18 | Blog 双源 | 列表用 Sanity post；detail 与静态 i18n `blog.articles`/`blog.detail.articles` 并存，标题已漂移 | 明确以 Sanity 为唯一源，i18n 仅保留 UI 壳文案 |

### P2 — 体验/专业度打磨（可排期）

| # | 位置 | 现状 | 建议 |
|---|------|------|------|
| P2-1 | `contact` i18n keys `taipei`/`taipeiAddr`/`hongKong`/`hongKongAddr` | key 叫台北/香港，值是马尼拉总部与电话邮箱 | 重命名为 `hq`/`hqAddr`/`contactInfo` 等 |
| P2-2 | `solutions` finance.products | 「We avoid core banking and trading platforms」作为「AI Applications」列表项，读起来像风险声明 | 移入 solutions 描述或 Why 区，不放在 products 亮点列表 |
| P2-3 | `solutions` ZH 深度 | EN 单条串起 Build:… Run:… Protect:…；ZH 拆成 3 短句且 Protect 常缺失 | 按 EN 结构补全 ZH 三支柱覆盖 |
| P2-4 | `home.stats` 标签 | keys 名 `clients`/`uptime`/`years`/`partners`，值却是「Solutions Delivered / Vendor Certifications / Markets Across Asia / Technology Partners」——命名与语义错位 | 重命名 keys 或修正标签文案 |
| P2-5 | `profile` | 无 i18n 命名空间，全部 ternary；与站点其余部分技术债不一致 | 建 `profile.*` 键并迁移 |
| P2-6 | Help GDPR | 菲律宾注册公司主推 GDPR/CCPA 条款，对目标市场偏「模板合规」 | 补充菲律宾 DPA（Data Privacy Act of 2012）表述 |
| P2-7 | VMware reason3 | 「Broadcom's October **2027** VCF 9 cutover」——时间敏感事实，过期即失信 | 加数据核验负责人与复审周期 |
| P2-8 | Compare 认证卡 | 厂商认证文案硬编码在 `compare/page.tsx:75-80`，未进 i18n | 迁入 i18n 或 Sanity 资质数据 |
| P2-9 | 产品卡信息密度 | Category 卡仅 5 条 feature bullets 拼接，无差异化价值句 | 为每产品补 1 句 outcome 导向描述 |
| P2-10 | Footer newsletter | 中英同构「Stay Updated / 保持更新」偏模板，无频率/内容承诺 | 补「每月 1 封，仅产品与行业洞察」类可信说明 |
| P2-11 | Hero 双语文案 | ZH tagline「以AI構建。超越VMware運行。無邊界保護。」节奏可，但「無邊界保護」略口号化 | 与品牌确认后微调为更具体承诺 |
| P2-12 | 登录注册 | ZH `checkEmail`：「檢查**你的**信箱」用「你」，全站其余用「您」 | 统一敬语「檢查您的信箱」 |

---

## 3. 双语差距专项

### 3.1 键完整性

| 指标 | 数值 | 证据 |
|------|------|------|
| EN 叶子键 | 890 | PowerShell flatten `en.json` |
| ZH 叶子键 | 888 | 同上 |
| ZH 缺失 | **2** | `privacy.section12Body`、`terms.section14Body` |
| EN 缺失 | 0 | — |

**结论**: 键覆盖率接近 100%，但**缺的 2 个键恰好都在法律页**，且 `terms.section14Body` 已在生产裸奔。

### 3.2 语义等价（同键不同义）

| 键路径 | EN | ZH | 问题 |
|--------|----|----|------|
| `nav.support` / `footer.support` | Tickets | 客戶支持 | 语义不对等（工单 vs 支持中心） |
| `products.features.ai-assisted-coding[*]` | 落地服务五步 | 通用编码能力五项 | **非翻译，内容分叉** |
| `solutions.industries.*.solutions[*]` | 单条含 Build/Run/Protect 全景 | 拆短、Protect 常缺 | ZH 信息量不足 |
| `about.intro` | Founded in 2023 | 成立於2023年 | 双语一致但**与 timeline 2020 冲突**（事实层） |
| `about.timeline.events[0]` | 2020 founded Manila | 2020年…馬尼拉成立 | 双语一致，与 intro/stats 冲突 |
| `blog.articles.1.title` vs `blog.detail.articles.1.title` | Hybrid Cloud Architecture Design Guide vs Building Resilient… | 混合雲架構設計實戰指南 vs 建構彈性混合雲架构 | 列表/detail 标题体系不一致 |

### 3.3 繁中质量与简体污染

| 类型 | 样例 | 位置 |
|------|------|------|
| 简体按钮 | 计算 TCO / 计算你的 TCO | `home/page.tsx:466`、`HeroSection.tsx:295`、`vmware-alternative/page.tsx:196`、`TcoCalculatorClient.tsx` |
| 简体混入繁中句 | 可靠的**基础**設施 | `zh.json` home.metadata.runStory |
| 简体法律句 | 包括**不**过式「包括但不限于」；「信息」 | `zh.json` terms.section2Body 等 |
| 简体产品词 | 代碼、網絡、支持 | `zh.json` products.features |
| 繁简混用品牌词 | 雲安全 / 雲端安全；基礎設施 / 基础設施 | home vs products |
| 敬语不一致 | 您 vs 你 | auth.checkEmail |
| 英文残留（非品牌名） | Learn more、View all products、Sign In、Sign Out、Create Account、governs、defending/indemnify、Network error… | 组件硬编码 + terms 正文 |
| 术语摇摆 | 構建/建構；承載/運行；影片/视频 | home、products metadata、storyline |

### 3.4 硬编码双语绕过 i18n（技术债清单）

这些位置用 `locale === 'zh' ? … : …` 或纯英文常量，未进 `messages/*.json`：

1. `home/page.tsx` — Partner 标题、AI 路径三卡、VMware 迁移三步、TCO CTA  
2. `HeroSection.tsx` — TCO 按钮  
3. `CategoryPage.tsx` / `ProductsList.tsx` — Learn more（且**两边都未本地化**）  
4. `AboutClient.tsx` — 年份数组  
5. `UserMenu.tsx` — Sign In / Sign Out / Create Account  
6. `TicketList.tsx` — Submit a ticket…  
7. `LoginForm.tsx` — Network error…  
8. `profile/page.tsx` — 几乎全部 UI 文案  
9. `compare/page.tsx` — 厂商认证卡  
10. `TcoCalculatorClient.tsx` / `TcoCalculatorSection.tsx` — 整段计算器 UI  
11. `Breadcrumb.tsx` — homeLabel ternary  
12. `terms/page.tsx` / `privacy/page.tsx` — Last Updated 日期  

**风险**: 做文案审计或切换语言时 i18n 工具扫不到这些字符串；ZH 质量无法集中治理。

---

## 4. 差距分析总结（与理想企业官网文案的差距）

### 4.1 事实一致性与可信度（差距最大）

理想企业站的数字、年份、客户、伙伴、认证在全站同源。当前：

- 成立年份 2020 / 2023 双轨  
- 伙伴数 19 / 20+ / 25+ 多轨  
- 客户数 100+ / 200+ 多轨  
- 「12+ Years」与成立年份冲突  
- Compare 用精确百分比证言却无具名客户  
- 对比表用稻草人竞品  

**差距本质**: 缺少「事实清单」（single source of truth）与发布前数字核对流程。

### 4.2 双语工程成熟度

理想：一键 i18n lint（缺键=CI fail、简繁检测、术语表）。  
当前：覆盖率高但法律页缺键裸奔；大量硬编码绕过；简体污染；术语表缺失。  
**差距本质**: 文案进了 JSON，但没有质量门禁。

### 4.3 信息架构与去重

理想：每页一个主标题、一段价值主张、一条 CTA 链。  
当前：品类页标题+Story 双份渲染；Home 同时出现 conversion CTA 与 ctaTitle 两套底部文案（i18n 中 `conversion*` 与 `cta*` 并存）；Solutions 的 pain/solutions/products 三层 EN/ZH 深度不对等。  
**差距本质**: 组件拼装时未做内容去重与唯一叙事。

### 4.4 品牌调性统一（Enterprise IT）

理想：克制、可验证、技术向，避免空话。  
较好的部分：VMware 页「双 Hypervisor、分阶段、保投资」具体；Help FAQ 回答有流程与 SLA。  
较差的部分：Compare 证言、Home「深受亞洲企業信賴」+ 无 logo 墙以外的社会证明、Hero 口号化「無邊界保護」。  
**差距本质**: 强页面已具备企业叙事，弱页面仍在「SaaS 模板腔」。

### 4.5 转化文案链路

理想：每屏明确「你是谁→你有何痛→我们如何解→下一步做什么」。  
当前：Home→Contact 通；VMware→TCO→Contact 通；但产品卡「Learn more」中英不统一且 ZH 英文，损失专业感；Support EN 叫 Tickets 弱化支持品牌；Profile 无引导回产品。  
**差距本质**: CTA 文案未纳入同一套 copy deck。

### 4.6 法律与合规文案

理想：结构完整、双语同步、日期本地化、管辖与第三方清单准确。  
当前：EN Privacy/Terms 结构完整（12/14 节）且第三方清单具体（Vercel/Sanity/Supabase/Resend）——这是加分项。  
但 ZH 缺 2 个 body、含未翻译英文、日期英文写死、对菲公司主写 GDPR/CCPA 而非 PH DPA。  
**差距本质**: 法律页当静态翻译件维护，未纳入发布检查。

### 4.7 CMS 与 i18n 双源漂移

Blog / About Team / Qualifications 走 Sanity；标题壳与静态 articles 在 i18n。  
已观察到：列表 vs detail 标题漂移、i18n 团队占位名 vs Sanity 真名。  
**差距本质**: 双源无同步契约。

---

## 5. 修复优先级建议

### 本周（P0，半天～1天可完成）

1. 补 `zh.json`：`privacy.section12Body`、`terms.section14Body`（立即消裸键）  
2. 重写 `zh.json` terms.intro / section9Body 英文残留  
3. 统一成立年份与 timeline stats / About intro / 预览年份  
4. 修正 Home「12+ Years」为可验证口径  
5. Privacy/Terms「Last Updated」日期 i18n 化  

### 两周内（P1）

6. 产品卡 Learn more / View all products 双语键化  
7. 清除 ZH 简体污染（计算/基础/包括但不限于/信息/代碼/網絡/支持→計算/基礎/包括但不限於/資訊/程式碼/網路/支援）  
8. 建立术语表：構建 / 承載 / 保護 + 伙伴数/客户数统一口径  
9. UserMenu / TicketList / LoginForm / Profile 硬编码迁 i18n  
10. 对齐 EN/ZH `ai-assisted-coding` features 与 solutions 深度  
11. About 预览年份 + timeline 链接 locale  
12. Nav/Footer EN Tickets → Support  
13. 处理 Compare 证言与对比表可信度  
14. 删除 `hero.cta.cases` 死键；CategoryPage 去重  

### 本迭代（P2）

15. Contact key 重命名；solutions finance「avoid core banking」位置调整  
16. Profile 建 i18n 命名空间  
17. TCO 计算器全文 i18n 化  
18. Help 补 PH DPA  
19. Blog 单源化（Sanity）  
20. CI：i18n 缺键检测 + 简体字符扫描 + 数字口径 lint  

### 建议的「文案发布门禁」最小集

- `en.json`/`zh.json` 键 diff = 0  
- ZH 文件禁止 `[\u7b80\u4f53字表]`（计算/网络/信息/基础/设置…）  
- 组件 `src/` 禁止面向用户的英文字符串字面量（白名单：品牌名、产品名、SLA 缩写）  
- 数字（年份/伙伴数/客户数/百分比）必须来自同一份 `facts.json` 或 CMS 字段  

---

## 附录 A：线上抽样证据

| URL | 观察 |
|-----|------|
| `https://www.techguru-it.asia/zh/terms` | 显示裸键 `terms.section14Body`；正文含 `governs`、`defending、indemnify 並 hold harmless`；「包括但不限于」 |
| `https://www.techguru-it.asia/zh/products/build` | 多处「Learn more」「View all products」英文；标题「Build，構建您的業務負載」中英夹杂；Story 重复出现 |
| `https://www.techguru-it.asia/en/about` | Intro「Founded in 2023」；团队为 Sanity 真名 Marcus Tan / Danielle Reyes；预览仅 2023–2025 |
| `https://www.techguru-it.asia/en/about/timeline` | 事件 2020–2025 完整；页脚 stats「2023 Founded / 20+ Vendors / 100+ Clients」与事件「25+ / 200+」冲突 |
| `https://www.techguru-it.asia/en` | Social proof「12+ Years of Enterprise IT」；伙伴 marquee 正常 |
| `https://www.techguru-it.asia/zh` | Hero「计算 TCO」简体；导航「客戶支持」vs EN「Tickets」 |
| `https://www.techguru-it.asia/en/compare` | 对比表全胜 + 认证卡；证言百分比无客户名 |

## 附录 B：评估方法

1. 读取全部目标 `page.tsx` / 关键客户端组件源码（#36）  
2. PowerShell flatten 对比 `en.json`/`zh.json` 叶子键与缺失项  
3. 精确提取 nav/hero/home/about/products/solutions/blog/contact/support/help/compare/vmware/privacy/terms/auth 段  
4. webfetch 抓取 en/zh 主要页面与 terms/about/products/build/compare 做生产对照  
5. 正则扫描硬编码英文与简体残留  
6. 未使用 `npm run dev`（#32）；未修改任何业务代码（本任务为只读评估）
