# TGWS 工程区系统性评估报告

> 评估对象：`D:\软件集\Vibe Coding\Mimo Space\TGWS`（可部署单元为 `tgws/`）
> 评估日期：2026-11-15
> 评估方式：静态通读全部源码/配置/Schema/脚本 + 本轮实跑（TypeScript / ESLint / Vitest / Next build）+ Sanity 生产数据集只读查询 + 历史报告交叉核对
> 基线版本：Git `Trunk`，工作区 HEAD `4e5895c`

---

## 0. 阅读范围、方法与口径声明

### 0.1 实际读了什么

| 层 | 范围 | 规模 |
|----|------|------|
| 应用源码 | `tgws/src/` 全部 ts/tsx/css/json | 193 文件（app 88 / components 60 / lib 28 / hooks 8 / i18n 2 / messages 2 / test 4），约 13.8k 行 TSX |
| 数据模型 | `tgws/supabase/migrations/001–003` | 8 张表 + RLS + 索引 |
| CMS Schema | `tgws/sanity/schemas/` | 9 个 document 类型 |
| 配置 | `next.config.ts`、`vercel.json`、`middleware.ts`、`sanity.config.ts`、`vitest/playwright` | 全读 |
| 内容 | `src/messages/en.json` / `zh.json` | 896 键 × 2 语言 |
| 线上内容库 | Sanity `r6ztl1oq/production` | 只读 GROQ 统计（post 77 / product 28 / solution 17 / faq 0 / partner 0 / team 3 / timeline 6 / qualification 4 / tco 1） |
| 历史文档 | PRD v1.2、AGENTS.md、TODO.md、ACCEPTANCE/TEST/AUDIT/PROJECT-REVIEW、`docs/modules/*`、`docs/eval/*` | 全读或按章读 |
| 视觉证据 | `dark-mode-verify/`、`audit-screenshots/`、`design-v2/shots/` | 抽查 5 张关键页 |

### 0.2 完成度口径（重要）

本报告的百分比是**评估值**，不是项目官方口径，也不替代验收结论。为避免"把写完当成做完"，每个模块拆三轴分别打分：

| 轴 | 含义 | 判定依据 |
|----|------|----------|
| **A 代码实现** | PRD 条目在代码里是否有对应实现（含异常分支） | 源码可证 |
| **B 内容/数据就绪** | CMS/i18n 里是否有真实可发布内容，而非占位/空字段 | 线上数据集实查 |
| **C 端到端可用** | 真实用户能否完成该目的（含权限、数据链路、界面入口） | 代码+数据推演，标注待验证项 |

综合值 = A×0.4 + B×0.3 + C×0.3（仅用于排序，不用于对外宣称）。

### 0.3 本轮实测结果（不是引用历史报告）

| 检查 | 命令 | 结果 |
|------|------|------|
| 类型检查 | `npx tsc --noEmit` | **通过，0 错误** |
| 生产构建 | `npm run build` | **通过**，58 个静态页，编译 17.2s |
| 单元/组件测试 | `npm run test:run` | **402 例：388 通过 / 14 失败 / 5 个文件失败** |
| ESLint | `npx eslint .` | **2 errors / 68 warnings** |
| 渲染模式 | 构建产物路由表 | **23 条 `[locale]` 路由全部为 `ƒ Dynamic`，0 条静态/ISR** |

四项里两项绿灯、两项红灯。**"能构建"不等于"能上线运营"**，后面的模块分析按这个前提展开。

---

## 1. 项目背景与原始需求还原

### 1.1 业务实体

TechGuru Network & Data Solutions Inc.（泰谷网数科技），面向东南亚（菲律宾为落地重心）的企业 IT 集成商/代理商。品牌主张三词：**Build. Run. Protect.** 官网 `www.techguru-it.asia`，Vercel 部署，EN + 繁体中文双语。

### 1.2 原始需求（PRD v1.2，S1–S22）

六条核心目标，按代码实际承担的角色重排：

1. 营销获客门户（品牌、产品、行业方案、博客）
2. 售后工单门户（注册/登录 → 建单 → 跟踪 → 管理员处置）
3. 表单线索沉淀（联系表单 + Odoo CRM 同步）
4. SEO/GEO 优化（metadata、JSON-LD、sitemap、hreflang）
5. CMS 可运营（Sanity 实时生效）
6. 安全与合规（CSP、RLS、限流、WCAG 2.1 AA、GDPR）

### 1.3 实际范围比 PRD 多出来的部分

PRD 没有写、但代码已经实现的模块（说明项目是按"边做边扩"演进的，不是严格按 PRD 交付）：

| 模块 | 规模 | 与 PRD 关系 |
|------|------|-------------|
| 全局 AI 搜索（站内 + Google CSE + Tavily + Gemini + 能力缺口检测 + 线索表单） | 4 个 lib + 2 个 API + 4 个组件 | PRD 未提；是最大增量 |
| TCO 计算器（3 场景 × 3 厂商 × 逐年累计 + PNG 导出） | `lib/tco.ts` + 3 组件 | PRD S16 只提"TCO 分析"，未要求工具 |
| `/compare` 公司级对比页 | 1 页 + i18n 65 键 | PRD 有，但定位从"产品对比"变成"公司对比" |
| `/profile` 账户页 | 1 页 | PRD S17 有 users 表，无页面要求 |
| 管理员仪表板 | 1 页 + stats API | PRD S6.5 有要求，但只做了只读统计 |
| `leads` 表 + 搜索线索 | 迁移 003 + API + 邮件 ×4 | PRD 未提 |

**结论：需求基线已漂移。** PRD v1.2 停在 2026-07-12，此后新增的搜索/TCO/leads/profile 都没有回写 PRD。现在拿 PRD 当"唯一真源"评审，会同时漏掉增量和放过缺口。

### 1.4 设计思路（架构意图 vs 落地）

| 设计意图 | 落地情况 | 判定 |
|----------|----------|------|
| CMS（Sanity，读）与业务库（Supabase，写）彻底分离 | 做到了。无跨库事务，内容与交易数据物理隔离 | ✅ 成立 |
| ISR + Webhook 实时生效（PRD S8.2） | **未成立**：所有 `[locale]` 路由动态渲染，`revalidate=3600` 与 `/api/revalidate` 对页面无实际作用 | ❌ 落空 |
| 降级优先（外部依赖失败不阻断主流程） | 做到了：Odoo/Resend/CSE/Tavily/Gemini 全部有失败路径 | ✅ 成立 |
| 组件全手写（禁 shadcn/ui） | 做到了，统一 `lucide-react` 图标 | ✅ 成立 |
| 双语对等（EN/繁中） | 键 100% 对齐，但正文内容严重不对等（见 §6） | ⚠️ 半成立 |
| 渐进增强（无 JS 内容可见） | 半成立：CSS 默认可见，但 `js-loaded` 在 `<head>` 同步加上后所有 `.scroll-reveal` 立即透明，依赖 IO 才恢复 | ⚠️ 有风险 |

