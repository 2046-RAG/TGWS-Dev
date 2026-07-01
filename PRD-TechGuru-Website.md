# TechGuru Network & Data Solutions 官网 PRD

**版本：** v1.0  
**日期：** 2026-06-28  
**项目名称：** TechGuru Network and Data Solutions 官方网站  
**域名：** www.techguru-it.asia  
**部署平台：** Vercel  

---

## [S1] 项目概述

### 1.1 企业背景

泰谷网数科技（TechGuru Network and Data Solutions Inc.）是亚洲领先的IT解决方案集成商和代理商，业务覆盖网络安全、网络优化、云计算、基础设施、人工智能、托管服务和业务连续性七大领域。

### 1.2 项目定位

打造一个具备**科技感、未来感和人工智能**的综合门户网站，展示公司实力、产品服务和行业解决方案。

### 1.3 品牌口号

| 层级 | 英文 | 繁中 |
|------|------|------|
| **主口号** | Build. Run. Protect. | 構建。運行。保護。 |
| **副口号** | From AI workloads to mission-critical infrastructure — we secure every layer. | 從AI工作負載到關鍵任務基礎設施——我們保護每一層。 |

### 1.4 目标用户

- 技术开发者（安全工程师、运维人员、架构师）
- 企业客户（IT决策者、安全Admin、基础架构团队主管、IT主管、IT Manager）
- 垂直行业用户（医疗、金融、零售、物流、教育、政府等）

### 1.5 核心目标

1. 塑造专业、可信、前沿的企业品牌形象
2. 提供清晰的产品/服务展示和行业解决方案
3. 支持客户登录网站创建售后issue ticket并通知技术人员处理，自助服务（门户）和内部管理（后台）
4. 通过SEO/GEO优化提升搜索引擎可见性
5. 预留Odoo CRM对接能力（表单提交自动同步到CRM联系人并创建Leads）
6. 集成CMS系统对网站内容进行管理，变更支持实时生效

---

## [S2] 技术架构

### 2.1 技术栈

| 组件 | 选择 | 用途 |
|------|------|------|
| **前端框架** | Next.js (App Router) | SSR/SSG，Vercel原生优化 |
| **CMS** | Sanity | 内容管理，实时生效 |
| **数据库** | Supabase | 用户、工单数据存储 |
| **认证** | Supabase Auth | Gmail OAuth + 邮箱密码 |
| **文件存储** | Supabase Storage | 工单附件上传 |
| **邮件服务** | Resend | 通知邮件发送 |
| **UI框架** | Tailwind CSS + shadcn/ui | 样式+组件库 |
| **动画** | Framer Motion | 页面过渡、微交互 |
| **部署** | Vercel | 托管+CDN |
| **语言** | TypeScript | 类型安全 |

### 2.2 多语言方案

| 项目 | 方案 |
|------|------|
| 支持语言 | 美式英语 (en) + 繁体中文 (zh) |
| 路由 | `/en/...` 英文，`/zh/...` 繁中 |
| 默认语言 | 英文（`/` 重定向到 `/en`） |
| 切换方式 | 导航栏语言切换器 |
| 内容管理 | Sanity多语言字段 |

### 2.3 SEO优化

| 项目 | 方案 |
|------|------|
| Meta标签 | 每页独立title、description、keywords |
| 结构化数据 | JSON-LD（Organization、Product、FAQ） |
| Sitemap | 自动生成 `/sitemap.xml` |
| Robots.txt | 允许所有爬虫 |
| 多语言SEO | hreflang标签 |
| 图片优化 | Next.js Image组件，自动WebP/AVIF |

### 2.4 性能目标

| 指标 | 目标 |
|------|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Lighthouse | > 90 |

### 2.5 网站安全

#### 2.5.1 应用层安全

| 攻击类型 | 防护措施 |
|----------|----------|
| **密码爆破** | 登录失败次数限制（5次/15分钟）、账户临时锁定、图形验证码 |
| **跨站脚本攻击(XSS)** | 输入过滤、输出编码、CSP内容安全策略、DOMPurify sanitization |
| **SQL注入** | 参数化查询、ORM（Prisma）、输入验证、最小权限数据库账户 |
| **点击劫持** | X-Frame-Options: DENY、CSP frame-ancestors |
| **CSRF攻击** | CSRF Token、SameSite Cookie属性、Referer验证 |
| **撞库攻击** | 密码复杂度要求、登录异常检测、邮件通知、IP黑名单 |
| **文件上传漏洞** | 文件类型白名单、文件大小限制（10MB）、病毒扫描、存储隔离 |
| **目录遍历** | 路径规范化、访问控制列表、禁止目录列表 |
| **SSRF攻击** | URL白名单、内网地址过滤、禁用file://协议 |

