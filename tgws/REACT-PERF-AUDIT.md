# Vercel React Best Practices 全站审计报告

## 审计范围：20个文件，70条规则，18个违规

---

## CRITICAL 级违规（3个）

### WF-01: 文件上传串行执行
- **文件**: `src/components/tickets/TicketForm.tsx:102-115`
- **问题**: 多个附件在for...of循环中逐个await上传，3个10MB附件耗时3倍
- **修复**: `await Promise.all(files.map(f => uploadSingle(ticketId, f)))`

### BS-01: HeroSection未懒加载
- **文件**: `src/app/[locale]/home/page.tsx:6`
- **问题**: 302行的HeroSection（视频播放器+打字机+鼠标追踪）静态导入，每次访问首页都加载
- **修复**: `dynamic(() => import('@/components/hero/HeroSection'), { ssr: false })`

### BS-02: 行内style jsx global
- **文件**: `src/app/[locale]/home/page.tsx:306-338`
- **问题**: ~30行CSS关键帧在`<style jsx global>`中，绕过Next.js CSS提取，膨胀JS bundle
- **修复**: 将fadeUp/nodePop/lineGrow移到globals.css

---

## HIGH 级违规（6个）

### WF-02: 无Suspense边界
- **文件**: 全站
- **问题**: 没有使用`<Suspense>`进行流式渲染，整个页面被单一loading状态阻塞
- **修复**: 在TicketForm、TicketList等组件外包裹`<Suspense>`

### BS-03: framer-motion重复引入
- **文件**: vmware-alternative/page.tsx, about/page.tsx, ProductsList.tsx, CaseStudiesList.tsx, BlogList.tsx, BlogDetail.tsx, CaseStudyDetail.tsx（7个文件）
- **问题**: 7个页面引入framer-motion（~40KB gzip）只为简单滚动淡入，与已有的scroll-reveal功能重复
- **修复**: 替换为CSS `scroll-reveal`类 + layout.tsx中已有的IntersectionObserver

### BS-04: 字体加载阻塞
- **文件**: `src/app/globals.css:1-2`
- **问题**: CSS @import加载HelveticaNowDisplay阻塞渲染
- **修复**: 改用next/font或link preload

### SS-01: 字体未提升到模块级
- **文件**: `src/app/[locale]/layout.tsx`
- **问题**: 字体配置在组件内部，每次请求重新执行
- **修复**: 提升到模块顶层

### CS-01: 滚动监听非passive
- **文件**: `src/app/layout.tsx:54`
- **问题**: scroll事件监听未添加`{ passive: true }`
- **修复**: `window.addEventListener('scroll', ..., { passive: true })`

### RR-01: 组件内定义组件
- **文件**: `src/app/[locale]/home/page.tsx`（内联样式组件）
- **问题**: JSX中内联定义导致每次渲染重新创建
- **修复**: 提取到模块级

---

## MEDIUM 级违规（9个）

### RR-02: useState未惰性初始化
- **文件**: ProductsList.tsx, CaseStudiesList.tsx, BlogList.tsx
- **问题**: 初始值为静态数据但未用函数形式
- **修复**: `useState(() => staticData)`

### RR-03: useEffect依赖整个对象
- **文件**: support/page.tsx:58
- **问题**: `[supabase]`依赖整个客户端对象
- **修复**: 提取为`const supabaseClient = useMemo(() => createClient(), [])`

### JP-01: 重复数组迭代
- **文件**: home/page.tsx, ProductsList.tsx
- **问题**: 多次.filter().map()链式调用
- **修复**: 合并为单次循环

### JP-02: 循环内重复属性访问
- **文件**: ProductsList.tsx:139-144
- **问题**: 循环内多次访问`product.slug?.current`
- **修复**: 提取为局部变量

### RP-01: 条件渲染用&&而非三元
- **文件**: 多个页面
- **问题**: `{count && <span>}` 当count为0时渲染"0"
- **修复**: `{count > 0 ? <span>{count}</span> : null}`

### RP-02: 静态JSX未提升
- **文件**: 多个页面的loading骨架屏
- **问题**: 每次渲染重新创建相同JSX
- **修复**: 提取为模块级常量

### JP-03: RegExp循环内创建
- **文件**: `src/app/api/contact/route.ts:16`
- **问题**: 每次请求重新创建email正则
- **修复**: 提升到模块级`const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### JP-04: 未使用Set进行O(1)查找
- **文件**: ProductsList.tsx:115
- **问题**: `group.slugs.includes()`在循环中O(n)查找
- **修复**: `const slugSet = new Set(group.slugs)`

### RR-04: 未使用startTransition
- **文件**: ProductsList.tsx, CaseStudiesList.tsx, BlogList.tsx
- **问题**: 标签切换直接setState，无过渡动画
- **修复**: `startTransition(() => setActiveTab(key))`

---

## 修复优先级

| 优先级 | 违规 | 预期收益 | 工作量 |
|--------|------|---------|--------|
| P0 | BS-01 HeroSection懒加载 | 首屏加载减少30% | 小 |
| P0 | BS-03 framer-motion→CSS | 7个页面各减40KB | 中 |
| P0 | WF-01 并行上传 | 附件上传速度提升3x | 小 |
| P1 | BS-02 style jsx→globals.css | 减少JS bundle | 小 |
| P1 | BS-04 字体加载优化 | 首屏渲染提速 | 小 |
| P1 | CS-01 passive listener | 滚动性能提升 | 小 |
| P2 | 其余12个MEDIUM违规 | 代码质量提升 | 中 |
