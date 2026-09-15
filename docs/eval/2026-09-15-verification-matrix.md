# 四维结论 · 三轮准确性复核矩阵

**日期**: 2026-09-15  
**方法**:  
- **R1 源码/i18n**: 键差 flatten、file 扫描、GROQ/schema/UI 三方对照  
- **R2 线上运行时**: Playwright Edge，全页滚动 + 等 `img.complete` 后再统计  
- **R3 独立交叉**: 线上正文断言 ↔ i18n 存在性 ↔ 组件是否渲染 ↔ 报告原文对照  

**判定**: ✅ 成立 · ❌ 证伪 · ⚠ 部分成立/表述需改 · ➖ 未测到支持

---

## 维度 D1 文案

| 结论 | R1 源码 | R2 线上 | R3 交叉 | 终判 |
|------|---------|---------|---------|------|
| ZH 缺 `terms.section14Body` | ✅ EN890/ZH888，缺2键 | ✅ `/zh/terms` 裸键=true | ✅ 键不存在 | ✅ **成立** |
| ZH 缺 `privacy.section12Body` | ✅ 仅 EN 有 | ✅ `/zh/privacy` 裸键=true | ✅ | ✅ **成立** |
| ZH 条款 `governs` 英文残留 | — | ✅ true | ✅ | ✅ **成立** |
| 成立年份 2020 vs 2023 矛盾 | ✅ intro=2023，events[0]=2020 | ✅ timeline 页 2020+2023 Founded 同现 | ✅ | ✅ **成立** |
| 伙伴数 19 / 20+ / 25+ 多口径 | ✅ Home 硬编码 19 | ✅ home「19」；timeline「25+」「20+」 | ✅ | ✅ **成立** |
| 客户 100+ vs 200+ | — | ✅ timeline 页两者皆 true | ✅ | ✅ **成立** |
| Home「12+ Years」与成立年冲突 | ✅ socialProofStat4=12+ | ✅ home 显示 12+ Years | ✅ 与 2020/2023 均冲突 | ✅ **成立** |
| `Learn more` 英文硬编码 | ✅ ProductsList/CategoryPage | ✅ `/en/products/build` true | — | ✅ **成立**（ZH 页是否显示英文待单独确认，R2 未抓 zh-build） |
| Compare 40%/35% 证言上线 | ✅ i18n 有 | ❌ 线上 compare **无** | ✅ page.tsx **不渲染** testimonials | ❌ **证伪「线上展示」**；⚠ 改为「i18n 死数据/未接入 UI」 |
| EN VMware 页显示中文 TCO | ✅ TcoCalculator `isZh?中:英` | ❌ EN HTML 无「计算」 | ✅ EN 分支是英文 | ❌ **证伪「EN 显示中文」**；⚠ 真问题是硬编码未进 i18n |
| Privacy 日期 `July 1, 2026` | ✅ 写死 | ✅ EN+ZH 皆 July 1, 2026 | ✅ ZH 未本地化日期 | ✅ **成立**（ZH 用英文日期格式） |
| About 预览年 2023–2025 | ✅ AboutClient:57 | ✅ about 含 2023 | ✅ | ✅ **成立** |
| timeline 链接无 locale | ✅ `href="/about/timeline"` | — | — | ✅ **成立**（路由层可能有 middleware 兜底，链仍不规范） |

**D1 终判**: 法律裸键、年份/数字矛盾、硬编码 CTA、日期未本地化 **高置信成立**。  
Compare 证言「线上展示」与「EN 页中文」**两条证伪/降级**。

---

## 维度 D2 配图

| 结论 | R1 | R2 | R3 | 终判 |
|------|----|----|-----|------|
| Partner logo 空白破损 | 文件 19 个在 | 滚动后 **0 broken**，57 loaded | HTTP 200 | ❌ **已证伪** |
| 配图 76.6% broken | 统计来自错误采样 | 正确采样 home: 64 图 0 broken | — | ❌ **作废** |
| 产品详情无 `<img>` 摄影图 | schema 有 image；Detail 用 iconMap | AIGC 详情 **0 img** | page.tsx 不取 image 字段 | ⚠ **成立但应表述为「设计用图标 + 未接入 product.image」**，非故障 |
| 首页 Hero 下方大留白 | — | 截图可见布局问题 | 未在本轮重测 | ⚠ **待重测**（截图存在但未本轮复验） |
| About 团队无图 | — | about 0 img（本轮） | 源码有 avatar 条件渲染 | ⚠ 若 Sanity 无 avatar 则走占位符；**不能断言「无图能力」** |
| Solutions 仅 1 图 | — | ✅ | schema 有 image 字段 | ⚠ 弱视觉，非 broken |

