# TechGuru PRD - 全局规范（项目概述、技术架构、产品归类、设计规范、免费额度、数据模型、API设计、无障碍、兼容性、测试、开放问题）

> 从 PRD-TechGuru-Website.md 分割
> 原始章节: L1-L52, L53-L170, L171-L206, L452-L526, L609-L620, L638-L719, L720-L810, L811-L844, L845-L871, L872-L936, L937-L952

---

# TechGuru Network & Data Solutions 官网 PRD

**版本：** v1.3  
**日期：** 2026-07-19  
**项目名称：** TechGuru Network and Data Solutions 官方网站  
**域名：** www.techguru-it.asia  
**部署平台：** Vercel

### 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-06-28 | 初始版本 |
| v1.1 | 2026-07-09 | 根据实际实现全面更新：修正设计规范(S9)色彩/字体、更新Hero Section(S5)、工单系统(S6)字段/限制、数据模型(S17)新增字段、API设计(S18)路由修正、开放问题(S22)状态更新 |
| v1.2 | 2026-07-12 | Phase 2完成：Product二级页面(/products/build/run/protect + [slug])、Hero文案重写(Build with AI. Run Beyond VMware. Protect Without Borders.)、Solutions Sanity集成、死代码CSS清理 |  
| v1.3 | 2026-07-19 | Wave 0-4 实现反向同步：S2.5 补 CSRF 双重提交 cookie + rate limit + 文件白名单 + 统一错误响应；S9 补 reset-password 页 + TOC 侧边栏 + 打印样式；S17 补 tickets.idempotency_key + migration 003 RLS policy；S18 补 idempotency_key + 安全机制说明；S22 标记 Wave 0-4 已解决项 + 新增 CSP nonce / coverage 60% 待解决项；M02 补 canonical 要求；M05 补工单详情页 / 幂等键 / 事务安全 / RLS policy |

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
| **邮件服务** | Resend | 通知邮件发送（联系邮箱: Inquiries@techguru-it.asia） |
| **UI框架** | Tailwind CSS | 样式框架（组件全部手写，未使用 shadcn/ui） |
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
| **CSRF攻击** | CSRF Token（双重提交 cookie 模式：`csrf-token` cookie + `x-csrf-token` header，timing-safe 比较）、SameSite Cookie 属性、Referer 验证。实现见 `src/lib/csrf.ts` + `src/middleware.ts` |
| **撞库攻击** | 密码复杂度要求、登录异常检测、邮件通知、IP黑名单 |
| **文件上传漏洞** | 文件类型白名单（11 项 MIME：png/jpeg/webp/gif/pdf/text/plain/zip/xls/xlsx/doc/docx）、文件大小限制（10MB）、文件名 sanitize（剥离路径分隔符）、存储隔离、Signed URL（1h TTL，非公开） |
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

#### 2.5.7 安全机制实现状态（2026-07-19 反向同步）

> 本节描述 Wave 1（W1-1 API 安全加固）实际落地的安全机制，作为 S2.5.1 的实现补充。

