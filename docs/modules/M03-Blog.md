# M03 - Blog 新闻博客

> **状态**：80%（基于源码事实评估，详见 spec.md §7.3）

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /blog, /blog/[slug] |
| 核心文件 | BlogDetail.tsx (12KB), BlogList.tsx (11KB) |
| 组件大小 | 26KB |
| PRD | [S12] 新闻博客 |
| 完成度 | 80% |

## Sanity 数据

- 82 篇博客文章
- 分布: 58 篇 1000-1500 词, 19 篇 1500-2000 词, 5 篇 2000+ 词
- 全部有完整中文翻译

## 功能特性

- **CodeBlock**: 代码块 + 语言标签 + 复制按钮
- **CalloutBox**: info/warning/tip 三种类型（W2-3 修复硬编码英文标签）
- **ArticleJsonLd**: AI 搜索引擎可理解文章内容（W0-2 修复 image 兜底）
- **阅读时间估算**: 自动计算（从 content 而非 excerpt）
- **PortableText 增强**: h2/h3 锚点、blockquote、代码块、callout

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W0-2 | picsum.photos 移除：OG image 兜底改本地 `/images/og-default.png` | blog/[slug]/page.tsx, BlogDetail.tsx |
| W0-4 | RSC 强制使用 `@/lib/sanity.server`；`blog/[slug]/page.tsx:44` 硬编码 Sanity CDN URL 改用 `urlFor` from `@/lib/sanity.image` | blog/page.tsx, blog/[slug]/page.tsx |
| W2-3 | 调用标签硬编码英文修复（"Key Takeaway"/"Warning"/"Pro Tip"）；`window.location.href` SSR 阶段为空字符串修复 | BlogDetail.tsx, BlogList.tsx |
| W4-5 | ArticleJsonLd image 兜底改本地（与 W0-2 合并验证） | JsonLd.tsx |
| W4-6 | `BlogDetail.tsx` architectureDiagram 渲染逻辑加 fallback | BlogDetail.tsx |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | WebSiteJsonLd 的 `SearchAction` 指向 `/blog?q=` | 🟡 已移除 SearchAction 或实现搜索功能（W4-5 决策） |
| 2 | 部分 PortableText marks（粗体/斜体/链接）支持不完整 | 🟡 长期优化项 |

## 关键教训

1. **Blog 内容质量标准**：最低 1000 词/篇，语言一致性不可妥协
2. **Sub-agent 大任务挂起**：7 篇以内 batch 可成功，13 篇 batch 容易挂起
3. **Sanity 子代理数据格式**：title/excerpt 必须是 string，不是 `{en:'...', zh:'...'}`
4. **旧文章中文问题**：39 篇旧文章中 24 篇中文内容缺失/过短（已修复）

## 相关 Session

- S50: Blog 质量修复（30 空删除 + 21 重写 + 80 扩充）
- S52: Article JSON-LD 添加 + sitemap 动态 blog slug
- W0-2: picsum.photos 移除（2026-07-19）
