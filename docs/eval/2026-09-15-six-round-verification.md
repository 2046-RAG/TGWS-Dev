# 六轮四维准确性复核 · 与三轮结果对比

**日期**: 2026-09-15  
**基线**: `2026-09-15-verification-matrix.md`（三轮）  
**本轮新增**: R4 网络层 · R5 组件全量重读 · R6 对抗性证伪  
**原始数据**: `docs/eval/2026-09-15-round456-raw.json`

## 轮次定义

| 轮 | 名称 | 方法 | 相对三轮 |
|----|------|------|----------|
| R1 | 源码/i18n | 键差、file 扫描 | 已有 |
| R2 | 运行时 DOM | Playwright 滚动 + complete | 已有 |
| R3 | 交叉对照 | 正文↔i18n↔组件 | 已有 |
| **R4** | **网络层** | 20 页 HTTP 抓取、资产 HEAD、API POST | **新** |
| **R5** | **组件全量** | 16 个关键文件逐文件特征矩阵 | **新** |
| **R6** | **对抗证伪** | 每条硬结论尝试推翻 | **新** |

### R4 噪声说明（必须读）

Next 会把 i18n messages 序列化进几乎每个页面的 RSC/HTML。因此 **`40%` / `Traditional Vendor` / `12+` 在全站 HTML 为 true 不能当作「该页渲染了这些内容」**。  
可信信号是**页面特异**结果：裸键、`Learn more`、`imgTags`、资产 200/非 200、API 状态码。

---

## 逐条结论：三轮 vs 六轮

| ID | 结论 | 三轮终判 | R4 | R5 | R6 | **六轮终判** | 相对三轮 |
|----|------|----------|----|----|----|--------------|----------|
| H1 | ZH 缺 `terms.section14Body` 线上裸键 | ✅ | 仅 `/zh/terms` bare14=true | page 使用 section14 | en有/zh无 | ✅ **成立** | 不变 |
| H2 | ZH 缺 `privacy.section12Body` 线上裸键 | ✅ | 仅 `/zh/privacy` bare12=true | page 使用 section12 | en有/zh无 | ✅ **成立** | 不变 |
| H3 | ZH 条款 `governs` 残留 | ✅ | `/zh/terms` `/zh/privacy` true（zh/home 为 i18n 内联噪声） | — | — | ✅ **成立** | 不变，补噪声说明 |
| H4 | 成立年份 2020 vs 2023 vs 12+ | ✅ | home 12+；timeline 页含多口径 | AboutClient 预览 2023–25；i18n 双年份 | 无法证伪 | ✅ **成立** | 不变 |
| H5 | 伙伴 19/20+/25+、客户 100+/200+ | ✅ | home partners19；HTML 内联污染 | home 硬编码 | — | ✅ **成立**（以 R1/R2 正文为准） | 不变 |
| H6 | `Learn more`/`View all products` 硬编码且无 i18n key | ✅ | `/en/products` `/en/products/build` true | ProductsList+CategoryPage | **i18n 无 learnMore key** | ✅ **成立** | **强化**（R6 证明无 key） |
| H7 | solutions GROQ 缺 Zh/metric 字段 | ✅ | zh/solutions 有内容（来自 i18n fallback） | Q 无 / L+S 有 | deadPath=true 静默 fallback | ✅ **成立** | **强化** |
| H8 | 首页 19 Partner 硬编码，schema 闲置 | ✅ | logos 资产全 200 | home partnerHardcoded；无 getPartners | schemaExists 路径误报 false→**以 R5 partnerSchema 为准存在** | ✅ **成立** | 不变（修正 R6 路径 bug） |
| H9 | 产品 image 字段未接入详情 | ⚠ 设计用图标 | 产品详情 **imgTags=0** | Detail 无 next/image/img；有 iconMap | parent 不取 image | ✅ **成立为架构/内容债** | 表述保持「非故障」 |
| H10 | Compare 40% 证言 **未渲染** | ✅ 已改 | HTML 含 40%（**内联噪声**） | compare 无 testimonial | compare 树 0 命中 | ✅ **成立（未渲染）** | 不变 |
| H11 | EN TCO **不显示**中文（真问题是硬编码） | ✅ 已改 | EN vmware 无中文 | isZh×26 | 中文行多在 `zh:` 字段；无条件中文行仅 4（数据字典） | ✅ **成立** | 不变；补充「无条件中文极少」 |
| H12 | 测试计划限流 = 实现 | ✅ | POST 外域 Origin→**403** | rates 在 route 非 guard | 数字 5/20/3/10/10 对齐 | ✅ **成立** | **强化**（R4 实弹 403） |
| F1 | Partner logo 破损 | ❌ | 资产 200，优化器 200 | — | — | ❌ **维持证伪** | 不变 |
| F2 | 配图 76.6% broken | ❌ | 未复用该指标 | — | — | ❌ **维持作废** | 不变 |
| F3 | Compare 证言已上线 | ❌ | 内联 40% ≠ 渲染 | 无 UI | 无 UI | ❌ **维持证伪** | 不变 |
| F4 | EN 页中文串台 | ❌ | — | isZh 分支 | 数据字典中文 | ❌ **维持证伪** | 不变 |