| 机制 | 实现 | 文件 |
|------|------|------|
| **CSRF（双重提交 cookie 模式）** | 服务端通过 `csrf-token` cookie（httpOnly=false，SameSite=lax，Secure in prod，1 年有效期）下发随机 32 字节 token；客户端 JS 读取 cookie 后通过 `x-csrf-token` header 回传；服务端用 timing-safe 字节比较验证 cookie 与 header 一致；对 POST/PUT/PATCH/DELETE `/api/*` 强制校验，缺失或不匹配返回 403 | `src/lib/csrf.ts`、`src/middleware.ts` |
| **Rate limit（内存 Map）** | `Map<key, {count, resetAt}>`，默认 10 req/60s/IP；按需收紧：`/api/contact` 5 req/min/IP、`/api/auth/reset-password` 5 req/min/IP；超限返回 429 + `Retry-After` header；懒清理过期 entry + 每分钟机会式清扫；无 Redis 共享状态（Vercel 单实例精确，serverless 按实例独立限流） | `src/lib/rate-limit.ts`、`src/app/api/contact/route.ts`、`src/app/api/auth/reset-password/route.ts` |
| **文件上传白名单** | 11 项 MIME type：`image/png`、`image/jpeg`、`image/webp`、`image/gif`、`application/pdf`、`text/plain`、`application/zip`、`application/vnd.ms-excel`、`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`、`application/msword`、`application/vnd.openxmlformats-officedocument.wordprocessingml.document`；非白名单 → 415 | `src/app/api/upload/route.ts` |
| **文件大小限制** | 10MB（`10 * 1024 * 1024`），超出 → 400 `FILE_TOO_LARGE`；与 S2.5.1 表中 "10MB" 一致（原 PRD 误标 50MB，已修正） | `src/app/api/upload/route.ts` |
| **文件名 sanitize** | `filename.replace(/[\/\\]/g, '_')` 剥离路径分隔符，防目录遍历 | `src/app/api/upload/route.ts` |
| **附件访问控制** | 上传前先校验 `ticketId` 归属权（`tickets.user_id === auth.uid()`），失败 → 403；存储到 Supabase Storage 后用 `createSignedUrl(1h)` 替代 `getPublicUrl`，附件不公开枚举 | `src/app/api/upload/route.ts` |
| **统一错误响应格式** | `{ success: false, error: { code, message } }`；不返回原始 Supabase 错误给客户端；服务端用结构化日志（`{timestamp, path, error: {name, message}, ...context}`），日志中 redact user_id 等 PII | 全部 `/api/*` 路由 |
| **字段长度校验** | `subject ≤ 200`、`description ≤ 800`、`productService ≤ 100`、`comment ≤ 4000`、`idempotency_key ≤ 128` | `src/app/api/tickets/route.ts`、`src/app/api/tickets/[id]/route.ts` |
| **Enum 校验** | `category ∈ {build, run, protect}`、`status ∈ {open, in_progress, resolved, closed}`、`priority ∈ {low, medium, high, critical}` | 同上 |
| **PATCH 字段级角色白名单** | 非管理员仅可改 `description` / 追加 `comment`，不可改 `status`/`priority`/`assigned_to`；管理员可改全部字段；违规 → 403 | `src/app/api/tickets/[id]/route.ts` |
| **路由保护** | `/support/*`（除 `/support/login`、`/support/register`、`/support/reset-password`）未登录 → 302 跳 `/support/login?redirect=...`；已登录访问 `/support/login` / `/support/register` → 跳 `/support` | `src/lib/supabase/middleware.ts`、`src/middleware.ts` |
| **Cookie 选项合并** | supabase 中间件与 intl 中间件的 cookies + headers 完整合并（保留 httpOnly/secure/sameSite/maxAge 选项，修复之前丢失选项的安全 bug） | `src/middleware.ts` |

#### 2.5.8 安全头部配置
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.sanity.io; frame-ancestors 'none'`

---


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


---

## [S9] 设计规范

> **注意**: 本节已根据实际实现更新（2026-07-09）。浅色主题为主，通过 `prefers-color-scheme: dark` 自动适配暗色模式，无手动切换。

### 9.1 色彩方案

#### 浅色模式 (默认)

| 用途 | Token | 颜色 | 说明 |
|------|-------|------|------|
| 主色 | `--color-primary` | `#00D4FF` | 科技蓝，CTA、链接、焦点环、强调 |
| 辅助色 | `--color-accent` | `#7B61FF` | 紫色，产品支柱(Run)、渐变 |
| 成功色 | — | `#22C55E` | 产品支柱(Protect)、表单成功状态 |
| 背景色 | `--color-background` | `#F4F4F5` | 页面背景 |
| 表面色 | `--color-surface` | `#FAFAFA` | 卡片背景 |
| 文字主色 | `--color-foreground` | `#18181B` | 主要文字 |
| 文字次色 | — | `#6B7280` | 副标题、次要文字 |
| 错误色 | — | `#EF4444` | 表单验证错误 |

#### 暗色模式 (`prefers-color-scheme: dark`)