---

## 2. 技术架构与模块构成

### 2.1 运行时拓扑

```
浏览器
  │ HTTPS
  ▼
Vercel Edge ── middleware.ts ──┬─ next-intl 重写（/ → /en，always 前缀，关自动检测）
                              └─ Supabase 会话刷新（写回 cookie）
  │
  ▼
Next.js 16.2.9 App Router（React 19.2.4）
  ├─ 23 条 [locale] 页面路由（全部 Dynamic）
  ├─ 12 条 API Route（Node runtime）
  └─ 1 个 Sanity Studio 配置（同仓，独立部署）
  │
  ├──▶ Sanity（内容，只读，CDN）
  ├──▶ Supabase（Postgres + Auth + Storage，写主库，全表 RLS）
  ├──▶ Resend（4 类事务邮件）
  ├──▶ Odoo（XML-RPC / call_kw，未配置凭证）
  └──▶ Google CSE / Tavily / Gemini 2.0 Flash（搜索，可降级）
```

### 2.2 分层与目录

```
src/
├── app/            路由层：23 page + 12 API + 根布局/错误边界/SEO 产出
├── components/     展示层：layout(3) / hero(1) / auth(2) / tickets(4) / ui(22)
├── hooks/          状态与副作用：useAutoSave / useOfflineCache / useOptimistic / useRetry
├── lib/            领域层：sanity / supabase / tco / search(5) / odoo / resend / api-guard / auth-guard / errors
├── i18n/           路由与消息解析
├── messages/       en.json 85KB / zh.json 77KB
└── test/           setup + 集成/性能/Sanity 数据测试
```

依赖方向干净：`app → components/hooks/lib`，`lib` 不反向依赖 `app`/`components`。这一点做得比多数同类项目好。

### 2.3 模块清单与三轴完成度

> 编号沿用项目自己的 M01–M11；M12 之后是本报告补充的横切模块。

| 模块 | 核心职责 | A 代码 | B 内容 | C 可用 | 综合 |
|------|----------|:------:|:------:|:------:|:----:|
| M01 Home | 品牌首屏、三支柱、AI Journey、伙伴墙、CTA | 88% | 85% | 85% | **86%** |
| M02 Products | 28 产品、三支柱分类、详情、搜索 | 85% | 72% | 78% | **79%** |
| M03 Blog | 77 篇文章、分类、详情、分享 | 85% | 40% | 55% | **62%** |
| M04 Solutions | 6 行业方案展示 | 80% | 40% | 50% | **58%** |
| M05 Tickets | 建单、列表、附件、状态、审计 | 75% | 60% | 45% | **61%** |
| M06 Contact | 表单、地图、二维码、CRM | 85% | 85% | 70% | **81%** |
| M07 About | 简介、团队、资质、时间轴 | 85% | 75% | 80% | **80%** |
| M08 Compare | 7 维对比 + 客户证言 | 90% | 70% | 85% | **82%** |
| M09 VMware Alt | 替代方案 + 迁移 + TCO | 85% | 75% | 80% | **80%** |
| M10 Help | 20 条 FAQ、分类、本地搜索 | 85% | 75% | 80% | **80%** |
| M11 Legal | 隐私政策 / 服务条款 | 90% | 75% | 85% | **84%** |
| M12 全局搜索 | 站内 + 站外 + AI 摘要 + 缺口线索 | 80% | 60% | 65% | **69%** |
| M13 认证/账户 | 注册、登录、OAuth、重置、资料 | 85% | 70% | 65% | **74%** |
| M14 管理后台 | 工单统计与处置 | 50% | 50% | 35% | **45%** |
| M15 基础设施 | 布局、i18n、SEO、安全头、错误边界 | 92% | — | 80% | **87%** |
| M16 设计系统 | 色彩、字体、组件类、暗色 | 85% | — | 75% | **80%** |
| M17 测试/工程化 | 单测、E2E、Lint、构建 | 70% | — | 60% | **66%** |

**读法：A 高 B/C 低，说明"代码写完了但没内容/没打通"。M03、M04、M05、M14 都是这个形态。**

---

## 3. 逐模块评估

### M01 Home（综合 86%）

**职责**：首屏品牌叙事（视频擦洗 + 打字机）、Build/Run/Protect 三支柱 Bento 卡、AI Journey、VMware 专题、社交证明、伙伴 Logo 双行跑马灯、CTA、Footer。

**已实现且质量在线**
- 视频随鼠标擦洗（`fastSeek` + rAF 节流 + `seeked` 锁），品牌记忆点强。
- 双行反向 Logo 跑马灯，hover 暂停，两侧渐变遮罩，视觉完成度高。
- Bento 网格（Build 大卡 + 两小卡）刻意打破"三列等宽"的模板感。
- 社交证明数字与真实数据一致：28 产品 / 19 伙伴 / 6 行业（已与 Sanity 和 `public/logos/` 核对）。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | 19 家伙伴 Logo 硬编码在组件里，`partner` schema 与 revalidate 映射形同虚设，且 CMS 中 partner 文档 = 0 | `home/page.tsx:124-144`；Sanity `count(partner)=0` |
| P1 | 中英文三元硬编码（"技術合作夥伴"），未走 i18n | `home/page.tsx:54` |
| P1 | 图片 alt 硬编码英文（"Build AI workloads"），中文页无障碍描述语言错误 | `home/page.tsx:171` |
| P2 | 首页/`/home` 双入口，canonical 只指 `/{locale}`，但 404 页"回首页"指向 `/{locale}/home` | `not-found.tsx:24` |
| P2 | 首屏依赖客户端 JS（`'use client'`），视频 `preload="auto"` 体积不可控 | `home/page.tsx:1` |
| P2 | "12+ Years of Industry Experience" 与 2020 成立并存，需口径说明（行业经验 vs 公司司龄） | `en.json home.socialProofStat4` |

---

### M02 Products（综合 79%，2026-11-15 线上复核修正）

**职责**：三支柱产品列表（28 条）、8 个 Run 子类分组、产品详情、客户端搜索与筛选、VMware 专题卡。