#### 2.5.2 数据层安全

| 风险 | 防护措施 |
|------|----------|
| **数据库拖库** | Supabase RLS行级安全、环境变量管理密钥、最小权限原则 |
| **敏感数据泄露** | 数据加密存储、日志脱敏、错误信息不暴露堆栈 |
| **数据备份** | Supabase自动备份、定期手动备份、备份加密存储 |
| **数据隐私** | GDPR合规、用户数据可导出可删除、隐私政策 |

#### 2.5.3 基础设施安全

| 风险 | 防护措施 |
|------|----------|
| **DDoS攻击** | Vercel内置DDoS防护、Cloudflare CDN（可选） |
| **中间人攻击** | 强制HTTPS、HSTS头部、证书固定 |
| **依赖漏洞** | npm audit、Dependabot自动更新、Snyk扫描 |
| **密钥泄露** | 环境变量管理、.gitignore排除敏感文件、pre-commit hooks |

#### 2.5.4 认证与授权

| 项目 | 方案 |
|------|------|
| **密码存储** | bcrypt/argon2哈希加盐 |
| **Session管理** | HttpOnly + Secure + SameSite Cookie |
| **Token安全** | JWT短期有效期、Refresh Token轮换 |
| **角色控制** | RBAC（客户/管理员/超级管理员） |
| **OAuth安全** | 验证state参数、限制redirect_uri |

#### 2.5.5 监控与响应

| 项目 | 方案 |
|------|------|
| **安全日志** | 记录登录、权限变更、敏感操作 |
| **异常检测** | 监控异常登录地点、时间、频率 |
| **入侵响应** | 自动锁定可疑账户、邮件通知管理员 |
| **安全审计** | 定期代码审计、渗透测试 |

#### 2.5.6 邮件安全

| 项目 | 方案 |
|------|------|
| **SPF** | 配置Sender Policy Framework |
| **DKIM** | 邮件域名密钥签名 |
| **DMARC** | 域名认证报告策略 |

