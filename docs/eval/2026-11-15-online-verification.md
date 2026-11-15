# 线上只读验证记录（2026-11-15）

> 目标：对评估报告中的关键结论做线上复核，不写任何数据、不改任何配置。
> 站点：`https://www.techguru-it.asia`
> 方法：HTTP GET + 响应头/HTML 解析（无登录、无数据库连接）

---

## 1. CSP：Umami 确实被拦

线上响应头：

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://db.onlinewebfonts.com; ...
```

`script-src` 没有 `https://cloud.umami.is`，而页面确实加载：

```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="..."></script>
```

**结论：T-067 成立。** 浏览器会拒绝该脚本；Umami 拿不到数据。控制台应出现 CSP violation。

---

## 2. 中文博客：线上确认是"摘要壳"

同一篇文章，EN / ZH 两个 URL 的正文对比（`div.article-content` 内可见文本）：

| 版本 | URL | 正文字符数 | 中文字符数 |
|------|-----|-----------:|-----------:|
| EN | `/en/blog/vmware-cloud-foundation-private-cloud` | 10,867 | 0 |
| ZH | `/zh/blog/vmware-cloud-foundation-private-cloud` | **465** | 263 |

比例：**4.3%**。开头的文本是：

> 為什麼私有雲仍然重要 每年都有人宣佈私有雲已死。但每年企業繼續建構。某些工作負載無法遷移到公有雲。受監管行業有數據主權要求。延遲敏感的應用需要本地計算。

句子之间没有连接、主语缺失，属"电报体摘要"，不是翻译。

**结论：T-063 成立，且比 Sanity 统计的 6.8% 更严重（该篇 4.3%）。** 页面没有任何"英文原文"提示。

---

## 3. 产品配图：**报告原结论错误，已修正**

原报告写"28 个产品 0 图，详情页只有图标，无产品视觉"。线上抽查：

| 产品 URL | HTTP | Hero 图 |
|----------|:----:|---------|
| `/en/products/core-switches` | 200 | `/images/products/real/switches.jpg` |
| `/en/products/ai-agent-development` | 200 | `/images/products/real/ai-agent.jpg` |
| `/en/products/incident-response` | 200 | `/images/products/real/incident-response.jpg` |
| `/en/products/hyper-converged-infrastructure` | 200 | `/images/products/real/hci.jpg` |

代码侧原因：`ProductDetail.tsx:71` 用 `productImages[slug]`，映射定义在
`products/shared.tsx:90-119`，共 **28 个 slug → 28 张本地图**；`public/images/products/real/` 下有 34 个文件。

**错在哪：** 我只查了 Sanity 的 `image` 字段（0/28）并用 `grep "<img"` 找详情页图片，而详情页用的是 Next.js `<Image>` + 本地映射。两个检查都漏了。

**修正：**
- 这不是"缺图"，是"两套来源"（CMS 字段空转 + 本地映射在用）。
- 报告 M02 综合 74% → **79%**（内容轴 60→72，可用轴 75→78）。
- TODO T-072 从 P1「产品配图（28 个）」降为 P2「产品视觉单一来源」，验收改为"二选一 + 28 张图 200"，不再要求补图。

---

## 4. 本轮未能线上验证的

| 项 | 原因 |
|----|------|
| `leads` / `search_logs` 是否存在 | 无数据库连接；anon key 只能走 PostgREST，且页面 bundle 未暴露 key |
| 是否为静态渲染 / ISR | 只能看构建产物，外部无法判断 |
| 管理员工单闭环 | 需登录账号 |
| 暗色模式 / 移动端 | 需浏览器渲染 |
| TCO 价格、Odoo 同步 | 需业务数据 / CRM 权限 |

---

## 5. 对行动清单的影响

| 任务 | 变化 |
|------|------|
| T-067 CSP | 证据从"代码推断"升级为"线上响应头确认" |
| T-063 中文博客 | 证据从 Sanity 统计升级为"线上页面实测 4.3%" |
| T-072 产品视觉 | P1 → P2，不再补图，改为双源收敛 |
| M02 评分 | 74% → 79% |
