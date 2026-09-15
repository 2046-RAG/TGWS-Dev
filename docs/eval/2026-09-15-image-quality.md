# 全站配图质量评估报告

**评估日期**: 2026-09-15  
**方法**: Playwright Edge 截图（`docs/eval/shots/`）+ 运行时 DOM 图片诊断（`image-diagnostics.json` / `product-detail-diagnostics.json`）+ 源码图片路径核对  
**约束**: AGENTS #38 UI 必须截图验证；#39 数据正确≠视觉正确；#58 禁止随机图；#60 视觉语义匹配  

---

## 1. 总览

| 指标 | 数值 |
|------|------|
| 抓取页面 | 20 |
| DOM 图片节点 | 295 |
| 首屏采样时未完成加载 | 226（**含大量 lazy-load 时序，非全为 broken**） |
| 空 alt | 0（无障碍良好） |
| 源宽 &lt;200px 的已加载图 | 57（主要是 48–96px logo，属预期） |
| **产品详情页无任何 img** | **19/19（100%）— 真实缺陷** |
| Partner logo 线上可用性 | **复核通过（200 + 视口内全部加载）** |

> 说明：部分 `incomplete` 为截图瞬间 lazy-load 未进入视口，属采集时序；但 **首页 Partner logo 网格、产品详情 0 图、品类页仅图标** 已由整页截图实证，与采集时序无关。

### 页面热力

| 页面 | 图片数 | 未完成 | 视觉结论 |
|------|--------|--------|----------|
| en-home | 64 | 61 | Hero 视频正常；**Partner logo 大面积空白方块**；中段大段留白 |
| en-blog / zh-blog | 77×2 | 77×2 | 列表封面可能未进视口；详情页需复核 Sanity cover |
| en-products | 5 | 0 | 总览仅图标 |
| en-products/build\|run\|protect | 0 | 0 | **分类页无产品图** |
| 19 个产品详情 | 0 | — | **全部无 img 标签** |
| en-compare | 0 | — | 认证用首字母色块，无真实 logo |
| en-about / timeline / help / vmware / compare | 0 | — | 纯排版+图标 |

---

## 2. 严重问题（P0/P1）

> **勘误（2026-09-15 复核）**: 原「P0-1 Partner logo 空白」为 lazy-load 采集误判，**已撤销**。滚动进入视口后 logo 全部正常加载。

### P0-1 ~~首页合作伙伴 Logo 视觉破损~~ **已复核撤销（2026-09-15）**

- **误判原因**: 首次诊断用整页截图 + 立刻采 DOM，Partner 区块 `loading="lazy"` 尚未进入视口，采到 `naturalWidth=0/complete=false`，被误读为 broken。
- **复核证据**:
  1. `tgws/public/logos/` 19 个 png 均在（1–40KB）
  2. 线上 `https://www.techguru-it.asia/logos/*.png` 全部 **HTTP 200**
  3. `/_next/image?url=%2Flogos%2Fveeam.png&w=48` 优化器 **200**
  4. 滚动到 Technology Partners + 等待 3–4s 后：`loadedCount` 达全部可见项，`still unloaded = []`
  5. 复核截图 `tgws/docs/eval/shots/en-home-partners-verified.png`：Dell/Nutanix/Alibaba/ByteDance/H3C/Veeam/Fortinet/Sangfor/Huawei/HP/Lenovo/Sophos 等 **清晰可见**
- **结论**: Partner logo **功能正常**。仍保留的可选优化：部分 png 为黑色透明标（avgAlpha 偏低），小尺寸下对比度一般；与「迁 Sanity partner schema」的架构项无关，属内容治理而非视觉破损。

### P0-2 产品详情页零配图（19/19）

- **位置**: 全部 `/en/products/[slug]`
- **现状**: `product-detail-diagnostics.json` 显示 `imgs: []`；标题/H1 正常
- **影响**: 企业产品页无视觉锚点，转化与专业感双降；违反 #60「视觉与产品语义匹配」
- **建议**: Sanity `product` 增加/启用 hero 图字段；AI 产品用代码/架构示意，安全用盾牌/拓扑，基础设施用机架/网络图——**禁止多产品共用同一风景图**

### P0-3 首页中段异常大留白（截图实证）

- **位置**: `/en` Hero 下方 → AI Journey 之间
- **现状**: 约一屏高度空白，疑似区块 minHeight / 未加载背景 / 视频容器高度错误
- **建议**: 对照 `home/page.tsx` 区块高度与 ScrollReveal，修复布局

### P1-1 品类页仅图标、无产品视觉

- Build/Run/Protect 列表无缩略图，与产品详情空图叠加，整条产品线「无图」

### P1-2 Compare 认证资质无真实 Logo

- 6 个认证卡片为 S/F/N/R/H/S 首字母色块，可信度弱于真实厂商 logo

### P1-3 多图复用同一资源

- 首页 AI Journey 中 `aigc.jpg` 同时用于 Build AI workloads / AI Paths；`ai-adoption`/`ai-agent` 语义相近但共用 real/ 产品图，区分度不足

### P1-4 源分辨率偏低

- 已加载图中 57 张 naturalWidth&lt;200（主要为 logo 96 宽请求）；放大后模糊

### P1-5 Blog 封面加载态

- 77 张 incomplete 需在滚动后复测；若线上真实 broken 则升 P0

---

## 3. 做得好的部分

| 项 | 说明 |
|----|------|
| Hero | 深色粒子/星云视觉与「AI Meets Infrastructure」调性匹配，青色点缀与品牌一致 |
| alt 文本 | 抽样 295 节点 alt 空值为 0 |
| VMware 迁移 SVG | `vmware-migration.svg` 架构图语义正确 |
| 配色 | 主视觉青/深色体系与 `#00D4FF` 一致 |
| 无随机风景图 | 未发现 picsum 类填充（历史教训已规避） |

---

## 4. 差距分析总结

1. **资产完整性** > 构图审美：先修 broken logo / 产品零图 / 留白，再谈风格  
2. **产品线视觉系统缺失**：28 产品无统一 hero 规范，与文案审计「产品卡无图」交叉  
3. **信任背书视觉弱**：首页 logo 空白 + compare 字母块，削弱 enterprise 信任  
4. **Headless 缺口**：配图路径大量硬编码（见硬编码审计），CMS 可换图能力未兑现  

## 5. 修复优先级

| 优先级 | 动作 |
|--------|------|
| P0 | 产品 hero 图字段与 19 张语义图；修首页留白；**不要**再把 Partner logo 当 broken 处理 |
| P1 | 品类卡片缩略图；compare 真实认证 logo；AI 区块图区分；logo 源分辨率 |
| P2 | Blog 滚动后 cover 复测；暗色模式图对比度；AVIF 体积 |

**证据路径**: `docs/eval/shots/*.png` · `docs/eval/image-diagnostics.json` · `docs/eval/product-detail-diagnostics.json`