**安全头部配置：**
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.sanity.io; frame-ancestors 'none'`

---

## [S3] 产品服务归类 - Build / Run / Protect

### 3.1 Build（构建）- 构建通用业务负载和智能业务负载

| 产品/服务 | 说明 |
|-----------|------|
| AIGC | Text-To-Video、Image-To-Video、AI Coding/Agentic Coding |
| AI Agent开发 | 低代码/零代码平台开发为主 |
| 传统业务智能化改造 | 现有系统AI赋能 |

### 3.2 Run（承载）- 极致性能、极致可靠，统一基础架构承载通用计算和智能计算

| 分类 | 产品/服务 |
|------|-----------|
| **虚拟化平台** | 服务器虚拟化、VMware替代方案（Proxmox VE、Sangfor aSV、Sangfor HCI、Nutanix、Arcfra、H3C） |
| **超融合** | 超融合基础设施（HCI）、分离式超融合架构（Disaggregated HCI） |
| **云平台** | 私有云、公有云、混合云解决方案 |
| **硬件** | 服务器、存储解决方案、模块化机架、布线系统 |
| **托管服务** | 托管云服务（Managed Cloud Service） |
| **业务连续性** | 容灾（DR-as-a-Service + On-Prem）、备份解决方案（Backup-as-a-Service）、DR Drill演练服务 |

### 3.3 Protect（保护）- 全方位多维度保护负载和数据安全

| 分类 | 产品/服务 |
|------|-----------|
| **边界防护** | 下一代防火墙（NGFW）、入侵防御系统（IPS） |
| **应用安全** | Web应用防护（WAF） |
| **终端安全** | 端点检测与响应（EDR）、终端防护（EPP）、杀毒软件 |
| **网络安全** | 网络检测与响应（NDR）、扩展检测与响应（XDR） |
| **云安全** | 云访问安全代理（CASB）、安全访问服务边缘（SASE）、零信任网络（ZTNA） |
| **网络优化** | 上网行为管理、流量控制、服务器负载均衡、链路负载均衡、WAN优化、SD-WAN |
| **托管安全** | 托管安全检测与响应（MDR）、安全渗透测试 |
| **应急响应** | 勒索软件应急响应、勒索软件加密数据恢复 |

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

Case Studies（案例展示）
├── 按行业筛选
├── 按产品筛选
└── 案例详情页

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
- **导航链接：** Home, Products, Solutions, Case Studies, Blog, About, Support
- **CTA按钮：** Get a Quote / Contact Us
- **语言切换：** EN / 繁中
- **移动端：** 汉堡菜单 + 全屏覆盖层

---

## [S5] Hero Section设计

### 5.1 全屏视频背景

- **交互方式：** 鼠标左右移动控制视频播放进度
- **视频内容：** IT基础设施、网络安全防护、数据中心、云服务等科技感画面
- **视频来源：** 免费视频库（Pexels、Coverr）或自定义视频

### 5.2 欢迎语（打字机效果）

| 语言 | 内容 |
|------|------|
| 英文 | "Your Trusted IT Partner in Asia. What challenge can we solve for you?" |
| 繁中 | "您在亞洲值得信賴的IT合作夥伴。我們能為您解決什麼挑戰？" |

### 5.3 模糊介绍标签

| 语言 | 内容 |
|------|------|
| 英文 | "TechGuru Network & Data Solutions" |
| 繁中 | "泰谷網數科技" |

### 5.4 行动按钮

| 按钮文本 | 链接 |
|----------|------|
| Explore Solutions | /solutions |
| View Case Studies | /case-studies |
| Schedule a Demo | /contact |
| VMware Migration | /vmware-alternative |
| Email us: info@techguru-it.asia | 复制邮箱功能 |

### 5.5 双版本设计

| 版本 | 背景 | 文字颜色 | 按钮风格 |
|------|------|----------|----------|
| **A: 白色简约** | 白色/浅灰 | 黑色 | 白底黑边框 |
| **B: 深色科技** | 深色+渐变 | 白色 | 渐变蓝紫 |

---

## [S6] 客户工单系统

### 6.1 功能概述

已下单客户或现有客户可注册账号、登录后提交工单，查看历史工单状态，后台管理员可分配和处理工单。

### 6.2 用户认证

| 项目 | 方案 |
|------|------|
| 注册方式 | 邮箱+密码、Gmail OAuth单点登录 |
| 邮箱建议 | 强烈推荐企业邮箱（不禁止@gmail.com） |
| 认证服务 | Supabase Auth |
| 密码复杂度 | 最少8位，包含大小写字母+数字 |

### 6.3 工单提交

| 字段 | 说明 |
|------|------|
| 产品/服务 | 下拉菜单选择（对应Build/Run/Protect分类） |
| 问题描述 | 富文本编辑器 |
| 附件上传 | 截图、文档等，限制10MB |
| 提交后 | 自动发送acknowledge邮件给技术人员和客户 |

### 6.4 邮件通知

| 场景 | 收件人 | 内容 |
|------|--------|------|
| 工单提交 | 技术人员（可自定义邮箱）+ 客户 | 工单确认通知 |
| 状态更新 | 客户 | 工单状态变更通知 |

### 6.5 工单管理

| 角色 | 功能 |
|------|------|
| **客户** | 查看我的工单、工单列表、状态筛选（Open/In Progress/Resolved/Closed） |
| **管理员** | 工单分配、状态更新、统计报表（按周/月/季/年）、用户管理 |

### 6.6 统计维度

- 按客户统计工单数量
- 按产品/服务统计工单数量
- 按时间维度（周/月/季/年）统计

---

## [S7] Odoo CRM集成

### 7.1 集成方式

表单单向推送到Odoo CRM，并在CRM中创建对应的Leads。

### 7.2 推送字段

| 网站字段 | Odoo字段 |
|----------|----------|
| 姓名 | Contact Name |
| 邮箱 | Email |
| 公司 | Company |
| 电话 | Phone |
| 需求描述 | Lead Description |
| 来源 | Lead Source = "TechGuru Website" |

### 7.3 技术实现

- 使用Odoo Online XML-RPC API
- 表单提交触发 → 调用Odoo API → 创建Contact + Lead

---

## [S8] CMS内容管理

### 8.1 Sanity配置

| 内容类型 | 说明 |
|----------|------|
| 产品/服务 | 名称、描述、分类（Build/Run/Protect）、图标 |
| 行业解决方案 | 行业名称、痛点、方案描述、案例链接 |
| 案例展示 | 标题、行业、产品、背景、挑战、方案、成果 |
| 博客文章 | 标题、内容（Markdown）、分类、发布日期 |
| 公司信息 | 简介、发展历程、团队成员、资质证书 |
| 合作伙伴 | 名称、Logo、链接 |

### 8.2 实时生效

- Sanity内容变更后，通过Webhook触发Next.js ISR重新验证
- 管理员在Sanity后台编辑内容，网站即时更新

---

## [S9] 设计规范

### 9.1 色彩方案

| 用途 | 颜色 | 说明 |
|------|------|------|
| 主色 | `#00D4FF` | 科技蓝，按钮、链接、强调 |
| 辅助色 | `#7B61FF` | 紫色，渐变、次要强调 |
| 背景色 | `#0A0A0F` | 深色背景 |
| 表面色 | `#12121A` | 卡片、导航栏 |
| 文字主色 | `#FFFFFF` | 主要文字 |
| 文字次色 | `#94A3B8` | 次要文字 |