**已实现**
- 28 个产品全部有 `features` 与 `relatedVendors`，分类/子类齐全。
- `ProductIcon` 按 slug 给语义图标（28 个），Run 页按子类分组并插入 VMware 卡。
- 详情页有 JSON-LD、面包屑、相关产品。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P2 | **产品视觉双源**：Sanity `product.image` 0/28 为空，但 `ProductDetail` 用本地 `productImages` 映射提供 28 张 Hero 图（线上抽查 4/4 有图）。不是"无图"，是两套来源无守护 | Sanity `withImg=0/28`；`shared.tsx:90-119`；线上 `/en/products/*` |
| P1 | 文案双源：`CategoryPage` 优先 i18n `features.{slug}`，CMS `features` 同时存在，二者会漂移 | `shared.tsx` 注释已警告历史 desync |
| P2 | 产品列表无分页/虚拟化，28 卡一次渲染（配合 `framer-motion` 每卡一个 motion 节点） | `ProductsList.tsx` |
| P2 | `ProductsList.tsx:50` 在 effect 内同步 setState，ESLint 报 error，会引发级联渲染 | `npx eslint` 实测 |
| P2 | "产品对比"未实现（PRD S4 要求产品级对比；现有 `/compare` 是公司级） | 路由清单 |

---

### M03 Blog（综合 62%，内容是最短板）

**职责**：文章列表 + 分类筛选 + 搜索 + 详情（Portable Text）+ 分享 + SEO。

**已实现**
- 77 篇文章，封面 77/77，`excerptZh` 77/77，slug 无重复。
- 详情页 coverImage 三态兼容（对象 / URL 字符串 / 缺失），分享按钮已接。
- 英文正文质量可读（中位 8,905 字符），结构与 `WRITING-GUIDELINES.md` 基本一致。

**差距（按严重度）**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| **P0** | **中文正文几乎是空壳**：72 篇有正文的文章里，63 篇 `contentZh` 长度 < 英文的 10%，中位比 **6.8%**；且回退逻辑为 `contentZh \|\| content`，只要字段存在（哪怕 300 字）就不会回退英文 | Sanity GROQ 统计；`BlogDetail.tsx:222` |
| P0 | 中文正文是"电报体摘要"而非翻译（"每年都有人宣佈私有雲已死。但每年企業繼續建構。某些工作負載無法遷移到公有雲。"），违反自家写作规范 | 抽样正文 |
| P1 | 5 篇 `content` 为空（列表可见、详情空白） | Sanity `content empty=5` |
| P1 | 分类全部为 `technical`，`news`/`industry`/`case-study` 三类为 0；导航里"行业/技术"分类筛选等于无效 | Sanity `cats={technical:77}` |
| P1 | 内容停更：最新 `publishedAt` 为 2025-05-03，距评估日约 18 个月 | Sanity |
| P2 | 列表无分页/加载更多，77 篇一次输出 | `blog/page.tsx:29` |

---

### M04 Solutions（综合 58%）

**职责**：6 行业方案（医疗/金融/零售/物流/教育/政府），痛点 → 方案 → 推荐产品 → 指标。

**已实现**
- 6 行业 Tab、搜索、架构 SVG、CTA 完整；GROQ 已补齐 Zh 字段（T-044 已修）。
- i18n 文案（`solutions` 47 键 / 6,618 字符）本身写得完整、有行业纵深。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| **P0** | **17 条 solution 文档只有 6 条可达**：`solutions.find(s => s.industry === key)` 只取第一条，其余 11 条永久不渲染（finance 4 条、education 3 条等） | `SolutionsList.tsx:86` |
| **P0** | **CMS 中文痛点/方案全空**：`challengesZh`/`solutionsZh` 0/17，所谓"CMS 可运营"对解决方案不成立 | Sanity |
| P1 | 文档 `title` 字段存的是繁体中文（schema 无 `titleZh`），数据模型语义倒置；EN 页靠 i18n 兜底才没串台 | Sanity 抽样 + `solution.ts` |
| P1 | 17 条 solution 图片 0 条；制造业（manufacturing）不在 6 行业 UI 中，属孤儿数据 | Sanity |
| P2 | "案例/成果"未实现（PRD S10.2 要求成功案例，S11 已废弃但方案页仍缺证据段） | 页面结构 |

---

### M05 Tickets（综合 61%，售后闭环是第二大短板）

**职责**：登录后建单（分类/产品/发生时间/主题/800 字描述/粘贴截图/附件）、我的工单、状态、管理员统计与批量操作。

**已实现且做得扎实的部分**
- 建单：同源校验 + 10/min 限流 + 字段校验 + `randomUUID` 单号 + 审计 `created` + 确认邮件（失败不阻断）。
- 上传：50MB、MIME 白名单（排除 SVG）、文件名净化、DB 失败回滚 Storage 对象。
- 更新：乐观锁 `version` + 审计 + 状态邮件；批量更新 ≤100 条并逐条审计。
- 草稿：`useAutoSave` 30s + 版本号 + 恢复/丢弃。

**差距（阻断级）**
| 优先级 | 问题 | 证据 | 影响 |
|--------|------|------|------|
| **P0** | **注册用户可能无法建单**：`tickets.user_id REFERENCES users(id)`，但全仓无 `handle_new_user` 触发器、无 `INSERT INTO users`；Supabase Auth 注册只写 `auth.users` | `001:5,21`；全库 grep 无触发器 | 新用户首单撞外键 → 500。**需线上库验证是否已手工补触发器** |
| **P0** | **管理员看不到别人的工单**：`GET /api/tickets` 恒定 `.eq('user_id', user.id)`；管理台只 `fetch('/api/tickets/stats')`，无列表、无详情、无指派/改状态按钮 | `tickets/route.ts:120-125`；`admin/dashboard/page.tsx:64` | 售后流程在"管理员处置"这一步断掉 |
| **P0** | **工单没有对话能力**：`ticket_comments` 只读不写；`sendTicketReplyEmail` 零调用；`/api/tickets/[id]` 前端零调用 | grep 结果 | 客户无法补充信息，管理员无法回复 |
| P1 | 附件在列表中只显示数量，`AttachmentPreview` 仅 import 未渲染 | `TicketList.tsx:7` | 管理员要判断问题得先下载 |
| P1 | 状态流转无 UI（客户看不到"处理中/已解决"的操作痕迹，只有徽章） | `TicketList.tsx` | 体验像"提交箱"而非"工单系统" |
| P2 | 无工单详情页路由（只有 API），深链不可分享 | 路由清单 | 客服协作困难 |
| P2 | 审计日志无查看入口（PRD/TODO-023 留了 TODO） | 管理台 | 合规追溯只能查库 |

---

### M06 Contact（综合 81%）

**职责**：联系表单、办公室信息、OSM 地图、WhatsApp 二维码、Odoo 同步。

**已实现**：表单校验、Supabase 落库、Odoo 失败不阻断、地图 iframe（CSP 已放行）、二维码走 goqr.me、双语完整。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | Odoo 凭证未配置 → 线索只进 `contact_submissions`，CRM 同步名存实亡 | `.env.local` 占位；`odoo.ts` 未启用 |
| P1 | 无客户确认邮件（只有工单/线索有），表单提交后用户只看到一句成功文案 | `api/contact/route.ts` |
| P2 | 失败响应缺 `success:false` 信封，与其他 11 个路由不一致 | 同上 |
| P2 | i18n 键名残留 `taipei`/`hongKong`（值已是 Manila/Contact），维护误导 | `en.json contact.*` |

