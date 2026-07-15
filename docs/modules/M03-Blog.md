# M03 - Blog 新闻博客

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /blog, /blog/[slug] |
| 核心文件 | BlogDetail.tsx (12KB), BlogList.tsx (11KB) |
| 组件大小 | 26KB |
| PRD | [S12] 新闻博客 |
| 状态 | ✅ 完成 |

## Sanity数据

- 82篇博客文章
- 分布: 58篇1000-1500词, 19篇1500-2000词, 5篇2000+词
- 全部有完整中文翻译

## 功能特性

- **CodeBlock**: 代码块 + 语言标签 + 复制按钮
- **CalloutBox**: info/warning/tip三种类型
- **ArticleJsonLd**: AI搜索引擎可理解文章内容
- **阅读时间估算**: 自动计算
- **PortableText增强**: h2/h3锚点、blockquote、代码块、callout

## 关键教训

1. **Blog内容质量标准**: 最低1000词/篇，语言一致性不可妥协
2. **Sub-agent大任务挂起**: 7篇以内batch可成功，13篇batch容易挂起
3. **Sanity子代理数据格式**: title/excerpt必须是string，不是{en:'...', zh:'...'}
4. **旧文章中文问题**: 39篇旧文章中24篇中文内容缺失/过短

## 相关Session

- S50: Blog质量修复(30空删除+21重写+80扩充)
- S52: Article JSON-LD添加 + sitemap动态blog slug
