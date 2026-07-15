# 10项网站体验问题修复计划

## 问题总览

| # | 问题 | 优先级 | 预估工时 |
|---|------|--------|----------|
| P1 | Hero视频+Key Message优化 | High | 2h |
| P2 | 首页Storyline重设计 | High | 3h |
| P3 | 合作伙伴Logo墙重做 | Medium | 1.5h |
| P4 | Product二级页面 | Critical | 8h |
| P5 | Solutions页面内容核对 | Medium | 2h |
| P6 | Blog语言一致性 | Medium | 1h |
| P7 | 暗色模式全面适配 | Critical | 4h |
| P8 | Ticket注册功能修复 | Critical | 1h |
| P9 | 导航栏AI Hub入口 | Medium | 1h |
| P10 | 悬停功能brainstorm | Low | 2h |

---

## P1: Hero Section优化

### 问题
- Key message不够吸睛
- 风格与网站不匹配
- 视频动效需要确认

### 方案
- 重新设计Hero文案：从"Build. Run. Protect."改为更具冲击力的Slogan
- 视频：保留当前视频scrubbing方案，优化过渡效果
- 添加动态文字效果（打字机/渐入）

### 具体改动
1. `HeroSection.tsx` - 重写文案和动画
2. `en.json` / `zh.json` - 更新Hero翻译
3. CSS动画增强

---

## P2: 首页Storyline重设计

### 问题
- 三个Storyline(Build/Run/Protect)设计不吸睛
- AI味太严重
- 体验平平

### 方案
- 调用impeccable技能评估并重设计
- 采用更真实的视觉风格
- 增加交互性（hover效果、点击展开）

### 具体改动
1. 调用impeccable获取设计方案
2. 重写Storyline组件
3. 添加微交互

---

## P3: 合作伙伴Logo墙

### 问题
- 字符重叠
- 大小不一
- 没有滚动效果
- 过于死板

### 方案
- CSS Grid/Flexbox统一布局
- 添加无限滚动动画（CSS marquee或JS）
- 统一Logo尺寸和间距

### 具体改动
1. `Footer.tsx` 或首页Logo组件
2. CSS添加marquee动画
3. Logo统一为固定尺寸

---

## P4: Product二级页面（最大任务）

### 问题
- Build/Run/Protect每个需要下钻页面
- 每个页面展示该类别下的品牌和产品
- 产品链接到官方页面
- 双语支持

### 方案
- 创建3个二级页面：/products/build, /products/run, /products/protect
- 每个页面展示该类别的所有产品
- 产品卡片：品牌名+产品名+简介+官方链接

### 产品数据（来自Sanity）

**Build (5个产品)**:
- Alibaba Cloud Bailian - AI平台
- ByteDance Seedance - AI视频生成
- ByteDance 即梦 - AI图像生成
- AIGC Content - AI内容生成
- AI Coding Tools - AI编程助手

**Run (15个产品)**:
- VMware vSphere - 虚拟化
- Nutanix HCI - 超融合
- Sangfor HCI - 超融合
- Proxmox VE - 开源虚拟化
- StarWind - 超融合
- H3C - 服务器/网络
- Dell PowerEdge - 服务器
- HP ProLiant - 服务器
- Lenovo ThinkSystem - 服务器
- Alibaba Cloud - 云服务
- Veeam - 备份
- Fortinet FortiGate - 网络(部分Run)
- SD-WAN - 广域网
- WiFi 6 - 无线网络
- Hybrid Cloud - 混合云

**Protect (8个产品)**:
- Fortinet FortiGate - 防火墙
- Fortinet FortiEDR - 端点防护
- Sangfor aNGAF - 防火墙
- Sangfor aEDR - 端点防护
- Sophos - 安全
- Hillstone - 防火墙
- Arcfra - 安全
- MDR SOC - 托管安全

### 具体改动
1. 创建 `src/app/[locale]/products/[category]/page.tsx`
2. 创建 `src/app/[locale]/products/[category]/ProductList.tsx`
3. 更新Sanity schema添加officialUrl字段
4. 导航菜单更新
5. i18n翻译

---

## P5: Solutions页面内容核对

### 方案
- 运行Sanity脚本核对前端显示与后端数据
- 修正不一致项

---

## P6: Blog语言一致性

### 方案
- 运行check-language-consistency.mjs
- 修复发现的问题

---

## P7: 暗色模式全面适配（关键任务）

### 问题
- 0条dark mode CSS规则
- body有dark:bg-[#09090B]但组件用硬编码白色
- 文字颜色在暗色模式下不可读

### 方案
- 在globals.css添加dark mode基础样式
- 所有组件添加dark:变体
- 使用CSS变量统一管理

### 具体改动
1. globals.css添加dark mode主题变量
2. 所有页面组件添加dark:前缀
3. Navbar/Footer/Card等组件适配
4. BlogDetail/CaseStudyDetail适配
5. 表单元素适配

---

## P8: Ticket注册功能修复

### 方案
- 检查RegisterForm.tsx
- 测试Supabase Auth注册流程
- 修复发现的问题

---

## P9: 导航栏AI Hub入口

### 方案
- 在MegaMenu中添加AI Hub入口
- 暂用占位页面
- 与用户brainstorm命名

---

## P10: 悬停功能Brainstorm

### 当前悬停项
1. 全站搜索 - Cloudflare Workers AI
2. Odoo CRM集成
3. 客户评价系统
4. AI集成

### Brainstorm方向
- AI搜索助手（替代简单搜索）
- 智能工单分类
- AI驱动的产品推荐
- 客户案例自动生成

---

## 执行顺序

### Phase 1: Critical修复（先做）
1. P8 Ticket注册修复
2. P7 暗色模式适配
3. P4 Product二级页面

### Phase 2: 体验提升
4. P1 Hero优化
5. P2 Storyline重设计
6. P3 Logo墙重做

### Phase 3: 内容完善
7. P5 Solutions核对
8. P6 Blog语言一致性
9. P9 AI Hub入口
10. P10 悬停功能brainstorm