### 9.2 字体

| 用途 | 字体 |
|------|------|
| 标题 | Inter (Bold) |
| 正文 | Inter (Regular) |
| 代码/技术 | JetBrains Mono |

### 9.3 设计风格

- **玻璃态效果 (Glassmorphism)**：导航栏、卡片使用半透明背景+模糊效果
- **渐变光效**：关键按钮和标题使用蓝紫渐变
- **微交互**：悬停时轻微放大、颜色变化
- **深色主题为主**，支持亮色模式切换

### 9.4 关键页面特效

| 页面 | 特效 |
|------|------|
| 公司简介 | 打字机效果 |
| 发展历程 | 垂直滚动时间线 |
| 团队介绍 | 3D翻转卡片 |
| 公司资质 | 网格展示 + 灯箱查看 |

---

## [S10] 行业解决方案

### 10.1 支持行业

| 行业 | 解决方案要点 |
|------|-------------|
| 医疗 | 医疗数据安全、合规性、远程医疗基础设施 |
| 金融 | 金融安全防护、交易系统高可用、合规审计 |
| 零售 | 零售数字化、POS安全、客户数据分析 |
| 物流 | 物联网追踪、供应链安全、仓储管理系统 |
| 教育 | 教育云平台、网络安全教育、远程教学 |
| 政府 | 政务云、网络安全等保、数据安全 |

### 10.2 行业页面内容

每个行业页面包含：
- 行业痛点分析
- 解决方案架构图（3D可视化）
- 推荐产品组合
- 成功案例
- 联系获取方案

---

## [S11] 案例展示

### 11.1 筛选维度

- 按行业分类筛选
- 按产品/技术分类筛选

### 11.2 案例详情页

- 背景介绍
- 面临挑战
- 解决方案
- 实施成果（数据可视化展示）

---

## [S12] 新闻博客

### 12.1 功能

- 文章列表 + 分类筛选
- 文章详情（Markdown渲染）
- SEO优化（结构化数据）
- 社交分享

---

## [S13] 联系我们

### 13.1 联系表单

- 姓名、邮箱、公司、需求描述
- 提交后发送邮件通知 + 同步到Odoo CRM

### 13.2 其他内容

- 亚洲各区域办公地点展示（地图）
- 社交媒体链接
- 二维码（微信、WhatsApp等）

---

## [S14] 关于我们

### 14.1 子页面

| 子页面 | 内容 | 特效 |
|--------|------|------|
| 公司简介 | 公司介绍、愿景使命 | 打字机效果 |
| 发展历程 | 时间轴展示 | 垂直滚动时间线 |
| 团队介绍 | 核心团队成员 | 3D翻转卡片 |
| 公司资质 | 资质证书、合作伙伴 | 网格展示 + 灯箱查看 |
| 新闻动态 | 公司新闻、行业资讯 | 列表 + 分页 |

---

## [S15] 免费额度汇总