| 用途 | 颜色 | 说明 |
|------|------|------|
| 背景色 | `#09090B` | 替代 `#F4F4F5` |
| 表面色 | `#18181B` | 替代 `#FAFAFA` |
| 文字主色 | `#FAFAFA` | 替代 `#18181B` |
| 文字次色 | `#A1A1AA` | 暗色模式副标题 |
| 卡片边框 | `rgba(255,255,255,0.08)` | 暗色模式微妙边框 |

#### 色彩使用规则

- **主色 `#00D4FF`**: CTA按钮、活跃状态、焦点环、链接悬停、产品支柱图标
- **辅助色 `#7B61FF`**: 产品支柱(Run)、仅用于渐变，不独立使用
- **成功色 `#22C55E`**: 产品支柱(Protect)、表单成功消息
- **禁止用主色做大面积背景** — 它是强调色，不是表面色

### 9.2 字体

| 用途 | 字体 | 备用字体 | CSS变量 |
|------|------|----------|---------|
| 标题 | `HelveticaNowDisplay-Medium` | `Helvetica Neue, Arial, sans-serif` | `var(--font-heading)` |
| 正文 | `HelveticaNowDisplayW01-Rg` | `Inter, sans-serif` | `var(--font-body)` |
| 代码/技术 | `JetBrains Mono` | `monospace` | `var(--font-mono)` |

字体从 `db.onlinewebfonts.com` 加载，`layout.tsx` 中使用 `<link rel="preload">` 预加载。

### 9.3 设计风格

- **克制设计**: 浅色调中性色 + 青色强调，强调色占比 ≤10%
- **玻璃态效果 (Glassmorphism)**：导航栏使用半透明背景+模糊效果 (`.glass-nav`: 85% opacity + blur 16px)
- **微交互**：悬停时 `translateY(-2px)` 升起 + 青色边框光晕
- **渐进增强**：内容无需 JS 即可见，动画通过 `.js-loaded` 类增强
- **无障碍优先**：WCAG 2.1 AA 合规，`prefers-reduced-motion` 禁用所有动画
- **浅色主题为主**，通过 CSS `@media (prefers-color-scheme: dark)` 自动适配暗色模式（无手动切换）
- **品牌个性**: 专业的企业IT，非初创风格、非玩具感

### 9.4 关键页面特效

| 页面 | 特效 | 状态 |
|------|------|------|
| 首页 Hero | 鼠标控制视频进度 + 打字机效果 + 三支柱故事卡片 | ✅ 已实现 |
| 首页 Build/Run/Protect | 三列产品支柱介绍 | ✅ 已实现 |
| VMware替代方案 | 独立页面 + 对比表格 + `alternates.canonical` + `alternates.languages`（W4-2） | ✅ 已实现 |
| 行业解决方案 | Tab切换6个行业 | ✅ 已实现 |
| ~~案例展示~~ | ~~列表+详情页，按行业/产品筛选~~ | **[已废弃]** 2026-07-12 完全删除 |
| 博客 | 列表+详情页，Markdown渲染 | ✅ 已实现 |
| 关于我们 | 公司简介页面；发展历程/团队/资质三板块从 Sanity 读取（W2-5） | ✅ 已实现 |
| 联系我们 | 表单 + Odoo CRM同步 | ✅ 已实现 |
| 工单系统 | 提交+列表+状态管理；工单详情页 `/support/tickets/[id]`（W1-3） | ✅ 已实现 |
| 密码重置页 `/support/reset-password` | 设置新密码表单，调用 `supabase.auth.updateUser({password})`（W1-2） | ✅ 已实现 |
| 隐私政策 / 服务条款 | TOC 侧边栏（桌面）+ 折叠菜单（移动）+ `@media print` 打印样式 + "Print this page" 按钮（W4-4） | ✅ 已实现 |
| 产品列表 `/products` | `alternates.canonical` 标签避免重复内容（W4-2） | ✅ 已实现 |
| 产品子分类页 `/products/{build,run,protect}` | 待补 canonical 标签（W2-2.4 跟踪） | 🔲 待补 |
| 发展历程 | 垂直滚动时间线（左右交替卡片 + 中线圆点），数据源 Sanity `timelineEvent` schema | ✅ 已实现（视觉简化版，原"3D翻转卡片"未实现） |
| 团队介绍 | 圆形头像卡片网格（非 3D 翻转），数据源 Sanity `teamMember` schema | ✅ 已实现（视觉简化版，原"3D翻转卡片"未实现） |
| 公司资质 | 4 列网格 + 图标，数据源 Sanity `qualification` schema | ✅ 已实现（视觉简化版，原"灯箱查看"未实现） |

