# 四维评估质量勘误与方法论检讨

**日期**: 2026-09-15（用户指出「所有评估都有问题」后复核）  
**原则**: 不辩护、只认证据；区分「已证实 / 已证伪 / 表述过度」

---

## 1. 配图子代理为何失败

| 项 | 事实 |
|----|------|
| actor_id | `general-2` |
| 平台报错 | `Actor assistant failed: UnknownError`（19 轮后中断，**非业务断言失败**） |
| 已留下产物 | `docs/eval/shots/*.png`（约 40 张）、`shot-capture.cjs`、`image-diagnostics.json`、`product-detail-diagnostics.json` |
| 未完成 | **没有写出** `2026-09-15-image-quality.md` 报告本身 |
| 我的错误 | 在子代理失败后，**未复核诊断质量**，直接用 `naturalWidth=0/complete=false` 计数写了报告，把 **lazy-load 时序** 当成 broken image |

根因链：

1. 子代理脚本用 `waitUntil: domcontentloaded` + 短滚动 + **立即**采 DOM（`shot-capture.cjs:47-76`）  
2. Partner 区 `loading="lazy"` + 距视口远 → 大量 `complete=false`  
3. 子代理会话在写报告前 **UnknownError 崩掉**（环境级，无更细日志）  
4. 主代理接管时未做「滚入视口再采样」校验 → 产出错误 P0  

---

## 2. 逐条结论可信度（复核后）

### 2.1 已证伪 / 必须撤销

| 原结论 | 复核 | 现状 |
|--------|------|------|
| 首页 Partner logo 空白破损 | 文件在、HTTP 200、滚入视口后全部加载 | **撤销** |
| 配图「76.6% broken」 | 含大量 lazy 时序样本 | **数字作废**，不能当质量指标 |
| 产品详情「19/19 零配图 = 视觉破损」 | 页面**故意用 lucide 图标**，无 `<img>` 是设计选择不是挂图 | 降级为「产品摄影/hero 图缺失」设计差距，非故障 |

### 2.2 已独立复核、仍然成立

| 结论 | 证据 |
|------|------|
| ZH 缺 `terms.section14Body`、`privacy.section12Body` | `en 890 / zh 888` 键差；线上 `/zh/terms` 含裸键 **True** |
| ZH 条款英文残留 `governs` | 线上 **True** |
| solutions GROQ 缺 `challengesZh/solutionsZh/...` | `page.tsx:29-39` query vs `SolutionsList.tsx` interface vs `solution.ts` schema 字段均存在 |
| About 预览年份写死 2023–2025、timeline 链接无 locale | `AboutClient.tsx:45,57` 源码实读 |
| 成立年份多口径 | i18n intro vs timeline events vs stats（源码/i18n） |
| Compare 无具名证言 | i18n 文案 |
| partner schema 已有、首页硬编码 | `partner.ts` + `home/page.tsx:124-144` |
| About 团队有 avatar 字段并渲染 | `AboutClient.tsx:87-97`（有图走 Sanity，无图渐变占位）— 与「about 0 img」采集一致，**不是 about 全站无图** |

### 2.3 表述过度、需降级

| 原表述 | 问题 | 应改为 |
|--------|------|--------|
| 「配图问题最重 P0」 | 证据链被 lazy-load 污染 | 「需按区块滚动复测；已确认真实缺口主要在产品视觉体系」 |
| 「产品页无图属破损」 | 设计为图标卡 | 「Sanity product.image 字段存在但详情 UI 未消费；企业站缺产品视觉资产」 |
| 文案/硬编码「全站评估完成」 | 多数 P1 **未逐条由主代理二次验证** | 标注「子代理结论，关键 P0 已复核；P1 待抽查」 |

---

## 3. 方法论缺陷（下次必须遵守）

1. **视口采样协议**: 诊断图片必须 `scrollIntoView` + `waitForFunction(img.complete)` + 再读 `naturalWidth`；禁止整页截图后立刻统计 broken。  
2. **区分设计与故障**: 无 `<img>` ≠ broken；先读组件再下「无图」结论。  
3. **子代理失败必须重跑或主代理重做**，不得直接采信半成品 JSON 计数。  
4. **主代理对交付物负最终责任**：子代理 UnknownError 时不得把草稿当终稿发布。  
5. **每个 P0 至少 2 条独立证据**（源码 + 线上/截图），缺一不得标 P0。

---

## 4. 当前仍建议优先处理（仅保留已证实项）

| 优先级 | 项 | 证据强度 |
|--------|-----|----------|
| P0 | 补 ZH 法律 2 键 | 键差 + 线上裸键 |
| P0 | solutions GROQ 补字段 | 源码三方对照 |
| P0 | 统一成立年份/夸大数字 | i18n 多源 |
| P1 | About timeline 链接 locale + 预览年份 | 源码 |
| P1 | 产品 image 字段接入详情 UI（若业务需要摄影图） | schema 有、UI 无 |
| P2 | Partner 迁 Sanity | 架构债，非视觉故障 |

---

## 5. 结论

- 配图子代理失败原因：**平台 UnknownError**（会话中断），不是业务逻辑错误。  
- 我把失败子代理的**半成品诊断**写成了正式报告，是评估质量问题的主因。  
- 文案/硬编码报告中 **法律裸键、solutions query、年份矛盾** 等关键项复核后仍成立；配图类结论需按本文勘误执行。