---

### M07 About（综合 80%）

**职责**：公司简介、团队（3 人）、资质（4 项）、发展历程（6 节点，垂直时间轴）。

**已实现**：Sanity 驱动、双语、时间轴渐变线 + 滚动进场、2020/2022/2025 预览年与 CMS 一致（T-050 已修）。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | PRD S14 要求的 **3D 翻转卡片、资质灯箱、新闻动态**均未实现 | `AboutClient.tsx` 无 lightbox/flip/modal |
| P2 | 团队仅 3 人且无头像兜底为渐变占位（可接受，但企业站显得单薄） | Sanity `team=3` |
| P2 | 资质 4 项，无证书编号/有效期，可信度弱 | Sanity `qual=4` |

---

### M08 Compare（综合 82%）

**职责**：TechGuru vs 传统代理商 vs 云厂商，7 维对比 + 3 条客户证言 + CTA。

**已实现**：对比表在移动端可横向滚动；证言已真正渲染（T-052 已从"死键"改为上线）。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | 证言为匿名 + 量化承诺（"saved 40% on VMware licensing"、"cut annual IT costs by 35%"），无客户名/授权说明，属合规与可信度风险 | `en.json compare.testimonials` |
| P2 | 对比维度是自述优势，无第三方数据/来源标注 | 页面 |

---

### M09 VMware Alternative（综合 80%）

**职责**：切换理由、5 家替代产品、4 步迁移、硬件利旧、TCO 计算器。

**已实现**：TCO 引擎两套定价模型（订阅/核/年、买断/CPU + 服务费率）、逐年累计、SVG 折线、PNG 导出；Sanity 配置真实存在（3 场景 × 3 厂商）。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | Sangfor 价格为 `isEstimated=true` 的估算值（$3,700 / $6,460 / $11,300 per CPU），VMware/Nutanix 也无来源与日期，销售不敢直接引用 | Sanity `tcoCalculator` |
| P2 | `lib/tco-engine.ts` 是另一套完整引擎，零生产引用（死代码），易误改 | grep 零引用 |
| P2 | 免责声明存在，但无"价格有效期/口径"字段 | `tcoCalculator` schema |

---

### M10 Help（综合 80%）

**职责**：20 条 FAQ（产品/技术/账户/账单 × 5）、分类 Tab、本地搜索、FAQ JSON-LD。

**已实现**：双语 20 条、`faqCounts` 驱动、搜索 + 空态、结构化数据。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | FAQ 走 i18n 而非 CMS；Sanity `faq` schema 文档数 = 0，"运营可改"不成立 | Sanity `faq=0` |
| P2 | 搜索是纯前端字符串过滤，与全局搜索（AI 多源）是两套行为，用户心智不一致 | `help/page.tsx` |
| P2 | 20 条对 28 产品 + 6 行业明显偏少，且无工单状态/附件/计费等高频问题 | 内容抽样 |

---

### M11 Legal（综合 84%）

**职责**：隐私政策（12 章）、服务条款（14 章），GDPR/CCPA 口径。

**已实现**：章节齐全，中英键 100% 对齐；日期已 i18n（T-051 已修）；此前缺失的两个收尾键已补。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | 繁中篇幅约为英文的 30–35%（字符数），属压缩翻译而非逐条对等；法律文本压缩会削弱条款效力 | 字符统计 + 抽样 |
| P1 | 未经法务复核（无复核记录），菲律宾/欧盟双重合规尚未验证 | 无证据 |
| P2 | 无 Cookie 分类说明（仅一句"essential cookies only"），与 Umami 实际行为需对齐 | `CookieConsent` |

---

### M12 全局搜索（综合 69%）

**职责**：全站搜索模态，站内 Sanity + Google CSE + Tavily 并行 → 去重 → 域名黑名单 → Gemini 三段摘要 → 能力缺口检测 → 线索表单。

**已实现**：管线分层清晰（`search/*` 5 个模块）、限流 20/min、外部源缺失有 UI 徽标、缺口线索落库 + 4 封邮件、空白态推荐。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| **P1** | **"图片搜索"是伪功能**：上传图片后 API 只把 query 置为字符串 `'image search'`，`imageData` 从未送进任何视觉模型 | `api/search/route.ts:19-31` |
| P1 | 搜索日志写 Sanity `searchLog`，但该类型未在 `sanity.config.ts` 注册（Studio 不可见）；同时 `search_logs` 表零写入 | 代码 + 迁移 003 |
| P2 | 摘要质量依赖 Gemini，无缓存/无超时降级到模板的显式标识 | `search/ai.ts` |
| P2 | 三套搜索并存（全局/产品/FAQ），结果口径不一致 | 组件层 |

---

### M13 认证 / 账户（综合 74%）

**职责**：邮箱密码 + Google OAuth 注册登录、密码重置、资料修改。

**已实现**：`@supabase/ssr` 双客户端、middleware 会话刷新、`redirectIfAuthenticated`、防账号枚举（重置恒返回成功）、OAuth 回调防开放重定向、`/profile` 可改姓名/密码。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| **P0** | 注册后不写 `public.users`，与 M05 的外键缺口同源 | 全库无插入 |
| P1 | 密码重置 `redirectTo` 指向仅支持 POST 的 `/api/auth/reset-password`，用户点邮件链接会得到 405 | `LoginForm.tsx` |
| P1 | `public.users` 表基本未使用：资料写 `auth.updateUser({data})`（user_metadata），角色字段却从 `users.role` 读 | `profile/page.tsx:45` |
| P2 | 角色判断三套实现，`auth-guard` 兜底 `'user'` 而 DB CHECK 只有 `customer/admin/super_admin` | `auth-guard.ts` vs `001` |
| P2 | 无邮箱验证强制、无登录失败锁定（PRD S2.5.1 要求 5 次/15 分钟锁定 + 验证码） | 无实现 |

---

### M14 管理后台（综合 45%）

**职责**：工单统计（总量/状态/优先级/类别/平均时长/最近 5 条）。

**已实现**：RSC `layout.tsx` 用 `requireAdmin()` 做服务端门禁（比纯客户端拦更稳），统计卡 + 分布条 + 最近列表。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| **P0** | 只读，无任何操作入口（指派、改状态、回复、导出） | 页面仅 1 处 GET fetch |
| **P0** | 无"全部工单"列表；管理员无法进入他人工单详情 | `/api/tickets` 恒定按本人过滤 |
| P1 | 统计只有状态/优先级/类别，PRD 要求的"按周/月/季/年"时间维度缺失 | `stats/route.ts` |
| P2 | 无审计日志视图、无用户管理（PRD S6.5 要求） | 页面 |