| 服务 | 免费额度 | 用途 |
|------|----------|------|
| Vercel | 100GB带宽/月 | 部署托管 |
| Sanity | 100k API请求/月 | CMS内容管理 |
| Supabase | 500MB数据库 + 1GB存储 | 用户/工单/附件 |
| Resend | 100封邮件/天 | 通知邮件 |
| **总计** | - | **全部免费** |

---

## [S16] VMware替代方案（独立板块）

### 16.1 页面内容

- **为什么切换？** VMware成本上涨、许可证复杂
- **替代产品：** Proxmox VE、Sangfor aSV、Sangfor HCI、Nutanix、Arcfra、H3C
- **迁移服务：** 评估、规划、实施
- **硬件利旧评估：** 兼容性评估、性能分析、使用寿命预测
- **新购硬件优化：** 选型、配置优化、TCO分析

### 16.2 页面位置

- 首页独立入口板块
- Products页面Run分类下的子页面

---

## [S17] 数据模型

### 17.1 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，Supabase Auth自动生成 |
| email | VARCHAR(255) | 邮箱，唯一 |
| full_name | VARCHAR(100) | 姓名 |
| company | VARCHAR(200) | 公司名称 |
| phone | VARCHAR(20) | 电话号码 |
| role | ENUM | customer / admin / super_admin |
| preferred_language | VARCHAR(5) | en / zh |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 17.2 工单表 (tickets)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 外键，关联users表 |
| ticket_number | VARCHAR(20) | 工单编号，自动生成（TG-YYYYMMDD-XXXX） |
| category | ENUM | build / run / protect |
| product_service | VARCHAR(100) | 具体产品/服务 |
| subject | VARCHAR(200) | 工单主题 |
| description | TEXT | 问题描述 |
| status | ENUM | open / in_progress / resolved / closed |
| priority | ENUM | low / medium / high / critical |
| assigned_to | UUID | 外键，分配给的管理员 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| resolved_at | TIMESTAMP | 解决时间 |

### 17.3 工单附件表 (ticket_attachments)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| ticket_id | UUID | 外键，关联tickets表 |
| file_name | VARCHAR(255) | 文件名 |
| file_url | TEXT | Supabase Storage URL |
| file_size | INTEGER | 文件大小（字节） |
| file_type | VARCHAR(50) | MIME类型 |
| uploaded_at | TIMESTAMP | 上传时间 |

### 17.4 工单评论表 (ticket_comments)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| ticket_id | UUID | 外键，关联tickets表 |
| user_id | UUID | 外键，关联users表 |
| content | TEXT | 评论内容 |
| is_internal | BOOLEAN | 是否内部备注（仅管理员可见） |
| created_at | TIMESTAMP | 创建时间 |

### 17.5 联系表单表 (contact_submissions)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 姓名 |
| email | VARCHAR(255) | 邮箱 |
| company | VARCHAR(200) | 公司 |
| phone | VARCHAR(20) | 电话 |
| message | TEXT | 需求描述 |
| odoo_synced | BOOLEAN | 是否已同步到Odoo |
| created_at | TIMESTAMP | 提交时间 |

---

## [S18] API设计

### 18.1 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/signup` | 邮箱注册 |
| POST | `/api/auth/signin` | 邮箱登录 |
| POST | `/api/auth/signin/oauth` | Gmail OAuth登录 |
| POST | `/api/auth/signout` | 登出 |
| POST | `/api/auth/reset-password` | 重置密码 |

### 18.2 工单接口

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/tickets` | customer | 获取我的工单列表 |
| POST | `/api/tickets` | customer | 创建工单 |
| GET | `/api/tickets/[id]` | customer | 获取工单详情 |
| PATCH | `/api/tickets/[id]` | admin | 更新工单状态 |
| POST | `/api/tickets/[id]/assign` | admin | 分配工单 |
| GET | `/api/tickets/stats` | admin | 获取统计报表 |

### 18.3 文件上传接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload` | 上传附件（最大10MB） |

### 18.4 联系表单接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/contact` | 提交联系表单 + 同步Odoo |

### 18.5 API响应格式

