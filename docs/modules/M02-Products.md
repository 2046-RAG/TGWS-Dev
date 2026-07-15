# M02 - Products 产品展示

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /products, /products/build, /products/run, /products/protect, /products/[slug] |
| 核心文件 | ProductDetail.tsx, CategoryPage.tsx, product-data.ts, ProductsList.tsx |
| 组件大小 | 36KB |
| PRD | [S3] 产品服务归类 - Build/Run/Protect |
| 状态 | ✅ 完成 |

## 页面结构

- **产品列表页**: /products (显示所有产品)
- **类别页**: /products/build, /products/run, /products/protect
- **详情页**: /products/[slug] (单个产品详情)

## Sanity数据

- 28个产品 (Build=5, Run=15, Protect=8)
- relatedVendors字段: 厂商专属关联

## 关键教训

1. **i18n映射多文件同步**: slugToI18n存在于ProductDetail.tsx和CategoryPage.tsx，修改时必须同步
2. **en.json有重复products对象**: line ~56(nav内部)和line 797(顶层)，JSON last-key-wins
3. **AIGC标题修复**: slugToI18n从aigcT2V改为aigcTitle

## 相关Session

- S54: Product二级页面(#5)完成
- S55: Product related vendors修复 + AIGC标题修复
