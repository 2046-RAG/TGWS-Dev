# TGWS 三任务综合审计

TGWS项目专用的网站质量审计框架。三阶段串行管道：数据正确 → 前后端一致 → 设计匹配。

## 触发词

"审计"、"评估"、"review"、"三任务"、"检查质量"、"内容审查"、"全站检查"

## 流程状态机

```
启动时:
  1. 读取 task 工具 → 查找 T1/T2/T3 的 status
  2. 如果没有任务 → 创建 T1(内容质量) + T2(前后端一致性) + T3(UI/UX)
  3. 找到第一个 in_progress 或 open 的任务 → 执行
  4. 全部 done → 输出总结报告

执行中:
  每个任务遵循: 评估 → 用户确认 → 修复 → 自测 → 验收
  自测不通过 → 回到修复
  验收不通过 → 回到评估
```

## 核心约束（必须遵守）

1. **评估必须用工具** — 不能仅凭阅读源代码下结论，必须调用 skill/bash/webfetch
2. **一维度一工具** — 每个评估维度只分配一个主工具，不存在两个工具评同一件事
3. **双轨评估** — 每个维度同时输出：维度评分 + 实现级发现
4. **实现级审查不能被维度评分替代** — 维度打分会掩盖具体 bug，两者必须同时做
5. **自测循环** — 每次修复后必须 lint → typecheck → build → test，不通过不交付
6. **厂商信息禁止幻想** — 涉及 Sangfor/Fortinet/Nutanix 等厂商时必须 webfetch 官网验证
7. **详情页必须深入检查** — 列表页检查不够，必须打开详情页验证实际渲染效果

## 评分标准

| 分数 | 含义 |
|------|------|
| 4 | 优秀，无需改进 |
| 3 | 良好，小问题不影响体验 |
| 2 | 需改进，明显问题 |
| 1 | 严重问题，必须立即修复 |

**达标**: 所有维度平均分 ≥ 3.0，且无 1 分维度。

## 双轨输出格式

每个评估维度必须同时输出:

```
维度: <维度名>
评分: <X>/4
工具: <使用的工具>

实现级发现:
- [Critical/High/Medium/Low] <具体问题描述> (<发现来源>)
```

## 自测循环

```
修复代码 → npm run lint → npx tsc --noEmit → npx next build --webpack → npx vitest run
    ↑                                                                    ↓
    ←←←←←←←←←← 发现问题则回到修复 ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
                                                          全部通过 → 交付
```

自测命令:

| 命令 | 检查内容 | 失败处理 |
|------|----------|----------|
| `npm run lint` | 代码规范、潜在错误 | 修复后重新 lint |
| `npx tsc --noEmit` | TypeScript 类型安全 | 修复类型错误 |
| `npx next build --webpack` | 构建是否成功 | 修复构建错误（win32 必须用 --webpack） |
| `npx vitest run` | 单元测试 | 修复测试 |

**不通过则不交付**。

---

# 任务 1: 内容质量评估

## 目标

验证 Sanity CMS + i18n 中的所有内容是否准确、完整、专业、可落地。

## 工具分配

| 维度类别 | 主工具 | 辅助 |
|----------|--------|------|
| 内容架构 | content-modeling-best-practices | sanity-best-practices |
| Sanity 实现 | sanity-best-practices | - |
| SEO/GEO | seo-aeo-best-practices | - |
| 写作质量 | writing-guidelines | - |
| 厂商信息 | webfetch（官网查询） | - |
| 业务准确性 | 用户确认 | - |

### 工具边界

- **content-modeling-best-practices** 管架构原则（"什么是好的内容架构"）
- **sanity-best-practices** 管实现细节（"如何在 Sanity 中正确实现"）
- **seo-aeo-best-practices** 管可发现性（"搜索引擎/AI 优化"）
- **writing-guidelines** 管可读性（"文案质量"）
- **impeccable** 管 UX 整体（"设计好不好"）— 任务 3 使用

## 23 个评估维度