---


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


---

## [S17] 数据模型

> **注意**: 本节已根据实际实现更新（2026-07-09）。数据库迁移文件位于 `supabase/migrations/`。

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

| 字段 | 类型 | 说明 | 状态 |
|------|------|------|------|
| id | UUID | 主键 | ✅ |
| user_id | UUID | 外键，关联users表 | ✅ |
| ticket_number | VARCHAR(20) | 工单编号，6 字符 base36 + `TG-` 前缀（如 `TG-A3F9K2`），碰撞重试 3 次（W1-3） | ✅ |
| category | ENUM | build / run / protect | ✅ |
| product_service | VARCHAR(100) | 具体产品/服务 | ✅ |
| subject | VARCHAR(200) | 工单主题 | ✅ |
| description | TEXT | 问题描述 | ✅ |
| occurred_at | TIMESTAMP | 问题发生时间（用户报告） | ✅ 迁移002已添加 |
| status | ENUM | open / in_progress / resolved / closed | ✅ |
| priority | ENUM | low / medium / high / critical | ✅ |
| assigned_to | UUID | 外键，分配给的管理员 | ✅ |
| idempotency_key | TEXT | 幂等键，前端生成 UUID v4，跨重试稳定，成功后重置；UNIQUE 部分索引（NULL 允许重复，见 migration 003）；上限 128 字符 | ✅ 迁移003已添加（W1-3） |
| version | INTEGER | 乐观锁版本号，每次 PATCH +1，PATCH 时校验 `eq('version', currentVersion)` 防并发覆盖 | ✅ |
| created_at | TIMESTAMP | 创建时间 | ✅ |
| updated_at | TIMESTAMP | 更新时间 | ✅ |
| resolved_at | TIMESTAMP | 解决时间 | ✅ |
| deleted_at | TIMESTAMP | 软删除时间戳（NULL = 未删除，所有查询过滤 `is('deleted_at', null)`） | ✅ |

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

### 17.5.1 工单审计日志表 (ticket_audit_log)

> W1-3 引入。记录工单所有状态变更的审计追踪（who/when/what），见 AGENTS.md #17。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| ticket_id | UUID | 外键，关联 tickets 表 |
| action | VARCHAR(50) | 动作类型：`created` / `status_changed` / `priority_changed` / `assigned` / `description_updated` |
| old_value | TEXT | 变更前值（JSON 字符串，可为 NULL） |
| new_value | TEXT | 变更后值（JSON 字符串） |
| performed_by | UUID | 外键，执行变更的用户 |
| created_at | TIMESTAMP | 变更时间 |

### 17.6 数据库迁移文件

| 文件 | 内容 |
|------|------|
| `supabase/migrations/001_initial_schema.sql` | 初始表结构（users, tickets, ticket_attachments, ticket_comments, contact_submissions） |
| `supabase/migrations/002_add_occurred_at.sql` | tickets 表新增 `occurred_at` TIMESTAMP 字段 |
| `supabase/migrations/003_add_idempotency_key.sql` | tickets 表加 `idempotency_key TEXT` + UNIQUE 部分索引（`WHERE idempotency_key IS NOT NULL`）；为 `ticket_audit_log` / `ticket_attachments` / `ticket_comments` 补 INSERT RLS policy；为 `ticket_comments` / `ticket_attachments` 补管理员 SELECT policy；为 tickets 表补 "管理员可创建工单" INSERT policy（W1-3） |

> **注意**：migration 003 文件已创建但**未自动执行**。需手动运行 `supabase db push` 部署。代码层已做向后兼容处理：若 `idempotency_key` 字段不存在（PostgreSQL `42703` 错误），API 会降级为非幂等插入而不是失败。建议在生产环境尽快应用此迁移以启用完整幂等保护。