---

### M15 基础设施（综合 87%）

**已实现且是强项**
- `[locale]/layout.tsx` 一手包办 `<html lang>`、主题防闪烁同步脚本、字体 preload、hreflang/canonical、JSON-LD、skip-link。
- `next.config.ts` 安全头齐全：CSP、HSTS（2 年 preload）、XFO DENY、Permissions-Policy 全禁。
- API 统一信封（除 contact）、`logServiceError` 27 处接入、错误边界双层（`error.tsx` + `global-error.tsx`）。
- `api-guard.ts` 零依赖实现限流 + 同源 + 字段校验，风格克制。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| **P0** | **ISR 全线失效**：23 条 locale 路由 100% Dynamic；`revalidate=3600` 与 `/api/revalidate` 对页面无效果 | 构建产物 + 无 `setRequestLocale` |
| P1 | **CSP 阻断 Umami**：`script-src 'self' 'unsafe-inline'`，未放行 `cloud.umami.is`，分析脚本会被浏览器拒绝 | `next.config.ts:68` vs `layout.tsx:132` |
| P1 | `script-src 'unsafe-inline'` 削弱 XSS 防护（主题脚本可改 nonce/hash） | 同上 |
| P1 | 限流是进程内 Map：Serverless 多实例各算各的，实际限流强度远低于宣称 | `api-guard.ts` |
| P2 | 双 Sanity 客户端内容逐字相同，命名误导 | `sanity.ts` / `sanity.server.ts` |

---

### M16 设计系统（综合 80%）

**已实现**：`@theme` 定义 primary/accent/surface/background/foreground + heading/body/mono 字体；`.card`/`.btn-primary`/`.glass-nav`/`.section-title` 等组件类；`text-wrap: balance/pretty`；圆角/间距体系一致。

**差距（详见 §5）**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | 设计令牌形同虚设：组件里 `#00D4FF` 硬编码 **316 处**（不含测试文件），`var(--color-primary)` **0 处** | grep 统计 |
| P1 | 96 处内联 `style={{}}`，861 处 `dark:` 手工变体，漂移风险高 | grep 统计 |
| P2 | 两套主题组件并存，`DarkModeToggle` 已成孤儿（仅测试引用） | grep |
| P2 | `DESIGN.md` 仍写"`prefers-color-scheme` 自动切换、无手动按钮"，与实现的 `.dark` + 三态切换不符 | 文档 vs 代码 |

---

### M17 测试 / 工程化（综合 66%）

**已实现**：69 个测试文件 / 402 例，覆盖全部 lib、hooks、API、多数组件与页面；Playwright 20 spec（含 5 条用户旅程）；`tsc` 0 错；构建通过。

**差距**
| 优先级 | 问题 | 证据 |
|--------|------|------|
| P1 | **14 例失败 / 5 文件**，根因不是业务逻辑，而是测试隔离：限流器在进程内共享（contact 第 6 次请求返回 429）、`NEXT_PUBLIC_SANITY_PROJECT_ID` 未注入（internal.test 加载即崩）、`performance.test` 断言"组件文件 <50"已过时（现 60） | 本轮实跑输出 |
| P1 | 无 CI 配置（仓库无 `.github/workflows`），"全绿"依赖人工跑 | 目录 |
| P2 | E2E `baseURL` 直指生产域，本地跑会打线上 | `playwright.config.ts` |
| P2 | ESLint 2 errors（`inspect-blog-i18n.cjs` require、`ProductsList.tsx:50` setState-in-effect）+ 68 warnings | 本轮实跑 |
| P2 | 根目录/`tgws/` 根残留一次性脚本（`patch-dup-blog.cjs`、`nav-audit2..5.mjs` 等），未归档 | 目录 |

---

## 4. 依赖树与关键耦合

### 4.1 模块依赖树（实际）

```
[locale]/layout.tsx  (唯一 <html>/<body>)
├── Navbar
│   ├── MegaMenu
│   ├── GlobalSearch ── lib/sanity (浏览器直查)
│   ├── UserMenu ────── lib/supabase/client
│   ├── LanguageSwitcher
│   └── ThemeToggle
├── Footer（订阅无后端）
├── CookieConsent / ScrollToTop / ScrollReveal / HashScroll
└── JsonLd

页面（23）
├── Home ────────────── HeroSection（无 lib 依赖）
├── Products* ───────── lib/sanity.server → ProductsList/CategoryPage/ProductDetail
│                       └── framer-motion（未声明依赖）
├── Blog* ───────────── lib/sanity.server
├── Solutions* ──────── lib/sanity.server
├── About* ──────────── lib/sanity.server（team/qual/timeline）
├── Contact ─────────── fetch /api/contact
├── VMware Alt ──────── TcoCalculatorSection → fetch /api/tco → lib/tco
├── Help ────────────── i18n（不查 CMS）
├── Support* ────────── lib/supabase/client + fetch /api/tickets[/stats]
└── Profile ─────────── lib/supabase/client

API（12）
├── /api/tickets* ───── lib/supabase/server + api-guard + resend + errors
├── /api/upload ─────── supabase/server + Storage
├── /api/contact ────── supabase/server + odoo + errors
├── /api/search* ────── lib/search/{internal,external,ai,capability} + sanity.server
├── /api/tco ────────── lib/sanity.server + lib/tco(types)
├── /api/products ───── lib/sanity.server
├── /api/revalidate ─── next/cache
└── /api/auth/* ─────── supabase/server

基础设施（被全站引用）
└── lib/errors（27 处）· lib/api-guard（6）· lib/auth-guard（3）
```

### 4.2 依赖热度（生产引用，排除测试）

| 模块 | 被引用次数 | 性质 |
|------|:---------:|------|
| `@/lib/errors` | 27 | 全站最广耦合点（日志/埋点/序列化） |
| `@/lib/supabase/server` | 9 | 全部写操作 |
| `@/lib/sanity.server` | 7 | 页面数据读取 |
| `@/lib/sanity` | 7 | 客户端搜索/推荐 |
| `@/lib/supabase/client` | 6 | 认证态与用户操作 |
| `@/lib/api-guard` | 6 | 5 个公开写接口 |
| `@/lib/tco` | 4 | 计算器 + API |
| `@/lib/auth-guard` | 3 | 管理台/支持页门禁 |

### 4.3 六条关键链路（谁在等谁）

