# M01 - Home 首页

> **状态**：80%（基于源码事实评估，详见 spec.md §7.1）

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /home (重定向自 /) |
| 核心文件 | app/[locale]/home/page.tsx (20KB) |
| 组件 | HeroSection.tsx (12KB) |
| PRD | [S5] Hero Section 设计 |
| 完成度 | 80% |

## 页面结构（5 区块，已稳定）

1. **Hero Section** - 全屏视频背景 + 打字机效果 + CTA 按钮
2. **Core Value** - Build. Run. Protect. 三维度介绍
3. **AI Journey** - AI 转型旅程
4. **VMware Alternatives** - VMware 替代方案特色
5. **Social Proof** - 合作伙伴 Logo 墙（双排逆向滚动）

## 关键配置

- **视频**: `/videos/mixkit-hologram-19630.mp4`
- **打字机速度**: 38ms/字符（reduced-motion 时直接显示完整文本）
- **鼠标灵敏度**: SENSITIVITY = 0.5（reduced-motion 时禁用 mousemove 监听）
- **Hero Tagline**: "Build with AI. Run Beyond VMware. Protect Without Borders."
- **视频 poster**: `/images/hero-poster.jpg`（W0-5 新增）
- **视频 aria-label**: "TechGuru brand video showing infrastructure and AI technology"（W0-5 新增）

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W0-5 | Hero a11y 修复：打字机 + 鼠标拖动加 `prefers-reduced-motion` 检查；`<video>` 加 poster + aria-label；`document.execCommand('copy')` 替换为 `navigator.clipboard.writeText` + fallback | HeroSection.tsx |
| W2-3 | 6 处硬编码 EN/ZH 字符串修复（"Choose Path"、"Powered by"、"VMware Alternatives"、迁移步骤标题/描述） | home/page.tsx |
| W4-8 | globals.css token 化（body color、.section-title 改 var） | globals.css |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | framer-motion 幽灵依赖（package.json 未声明但代码 import） | ⏳ 待用户决策（移除或加入依赖） |
| 2 | "Explore Products" 链接指向 `/products`（未带 `#build`/`#run`/`#protect` 锚点） | 🟡 待统一锚点策略 |
| 3 | Hero 鼠标拖动视频进度是否保留（a11y vs 视觉惊艳权衡） | ⏳ 待用户决策（W0-5 已加 reduced-motion 守护） |

## 关键教训

1. **鼠标 scrubbing 全方向**：必须同时追踪 deltaX+deltaY，分母用 (innerWidth+innerHeight)
2. **首页布局保守**：5 个区块结构已稳定，不合并区块（AGENTS #44）
3. **Logo 墙 animationPlayState**：必须应用在带动画类名的子元素上，不能在父 div
4. **禁止擅自添加 grayscale**：logo 墙曾因擅自加 grayscale+opacity 导致全部变灰（AGENTS #53）

## 相关 Session

- S57: #6 Hero 简化（保留单视频） + Logo 墙统一化（19 品牌 Iconify）
- S60: Hero 全方向鼠标动效修复
- W0-5: Hero a11y 修复（2026-07-19）