### 17.7 RLS Policy 说明（migration 003）

> W1-3 之前 `ticket_audit_log` / `ticket_attachments` / `ticket_comments` 三表**仅依赖默认 SELECT policy**，缺少 INSERT policy，导致 customer 角色无法插入自己工单的审计日志 / 附件 / 评论。migration 003 补全这些 policy。

| 表 | 操作 | Policy | 说明 |
|----|------|--------|------|
| `tickets` | INSERT | "Admins can create tickets" | 管理员可代客户创建工单 |
| `tickets` | INSERT | （已存在）"Customers can create own tickets" | 客户只能 `user_id = auth.uid()` |
| `tickets` | SELECT | （已存在）"Customers can view own tickets" | 客户只能看自己的工单 |
| `ticket_audit_log` | INSERT | "Admins can insert audit log" | 管理员可插入任意审计日志 |
| `ticket_audit_log` | INSERT | "Users can insert audit log for own tickets" | 客户只能为自己的工单插入审计日志 |
| `ticket_attachments` | INSERT | "Admins can insert attachments for any ticket" | 管理员可为任意工单添加附件 |
| `ticket_attachments` | INSERT | "Users can insert attachments for own tickets" | 客户只能为自己的工单添加附件 |
| `ticket_attachments` | SELECT | "Admins can view all attachments" | 管理员可查看所有附件 |
| `ticket_comments` | INSERT | "Admins can insert comments for any ticket" | 管理员可为任意工单添加评论 |
| `ticket_comments` | INSERT | "Users can insert comments for own tickets" | 客户只能为自己的工单添加评论 |
| `ticket_comments` | SELECT | "Admins can view all ticket comments" | 管理员可查看所有评论（含 internal） |
| `ticket_comments` | SELECT | （已存在）"Customers can view non-internal comments on own tickets" | 客户只能看自己工单的非内部评论 |

> **重要**：所有 policy 均要求 `users.deleted_at IS NULL`（软删除用户无权限）。`tickets.deleted_at IS NULL` 同样在所有外键校验中检查，防止为已删除工单追加记录。

---


---

## [S18] API设计

> **注意**: 本节已根据实际实现更新（2026-07-09）。认证由 Supabase Auth 直连处理，无自建 API 中间层。

### 18.1 认证接口

认证由 Supabase Auth 直连处理，前端通过 `@supabase/ssr` 客户端直接调用 Supabase。以下 API 路由仅处理回调和密码重置：

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/auth/callback` | OAuth 回调处理（Gmail 登录后重定向） | ✅ 已实现 |
| POST | `/api/auth/reset-password` | 密码重置请求 | ✅ 已实现 |

**Supabase Auth 直连操作（无自建API）：**

| 操作 | Supabase 方法 | 说明 |
|------|--------------|------|
| 邮箱注册 | `supabase.auth.signUp()` | 前端直连 |
| 邮箱登录 | `supabase.auth.signInWithPassword()` | 前端直连 |
| OAuth登录 | `supabase.auth.signInWithOAuth()` | 前端直连 |
| 登出 | `supabase.auth.signOut()` | 前端直连 |

### 18.2 工单接口

| 方法 | 路径 | 权限 | 说明 | 状态 |
|------|------|------|------|------|
| GET | `/api/tickets` | customer | 获取我的工单列表 | ✅ |
| POST | `/api/tickets` | customer | 创建工单（支持 `idempotency_key` 幂等重试，6 字符 base36 工单号碰撞重试 3 次，事务：insert ticket → insert audit_log → send email；email 失败不回滚工单） | ✅ |
| GET | `/api/tickets/[id]` | customer/admin | 获取工单详情（含 attachments + comments；customer 仅可见 `is_internal=false` 评论；admin 可见全部） | ✅ |
| PATCH | `/api/tickets/[id]` | customer/admin | 更新工单：乐观锁 `version` 字段；字段级角色白名单（非 admin 仅可改 `description`/追加 `comment`）；状态变更触发审计日志 + 邮件通知 | ✅ |
| POST | `/api/tickets/[id]` | admin | 指派工单（向后兼容接口；新代码应优先用 PATCH `assignedTo`） | ✅ |
| GET | `/api/tickets/stats` | admin | 获取统计报表 | ✅ |

**idempotency_key 字段说明（W1-3 新增）：**

- 前端 `TicketForm.tsx` 在首次提交时生成 UUID v4 作为 `idempotency_key`，作为 `<input type="hidden">` 隐藏字段；
- 网络重试 / 用户重复点击时复用同一 key（不重新生成）；
- 后端收到 `idempotency_key` 后先查询是否已有同 key 工单：
  - 命中 → 返回原工单（响应体加 `idempotent_replay: true` 标记）；
  - 未命中 → 正常创建，UNIQUE 索引保证并发场景下只有一条插入成功（其他失败者降级为 replay 查询）；
- 提交成功后前端重置 key，确保下一次"提交新工单"操作生成新 key；
- key 上限 128 字符，前端校验 + 后端 `validateCreatePayload` 二次校验；
- 字段缺失时（旧客户端 / migration 003 未应用）API 自动降级为非幂等模式（向后兼容）。

### 18.3 文件上传接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload` | 上传附件（最大 **10MB**，11 项 MIME 白名单，见 S2.5.7；先校验 ticket ownership 再上传 Storage；返回 1h TTL Signed URL，非公开） |

