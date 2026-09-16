# T-055 安全检测报告（线上只读）

**日期**: 2026-09-16  
**范围**: 安全响应头 · OAuth 开放重定向 · CSRF Origin · 字段校验 · 匿名鉴权 · revalidate · i18n/SEO · 上传匿名 · 方法/泄露 · robots/sitemap  
**约束**: 不对生产做限流洪水 / 大文件上传（AGENTS 安全边界）  
**脚本**: `security-readonly-scan.mjs`

## 结果：25 / 25 PASS

| 类 | 结论 |
|----|------|
| 安全头 | XFO DENY · nosniff · Referrer-Policy · HSTS · CSP 均在 |
| OAuth 回调 | `//evil`、`/\evil`、绝对 evil URL **均不外跳** |
| CSRF | 跨域 POST `/api/contact` → **403** |
| 字段校验 | 非法 body → **400**；坏 JSON 原为 500，**已改为 400** 并部署 |
| 匿名 API | tickets / stats / upload → **401** |
| revalidate | 无 secret → **401** |
| i18n/SEO | 无法律裸键；无 tgws.vercel.app；canonical 品牌域 |
| 其它 | DELETE products → 405 无堆栈；robots/sitemap 200 |

## 未在本轮执行（需本地 prod + 账号）

- 限流 429 触发（避免打生产）  
- 工单并发 version 冲突  
- 鉴权矩阵（user/admin/other）  
- 上传 MIME/50MB 边界（匿名已挡）

本地 `.next` 已存在时可继续：`next start` 后跑 `pass5-test-plan.md` S2/S3。