### A. 内容完整性（3 维度）
| # | 维度 | 工具 | 检查内容 |
|---|------|------|----------|
| 1 | 产品完整度 | content-modeling | Build/Run/Protect 下品牌、技术、产品是否齐全 |
| 2 | 行业方案完整度 | sanity-best-practices | 6 个行业是否都有痛点/方案/产品 |
| 3 | AI 产品线完整度 | content-modeling | Adoption→AIGC/Coding/Legacy→Agent 逻辑 |

### B. 内容准确性（3 维度）
| # | 维度 | 工具 | 检查内容 |
|---|------|------|----------|
| 4 | 产品描述准确性 | webfetch（官网） | 技术参数、功能描述是否正确 |
| 5 | 合作伙伴信息 | webfetch（官网） | 合作伙伴描述是否准确 |
| 6 | 统计数据 | 用户确认 | 数字是否属实 |

### C. 内容质量（6 维度）
| # | 维度 | 工具 | 检查内容 |
|---|------|------|----------|
| 7 | 真实性 | 用户确认 | 是否存在虚假宣传 |
| 8 | 可落地性 | 用户确认 | 能否交付所承诺的内容 |
| 9 | 语气适当性 | writing-guidelines | 专业但不僵硬 |
| 10 | 品牌一致性 | 审查 | Build.Run.Protect. + AI 双故事线 |
| 11 | 差异化 | 审查 | 与竞品的区别 |
| 12 | 信任信号 | 审查 + 用户确认 | 案例/数据/资质是否充分 |

### D. 内容策略（5 维度）
| # | 维度 | 工具 | 检查内容 |
|---|------|------|----------|
| 13 | 定位关联性 | 审查 | 是否符合 "Asia's leading IT solutions integrator" |
| 14 | CTA 有效性 | 审查 | 行动号召是否清晰有力 |
| 15 | 信息密度 | 审查 | 关键信息是否突出 |
| 16 | 用户旅程 | 审查 | 首页→转化路径是否顺畅 |
| 17 | 行业相关性 | sanity-best-practices | 6 个行业内容是否贴合痛点 |

### E. 多语言与 SEO（3 维度）
| # | 维度 | 工具 | 检查内容 |
|---|------|------|----------|
| 18 | 多语言质量 | 审查 | 英文/繁中翻译是否准确自然 |
| 19 | SEO 对齐 | seo-aeo-best-practices | 是否匹配搜索意图 |
| 20 | GEO 优化 | seo-aeo-best-practices | 是否针对 AI 搜索引擎优化 |

### F. 扩展（3 维度）
| # | 维度 | 工具 | 检查内容 |
|---|------|------|----------|
| 21 | 内容新鲜度 | 审查 | 是否有过时信息 |
| 22 | 价格信息 | 用户确认 | 免费额度是否准确 |
| 23 | 法律合规 | 审查 | 隐私政策/条款是否完整 |

## 实现级检查（按页面类型）

| 页面类型 | 检查项 | 工具 |
|----------|--------|------|
| 案例详情 | content 是否含非英文文字 | Sanity 脚本扫描 + webfetch |
| 案例详情 | clientName 是否为占位值 | Sanity 脚本查询 |
| 案例详情 | results 字段格式是否正确 | Sanity 脚本 + 正则 |
| 案例详情 | summaryZh/contentZh 是否缺失 | Sanity 脚本查询 |
| 博客详情 | content 是否含异常字符 | Sanity 脚本扫描 |
| 产品详情 | features 字段是否完整 | Sanity 脚本查询 |
| 解决方案 | solutions/products 数组长度 | Sanity 脚本查询 |
| 所有页面 | i18n key 是否缺失 | grep en.json/zh.json |

## Sanity 脚本模板

```javascript
// 扫描内容中的中文字符（匿名文字检测）
const withChinese = items.filter(item => {
  const text = item.content?.map(b => b.children?.map(c => c.text).join('')).join('') || '';
  return /[\u4e00-\u9fff]/.test(text);
});

// 扫描占位值
const withPlaceholder = items.filter(item =>
  /(sector client|某|TBD|TODO|placeholder)/i.test(item.clientName)
);

// 扫描格式异常
const withBadResults = items.filter(item =>
  item.results?.some(r => /^(3x|Yes|No\b|GDPR|FERPA|PCI)/.test(r))
);
```

