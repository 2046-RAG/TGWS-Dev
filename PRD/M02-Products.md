# TechGuru PRD - 产品页（VMware替代方案 + 产品列表 canonical）

> 从 PRD-TechGuru-Website.md 分割
> 原始章节: L621-L637
> **v1.3（2026-07-19）**：补 canonical 标签要求章节（W4-2 反向同步）

---

## [S16] VMware替代方案（独立板块）

### 16.1 页面内容

- **为什么切换？** VMware成本上涨、许可证复杂
- **替代产品：** Proxmox VE、Sangfor aSV、Sangfor HCI、Nutanix、Arcfra、H3C
- **迁移服务：** 评估、规划、实施
- **硬件利旧评估：** 兼容性评估、性能分析、使用寿命预测
- **新购硬件优化：** 选型、配置优化、TCO分析

### 16.2 页面位置

- 首页独立入口板块
- Products页面Run分类下的子页面

### 16.3 Canonical 标签要求（W4-2 反向同步）

> 本节描述 Products 系列页面与 VMware 替代方案页面的 canonical 策略，避免搜索引擎重复内容惩罚。

#### 16.3.1 已实现（W4-2）

| 页面 | canonical 配置 | 实现文件 |
|------|--------------|---------|
| `/products` | `alternates.canonical = /${locale}/products` | `src/app/[locale]/products/page.tsx` |
| `/products/[slug]` | （由 Next.js 自动生成，暂未显式 canonical） | `src/app/[locale]/products/[slug]/page.tsx` |
| `/vmware-alternative` | `alternates.canonical = /${locale}/vmware-alternative` + `alternates.languages`（en/zh 全列出） | `src/app/[locale]/vmware-alternative/layout.tsx` |

#### 16.3.2 canonical 策略说明

- **多语言 canonical**：每个 locale 独立 canonical 指向自身（如 `/zh/products` 的 canonical 是 `/zh/products`，不是 `/en/products`），配合 `alternates.languages` 列出所有 locale 对应 URL，让 Google 理解这是同一页面的不同语言版本而非重复内容。
- **Tab 锚点 vs 独立路由**：当前产品分类页支持两种访问方式：
  - `/products#build`（Tab 锚点，单页面内切换）
  - `/products/build`（独立路由，独立 SSR 页面）
  - 两者内容高度重叠，存在重复内容风险。canonical 策略：`/products/build` 应设 canonical 指向 `/products`（让 Tab 版本成为权威版本），或反过来选择 `/products/build` 作为权威版本并在 `/products` 用 `noindex`。**当前未实现，跟踪在 W2-2.4 + S22 #21**。
- **产品详情页 `/products/[slug]`**：每个产品 slug 应有独立 canonical（指向自身 URL），避免不同 query 参数（如 `?ref=...`）造成重复。当前由 Next.js generateMetadata 默认行为处理，未显式设置；建议未来在 `generateMetadata` 中显式 `alternates.canonical = /${locale}/products/${slug}`。

#### 16.3.3 待补项（跟踪在 S22 #21）

- `/products/build`、`/products/run`、`/products/protect` 三个子分类页未加 `alternates.canonical`，需在 W2-2.4 决策路由策略后补
- 产品详情页 `/products/[slug]` 显式 canonical 待补


---

