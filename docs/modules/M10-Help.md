# M10 - Help 帮助中心

> **状态**：85%（基于源码事实评估，详见 spec.md §7.10）— Wave 4 完成修复

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /help |
| 核心文件 | help/page.tsx (7KB), FAQAccordion.tsx (2KB) |
| 组件大小 | 8KB |
| PRD | 无独立 PRD section |
| 完成度 | 85% |

## 页面内容

- **FAQ 分类**：all, product, technical, account, billing
- **FAQ 搜索**：支持关键词搜索（W4-3 加 300ms debounce）
- **FAQJsonLd**：结构化数据，SEO 友好（W4-3 接收 `faqItems` 全部而非 `filteredFaqs`）

## 访问方式

- 从页脚进入（非导航栏直接显示）

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W2-1 | `<Breadcrumb>` locale 自动从 `useParams()` 获取（之前 `/zh/help` 显示 "Home" 而非 "首頁"） | help/page.tsx:103 |
| W2-3 | `BreadcrumbJsonLd` items `[{ name: 'Help', url: ... }]` 硬编码英文修复 | help/page.tsx:102 |
| W4-3 | **FAQJsonLd 接收 `faqItems` 全部**（之前接收 `filteredFaqs` 导致 SEO 显示用户当前看不到的 FAQ） | help/page.tsx:101 |
| W4-3 | **空状态文案分场景**：搜索为空 + 类目无 FAQ → "No FAQs in this category yet"；搜索非空 + 无结果 → "No results for '{query}'" | help/page.tsx:145-153 |
| W4-3 | **搜索加 300ms debounce**（之前每次按键全量扫描 FAQ） | help/page.tsx:117 |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | 无（W4-3 修复后已知问题已解决） | ✅ |

## 关键教训

1. **i18n 在结构化数据上漏审**：可视 UI 用 `t()`，JSON-LD 用裸字符串 → W2-3 已修复
2. **Breadcrumb locale prop 设计为可选默认 'en'**：消费方忘记传 → W2-1 改为 `useParams()` 自动获取
3. **筛选逻辑与 SEO 不同步**：JSON-LD 应反映页面默认状态（全部 FAQ），而非用户当前筛选状态 → W4-3 已修复

## 相关 Session

- W4-3: M10 Help 修复（2026-07-19）
