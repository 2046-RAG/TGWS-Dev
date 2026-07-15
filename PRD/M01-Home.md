# TechGuru PRD - 首页（网站架构、Hero Section）

> 从 PRD-TechGuru-Website.md 分割
> 原始章节: L207-L278, L279-L331

---

## [S4] 网站架构

### 4.1 页面结构

```
Home（首页）
├── Hero Section（全屏视频+打字机效果）
├── Build/Run/Protect 三维度介绍
├── VMware替代方案特色板块
├── 行业解决方案精选
├── 客户案例 + 数据统计
├── 合作伙伴Logo墙
└── CTA区域

Products（产品服务）
├── Build（构建）
│   ├── AIGC
│   ├── AI Agent开发
│   └── 传统业务智能化改造
├── Run（承载）
│   ├── VMware替代方案 ⭐特色
│   ├── 超融合HCI
│   ├── 私有云/公有云/混合云
│   ├── 服务器/存储
│   └── 托管云/业务连续性
└── Protect（保护）
    ├── NGFW/IPS/WAF
    ├── EDR/XDR/NDR
    ├── SASE/ZTNA
    ├── 网络优化
    └── MDR/渗透测试/应急响应

Solutions（行业解决方案）
├── 医疗
├── 金融
├── 零售
├── 物流
├── 教育
└── 政府

Blog（新闻博客）
├── 文章列表
├── 分类筛选
└── 文章详情

About（关于我们）
├── 公司简介
├── 发展历程（时间轴）
├── 团队介绍
└── 公司资质

Support（客户支持）
├── 工单系统（需登录）
├── 知识库/FAQ
└── 联系我们

Admin（后台管理）
├── 工单管理
├── 用户管理
└── 内容管理（跳转Sanity）
```

### 4.2 导航栏设计

- **Logo：** TechGuru Network & Data Solutions®
- **导航链接：** Home, Products, Solutions, Blog, About, Support
- **CTA按钮：** Get a Quote / Contact Us
- **语言切换：** EN / 繁中
- **移动端：** 汉堡菜单 + 全屏覆盖层

---


---

## [S5] Hero Section设计

> **注意**: 本节已根据实际实现更新（2026-07-09）。

### 5.1 全屏视频背景

- **交互方式：** 鼠标左右移动控制视频播放进度（scrubbing）
- **视频来源：** CloudFront CDN 托管的 MP4 视频（已确认）
- **技术实现：** `muted playsInline preload="auto"`，`fastSeek()` 优先（Chrome支持），降级为 `currentTime`
- **灵敏度：** `SENSITIVITY = 0.5`（鼠标移动全屏宽度时，视频播放一半时长）
- **移动端：** 黑色半透明遮罩 (`bg-black/30`) 保证文字可读性

### 5.2 欢迎语（打字机效果）

| 语言 | 内容 |
|------|------|
| 英文 | "Your Trusted IT Partner in Asia. What challenge can we solve for you?" |
| 繁中 | "您在亞洲值得信賴的IT合作夥伴。我們能為您解決什麼挑戰？" |

- **打字速度：** 38ms/字符
- **启动延迟：** 600ms
- **光标：** 打字完成后隐藏

### 5.3 模糊介绍标签

| 语言 | 内容 |
|------|------|
| 英文 | "TechGuru Network & Data Solutions" |
| 繁中 | "泰谷網數科技" |

- **模糊效果：** `filter: blur(4px)` 作为品牌身份锚点

### 5.4 行动按钮

Hero 底部包含三个故事卡片（Storyline Cards）：

| 卡片 | 内容 | 动画延迟 |
|------|------|----------|
| Build. Run. Protect. | 三支柱框架介绍 | 0.8s |
| AI Journey | AI服务能力 | 1.0s |
| VMware Alternatives | VMware替代方案 | 1.2s |

- **CTA按钮组：** 挂载后 400ms 淡入，白色背景 + 黑色文字，悬停反转为黑底白字
- **邮箱复制按钮：** 透明背景 + 黑色边框，点击复制 `Inquiries@techguru-it.asia`
- **所有按钮：** `min-h-[44px]` (WCAG 触控目标合规)
- **滚动指示器：** 底部脉冲动画 + 弹跳效果

### 5.5 设计版本

当前仅实现一种版本：浅色背景 + 自动暗色模式适配。通过 CSS `@media (prefers-color-scheme: dark)` 自动切换，无手动切换按钮。

---


---