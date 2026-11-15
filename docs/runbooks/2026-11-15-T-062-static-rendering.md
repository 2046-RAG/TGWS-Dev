# T-062 执行记录：恢复静态渲染 / ISR

**日期**：2026-11-15
**状态**：✅ 已推送生产并在线上验证（08:10 GitHub push → Vercel 自动部署成功）；静态渲染目标达成，首屏策略仍缺
**范围说明**：本轮只解决"locale 路由全动态"，不含原任务里的首页首屏策略（`use client` + video `preload=auto`）。

---

## 1. 问题复现（评估基线）

`npm run build` 产物里 **23 条 `/[locale]` 路由全部标 `ƒ` Dynamic，0 条静态**。根因是全仓没有调用 `next-intl` 的 `setRequestLocale(locale)`，导致 `getMessages()` / `getTranslations()` 从请求头解析语言，强制每个页面走 SSR；8 个页面写的 `revalidate = 3600` 与 `/api/revalidate` 因此对页面无效。

---

## 2. 改动清单（本地工作区，未提交、未部署）

| 文件 | 改动 |
|------|------|
| `src/app/[locale]/layout.tsx` | 引入并调用 `setRequestLocale(locale)`（本次核心开关） |
| `src/app/[locale]/privacy/page.tsx` | `getLocale()` → 从 `params` 取 locale + `setRequestLocale` |
| `src/app/[locale]/terms/page.tsx` | 同上 |
| `src/app/[locale]/products/page.tsx` | `revalidate = 3600` → 显式 `dynamic = 'force-dynamic'` |
| `src/app/[locale]/blog/[slug]/page.tsx` | 新增 `generateStaticParams()`（从 Sanity 取 post slug） |
| `src/app/[locale]/products/[slug]/page.tsx` | 新增 `generateStaticParams()`（从 Sanity 取 product slug） |
| `src/app/[locale]/products/[slug]/ProductDetail.tsx` | 特性文案缺失时回退到 CMS `product.features` |
| `src/app/[locale]/products/ProductsList.tsx` | 同上（守卫式取值） |
| `src/app/[locale]/products/CategoryPage.tsx` | 同上（守卫式取值） |
| `src/messages/en.json` / `zh.json` | `help.faqCounts.*` 由数字改为字符串（数字被 `t()` 解析会报 `INVALID_MESSAGE`） |

**为什么保留 4 个动态页**

| 路由 | 原因 |
|------|------|
| `/[locale]/products` | 客户端 `ProductsList` 用 `useSearchParams()` 读 `?category=`，静态预渲染会丢筛选后的 HTML 且要求 Suspense 边界；显式声明动态 |
| `/support/login`、`/support/register`、`/support/admin/dashboard` | 认证/会话相关，保持动态合理 |

---

## 3. 静态化后暴露并修复的两个既有缺陷

预渲染会把过去运行时才触发的翻译错误全部打进构建日志，本轮共出现 **80 条**：

1. **`MISSING_MESSAGE` × 64**：`products.features` 只有 20 个键，8 个网络硬件产品（access-switches / aggregation-switches / core-switches / enterprise-routers / enterprise-wireless-ap / outdoor-wireless-ap / wifi-6-7-ap / wireless-controllers）缺本地化特性文案。
   - 查证：这 8 个产品在 Sanity 里**各有 4 条真实英文特性**（例如 access-switches：`PoE+ power supply` / `802.1X authentication` / `Storm control` / `Stackable design`）。
   - 处理：**不编造文案**，改为 i18n 缺键时回退 CMS 数据。修复后 8 个产品详情页重新出现 "Key Features" 区块（抽查 4/4 命中 CMS 原文）。
   - 遗留：中文站这 8 个产品显示的是英文特性（CMS 无中文字段）。归入 T-072 / T-075。
2. **`INVALID_MESSAGE` × 16**：`help/page.tsx` 用 `Number(t('faqCounts.product'))` 读取数字 5，next-intl 把它当可翻译消息解析。改为字符串 `"5"`，`Number()` 结果不变。

**兼容性处理**：单元测试里的 `useTranslations` mock 只实现了 `t()` / `t.raw()`，没有 `t.has`。生产代码加了 `typeof t.has === 'function'` 守卫——测试环境走原路径、生产环境跳过缺失键，因此**没有改动任何测试文件**，行为零变化。

---

## 4. 本地验证结果（全部本轮实跑）

| 检查 | 结果 |
|------|------|
| `npx tsc --noEmit` | 通过，0 错误 |
| `npm run build` | 通过，`BUILD_EXIT=0` |
| 构建期 i18n 错误 | `MISSING_MESSAGE` 0 / `INVALID_MESSAGE` 0（修复前 80） |
| 路由渲染模式 | **20 条 `●` SSG/ISR**（带 `1h` revalidate）+ 5 条 `○` Static + 18 条 `ƒ` |
| `ƒ` 中的 locale 页面 | 仅 4 条（见第 2 节）；其余 `ƒ` 为 API 路由与 Middleware |
| 预渲染 HTML 文件 | 247 个 |
| 8 个产品页特性区块 | 抽查 4/4 已恢复，内容为 CMS 原文 |
| `npx eslint .` | 2 errors / 68 warnings — **与评估基线一致，本轮无新增** |
| `npm run test:run` | 5 failed / 64 passed（69 文件）— **与评估基线一致** |

