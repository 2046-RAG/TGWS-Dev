# M08 - Compare VMware 对比

> **状态**：80%（基于源码事实评估，详见 spec.md §7.8）— Wave 4 完成重构

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /compare |
| 核心文件 | compare/page.tsx (5KB), CompareTable.tsx (4KB) |
| 组件大小 | 5KB |
| PRD | 无独立 PRD section |
| 完成度 | 80% |

## 页面内容

- **特性对比表**：TechGuru vs 竞争对手（W4-1 启用 `CompareTable` 组件替代内联表格）
- **认证展示**：合作伙伴认证
- **CTA 区域**：联系我们

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W2-1 | `<Breadcrumb>` locale 自动从 `useParams()` 获取（之前 `/zh/compare` 显示 "Home" 而非 "首頁"） | compare/page.tsx |
| W2-3 | 6 个合作伙伴凭证字符串（"Authorized Partner"、"Channel Partner"）硬编码英文修复 | compare/page.tsx:74-80 |
| W4-1 | **删除内联表格**，改用 `<CompareTable />`；修复 `CompareTable.tsx:81` 重复条件 bug；加 `<caption>` 和 `aria-label`；TechGuru 列从颜色区分改为 `<th scope="col" aria-label="TechGuru">` + 图标标识 | compare/page.tsx, CompareTable.tsx |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | 屏幕阅读器读出表格结构（验证） | ⏳ 待 Playwright + axe-core 验证 |

## 关键教训

1. **两套实现各自演化**：原 page.tsx 内联表格与 CompareTable.tsx 独立演进，本应规范的组件被绕过 → W4-1 已统一
2. **i18n 纪律松散**：合作伙伴字符串当数据而非可翻译内容 → W2-3 已修复
3. **无 a11y review**：表格语义缺失，视觉样式优先于屏幕阅读器 → W4-1 已加 `<caption>` + `aria-label`（WCAG 1.4.1 颜色使用违规已修复）

## 相关 Session

- W4-1: M08 Compare 重构（2026-07-19）