### 18.4 联系表单接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/contact` | 提交联系表单 + 非阻塞同步 Odoo（`odoo_synced` 回写）；rate limit 5 req/min/IP（W1-1） |

### 18.5 产品接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/products` | 从 Sanity 获取产品列表（工单表单产品下拉用） |

### 18.6 ISR 重新验证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/revalidate` | Sanity Webhook 触发的 ISR 重新验证 |

### 18.7 API响应格式

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

### 18.8 已实现的 API 路由完整清单

| 路由文件 | 方法 | 用途 |
|----------|------|------|
| `src/app/api/auth/callback/route.ts` | GET | OAuth 回调 |
| `src/app/api/auth/reset-password/route.ts` | POST | 密码重置请求；rate limit 5 req/min/IP（W1-1） |
| `src/app/api/contact/route.ts` | POST | 联系表单提交；rate limit 5 req/min/IP（W1-1） |
| `src/app/api/products/route.ts` | GET | Sanity 产品列表 |
| `src/app/api/revalidate/route.ts` | POST | ISR 重新验证 |
| `src/app/api/tickets/route.ts` | GET/POST | 工单列表 / 创建（含 `idempotency_key` 幂等，W1-3） |
| `src/app/api/tickets/stats/route.ts` | GET | 工单统计 |
| `src/app/api/tickets/[id]/route.ts` | GET/PATCH/POST | 工单详情 / 更新（乐观锁 `version`，W1-3）/ 指派 |
| `src/app/api/upload/route.ts` | POST | 文件上传（10MB + 11 项 MIME 白名单 + Signed URL，W1-1） |

### 18.9 API 安全机制（W1-1 反向同步）

> 本节汇总 Wave 1 W1-1 落地的 API 层安全机制。详细实现见 S2.5.7。