## 用户确认清单

以下问题必须问用户确认:
- 合作伙伴信息是否准确
- 统计数据是否属实
- AI 产品哪些已交付、哪些在规划
- 案例是真实还是虚构（虚构需标注为"典型应用场景"）

---

# 任务 2: 前后端一致性检查

## 目标

验证所有页面的前端展示是否与数据源（Sanity/i18n/Supabase）一致。

## 工具

| 工具 | 用途 |
|------|------|
| check-sanity-content.mjs | Sanity vs 前端对比 |
| fetch-sanity-content.mjs | 查询 Sanity 数据 |
| read | 读取页面组件源码 |
| bash | 运行脚本 |
| webfetch | 验证线上页面渲染效果 |

## 页面检查清单

| # | 页面 | 路由 | 数据来源 | 关键检查 |
|---|------|------|----------|----------|
| 1 | 首页 | /{locale}/ | i18n + Sanity | Hero/产品展示/CTA/统计 |
| 2 | 关于 | /{locale}/about | i18n | 公司/团队/愿景 |
| 3 | 产品 | /{locale}/products | Sanity | 28 产品数据 |
| 4 | 解决方案 | /{locale}/solutions | i18n | 6 行业内容 |
| 5 | 案例列表 | /{locale}/case-studies | Sanity | 36 案例列表 |
| 6 | **案例详情** | /{locale}/case-studies/[slug] | Sanity | **content 中文扫描 + results 格式** |
| 7 | 博客列表 | /{locale}/blog | Sanity | 30 博客列表 |
| 8 | **博客详情** | /{locale}/blog/[slug] | Sanity | **content 异常字符** |
| 9 | 联系 | /{locale}/contact | i18n | 联系信息/表单 |
| 10 | 支持 | /{locale}/support | i18n + Supabase | 工单入口 |
| 11 | 登录 | /{locale}/support/login | 前端 | 表单字段 |
| 12 | 注册 | /{locale}/support/register | 前端 | 表单字段 |
| 13 | 帮助 | /{locale}/help | i18n | FAQ |
| 14 | VMware 替代 | /{locale}/vmware-alternative | i18n | 迁移方案 |
| 15 | 隐私 | /{locale}/privacy | i18n | 法律文本 |
| 16 | 条款 | /{locale}/terms | i18n | 法律文本 |
| 17 | home | /{locale}/home | i18n | 与根页面关系 |

**关键**: 案例详情和博客详情必须用 webfetch 验证实际渲染效果，不能只检查列表页。

## 检查方法

每个页面执行:
1. **数据源查询** — Sanity 脚本或 i18n 文件，获取原始数据
2. **前端组件阅读** — read 页面组件，检查数据如何渲染
3. **线上验证** — webfetch 访问线上 URL，对比实际输出
4. **i18n 一致性** — en.json 和 zh.json 的 key 是否对齐

## 达标标准

17 个页面全部一致，无差异项。不一致则修复后重新验证。

---

# 任务 3: UI/UX 评估 + 设计适配性

## 目标

评估所有页面的 UI/UX 质量 + 不同内容类型的设计适配性。

## 工具边界划分

### design-taste-frontend vs impeccable critique

| 维度 | 主工具 | 理由 |
|------|--------|------|
| 吸睛度 | design-taste-frontend | 60+ 预检项更详细 |
| 美感 | design-taste-frontend | 反模板检测更专业 |
| 视觉层次 | impeccable critique | UX 启发式评审 |
| 其他 UX 维度 | impeccable critique | Nielsen 启发式 |

### impeccable critique vs audit

| 类型 | 用途 |
|------|------|
| critique | 评"设计是否好"（UX 整体评估） |
| audit | 评"技术是否对"（技术检查） |

**不用的工具**: impeccable craft/shape/polish/bolder（实施命令，评估阶段不用）、frontend-design（与 impeccable 重叠 80%）、web-design-guidelines（与 impeccable 审计维度重叠）

## 25 个评估维度