```json
// 成功
{
  "success": true,
  "data": { ... }
}

// 失败
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

---

## [S19] 无障碍要求 (WCAG 2.1 AA)

### 19.1 核心要求

| 级别 | 要求 | 实现方式 |
|------|------|----------|
| **A** | 所有图片有alt文本 | `<img alt="...">` 或 Next.js Image组件 |
| **A** | 表单有标签 | `<label>` 关联 `<input>` |
| **A** | 链接文本有意义 | 避免"点击这里" |
| **A** | 页面可键盘导航 | Tab顺序合理，无键盘陷阱 |
| **AA** | 颜色对比度 ≥ 4.5:1 | 使用对比度检查工具 |
| **AA** | 文本可缩放至200% | 使用rem/em单位 |
| **AA** | 焦点可见 | 自定义焦点样式 |
| **AA** | 错误提示清晰 | 表单验证信息明确 |

### 19.2 组件无障碍

| 组件 | 要求 |
|------|------|
| 导航栏 | `role="navigation"`, aria-label |
| Hero视频 | 提供暂停按钮，尊重prefers-reduced-motion |
| 表单 | aria-required, aria-invalid, aria-describedby |
| 模态框 | focus trap, ESC关闭, aria-modal |
| 轮播图 | aria-live区域通知内容变化 |
| 语言切换 | aria-label="Language selector" |

### 19.3 测试工具

- **axe-core**: 自动化无障碍测试
- **Lighthouse**: 内置无障碍审计
- **屏幕阅读器**: NVDA/VoiceOver手动测试

---

## [S20] 浏览器兼容性

### 20.1 支持范围

| 浏览器 | 最低版本 | 优先级 |
|--------|----------|--------|
| Chrome | 90+ | P0 |
| Firefox | 88+ | P0 |
| Safari | 14+ | P0 |
| Edge | 90+ | P0 |
| Samsung Internet | 15+ | P1 |
| Opera | 76+ | P2 |

### 20.2 移动端支持

| 平台 | 最低版本 | 优先级 |
|------|----------|--------|
| iOS Safari | 14+ | P0 |
| Android Chrome | 90+ | P0 |

### 20.3 不支持

- IE 11及更早版本
- 旧版Android浏览器（< 7.0）

---

## [S21] 测试策略

### 21.1 测试金字塔

```
        ┌─────────────┐
        │    E2E      │  少量关键流程
        ├─────────────┤
        │ Integration  │  API和组件集成
        ├─────────────┤
        │   Unit      │  大量单元测试
        └─────────────┘
```

### 21.2 单元测试

| 工具 | 用途 |
|------|------|
| Vitest | 测试运行器 |
| React Testing Library | 组件测试 |

**测试覆盖：**
- 工具函数（日期格式化、验证等）
- UI组件（按钮、表单、卡片等）
- 自定义Hooks（useTypewriter等）

### 21.3 集成测试

| 场景 | 测试内容 |
|------|----------|
| 认证流程 | 注册、登录、登出、OAuth |
| 工单流程 | 创建、查看、更新状态 |
| 表单提交 | 联系表单、工单表单 |
| CMS数据 | Sanity数据获取、多语言 |

### 21.4 E2E测试

| 工具 | 用途 |
|------|------|
| Playwright | 跨浏览器E2E测试 |

**关键流程：**
- 用户注册 → 登录 → 提交工单 → 查看工单
- 语言切换 → 内容正确显示
- 导航 → 页面加载 → 交互

### 21.5 性能测试

| 指标 | 目标 | 工具 |
|------|------|------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Web Vitals |
| CLS | < 0.1 | Lighthouse |
| Bundle Size | < 200KB gzipped | Next.js Analytics |

### 21.6 安全测试

| 测试 | 工具 |
|------|------|
| 依赖漏洞 | npm audit, Snyk |
| OWASP Top 10 | OWASP ZAP |
| 渗透测试 | 手动/专业服务 |

---

## [S22] 开放问题

以下问题待后续确认：

1. **Hero视频素材：** 使用免费库还是自定义录制？
2. **合作伙伴Logo：** 需要收集现有合作伙伴Logo
3. **案例数据：** 需要收集真实客户案例
4. **团队照片：** 需要收集团队成员照片
5. **办公地点地图：** 确认亚洲各办公室具体地址
6. **社交媒体账号：** 确认微信、WhatsApp等账号信息
7. **分析工具：** 是否使用Google Analytics或Umami？
8. **时区处理：** 工单时间显示使用哪个时区？
9. **邮件模板：** acknowledge邮件的具体内容模板？
10. **管理员账号：** 初始超级管理员如何创建？