1. **内容读**：页面 → `sanity.server.fetch` → CDN。失败 `catch` 后返回 `[]`，页面静默空数据。
2. **建单写**：`TicketForm` → `/api/tickets` → 鉴权 → 校验 → `tickets` insert → `audit_log` → Resend（异步）。**insert 前置依赖 `users` 行存在。**
3. **附件写**：建单成功 → 串行 `/api/upload` → Storage → `ticket_attachments`；DB 失败回滚 Storage。
4. **线索双通道**：`/api/contact` → `contact_submissions` → Odoo（可失败）；`/api/search/lead` → `leads` → 4 封邮件。
5. **搜索**：`GlobalSearch` → `/api/search` → 3 源并行 → 去重/过滤 → Gemini → 响应 + 异步写 Sanity `searchLog`。
6. **TCO**：`TcoCalculatorSection` → `/api/tco`（`force-dynamic`）→ `tco.ts` 计算 → SVG → PNG。

### 4.4 关键耦合与风险 Top 10

| # | 耦合点 | 证据 | 风险 | 建议 |
|---|--------|------|------|------|
| 1 | **Sanity GROQ 字段名 ↔ 页面** | 页面 `try/catch → []` | schema 改名/字段缺失 → 页面静默空白，无告警 | 加字段白名单校验 + 空数据告警；关键页 `notFound()` 而非空列表 |
| 2 | **i18n 键 ↔ 组件** | 896 键 100% 对齐，但仍有多处硬编码 | 新文案漏翻 → 中文页出现英文（Navbar 移动端 "Search"、UserMenu "Sign In/Out"） | 硬编码清剿 + lint 规则（禁 JSX 中文字面量） |
| 3 | **errors.ts 单点** | 27 引用 | 本身是纯函数，风险低；但"错误策略"集中在一个日志函数，无统一 handler，路由各写 try/catch | 抽 `withApiHandler` 统一信封 + 错误码 |
| 4 | **鉴权三套** | `auth-guard` / `tickets` / `stats` 各自查 role | 角色语义漂移（`'user'` 不在 CHECK 内）；新增接口易漏判 | 收敛 `getUserRole()` + `requireAdmin` 唯一入口 |
| 5 | **users 表 ↔ auth.users** | 无触发器 | 注册即断链，工单外键失败 | 补 `handle_new_user` 触发器 + 回填历史用户 |
| 6 | **api-guard 限流** | 进程内 Map | Serverless 多实例失效；测试互相污染 | 换 Upstash/Vercel KV 或声明"best-effort" |
| 7 | **CMS 与现实数据** | faq 0、partner 0、product image 0、solution zh 0 | "CMS 驱动"只是架构承诺，运营侧实际不可用 | 按模块补数据或明确降级为 i18n 并写进文档 |
| 8 | **设计令牌 ↔ 组件** | 316 处硬编码色值 | 换品牌色需改 316 处；暗色漂移 | 全量替换为 `var(--color-*)` / Tailwind theme token |
| 9 | **ISR ↔ next-intl** | 无 `setRequestLocale` | 全站动态渲染，缓存与 Webhook 失效，成本/性能双输 | 每页调 `setRequestLocale(locale)`，恢复 SSG/ISR |
| 10 | **搜索日志双写** | Sanity `searchLog` vs `search_logs` | 数据沉在 CMS，业务分析落空；类型未注册 | 二选一：注册 schema 或改写 Supabase 表 |

---

## 5. UI 整体设计质量评价

### 5.1 总评

**78 / 100。** 视觉语言统一、克制、有品牌记忆点，明显高于"AI 生成的模板站"；扣分集中在**令牌纪律、暗色一致性、应用页与营销页的风格断层、以及若干可用性缺口**。

### 5.2 视觉一致性

**做得好的**
- 色彩体系克制：青色 `#00D4FF` 作强调（≤10% 面积），紫 `#7B61FF` 只做 Run 支柱与渐变，绿 `#22C55E` 只做 Protect——三支柱语义色贯穿首页/产品/图标。
- 字体层级稳定：`section-title clamp(2rem,5vw,3rem)` + `section-subtitle 1.7 行高`，全站节奏一致；标题 `text-wrap: balance` 是加分项。
- 卡片/按钮/输入框圆角分工明确（16px / 9999px / 8px），玻璃态导航 `85% + blur16` 与深色 Footer 形成清晰上下边界。

**问题**
| 严重度 | 问题 | 证据 |
|--------|------|------|
| 高 | **令牌未落地**：316 处硬编码 `#00D4FF`（不含测试），`var(--color-primary)` 0 处；`@theme` 定义了却没人用 | grep |
| 高 | **暗色模式在应用页断裂**：`support/page.tsx:109`、`admin/dashboard/page.tsx:114` 根容器只有 `bg-[#F4F4F5]` 无 `dark:bg`，而文字是 `dark:text-white` → 暗色下白字压浅灰底，对比度约 1.1:1，读数不可见 | 源码 |
| 中 | 96 处内联 style 与 Tailwind 混用，同一视觉在不同页由不同机制实现 | grep |
| 中 | 两套主题组件（`ThemeToggle` 三态 / `DarkModeToggle` 二态），后者已无人引用；`DESIGN.md` 描述的是第三套（纯 media query） | grep + 文档 |
| 低 | 登录页密码占位文案被输入框截断（截图为 "…lowercase, nur"） | `audit-screenshots/v2/support.png` |

### 5.3 交互合理性

**做得好的**
- MegaMenu 有 hover 意图延迟（150ms）+ 键盘 focus + Escape，比多数手写菜单完整。
- 全局搜索：防抖、body 滚动锁、空态推荐、外源不可用徽标、缺口→线索表单，闭环意识强。
- TCO：输入即算 + "计算后才出结果"的显式状态 + PNG 导出，工具感真实。
- 工单草稿自动保存与恢复，是同类站少见的细节。

**问题**
| 严重度 | 问题 | 证据 |
|--------|------|------|
| 高 | **管理台是死胡同**：只能看数，不能点任何工单 | 页面仅 GET |
| 高 | **Hero 无暂停/无 reduced-motion 分支**：视频随鼠标擦洗，对晕动症用户不友好；PRD S19 明确要求暂停按钮 | `HeroSection.tsx` 无 pause / matchMedia |
| 中 | **移动端抽屉无滚动锁**：全屏菜单打开后背景仍可滚动（搜索模态有锁，抽屉没有） | `Navbar.tsx` 无 `body.style.overflow` |
| 中 | **搜索模态无焦点陷阱**：Tab 可跑出模态；只有 autofocus | `GlobalSearch/index.tsx` |
| 中 | **三套搜索行为**：全局 AI 搜索 / 产品本地过滤 / FAQ 本地过滤，同一图标语义不同 | 组件层 |
| 中 | **Footer 订阅是假承诺**：`setSubscribed(true)` 后无任何请求 | `Footer.tsx:17` |
| 低 | 产品卡 CTA 仅 "Learn more"，无价格/对比/试用等次级动作 | `ProductsList.tsx` |

### 5.4 响应式