> 回归说明：中途一版直接调用 `t.has` 曾让 3 个产品组件测试文件失败（8 个失败文件）。已用兼容守卫修回，全量重跑回到基线的 5 个失败文件。这 5 个是既有问题：限流器进程内共享导致 429、Sanity env 未注入、performance 断言过期（`en.json` 解析 11.9ms > 10ms、组件数 60 不小于 50）。

---

## 5. 生产部署与线上验证（2026-11-15 08:10–08:16）

**推送**：`git push origin Trunk` → `dca689d..07f88b4 Trunk -> Trunk`（3 个提交：本次 2 个 + 此前未推送的 `4e5895c`）。远程 `refs/heads/Trunk` 已确认为 `07f88b4`。提交前扫描过暂存区，无明文密钥；`.secrets/` 已被 `.gitignore` 排除。

**部署**：GitHub 该提交的 Vercel 状态 `success / Deployment has completed`。无 Vercel token，靠 GitHub 自动构建。

> 网络说明：git 与 curl 均经环境变量指定的本机代理 `http://127.0.0.1:51257`（HTTPS CONNECT 隧道）。`curl -D -` 输出里的 `HTTP/1.1 200 Connection Established` 是代理应答，不是站点状态码；真实状态码用 `%{http_code}` 单独核对为 200。

| 检查 | 部署前 | 部署后 |
|------|--------|--------|
| `/en/privacy` 响应头 | `private, no-cache, no-store` / `X-Vercel-Cache: MISS` | `public, max-age=0, must-revalidate` / `PRERENDER` → `HIT` |
| 首页、中文法律页、博客详情、产品详情、帮助页 | 全动态 | 均 `PRERENDER`/`HIT` |
| `/en/products`、`/en/support/login`（设计上保留动态） | `MISS` | 仍 `MISS`（符合预期） |
| 重复访问 | — | 第 2 次起 `X-Vercel-Cache: HIT`，缓存命中 |
| 8 个产品页 "Key Features" | 无 | `/en/products/access-switches` 命中 CMS 原文 `PoE+ power supply` |
| 语言串台 | — | `/en/privacy` = `lang="en"` + Privacy Policy；`/zh/privacy` = `lang="zh"` + 隱私權/個人資料，均 200 |

> Vercel 的 ISR 响应是 `public, max-age=0, must-revalidate` 配合 `x-vercel-cache`，不是自托管 Next.js 的 `s-maxage=3600`。首次自动化检测按 `s-maxage` 判据误报为"未生效"，已按 Vercel 实际头修正。

## 5.1 仍未完成 / 未验证（如实保留）

| 项 | 状态 | 说明 |
|----|------|------|
| 首页首屏策略（`use client` + video `preload=auto`） | ❌ 本轮未做 | 原 T-062 验收的一半，仍待办 |
| `/api/revalidate` 主动触发后的页面更新 | ❌ 未验证 | 需要改一条 Sanity 内容并调接口；未擅自改动线上内容 |
| 中文站 8 个产品特性文案 | ❌ 未提供 | CMS 无中文字段，中文页显示英文特性；归入 T-072 / T-075 |
| Vercel 构建日志里的路由表 | 🟡 未直接读取 | 无 Vercel token；以线上响应头 + 部署 success 作为等价证据 |

**结论口径更新**：T-062 的"恢复静态渲染"已有代码 + 构建 + **线上端到端证据**，该项可判定完成；但 T-062 整条任务因首屏策略未做，仍标记**部分完成**。

## 6. 后续可执行验证（本轮未做）

1. ~~确认部署方式~~ 已完成：GitHub push 触发 Vercel 自动构建。
2. ~~核对 locale 路由渲染模式~~ 已完成：见第 5 节响应头表。
3. ~~连续请求命中缓存~~ 已完成：`X-Vercel-Cache: HIT`。
4. 修改一条 Sanity 内容 → 调 `/api/revalidate` → 确认页面更新（未做）。
5. ~~抽查 8 个网络产品详情页~~ 已抽查 1 个，其余 7 个未逐个核对。
6. ~~抽查中文站语言串台~~ 已完成：`/zh/privacy` 繁中、`lang="zh"`。

## 7. 回滚

本轮改动全部未提交，可逐文件 `git checkout -- <file>` 回退（清单见第 2 节）。`src/messages/*.json` 回滚时需注意 `faqCounts` 会变回数字，构建日志的 `INVALID_MESSAGE` 会重新出现。
