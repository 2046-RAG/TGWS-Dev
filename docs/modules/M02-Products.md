# M02 - Products 产品展示

> **状态**：80%（基于源码事实评估，详见 spec.md §7.2）

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /products, /products/build, /products/run, /products/protect, /products/[slug] |
| 核心文件 | ProductDetail.tsx, CategoryPage.tsx, ProductsList.tsx, product-data.ts, products/shared.ts |
| 组件大小 | 36KB |
| PRD | [S3] 产品服务归类 - Build/Run/Protect |
| 完成度 | 80% |

## 页面结构

- **产品列表页**: /products (显示所有产品)
- **类别页**: /products/build, /products/run, /products/protect（含 canonical 标签避免重复内容）
- **详情页**: /products/[slug] (单个产品详情，含 ProductJsonLd)

## Sanity 数据

- 28 个产品 (Build=5, Run=15, Protect=8)
- `relatedVendors` 字段: 厂商专属关联
- `subcategory` 字段: 子分类

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W0-4 | RSC 强制使用 `@/lib/sanity.server`（ESLint 规则禁止 RSC 导入 `@/lib/sanity`） | products/page.tsx, product-data.ts |
| W2-2 | 抽取共享 ProductCard 组件：`src/components/products/shared.ts` 集中 `slugToI18n`、`iconMap`、`tabColors`、`runSubgroups`；3 文件（CategoryPage/ProductsList/ProductDetail）移除本地副本 | components/products/shared.ts |
| W2-2 | 产品路由策略统一 + canonical 标签（避免 SEO 重复内容） | CategoryPage.tsx |
| W2-3 | 修复多处硬编码英文（"Learn more"、"No products found"、"Key Features"、"Interested in {title}?"、"Related Vendor Solutions"） | 3 文件 |
| W4-5 | ProductJsonLd image 兜底改本地 `/images/og-default.png`；移除 `offers.price:'0'` 块（服务型产品不应有 price） | JsonLd.tsx |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | `[slug]/page.tsx` `ProductJsonLd.url` 和 Breadcrumb href 缺 `/${locale}/` 前缀 | 🟡 待修复（W5 follow-up） |
| 2 | 客户端组件渲染产品数据（SSR HTML 丢失，SEO 受损） | 🟡 长期优化项 |

## 关键教训

1. **i18n 映射多文件同步**（AGENTS #49）：`slugToI18n` 曾同时存在于 ProductDetail.tsx 和 CategoryPage.tsx；W2-2 抽取到 `shared.ts` 后此问题已彻底解决
2. **en.json 有重复 products 对象**: line ~56(nav 内部) 和 line 797(顶层)，JSON last-key-wins
3. **AIGC 标题修复**: slugToI18n 从 aigcT2V 改为 aigcTitle

## 相关 Session

- S54: Product 二级页面（#5）完成
- S55: Product related vendors 修复 + AIGC 标题修复
- W2-2: 共享 ProductCard 抽取（2026-07-19）