**做得好的**
- `sm/md/lg` 断点体系清晰；`md` 切桌面导航；产品网格 `sm:2/lg:3`；方案 Tab 横向滚动；对比表 `overflow-x-auto`。
- `clamp()` 字号 + `input font-size:16px`（防 iOS 聚焦缩放）是实战细节。
- 31 处 `min-h-[44px]`，触控目标基本达标。

**问题**
- 导航高度 `73px` 在 `layout`（`pt-[73px]`）与 `Navbar`（`top-[73px]`）两处硬编码，字号一变即错位。
- 移动端全屏菜单链接 32px、子项 14px，层级靠字号硬拉，缺少分组标题/返回逻辑。
- 产品卡 `line-clamp-2` 在窄屏会截断关键差异点（截图可见截断无省略号，需线上复核）。

### 5.5 可用性与无障碍（对照 PRD S19 / WCAG 2.1 AA）

| 项 | 状态 | 证据 |
|----|------|------|
| skip-link / 键盘可达 | ✅ | `layout.tsx:138` |
| 焦点可见 | ✅ | `focus-visible` 统一 2px 青环 |
| reduced-motion | ⚠️ 部分 | CSS 全局降级，但 Hero 打字机/擦洗不受控 |
| 表单 aria | ⚠️ 部分 | 主要表单有 `aria-required/invalid/describedby`，搜索/订阅等弱 |
| 图标按钮可读名 | ❌ 不足 | 全站仅 18 个 `aria-label`；搜索按钮用 `title` |
| 焦点陷阱 | ❌ | 搜索模态、移动抽屉均无 |
| 对比度 | ⚠️ | 营销页良好；暗色应用页断裂（见 5.2） |
| 图片 alt | ⚠️ | 18 处 `<Image>`，仍有原生 `<img>`；部分 alt 为硬编码英文 |

---

## 6. 内容文本评价

### 6.1 总评

**54 / 100。** 营销层文案（首页/产品/VMware/Compare）质量明显高于行业平均，有具体数字、有场景、有立场；但**双语内容的"第二语言"基本没有真正交付**，且内容运营链路（CMS/时效/分类）多处断掉。

### 6.2 准确性

| 结论 | 证据 | 判定 |
|------|------|------|
| 成立年份统一为 2020 | `about.intro`、timeline、About 预览年均一致 | ✅ |
| 28 产品 / 19 伙伴 / 6 行业与真实数据一致 | Sanity 28；`public/logos` 19；UI 6 行业 | ✅ |
| "12+ Years of Industry Experience" | 公司 2020 成立（6 年）；表述改为"行业经验"规避，但仍需可核验口径 | ⚠️ 需说明 |
| 客户证言量化（40%/35% 节省） | 匿名 + 无授权/来源 | ⚠️ 可信度/合规风险 |
| TCO 价格 | Sangfor 标注 estimated；VMware/Nutanix 无来源与日期 | ⚠️ 不可对外背书 |
| 联系页地址/电话/邮箱 | 与 PRD S22 一致 | ✅ |
| 法律页日期 | 已 i18n | ✅ |

### 6.3 完整性

| 维度 | 实测 | 判定 |
|------|------|------|
| i18n 键覆盖 | 896 / 896，零缺失 | ✅ |
| 中文营销文案 | 各命名空间字符量为英文 25–60%（中文密度高，属正常压缩），无未翻译英文串 | ✅ 基本成立 |
| **中文博客正文** | 72 篇中 63 篇 < 英文 10%，中位 6.8%；5 篇正文空 | ❌ **不成立** |
| 中文法律条款 | 章节齐全，篇幅约英文 1/3 | ⚠️ 压缩翻译 |
| 解决方案 CMS 中文 | `challengesZh/solutionsZh` 0/17 | ❌ |
| FAQ | 20 条双语，但不走 CMS（schema 0 文档） | ⚠️ |
| 产品视觉 | 28/28 有本地 Hero 图；Sanity `image` 字段空 | ⚠️ 双源，非缺失 |
| 博客分类 | 77 篇全 technical，news/industry/case-study = 0 | ❌ |
| 内容时效 | 最新文章 2025-05，停更约 18 个月 | ❌ |

### 6.4 风格一致性

**做得好的**
- 品牌口吻统一："Build with AI. Run Beyond VMware. Protect Without Borders." 与三支柱、产品命名、导航一致。
- 英文博客有明确写作规范（`WRITING-GUIDELINES.md`：反 AI 腔、具体数字、结论先行），抽样文章符合。
- 中英术语表基本稳定（超融合/HCI、托管服务/MDR 等）。

**问题**
- **中文博客是"电报体"**：短句堆叠、缺主语、缺过渡（"某些工作負載無法遷移到公有雲。受監管行業有數據主權要求。"），与英文叙事风格完全断裂，也不符合自家规范。
- 应用页文案（Support/Admin）偏"内部系统"语气，与营销页的品牌温度不一致。
- 硬编码英文残留：Navbar 移动端 `Search`、`UserMenu` 的 `Sign In/Out`、`Signed in as`、产品卡 `alt` 等。
- 匿名证言与"企业级可信"的定位有张力。

---

## 7. 整体健康状况与下一步

### 7.1 四维健康度

| 维度 | 分数 | 依据 |
|------|:----:|------|
| 工程实现 | **85** | tsc 0 错、build 通过、分层干净、安全与降级意识到位、审计/回滚/乐观锁齐全 |
| 功能闭环 | **64** | 售前 P1–P4 基本通；售后 P8–P11 断在"管理员处置"与"对话"；图片搜索伪功能 |
| 内容就绪 | **50** | 中文博客空壳、产品无图、方案中文空、FAQ/伙伴未入 CMS、内容停更 18 个月 |
| 体验与设计 | **78** | 视觉统一有品牌感；令牌未落地、暗色应用页断裂、若干可用性缺口 |
| **综合** | **72 / 100** | 可上线做"品牌 + 获客"，不可宣称"完整双语 + 完整售后门户" |

### 7.2 与文档宣称的差异（必须纠正的认知）

| 文档说法 | 实测 | 差异性质 |
|----------|------|----------|
| TODO：测试"68 文件全绿"、覆盖率 74.9% | 402 例中 14 失败；覆盖率本轮未复测 | 结论已过期 |
| `docs/modules/INDEX.md`：M01–M11 全部 95% / "✅ 完成" | 本报告三轴打分 45–86%，M14 仅 45% | 口径失真 |
| 架构文档：SSG/ISR + Webhook 实时生效 | 23 条 locale 路由全部 Dynamic，ISR 未生效 | 事实错误（本报告修正） |
| TODO：GlobalSearch"图片搜索/多模态" | 图片数据未进模型，实为文本占位 | 功能虚标 |
| TODO：TCO"Sanity 驱动定价" | 有定价但 Sangfor 为估算、无来源 | 半成立 |
| ACCEPTANCE：ESLint 21 errors | 现 2 errors / 68 warnings | 已改善，但未清零 |

