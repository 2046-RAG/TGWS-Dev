# Vercel Optimize 全站审计报告

## 审计方式：代码级扫描（无Observability Plus）
## 审计时间：2026-07-04
## 项目：tgws (techguru-it.asia)

---

## 平台配置发现

### P0 — 安全头重复定义
- **问题**: `vercel.json` 和 `next.config.ts` 同时定义了相同的安全头（X-Frame-Options、X-Content-Type-Options等）
- **影响**: HTTP响应中出现重复头，部分浏览器可能行为不一致
- **修复**: 删除 `vercel.json` 中的 `headers` 配置，只保留 `next.config.ts` 中的定义

### P0 — 未使用依赖膨胀
- **问题**: `framer-motion`（~40KB gzipped）和 `styled-components` 已无任何文件导入，但仍声明在 `package.json`
- **影响**: 每次 `npm install` 下载无用包，增加node_modules体积
- **修复**: 从 `package.json` 删除这两个依赖

### P1 — CSP策略过于宽松
- **问题**: Content-Security-Policy 包含 `'unsafe-inline'` 和 `'unsafe-eval'`
- **影响**: 降低XSS防护等级
- **修复**: 移除 `'unsafe-eval'`（Next.js不需要），`'unsafe-inline'` 保留（Next.js需要）

### P1 — 单区域部署
- **问题**: `vercel.json` 配置 `"regions": ["hkg1"]` 只部署到香港
- **影响**: 非亚洲用户访问延迟高
- **修复**: 删除regions限制，使用Vercel默认的边缘网络（全球CDN）

### P2 — 字体加载阻塞
- **问题**: `globals.css` 使用 `@import` 加载HelveticaNowDisplay字体，阻塞首屏渲染
- **影响**: 首次访问白屏时间增加
- **修复**: 改用 `next/font` 或 `<link rel="preload">`

### P2 — 无ISR策略
- **问题**: 所有页面要么全静态要么全动态，没有使用ISR（增量静态再生）
- **影响**: 内容更新需要完全重新构建
- **修复**: 对博客、案例等不频繁更新的页面启用ISR

### P3 — 图片未优化
- **问题**: 项目使用原生 `<img>` 标签而非Next.js `<Image>` 组件
- **影响**: 无自动格式转换（WebP/AVIF）、无尺寸优化、无懒加载
- **修复**: 关键图片改用 `next/image`（Sanity图片已通过urlFor处理，可配置loader）

---

## 优化建议汇总

| 优先级 | 建议 | 预期收益 | 工作量 |
|--------|------|---------|--------|
| P0 | 删除vercel.json重复头 | 消除重复HTTP头 | 小 |
| P0 | 删除framer-motion+styled-components | 减少~50KB install | 小 |
| P1 | 移除CSP中的unsafe-eval | 增强XSS防护 | 小 |
| P1 | 删除regions限制，用全球CDN | 非亚洲用户提速 | 小 |
| P2 | 字体加载改next/font | 首屏提速 | 中 |
| P2 | 博客/案例启用ISR | 减少重建频率 | 中 |
| P3 | 关键图片改next/image | 图片加载优化 | 大 |
