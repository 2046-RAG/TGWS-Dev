# M09 - VMware Alt VMware 替代方案

> **状态**：85%（基于源码事实评估，详见 spec.md §7.9）— Wave 4 完成修复

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /vmware-alternative |
| 核心文件 | vmware-alternative/page.tsx (11KB), vmware-alternative/layout.tsx |
| 组件大小 | 11KB |
| PRD | [S16] VMware 替代方案 |
| 完成度 | 85% |

## 页面内容

- **5 个替代方案**：Proxmox, Sangfor, Nutanix, StarWind, H3C
- **4 步迁移流程**：Assess → Start → Migrate → Validate
- **CTA 区域**：Hero phone CTA (`tel:+63xxxxxxxxx`) + 底部 "VMware Migration Inquiries"

## 访问方式

- 从首页 Storyline 卡片进入（非导航栏直接显示）

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W4-2 | **Hero phone CTA 改 `tel:+63xxxxxxxxx`**（之前两个 CTA 都指向 `/contact`，行为不一致） | vmware-alternative/page.tsx:60-72 |
| W4-2 | metadata 加 `alternates.canonical` 和 `alternates.languages`（多语言 SEO 信号） | vmware-alternative/layout.tsx:11-18 |
| W4-2 | **厂商品牌色集中到 `src/lib/vendor-colors.ts`**（之前 `#E57000`、`#0066CC` 等内联在 JSX） | lib/vendor-colors.ts |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | 统计数据 `t('stat1')` 等作为显示值，无数值校验、无 aria-label | 🟡 翻译者可注入任意字符串，待加校验 |
| 2 | `scroll-reveal` 类依赖全局 IntersectionObserver；若 `.js-loaded` 缺失，内容隐藏 | 🟡 已渐进增强处理 |

## 关键教训

1. **CTA copy-paste**：Hero 复制了 phone CTA 变体但接了同样的 `/contact` → W4-2 已修复（一个跳联系页，一个拨号）
2. **内联样式漂移**：厂商主题色按区段写，未集中 → W4-2 已迁移到 `lib/vendor-colors.ts`
3. **metadata 模板太薄**：layout.tsx 从 compare 复制但缺 SEO 扩展 → W4-2 已补 canonical/alternates

## 相关 Session

- W4-2: M09 VMware 修复（2026-07-19）
