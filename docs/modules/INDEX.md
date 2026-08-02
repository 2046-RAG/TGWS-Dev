# TGWS Modules Index

## 模块总览

| 模块ID | 模块名称 | 路由 | 状态 | 完成度 | 差距 |
|--------|----------|------|------|--------|------|
| M01 | Home | /home | ✅ 完成 | 95% | 视频性能优化 |
| M02 | Products | /products/* | ✅ 完成 | 95% | API路由字段补全 |
| M03 | Blog | /blog/* | ✅ 完成 | 95% | — |
| M04 | Solutions | /solutions | ✅ 完成 | 90% | — |
| M05 | Tickets | /support/* | ✅ 完成 | 90% | 测试覆盖（TODO-005） |
| M06 | Contact | /contact | ✅ 完成 | 95% | — |
| M07 | About | /about | ✅ 完成 | 95% | — |
| M08 | Compare | /compare | ✅ 完成 | 85% | 详细指南 |
| M09 | VMware Alt | /vmware-alternative | ✅ 完成 | 90% | —（TCO 计算器已实现，独立工具 vmware-tco.vercel.app） |
| M10 | Help | /help | 🔄 内容待录入 | 60% | 帮助文档内容补全（需迁移 Sanity，待用户确认） |
| M11 | Legal | /privacy, /terms | ✅ 完成 | 95% | — |

> 状态对齐 2026-08-02（与 TODO.md 复核一致）：M03 社交分享 ✅（TODO-014）、M05 audit_log 写入 ✅（TODO-023）、M06 Odoo 降级提示 ✅（TODO-021/022）、M09 TCO 计算器 ✅（TODO-025）、M10 Help 基础设施就绪、内容走 i18n 未迁移 Sanity（TODO-028）。

## 全局组件（被多个模块共享）

| 组件 | 文件 | 使用模块 |
|------|------|----------|
| Navbar | components/layout/Navbar.tsx | 所有页面 |
| Footer | components/layout/Footer.tsx | 所有页面 |
| Breadcrumb | components/ui/Breadcrumb.tsx | M02-M11 |
| DarkModeToggle | components/ui/DarkModeToggle.tsx | Navbar |
| LanguageSwitcher | components/ui/LanguageSwitcher.tsx | Navbar |
| JsonLd | components/ui/JsonLd.tsx | M01, M03, M10 |
| CookieConsent | components/ui/CookieConsent.tsx | 全局 |
| ScrollToTop | components/ui/ScrollToTop.tsx | 全局 |
| ScrollReveal | components/ui/ScrollReveal.tsx | 全局 |

## 全局基础设施

| 模块 | 文件 | 说明 |
|------|------|------|
| i18n | messages/en.json, zh.json | 多语言支持(EN+繁中) |
| Sanity | lib/sanity.ts, sanity.server.ts | CMS数据层 |
| Supabase | lib/supabase/* | 数据库+认证 |
| Dark Mode | globals.css, DarkModeToggle.tsx | 暗色模式(toggle 2态) |
| SEO | sitemap.ts, robots.ts, JsonLd.tsx | 搜索引擎优化 |

## Review工作流

**用户说**："review Home模块"

**Agent执行**：
```
1. Read(docs/modules/INDEX.md)           # 5KB - 定位M01
2. Read(docs/modules/M01-Home.md)        # 5KB - 模块详情
3. 总计: ~10KB vs 当前~51KB
```

## 文档维护规则

1. **模块文档更新时机**：模块有重大变更时更新对应文档
2. **MEMORY.md保留**：当前状态+待办+核心规则（~15KB）
3. **历史session记录**：保留在MEMORY.md中，不单独分割