### A. 第一印象层（4 维度）
| # | 维度 | 工具 |
|---|------|------|
| 1 | 吸睛度 | design-taste-frontend |
| 2 | 美感 | design-taste-frontend |
| 3 | 质感 | impeccable critique |
| 4 | 配色方案 | impeccable critique |

### B. 信息传达层（5 维度）
| # | 维度 | 工具 |
|---|------|------|
| 5 | 视觉层次 | impeccable critique |
| 6 | 关键信息传递 | impeccable critique |
| 7 | 排版设计 | impeccable critique |
| 8 | 信息架构 | impeccable critique |
| 9 | 信息密度 | impeccable critique |

### C. 交互体验层（8 维度）
| # | 维度 | 工具 |
|---|------|------|
| 10 | 过渡动效 | impeccable audit |
| 11 | 交互反馈 | impeccable audit |
| 12 | 导航结构 | impeccable critique |
| 13 | 表单体验 | impeccable audit |
| 14 | 响应式适配 | impeccable audit |
| 15 | 无障碍访问 | impeccable audit |
| 16 | 错误处理 | impeccable audit |
| 17 | 暗色模式 | impeccable audit |

### D. 品牌一致性层（3 维度）
| # | 维度 | 工具 |
|---|------|------|
| 18 | 品牌一致性 | impeccable critique |
| 19 | CTA 设计 | impeccable critique |
| 20 | 卡片设计 | impeccable critique |

### E. 设计适配性层（5 维度）
| # | 维度 | 工具 |
|---|------|------|
| 21 | 内容类型差异化 | impeccable critique |
| 22 | 信息密度匹配 | impeccable critique |
| 23 | 交互差异化 | impeccable critique |
| 24 | 双故事线视觉区分 | impeccable critique |
| 25 | 页面节奏感 | impeccable critique |

## 达标标准

所有维度平均分 ≥ 3.0，无 1 分维度。未达标则修复后重新评估。

---

# 任务完成后

## 输出报告

每个任务完成后输出:
1. **评分表** — 每个维度的分数、工具、发现
2. **实现级发现列表** — 按 Critical/High/Medium/Low 排序
3. **修复记录** — 改了什么、为什么这么改
4. **验证结果** — 自测是否通过

全部完成后输出 **综合改进计划**:
- 优先级排序
- 每个改进项的改前后对比
- 预期效果

## 部署

全部任务完成后，执行:
```bash
npx vercel --prod --yes
```
提醒用户前往 https://www.techguru-it.asia 复审。

## 跨 Session 恢复

如果 session 中断:
1. 查看 task 工具中 T1/T2/T3 的 status
2. 找到第一个未完成的任务
3. 读取该任务的 progress.md 恢复上下文
4. 继续执行

---

# 项目上下文

## 技术栈

- Next.js (App Router) + TypeScript
- Sanity CMS (内容管理)
- Supabase Auth (认证，直连无自建API)
- Supabase (用户/工单/存储)
- Resend (邮件通知)
- Tailwind CSS (组件全部手写，未使用 shadcn/ui)
- 部署: Vercel CLI (`npx vercel --prod --yes`)

## 内容规模

- 28 产品 (Build=5, Run=15, Protect=8)
- 30 博客文章
- 36 案例展示
- 17 解决方案
- 2 语言 (en/zh 繁体)

## 页面清单 (17 个)

首页、关于、产品、解决方案、案例列表、案例详情、博客列表、博客详情、联系、支持、登录、注册、帮助、VMware 替代、隐私、条款、home

## 关键脚本

| 脚本 | 用途 |
|------|------|
| scripts/check-sanity-content.mjs | Sanity 内容核对 |
| scripts/fetch-sanity-content.mjs | 批量拉取 Sanity 内容 |
| scripts/anonymize-case-studies.mjs | 案例匿名化 |

## 设计系统

- 主色: `#00D4FF` (≤10% 表面积)
- 强调色: `#7B61FF`
- 字体: HelveticaNowDisplay-Medium (标题) / HelveticaNowDisplayW01-Rg (正文)
- 卡片: `border-radius: 12px`, hover `translateY(-2px)` + cyan glow
- 按钮: pill 形状 (`border-radius: 9999px`)
- 触控: 44px 最小 (WCAG 2.5.8)
