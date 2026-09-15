# 全新九轮复核 · 与六轮交叉对比

**日期**: 2026-09-15  
**原则**: 九轮方法与旧六轮（源码/DOM/交叉/网络/组件/对抗）**不重复**  
**原始数据**: `docs/eval/2026-09-15-nine-round-raw.json` + Sanity CDN 实查  

## 九轮定义

| 轮 | 名称 | 方法（新） |
|----|------|-----------|
| **N1** | i18n 键使用图 | 键存在性 × 源码引用 × 页面消费 |
| **N2** | 可见文本抽取 | 剥 script/style/标签后的 visible text（非整页 HTML includes） |
| **N3** | Sanity CDN 公网实查 | partner/solution/product/team/timeline 真数据 |
| **N4** | EN↔ZH 同页对齐 | 可见文本长度比、CJK 密度、Learn more 串语言 |
| **N5** | 公共资产完整性 | 首页引用图逐个 HTTP+字节数 |
| **N6** | SEO meta/hreflang | title/canonical/hreflang/og:locale/JSON-LD |
| **N7** | 硬编码 UI 全量扫 | 精确字面量 + 行号 |
| **N8** | solutions 数据链路 | Q/L/S 字段矩阵 + fallback 路径 |
| **N9** | 对抗再证伪 | 每条硬结论换路径攻击 |

---

## 九轮核心结果摘要

### N1 i18n 键图
| 键 | EN | ZH | 源码引用 | 页面 |
|----|----|----|----------|------|
| `terms.section14Body` | ✅ | ❌ | terms 页使用 | `/zh/terms` 裸键 |
| `privacy.section12Body` | ✅ | ❌ | privacy 页使用 | `/zh/privacy` 裸键 |
| `products.learnMore` | ❌ | ❌ | — | UI 写死英文 |
| `compare.testimonials.*` | ✅ | ✅ | **源码无引用** | **死键** |

### N2 可见文本（剥掉内联 i18n 后）
| 页面 | 关键可见信号 |
|------|----------------|
| `/zh/terms` | **bare14=true**；governs 上下文：「本服務條款… **governs** 您對…」 |
| `/zh/privacy` | **bare12=true** |
| `/en/products/build` | Learn more + View all products |
| `/zh/products/build` | **Learn more 仍为英文**（N4） |
| `/en/compare` | Traditional Vendor=true；**quote40=false**（40% 不可见） |
| `/en/about/timeline` | **2020 与 2023 同页可见** |
| `/en` | 12+ Years + 19 Technology Partners |

### N3 Sanity CDN（九轮新证据）
| 类型 | 结果 | 含义 |
|------|------|------|
| `partner` | **n=0** | CMS 无合作伙伴文档；迁前端后仍须导数据 |
| `solution` | n=17；**全部 hasChZh=false hasSolZh=false** | 即便修 GROQ，中文字段 CMS 也是空的 → **双缺口** |
| `product` | n=28；**hasImg 全 false** | schema 有 image，**数据全空** |
| `teamMember` | n=3（Regil / Marcus / Danielle） | 有数据 |
| `timelineEvent` | **Company Founded year=2020** | CMS 权威年=2020，intro「2023」为错 |

### N4 EN/ZH 对齐
| 路径对 | zh/en 长度比 | 备注 |
|--------|--------------|------|
| /en↔/zh | 0.51 | |
| /about | 0.46 | |
| **/products/build** | 0.47 | **ZH 仍有英文 Learn more** |
| **/terms** | **0.34** | ZH 严重短于 EN；且含英文法律词 |
| /privacy | 0.35 | 同上量级 |
| /compare /help | ~0.51–0.52 | |

### N5 资产
首页引用 **25/25 HTTP 200 且有字节** → 再次否定「logo 破损」。

### N6 SEO（九轮新问题）
| 项 | 线上实际 | 问题 |
|----|----------|------|
| hreflang | `https://**tgws.vercel.app**/zh` | **指向部署域名，非 www.techguru-it.asia** |
| canonical | 相对路径 `/en` | 依赖 base，需确认是否 absolute |
| title | about 等 `… \| TechGuru \| TechGuru` | **模板双拼重复** |
| og:locale | en_US / 部分页有 | 基本正常 |
| JSON-LD | 4 块/页 | 正常 |

### N7 硬编码（行号级）
| 串 | 位置 |
|----|------|
| Learn more | ProductsList:174, CategoryPage:82 |
| View all products | CategoryPage:154 |
| 计算你的… | home:466, vmware:196, TcoCalculatorClient:105 |
| 2023–2025 预览 | AboutClient:57 |
| `/about/timeline` | AboutClient:45 |
| July 1, 2026 | privacy:35, terms:35 |
| Submit a ticket… | TicketList:147 |
| Network error | LoginForm:37 |

### N8 solutions 链路
brokenFields（Q 无 / L+S 有）:  
`challengesZh, solutions, solutionsZh, recommendedProductsZh, metricLabel, metricLabelZh`  
fallback 存在 → **代码路径成立**；N3 补充：**CMS 字段也全空**。

### N9 对抗
全部硬结论 **CONFIRMED**，无一被推翻。

---

## 与六轮结果交叉对比