### 7.3 下一步优先改进（按"阻断真实使用"排序）

**P0 — 不修就不能对外说"上线"**

1. **补 `handle_new_user` 触发器**（`auth.users` → `public.users`），回填历史用户；上线前用新账号跑一次"注册→建单"。
   *验收：新注册用户 5 分钟内可成功建单并在列表看到。*
2. **打通管理员处置闭环**：`GET /api/tickets?scope=all`（admin）+ 工单详情页 + 指派/改状态/回复 UI。
   *验收：管理员登录后能看到全部工单、打开任一单、改状态并留下审计记录。*
3. **补工单对话**：`ticket_comments` 写入接口 + 详情页时间线 + 回复邮件调用。
   *验收：客户与管理员可各发一条消息，双方都能看到并收到邮件。*
4. **修 `003` 迁移**（`leads` 策略引用不存在的 `user_id`），确认线上 `search_logs`/策略实际状态。
   *验收：迁移可在空库一次跑通。*
5. **中文博客正文补齐或明确降级**：63 篇 <10% 的文章要么补译，要么在 ZH 页显式回退英文并标注"英文原文"。
   *验收：任选 10 篇 ZH 文章，正文长度 ≥ 英文 60% 或页面明示回退。*
6. **恢复静态渲染**：每页/布局加 `setRequestLocale(locale)`，让 `revalidate=3600` 与 `/api/revalidate` 真正生效。
   *验收：构建产物中 `[locale]` 路由出现 `○`/ISR，重复访问不重复渲染。*

**P1 — 影响信任与转化**

7. CSP 放行 `cloud.umami.is`（或改用同源代理），让分析真正采集。
8. 图片搜索：接视觉模型，或从 UI 移除"图片搜索"入口（不要留假功能）。
9. 产品视觉：确定唯一来源（CMS `image` 或本地 `productImages`），删除另一条；**不需补图**，28 张资产已在。
10. 解决方案数据治理：17 条 → 6 条（或按行业聚合），补 `challengesZh/solutionsZh`，决定 manufacturing 去留。
11. 暗色一致性：`support`/`admin` 根容器补 `dark:bg`，并做一次全站暗色巡检。
12. 测试隔离：限流器按测试重置、`vitest` 注入 Sanity env、更新 performance 断言；补 CI。
13. 依赖声明：`framer-motion`、`date-fns` 补进 `dependencies`。
14. 密码重置：新增 `/support/reset-password` 页面，`redirectTo` 指向它。
15. 内容运营：博客恢复更新节奏；分类从"全 technical"改为真实分类；FAQ/伙伴迁入 CMS 或明确 i18n 为唯一源。
16. 设计令牌落地：316 处硬编码色值替换为 token（可脚本化），并把 `DESIGN.md` 更新为当前实现。

**P2 — 品质与可维护性**

17. 移死代码：`tco-engine.ts`、`DarkModeToggle.tsx`、`AttachmentPreview` 未用 import、重复 Sanity 客户端。
18. 统一三套角色判断为 `getUserRole()`；`auth-guard` 兜底改为 `customer`。
19. 移动端抽屉加滚动锁；搜索模态加焦点陷阱；Hero 加暂停 + reduced-motion。
20. 404 首页链接改 `/{locale}`；`/api/contact` 统一信封；管理台补 metadata。
21. 一次性脚本归档，ESLint 清零（2 errors）。

### 7.4 一句话结论

**这是一套"工程骨架扎实、售前叙事完整、售后闭环断尾、双语内容半成品"的营销+门户站。** 代码侧的安全、降级、审计、组件化水准高于同类项目；真正的短板不在技术，而在**内容交付（中文正文/CMS 数据/内容时效）**与**售后流程的最后一公里（管理员处置与对话）**。先补 P0 的 6 项，才有资格对外称"完整双语企业门户"。

---

## 附录 A：关键证据索引

| 结论 | 文件:行 |
|------|---------|
| 23 条 locale 路由全动态 | `npm run build` 路由表（`ƒ /[locale]/*`），`grep setRequestLocale` = 0 |
| ISR 声明但无效 | `blog/page.tsx:8`、`products/page.tsx:8` 等 8 处 `revalidate=3600` |
| CSP 阻断 Umami | `next.config.ts:68`；`[locale]/layout.tsx:132` |
| 工单外键风险 | `001_initial_schema.sql:5,21`；`api/tickets/route.ts:65-77`；无 `handle_new_user` |
| 管理员只读 | `admin/dashboard/page.tsx:64`；`api/tickets/route.ts:120-125` |
| 评论只读 | `api/tickets/[id]/route.ts:52-60`；无 INSERT |
| leads RLS 错误 | `003_add_search_tables.sql:38-40`（列 `user_id` 不存在） |
| 图片搜索伪功能 | `api/search/route.ts:19-31` |
| 中文博客 6.8% | Sanity GROQ：72 篇有正文，中位 `contentZh/content = 0.068`，63 篇 <10% |
| 产品视觉 | Sanity `product.image` = 0/28；本地 `productImages` = 28/28；线上抽查 4/4 有 Hero 图 |
| 方案中文 0 | Sanity `challengesZh/solutionsZh` = 0/17 |
| FAQ/伙伴 0 文档 | Sanity `faq=0`、`partner=0` |
| 设计令牌未用 | `#00D4FF` 316 次；`var(--color-primary)` 0 次 |
| 暗色断裂 | `support/page.tsx:109`、`admin/dashboard/page.tsx:114` |
| 订阅无后端 | `Footer.tsx:12-17` |
| 证言匿名量化 | `en.json compare.testimonials` |
| 测试 14 失败 | `npm run test:run`：402 例 / 14 失败 / 5 文件 |
| ESLint 2 errors | `ProductsList.tsx:50`；`inspect-blog-i18n.cjs:1` |

## 附录 B：本轮未验证事项（不得当作已确认）

1. 线上 Supabase 是否已手工补 `public.users` 触发器/外键（决定"注册→建单"是否真的断）。
2. 线上 `leads`/`search_logs` 表是否已建（003 在仓库里是坏的）。
3. Vercel Production 环境变量（`NEXT_PUBLIC_UMAMI_WEBSITE_ID`、CSE/Tavily/Gemini、Odoo）真实配置状态。
4. 线上暗色模式、移动端抽屉、产品卡截断的实际表现（本报告依据源码与旧截图，未做真机截图）。
5. 覆盖率现值（74.9% 为 2026-08-02 记录，本轮未复测）。
6. 法律条款的合规性（需法务，不是工程判断）。
7. `design-v2` 提案（T-036）的视觉方案未纳入本次 UI 评分，仅评现行生产 UI。
