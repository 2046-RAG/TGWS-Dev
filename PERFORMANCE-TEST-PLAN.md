# TGWS 性能测试计划

**版本:** 1.0.0
**日期:** 2026-06-30
**目标:** Core Web Vitals达标 + Bundle优化
**工具:** Lighthouse, Web Vitals, Next.js Bundle Analyzer

---

## 一、性能指标目标 (PRD [S2.3])

| 指标 | 目标值 | 说明 |
|------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 最大内容绘制 |
| FID (First Input Delay) | < 100ms | 首次输入延迟 |
| CLS (Cumulative Layout Shift) | < 0.1 | 累积布局偏移 |
| TTFB (Time to First Byte) | < 800ms | 首字节时间 |
| TTI (Time to Interactive) | < 3.5s | 可交互时间 |
| Total Blocking Time | < 300ms | 总阻塞时间 |

## 二、页面性能测试

### 2.1 各页面Lighthouse评分

| 页面 | 预期Performance | 预期Accessibility | 预期Best Practices | 预期SEO |
|------|----------------|-------------------|-------------------|---------|
| /en/home | >= 90 | >= 95 | >= 95 | >= 90 |
| /en/products | >= 90 | >= 95 | >= 95 | >= 90 |
| /en/solutions | >= 90 | >= 95 | >= 95 | >= 90 |
| /en/contact | >= 90 | >= 95 | >= 95 | >= 90 |
| /en/support | >= 85 | >= 95 | >= 95 | >= 90 |
| /en/about | >= 90 | >= 95 | >= 95 | >= 90 |
| /en/blog | >= 90 | >= 95 | >= 95 | >= 90 |
| /en/case-studies | >= 90 | >= 95 | >= 95 | >= 90 |

### 2.2 Hero Section性能 (PRD [S5])

| 测试项 | 方法 | 目标 | 状态 |
|--------|------|------|------|
| 视频加载时间 | performance.getEntriesByType | < 3s | ⚠️ CDN依赖 |
| 视频文件大小 | 检查Cloudfront资源 | < 5MB | ⚠️ 待确认 |
| 打字机CPU占用 | Performance Monitor | < 5% | ✅ 纯CSS+JS |
| 鼠标跟随延迟 | requestAnimationFrame检查 | < 16ms | ✅ RAF优化 |
| fastSeek支持 | Chrome/FF/Safari测试 | 主流浏览器 | ✅ 降级处理 |

## 三、Bundle分析

### 3.1 构建产物

| 指标 | 当前值 | 目标值 | 状态 |
|------|--------|--------|------|
| 总JS大小 | 待测量 | < 500KB | ⚠️ 待分析 |
| 首屏JS | 待测量 | < 200KB | ⚠️ 待分析 |
| CSS大小 | 待测量 | < 100KB | ⚠️ 待分析 |
| 页面数量 | 33 | - | ✅ |

### 3.2 依赖审计

| 包名 | 用途 | 替代方案 | 优化建议 |
|------|------|----------|----------|
| next (16.2.9) | 框架 | 无 | - |
| react (19) | UI库 | 无 | - |
| next-intl | i18n | 无 | - |
| lucide-react | 图标 | 无 | 按需导入 |
| date-fns | 日期格式化 | dayjs | 可替换减小体积 |
| framer-motion | 动画 | CSS animations | 已大部分替换 |

## 四、网络性能

### 4.1 CDN配置 (Vercel)

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Edge Network | 全球CDN | Vercel默认 |
| ISR/SSG | 混合 | 静态页面SSG, 动态SSR |
| 压缩 | Brotli | Vercel自动 |
| HTTP/2 | 启用 | Vercel默认 |
| 图片优化 | next/image | 自动WebP/AVIF |

### 4.2 缓存策略

| 资源类型 | 缓存头 | 说明 |
|----------|--------|------|
| 静态页面 | s-maxage=31536000 | 1年CDN缓存 |
| API响应 | no-cache | 动态不缓存 |
| JS/CSS | contenthash | 自动失效 |
| 字体 | cache-control: max-age=31536000 | 长期缓存 |

## 五、性能优化建议

| # | 建议 | 优先级 | 预期效果 |
|---|------|--------|----------|
| 1 | Hero视频懒加载 | 中 | 减少首屏加载 |
| 2 | 替换date-fns为dayjs | 低 | 减小~50KB |
| 3 | 移除剩余framer-motion | 低 | 减小~30KB |
| 4 | 实施图片CDN优化 | 中 | 加速图片加载 |
| 5 | 添加resource hints | 低 | 预连接外部资源 |

## 六、测试方法

```bash
# Lighthouse审计
npx lighthouse https://tgws.vercel.app --output=json --output-path=./lighthouse-report.json

# Bundle分析
ANALYZE=true npm run build

# 性能监控
# 在Chrome DevTools > Performance面板录制
```