**D2 终判**: 唯一硬结论是「产品线几乎无摄影/hero 资产、UI 未用 image 字段」。其余 broken 类结论已废。

---

## 维度 D3 硬编码 vs CMS

| 结论 | R1 | R2 | R3 | 终判 |
|------|----|----|-----|------|
| 首页 19 Partner 硬编码 | ✅ 精确 19 条 | — | ✅ 无 getPartners | ✅ **成立** |
| partner schema + revalidate 已预留 | ✅ partner.ts 字段全 | — | ✅ revalidate 含 partner | ✅ **成立** |
| solutions GROQ 缺 6 字段 | ✅ query 无 Zh/metric 字段；list+schema 有 | — | ✅ | ✅ **成立**（静默 fallback） |
| compare 认证硬编码 | 源码页用 i18n partnerCertifications | — | 非 Sanity | ⚠ 在 i18n 而非 CMS；与「无 schema」表述可并存 |
| TCO 27 处 isZh 三元 | ✅ TcoCalculatorClient 大量 isZh | EN 页不出现中文 | — | ⚠ **成立为 i18n 债**；「EN 显示中文」不成立 |
| products/blog/team 已接 Sanity | 部分有 fetch | about 0 img 或无 avatar | — | ⚠ 部分成立，需按模块拆 |

**D3 终判**: Partner 硬编码、solutions query 缺口 **高置信成立**。TCO 属 i18n 治理不是语言串台。

---

## 维度 D4 测试计划

| 结论 | R1 | R2 | R3 | 终判 |
|------|----|----|-----|------|
| 限流 contact=5 search=20 lead=3 tickets=10 upload=10 | ✅ 与 api-guard/route 一致 | — | ✅ plan 与 source 数字一致 | ✅ **成立** |
| Origin 检查除 search 外开启 | ✅ search origin=false，其余 true | — | — | ✅ **成立** |
| functional + e2e 目录存在 | ✅ | — | ✅ api-guard.test 存在 | ✅ **成立** |
| SEC 用例数 | plan 含 SEC 多处 | — | 未执行 | ⚠ 计划为文档，**未跑**；数字口径需以文件为准 |
| 破坏性不打生产 | 策略写明 | — | — | ✅ 策略正确（待执行时遵守） |

**D4 终判**: 与源码一致的限流/路径事实 **成立**；执行结果 **尚未产生**。

---

## 汇总：三轮后仍站得住的「硬结论」

1. ZH 法律 2 键缺失 → 线上裸键  
2. 成立年份 + 伙伴/客户/年限数字多口径  
3. solutions GROQ 未取 Zh 字段（CMS 中文无效）  
4. 首页 Partner 硬编码 vs partner schema 闲置  
5. 产品 image 字段未接入详情 UI（图标化设计）  
6. Compare 证言 40%/35% 仅在 i18n、**页面未渲染**  
7. TCO/组件中文为硬编码 i18n 债，**不是 EN 串中文**  
8. 测试计划限流数字与实现一致  

## 汇总：已证伪或必须改写

1. Partner logo 破损  
2. 配图 76.6% broken  
3. Compare 证言已上线展示  
4. EN VMware/TCO 页显示中文  
5. 「所有维度评估已完成可直接修复排期」——配图需重做，文案 P1 需按上表降级  

---

## 报告文件状态

| 文件 | 状态 |
|------|------|
| `2026-09-15-text-quality.md` | 部分过时：Compare 证言、TCO 中文表述需改 |
| `2026-09-15-image-quality.md` | 已含勘误；产品「无图」表述需再收紧 |
| `2026-09-15-hardcoded-content.md` | 核心 P0 仍成立 |
| `2026-09-15-test-plan.md` | 限流事实成立；待审批执行 |
| `2026-09-15-eval-correction.md` | 有效 |
| `2026-09-15-verification-matrix.md` | **本文件（三轮复核权威结论）** |