| 机制 | 适用范围 | 配置 |
|------|---------|------|
| **CSRF（双重提交 cookie 模式）** | 全部 POST/PUT/PATCH/DELETE `/api/*` 请求 | `csrf-token` cookie + `x-csrf-token` header，timing-safe 比较；缺失或不匹配 → 403 `{ code: 'CSRF_INVALID' }` |
| **Rate limit（内存 Map）** | `/api/contact`、`/api/auth/reset-password` | 5 req/min/IP，超限 → 429 + `Retry-After` header |
| **Rate limit（默认）** | 其他 `/api/*` 路由（如未来扩展） | 10 req/min/IP（`rateLimit(key)` 默认参数） |
| **文件上传白名单** | `/api/upload` | 11 项 MIME type（详见 S2.5.7）；非白名单 → 415；超 10MB → 400 `FILE_TOO_LARGE` |
| **统一错误响应** | 全部 `/api/*` 路由 | `{ success: false, error: { code, message } }`；不暴露原始 Supabase 错误；服务端结构化日志 + PII redact |
| **字段长度校验** | `/api/tickets` POST/PATCH | `subject ≤ 200`、`description ≤ 800`、`productService ≤ 100`、`comment ≤ 4000`、`idempotency_key ≤ 128` |
| **Enum 校验** | `/api/tickets` POST/PATCH | `category ∈ {build, run, protect}`、`status ∈ {open, in_progress, resolved, closed}`、`priority ∈ {low, medium, high, critical}` |
| **PATCH 字段级角色白名单** | `/api/tickets/[id]` PATCH | customer 仅可改 `description` / 追加 `comment`；admin 可改全部业务字段；违规 → 403 |
| **乐观锁** | `/api/tickets/[id]` PATCH | `version` 字段，PATCH 时 `eq('version', currentVersion)`；冲突 → 409 `version_conflict` |
| **Idempotency** | `/api/tickets` POST | `idempotency_key` UNIQUE 部分索引；同 key 重复提交返回原工单 + `idempotent_replay: true` 标记 |
| **事务补偿** | `/api/tickets` POST | insert ticket → insert audit_log → send email；email 失败不回滚工单（best-effort）；audit_log 失败不回滚工单（best-effort） |
| **附件访问控制** | `/api/upload` | 先校验 `ticketId` 归属权（`tickets.user_id === auth.uid()`），失败 → 403；返回 Signed URL（1h TTL），不公开 |
| **路由保护** | `/support/*` | 中间件层；未登录访问受保护路由 → 302 跳 `/support/login?redirect=...` |

---


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


---

## [S22] 开放问题

> **更新日期**: 2026-07-19（Wave 5-2 反向同步）

