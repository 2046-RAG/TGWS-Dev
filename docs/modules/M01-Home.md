# M01 - Home 首页

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /home (重定向自 /) |
| 核心文件 | app/[locale]/home/page.tsx (20KB) |
| 组件 | HeroSection.tsx (12KB) |
| PRD | [S5] Hero Section设计 |
| 状态 | ✅ 完成 |

## 页面结构

1. **Hero Section** - 全屏视频背景 + 打字机效果 + CTA按钮
2. **Core Value** - Build. Run. Protect. 三维度介绍
3. **AI Journey** - AI转型旅程
4. **VMware Alternatives** - VMware替代方案特色
5. **Social Proof** - 合作伙伴Logo墙(双排逆向滚动)

## 关键配置

- **视频**: `/videos/mixkit-hologram-19630.mp4` (Hologramle5)
- **打字机速度**: 38ms/字符
- **鼠标灵敏度**: SENSITIVITY = 0.5
- **Hero Tagline**: "Build with AI. Run Beyond VMware. Protect Without Borders."

## 关键教训

1. **鼠标scrubbing全方向**: 必须同时追踪deltaX+deltaY，分母用(innerWidth+innerHeight)
2. **首页布局保守**: 5个区块结构已稳定，不合并区块
3. **Logo墙animationPlayState**: 必须应用在带动画类名的子元素上，不能在父div
4. **禁止擅自添加grayscale**: logo墙曾因擅自加grayscale+opacity导致全部变灰

## 相关Session

- S57: #6 Hero简化(保留单视频) + Logo墙统一化(19品牌Iconify)
- S60: Hero全方向鼠标动效修复
