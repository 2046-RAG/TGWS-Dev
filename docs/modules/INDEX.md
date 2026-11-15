# TGWS Modules Index

> **本文档是模块地图，不是完成度证明。**
> 唯一执行依据：`TODO.md` 第五轮 **§8 当前剩余待办总览**；具体验收动作见 `docs/PENDING-ACCEPTANCE.md`。
> 下表三轴数字**逐字引用** `docs/TGWS-ASSESSMENT-REPORT.md`（2026-11-15 评估时点），是历史快照，**不是当前状态，更不代表验收通过**。本文件不自行折算百分比。

## 1. 模块地图（三轴：代码 / 内容或数据 / 端到端）

| ID | 模块 | 路由 | 代码 | 内容 | 端到端 | 综合（评估时点） | 评估时点主要缺口 |
|:--:|------|------|:---:|:---:|:---:|:---:|------|
| M01 | Home | /[locale] | 88% | 85% | 85% | **86%** | 伙伴 logo 硬编码；首屏视频抢占带宽 |
| M02 | Products | /products/* | 85% | 72% | 78% | **79%** | 视觉双源（见下方修正）；文案 i18n/CMS 双源 |
| M03 | Blog | /blog/* | 85% | 40% | 55% | **62%** | 中文正文中位仅英文 6.8%；停更 18 个月 |
| M04 | Solutions | /solutions | 80% | 40% | 50% | **58%** | 17 条仅 6 条可达；中文痛点/方案 0/17 |
| M05 | Tickets | /support/* | 75% | 60% | 45% | **61%** | 注册用户可能建不了单；无管理员逐单处置 |
| M06 | Contact | /contact | 85% | 85% | 70% | **81%** | Odoo 凭证未配；无客户回执 |
| M07 | About | /about | 85% | 75% | 80% | **80%** | 3D 翻转 / 灯箱 / 新闻动态未实现 |
| M08 | Compare | /compare | 90% | 70% | 85% | **82%** | 匿名 + 量化证言，合规风险 |
| M09 | VMware Alt | /vmware-alternative | 85% | 75% | 80% | **80%** | Sangfor 估算价无来源与日期 |
| M10 | Help | /help | 85% | 75% | 80% | **80%** | FAQ 走 i18n，Sanity faq 0 篇 |
| M11 | Legal | /privacy, /terms | 90% | 75% | 85% | **84%** | 繁中约为英文 1/3，未经法务复核 |
| M12 | 全局搜索 | 弹窗 | 80% | 60% | 65% | **69%** | 图片搜索伪功能；三套口径；日志无落点 |
| M13 | 认证/账户 | /support/login 等 | 85% | 70% | 65% | **74%** | 重置链接 405；users 表基本未用 |
| M14 | 管理后台 | /support/admin/* | 50% | 50% | 35% | **45%** | 只读统计，无法列出/处置他人工单 |
| M15 | 基础设施 | 全局 | 92% | — | 80% | **87%** | ISR 全线失效；CSP 阻断 Umami |
| M16 | 设计系统 | 全局 | 85% | — | 75% | **80%** | 316 处硬编码主色，令牌 0 使用 |
| M17 | 测试/工程化 | 全局 | 70% | — | 60% | **66%** | 5 个失败测试文件；无 CI；本机 build OOM |

**评估时点后的已知修正（不改写上表历史快照）**：

- **M02「产品 0 图」结论不成立**：本地 `productImages` 映射 28/28，线上抽查 4/4 有 Hero 图，真实问题是「CMS 与本地映射双源无守护」，已从 P1 降为 P2（T-072）。
- **M15 ISR**：2026-11-15 已加 `setRequestLocale` 恢复静态渲染，线上 `PRERENDER → HIT` 验证通过；CSP 已放行 Umami，但 `unsafe-inline` 因与静态渲染互斥而有意保留（待拍板 D10）。
- **M05 / M14 工单闭环**：005 / 006 / 007 迁移均已线上执行并核对；管理员列表、详情、指派、对话、附件预览代码全部上线。**但 4 项 P0 仍缺真实账号端到端验收，不得据此宣称完成。**

## 2. 当前状态从哪看

| 想知道什么 | 看哪里 |
|---|---|
| 还剩哪些待办 / 什么算做完 | `TODO.md` §8（当前剩余总览）与 §2–§4 任务表 |
| 需要真实账号/真机才能验的动作 | `docs/PENDING-ACCEPTANCE.md` A1–A17 / B1–B6 |
| 某次改动的代码与线上证据 | `docs/runbooks/` 与 `docs/2026-11-15-PROGRESS-SUMMARY.md` |
| 评估结论与依赖树 | `docs/TGWS-ASSESSMENT-REPORT.md` / `docs/TGWS-REPORT-CROSSCHECK.md` |

> 口径提醒：**代码完成 ≠ 验收完成**。第五轮验收标准要求「代码 + 数据 + 端到端证据」三样齐全。

## 3. 全局组件（2026-11-15 修正）

| 组件 | 文件 | 使用模块 |
|------|------|----------|
| Navbar | components/layout/Navbar.tsx | 所有页面 |
| Footer | components/layout/Footer.tsx | 所有页面 |
| MegaMenu | components/layout/MegaMenu.tsx | Navbar |
| Breadcrumb | components/ui/Breadcrumb.tsx | M02–M11 |
| **ThemeToggle** | components/ui/ThemeToggle.tsx | Navbar |
| LanguageSwitcher | components/ui/LanguageSwitcher.tsx | Navbar |
| UserMenu | components/ui/UserMenu.tsx | Navbar |
| GlobalSearch | components/ui/GlobalSearch/* | Navbar |
| JsonLd | components/ui/JsonLd.tsx | M01, M03, M10 |
| CookieConsent | components/ui/CookieConsent.tsx | 全局 |
| ScrollToTop | components/ui/ScrollToTop.tsx | 全局 |
| ScrollReveal | components/ui/ScrollReveal.tsx | 全局 |
| AttachmentPreview | components/tickets/AttachmentPreview.tsx | M05 / M14（D-01 裁决：实现，不得当死代码删除） |

> 原表把 `DarkModeToggle.tsx` 列为 Navbar 组件，**与实际不符**（Navbar 用的是 ThemeToggle）。该文件及其测试已按 T-086 作为无引用死代码删除。

## 4. 全局基础设施（2026-11-15 修正）

| 模块 | 文件 | 说明 |
|------|------|------|
| i18n | messages/en.json, zh.json | 多语言（EN + 繁中），顶层键数一致 |
| Sanity | lib/sanity.ts（唯一实现）+ lib/sanity.server.ts（re-export） | CMS 数据层；T-086 前两者是逐字节重复的两份配置 |
| Supabase | lib/supabase/*、supabase/migrations/005–007 | 数据库 + 认证；迁移文件 push 不会自动执行，需 Management API |
| Dark Mode | globals.css + ThemeToggle.tsx | 暗色模式（CSS class 方案，layout 内有主题初始化脚本） |
| SEO | sitemap.ts, robots.ts, JsonLd.tsx | 搜索引擎优化；后台路由已设 noindex |
| 部署 | scripts/deploy-vercel.mjs | Vercel 直推（`--prod --no-wait`），GitHub 仅存代码 |

## 5. Review 工作流

**用户说**：「review Home 模块」

**Agent 执行**：

```
1. Read(docs/modules/INDEX.md)        # 定位模块与权威状态来源
2. Read(docs/modules/M01-Home.md)     # 模块详情（若存在）
3. 对照 TODO.md §8 与评估报告       # 不用本文档的百分比下结论
```

## 6. 文档维护规则

1. 模块有重大变更时，更新对应模块文档**并在 `TODO.md` §8 同步状态**；
2. 完成度数字只能引用评估报告原文，不得自行合成或折算；
3. 「已完成」必须带线上/端到端证据，否则写「代码完成 / 待验收」；
4. 历史 session 记录保留在 `.workbuddy/memory/` 与 runbook，不单独拆分新文档。