| # | 问题 | 状态 | 说明 |
|---|------|------|------|
| 1 | Hero视频素材 | ✅ 已解决 | 使用 CloudFront CDN 托管的 MP4 视频 |
| 2 | 合作伙伴Logo | ✅ 已解决 | 21 个 SVG/PNG 文件已收集在 `public/logos/`（Alibaba Cloud, Arcfra, ByteDance, Cisco, Dell, Fortinet, H3C, Hillstone, HP, Huawei, KVM, Lenovo, Nutanix, Proxmox, Ruijie, Sangfor, Sophos, StarWind, Veeam） |
| 3 | ~~案例数据~~ | **[已废弃 - 2026-07-12 完全删除]** | ~~匿名化+重构为"典型应用场景"~~ → 2026-07-12 Case Studies 完全删除（W0-3） |
| 4 | 团队照片 | ✅ 已解决（W2-5） | About 页团队/资质/时间线三板块迁移到 Sanity（`teamMember` / `qualification` / `timelineEvent` schema）；用户暂不想透露真名 → 用 fallback 头像 + i18n 默认姓名；Sanity 数据上传后无需重新部署即可更新 |
| 5 | 办公地点 | ✅ 已确认 | 10 Rajah Matanda St, corner JP Rizal St, Project 4, Quezon City, 1109 Metro Manila |
| 6 | 社交媒体账号 | ✅ 已解决（W4-5） | LinkedIn + WhatsApp 已配置；`OrganizationJsonLd.sameAs` 已填 `[LinkedIn_URL, WhatsApp_URL]`；具体链接集中到 `src/lib/config.ts`（`SUPPORT_EMAIL` / `CONTACT_PHONE` / `WHATSAPP_URL` / `LINKEDIN_URL`，W4-4.2） |
| 7 | 分析工具 | ✅ 已部署 | Umami(免费开源、2KB script、零维护、天然GDPR合规)，Website ID已配置并部署 |
| 8 | 工单时区 | ✅ 已解决（W1-3.6） | API 层存储 ISO 8601 字符串（含时区）；前端 `TicketList.tsx` 用 `Intl.DateTimeFormat` 按用户 locale 格式化；移除原硬编码 "PHT" 后缀 |
| 9 | 邮件模板 | ✅ 已完成 | 4套：确认/状态/密码/回复通知，FROM: support@techguru-it.asia |
| 10 | 管理员账号 | ✅ 已解决 | 通过网站/register页面创建Supabase Auth账号即可 |
| 11 | CSRF 防护方案 | ✅ 已解决（W1-1） | 双重提交 cookie 模式（`csrf-token` cookie + `x-csrf-token` header，timing-safe 比较）；对 POST/PUT/PATCH/DELETE `/api/*` 强制校验；实现见 `src/lib/csrf.ts` + `src/middleware.ts` |
| 12 | API rate limit 方案 | ✅ 已解决（W1-1） | 内存 Map 实现，默认 10 req/min/IP；contact/reset-password 收紧到 5 req/min/IP；超限返回 429 + `Retry-After`；接受 serverless 单实例限制（无 Redis 共享状态）；实现见 `src/lib/rate-limit.ts` |
| 13 | 文件上传白名单 | ✅ 已解决（W1-1） | 11 项 MIME type 白名单（png/jpeg/webp/gif/pdf/text/plain/zip/xls/xlsx/doc/docx）；10MB 上限；Signed URL 1h TTL；文件名 sanitize；详见 S2.5.7 |
| 14 | 工单幂等键 | ✅ 已解决（W1-3） | `tickets.idempotency_key` TEXT + UNIQUE 部分索引（migration 003）；前端生成 UUID v4，跨重试稳定；UNIQUE 索引保证并发安全；详见 S17.2 + S18.2 |
| 15 | RLS INSERT policy 缺失 | ✅ 已解决（W1-3） | migration 003 为 `ticket_audit_log` / `ticket_attachments` / `ticket_comments` 补 INSERT policy；详见 S17.7 |
| 16 | 工单详情页 | ✅ 已解决（W1-3） | `/support/tickets/[id]` 已实现；含 attachments + comments + admin 状态变更 UI；详见 M05-Tickets.md 6.8 |
| 17 | 密码重置完整流程 | ✅ 已解决（W1-2） | `/support/reset-password` 页面 + 中间件路由保护 + LoginForm `redirectTo` 修正；详见 M05-Tickets.md 6.2 |
| 18 | Canonical 标签 | 🟡 部分解决（W4-2） | `/products` 和 `/vmware-alternative` 已加 `alternates.canonical` + `alternates.languages`；`/products/{build,run,protect}` 子分类页待补（W2-2.4 跟踪） |
| 19 | CSP nonce 方案 | 🔲 待解决（W4-7.2） | 当前 CSP 仍用 `'unsafe-inline'`（style-src）；`next.config.ts` 已留 TODO，需实现 per-request nonce 生成中间件替代 `'unsafe-inline'`；属于 Wave 4 延后项 |
| 20 | 测试覆盖率 60% 目标 | 🔲 待解决（W3-1.5） | 当前 baseline（2026-07-19）：statements 37.89% / branches 29.59% / functions 32.50% / lines 38.04%；`vitest.config.ts` 已设 pragmatic floor（35/25/30/35）防止回归；提升到 PRD [S21] 目标 60% 需补 HeroSection / MegaMenu / Navbar / Footer / CompareTable / TicketDetailClient / server-component pages / lib/odoo / lib/resend 等测试 |
| 21 | 产品子分类页 canonical | 🔲 待解决（W2-2.4） | `/products/{build,run,protect}` 三个子分类页未加 `alternates.canonical`，可能与 `/products#build`（Tab 锚点）形成重复内容；待 W2-2.4 决策路由策略后补 |
| 22 | `vercel.json` 镜像源 | 🔲 待解决（W4-7.3） | `vercel.json` 仍引用 `npmmirror.com` 镜像源；需移除或改用 `regions: ["hkg1"]` 配合中国镜像 |
| 23 | tsconfig 严格选项 | 🔲 待解决（W4-7.4） | `tsconfig.json` 待补 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`、`forceConsistentCasingInFileNames` |
| 24 | ESLint 安全规则插件 | 🔲 待解决（W4-7.5） | `eslint.config.mjs` 待补 `eslint-plugin-jsx-a11y`、`eslint-plugin-security` |
| 25 | Sanity Studio visionTool | 🔲 待解决（W4-7.6） | `sanity.config.ts` 待加 `visionTool` 插件便于 GROQ 调试 |

---