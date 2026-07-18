# M04 - Solutions 行业解决方案

> **状态**：75%（基于源码事实评估，详见 spec.md §7.4）— Wave 0 修复了 P0 致命 bug

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /solutions |
| 核心文件 | SolutionsList.tsx (10KB), solutions/page.tsx |
| 组件大小 | 12KB |
| PRD | [S10] 行业解决方案 |
| 完成度 | 75% |

## Sanity 数据

- 17 个解决方案
- Schema 字段：challenges, challengesZh, solutions, solutionsZh, recommendedProducts, recommendedProductsZh, metricLabel, metricLabelZh 等 13 字段

## 功能特性

- **Sanity 优先 + i18n fallback**：数据优先从 Sanity 获取，无数据时用 i18n
- **6 个行业 Tab**：healthcare, finance, retail, logistics, education, government
- **架构图**：SVG 路径 `/images/solutions/${industryKey}-network.svg`

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W0-1 | **GROQ 致命 bug 修复**：补齐 `challengesZh, solutionsZh, recommendedProductsZh, metricLabel, metricLabelZh` 5 字段（之前 GROQ 漏取，导致 zh locale 永远走 i18n 兜底，Sanity 中文内容死代码） | solutions/page.tsx |
| W0-1 | **`<meta.icon>` JSX bug 修复**：`<meta.icon ... />` 小写 JSX 改为 `const Icon = meta.icon; <Icon ... />` | SolutionsList.tsx:138 |
| W0-3 | 删除 `solutions/layout.tsx`（metadata-only wrapper 死代码），合并到 page.tsx | solutions/ |
| W0-4 | RSC 强制使用 `@/lib/sanity.server` | solutions/page.tsx |
| W2-3 | 架构图标签硬编码英文修复 | SolutionsList.tsx:158 |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | `solution.ts` schema 的 `image` 字段定义但从未消费（架构图 SVG 路径硬编码在 JSX） | 🟡 死字段，待清理或消费 |
| 2 | Sanity 中文内容填充完整度未线上验证 | ⏳ 待 Playwright 截图验证 |

## 关键教训

1. **GROQ 与消费接口漂移**：schema 13 字段、query 8 字段、consumer 读 11 字段，三方无契约 → W0-1 已修复，需建立 GROQ 字段集 = schema 字段集 + 消费方字段集的契约（spec.md TGWS-GAP-004）
2. **i18n + Sanity 混合策略**：zh 从 Sanity、en 从 i18n，但 Sanity 内容从未填齐 → 设计假设落空（W0-1 修复后 zh 终于能从 Sanity 加载）
3. **Layout-as-metadata-wrapper 反模式**：多个模块（solutions/about/compare/help/contact）都有此冗余 → W0-3 已删 solutions/layout.tsx

## 相关 Session

- S54: Solutions 切换 Sanity 数据源（#8）完成
- W0-1: GROQ 致命 bug 修复（2026-07-19）