---

## 六轮新增发现（三轮矩阵未覆盖）

| # | 发现 | 轮次 | 说明 |
|---|------|------|------|
| N1 | `/api/products`、`/api/tco` GET 200 | R4 | 契约可用 |
| N2 | 跨域 POST `/api/contact` → **403 Forbidden origin** | R4 | api-guard 生效，非纸面配置 |
| N3 | 全部抽样 logo 资产 HTTP 200 | R4 | 再次否定 F1 |
| N4 | TCO 无条件中文行 ≈4（`zh:` 数据字段） | R6 | 「27 处中文」应表述为 **isZh 三元 + 数据字典**，非 EN 误显示 |
| H6′ | `products.learnMore` **i18n key 不存在** | R6 | 修复时必须**新增 key**，不是改调用 |
| N5 | R4 全页 `12+`/`Traditional`/`40%` 为真 | R4 | **i18n 内联噪声**；禁止再用裸 HTML includes 做页面级文案断言 |
| N6 | partner schema 在 `tgws/sanity/schemas/partner.ts` | R5 | R6 `ROOT/sanity` 路径错误导致假「不存在」 |

---

## 维度汇总（六轮后）

### D1 文案 — 置信提升
- **P0 保持**: H1 H2 H3 H4 H5  
- **P1 保持且加强**: H6（无 i18n key）  
- **降级保持**: H10 证言死数据；H11 非串台  

### D2 配图 — 结论收紧
- 唯一稳定项：产品摄影缺失 / image 未接 UI（H9）  
- logo/broken 类维持证伪  
- R4 imgTags：products 列表 5、build 0、详情 0、blog 77、home 64、about 0  

### D3 硬编码 — 置信提升
- H7 H8 六轮未被动摇，且 R5 字段矩阵 + R6 deadPath 强化  
- TCO：改为「i18n 债」表述（H11）  

### D4 测试计划 — 置信提升
- 限流数字一致 + **线上 CSRF 403 实证**（H12/N2）  
- 计划本身仍未大规模执行  

---

## 与三轮矩阵对比结论

| 类型 | 数量 | 说明 |
|------|------|------|
| 维持成立 | 12 条硬结论中 12 | 无一被 R4–R6 推翻 |
| 维持证伪 | 4 条 | F1–F4 仍假 |
| 表述加强 | 3 | H6 无 key、H7 静默路径、H12 实弹 403 |
| 表述修正 | 2 | H11 TCO 中文细节；R6 partner 路径误报 |
| 新增噪声规则 | 1 | N5：禁止用全页 HTML includes 判文案是否展示 |
| 新增正向证据 | 3 | API 200、Origin 403、logo 200 |

**总评**: 六轮复核**没有推翻**三轮后的硬结论集，反而用网络层与对抗层**加固**了 H1–H12；同时暴露了 R4 方法噪声与一处 R6 路径 bug，已在校正中排除。

**权威优先级**: 本文件 > `2026-09-15-verification-matrix.md` > 各维度初版报告。

---

## 建议修复集（仅六轮后仍成立项）

1. 补 ZH `terms.section14Body`、`privacy.section12Body`  
2. 统一成立年份 / 伙伴 / 客户 / 年限数字单一源  
3. solutions GROQ 补 `challengesZh/solutionsZh/metricLabel*/recommendedProductsZh`  
4. 新增 i18n `learnMore`/`viewAllProducts` 并替换硬编码  
5. Partner 迁 Sanity（schema+revalidate 已备）  
6. Decide：Compare 证言接入 UI 或删除死 i18n  
7. Decide：product.image 接入详情或保持图标并文档化  
8. TCO 标签迁 next-intl（数据字典可留）  