### A. 维持成立（六轮 H1–H12 ∩ 九轮）

| ID | 结论 | 六轮 | 九轮加固方式 |
|----|------|------|----------------|
| H1 | ZH terms 裸键 | ✅ | N1 键图 + N2 可见文本 |
| H2 | ZH privacy 裸键 | ✅ | 同上 |
| H3 | governs 英文残留 | ✅ | N2 **抽出原文上下文** |
| H4 | 年份/12+ 矛盾 | ✅ | N2 同页 2020+2023；**N3 CMS=2020** |
| H5 | 数字多口径 | ✅ | N1 socialProof 12+/19；N2 可见 |
| H6 | Learn more 无 i18n | ✅ | N1 key 不存在；N7 行号；**N4 ZH 页英文** |
| H7 | solutions GROQ 缺口 | ✅ | N8 六字段；**N3：CMS 中文字段也空** |
| H8 | Partner 硬编码 | ✅ | N9 无 fetch；**N3 CMS partner=0** |
| H9 | 产品无图 | ✅ | N9 icon-only；**N3 28 产品 hasImg=false** |
| H10 | Compare 证言未渲染 | ✅ | N1 死键；N2 quote40=false |
| H11 | TCO=i18n 债非串台 | ✅ | N7 计算你的 行号 |
| H12 | 限流/Origin | ✅ | N9 代码确认（实弹在六轮） |

### B. 六轮已证伪 ∩ 九轮仍假

| ID | 结论 | 九轮 |
|----|------|------|
| F1 logo 破损 | N5 25/25 200 |
| F2 76% broken | 未再使用该指标 |
| F3 证言上线 | N2 可见文本无 40% VM 证言 |
| F4 EN 中文串台 | N4 EN 页无 CJK |

### C. 九轮 **新增**（六轮矩阵没有或未点名）

| ID | 发现 | 严重度 | 说明 |
|----|------|--------|------|
| **NEW-1** | **hreflang 指向 `tgws.vercel.app`** | **P0 SEO** | 生产交替语言 URL 指到部署域，非品牌域 |
| **NEW-2** | title 模板双拼 `\| TechGuru \| TechGuru` | P1 SEO | 多内页 |
| **NEW-3** | CMS `partner` 文档 **0 条** | P1 | 迁前端前必须先导数据 |
| **NEW-4** | CMS solutions **17 条但 Zh 字段全空** | P1 | 修 GROQ 后仍需补内容，否则仍 fallback |
| **NEW-5** | CMS products **28 条 image 全空** | P1 | 与 UI 无图叠加，双侧都缺 |
| **NEW-6** | `/zh` 可见文本长度仅 EN 的 ~0.35–0.5 | P1 内容 | 法律页最严重 |
| **NEW-7** | timeline CMS 证实 Founded **2020** | 证据升级 | intro 2023 应改 |
| **NEW-8** | compare testimonials 为 **零引用死键** | P2 | 删或接 UI |

### D. 六轮有、九轮未再测（非否定）

- 线上 Origin 403 实弹（六轮 R4）— 九轮只做了代码确认  
- Playwright 滚动采样 partner 加载（六轮）— 九轮用 HTTP 资产替代  

---

## 综合置信度（六轮 ∪ 九轮）

| 等级 | 结论 |
|------|------|
| **极高（≥3 独立方法）** | H1 H2 H3 H4 H6 H7 H8 H9 H10 |
| **高** | H5 H11 H12 NEW-1 NEW-7 |
| **高（数据层新证）** | NEW-3 NEW-4 NEW-5 |
| **中** | NEW-2 NEW-6 NEW-8 |
| **已排除** | F1–F4 |

---

## 更新后的修复清单（合并六轮+九轮）

| 优先级 | 项 | 依据 |
|--------|-----|------|
| **P0** | 补 ZH 法律 2 键 | H1 H2 N1 N2 |
| **P0** | **hreflang/canonical 改为 www.techguru-it.asia** | **NEW-1** |
| **P0** | 统一年份=2020（或改 CMS）、12+ Years 改可验证表述 | H4 N3 NEW-7 |
| P1 | solutions GROQ 补字段 **+ Studio 补 Zh 数据** | H7 NEW-4 |
| P1 | Partner：Studio 导数据 + 前端 fetch | H8 NEW-3 |
| P1 | Product image：Studio 上传 + Detail 接入（或书面确认图标策略） | H9 NEW-5 |
| P1 | Learn more / View all i18n 化（新建 key） | H6 N4 N7 |
| P1 | 修 title 双拼、法律页 ZH 补全长度 | NEW-2 NEW-6 |
| P2 | Compare 证言接 UI 或删除死键 | H10 NEW-8 |
| P2 | TCO/日期/About 预览等硬编码 i18n | H11 N7 |

---

## 结论

九轮用 **可见文本、CMS 实数据、SEO meta、EN/ZH 长度对齐** 等新方法，**没有推翻**六轮硬结论，并新增 **hreflang 指错域名** 与 **CMS 侧数据空洞（partner/product/solutionZh）** 两类六轮未覆盖的问题。

**权威顺序**: 本文件 > six-round-verification > 三轮矩阵 > 初版四维报告。  
