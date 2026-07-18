# M11 - Legal 法律条款

> **状态**：80%（基于源码事实评估，详见 spec.md §7.11）— Wave 4 完成增强

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /privacy, /terms |
| 核心文件 | privacy/page.tsx (3KB), terms/page.tsx (2KB), components/legal/TableOfContents.tsx (新增 W4-4) |
| 组件大小 | 5KB |
| PRD | 无独立 PRD section |
| 完成度 | 80% |

## 页面内容

- **隐私政策**：/privacy (9 个 section)
- **服务条款**：/terms (6 个 section)
- **目录导航**：W4-4 加 TOC 侧边栏（桌面）+ 折叠菜单（移动）
- **打印支持**：W4-4 加 `@media print` 样式 + "Print this page" 按钮

## 访问方式

- 从页脚进入（非导航栏直接显示）

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W2-3 | `privacy/page.tsx:33` + `terms/page.tsx:33` 硬编码日期 `"June 30, 2026"` 修复（W4-4 改 `process.env.BUILD_DATE`） | privacy/, terms/ |
| W4-4 | **last-updated 改 `process.env.BUILD_DATE`**（之前硬编码日期不本地化、不自动更新） | privacy/, terms/ |
| W4-4 | **新建 `src/lib/config.ts` 集中联系信息**：`SUPPORT_EMAIL`、`CONTACT_PHONE`、`WHATSAPP_URL`、`LINKEDIN_URL`（之前 `Inquiries@techguru-it.asia` 多处重复硬编码） | lib/config.ts, privacy/, terms/ |
| W4-4 | **加 TOC 侧边栏**（桌面）+ 折叠菜单（移动）— WCAG 2.4.1 绕过块建议 | components/legal/TableOfContents.tsx, privacy/, terms/ |
| W4-4 | **加 `@media print` 样式 + "Print this page" 按钮**（法律页常见需求） | privacy/, terms/ |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | `mailto:` 链接无 `target="_blank"` / `rel="noopener"` | 🟡 安全一致性，待统一加 |
| 2 | 无 "下载 PDF" 按钮（仅打印） | 🟡 长期优化项 |

## 关键教训

1. **日期当内容而非数据**：last-updated 应来自构建时元数据或 i18n，不应硬编码 → W4-4 已改 `process.env.BUILD_DATE`
2. **联系信息未集中**：email 多处重复 → W4-4 已迁移到 `lib/config.ts`
3. **法律页当营销页处理**：同样的布局，缺法律专属 affordance（TOC、打印、PDF） → W4-4 已加 TOC + 打印

## 相关 Session

- W4-4: M11 Legal 增强（2026-07-19）
