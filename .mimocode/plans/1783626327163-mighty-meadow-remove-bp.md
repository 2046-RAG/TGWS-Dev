# 移除Best Practice + 强化Blog方案

## 1. 目标

1. 删除Best Practice页面（虚假案例不维护）
2. 强化Blog，作为展示技术专业能力的主阵地
3. Blog定位：技术大杂烩，从入门到专家级，从500字到5000字

## 2. 影响范围

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app/[locale]/case-studies/` | 删除 | Best Practice页面目录 |
| `src/components/layout/MegaMenu.tsx` | 修改 | 移除导航链接 |
| `src/app/sitemap.ts` | 修改 | 移除case-studies URLs |
| `src/components/ui/JsonLd.tsx` | 检查 | 移除相关结构化数据 |
| `src/app/[locale]/layout.tsx` | 检查 | 移除相关引用 |

## 3. SEO处理

### 301重定向规则

```
/en/case-studies → /en/blog
/zh/case-studies → /zh/blog
/en/case-studies/[slug] → /en/blog (或相关文章)
/zh/case-studies/[slug] → /zh/blog
```

### 实现方式

在 `next.config.ts` 中添加 redirects:

```typescript
async redirects() {
  return [
    {
      source: '/:locale/case-studies',
      destination: '/:locale/blog',
      permanent: true,
    },
    {
      source: '/:locale/case-studies/:slug',
      destination: '/:locale/blog',
      permanent: true,
    },
  ];
}
```

## 4. 执行步骤

### 阶段A：移除Best Practice

| 步骤 | 任务 | 依赖 |
|------|------|------|
| A1 | 在next.config.ts添加301重定向 | 无 |
| A2 | 修改MegaMenu移除导航链接 | 无 |
| A3 | 修改sitemap.ts移除URL | 无 |
| A4 | 删除case-studies页面目录 | A1-A3完成 |
| A5 | 检查并清理相关引用 | A4完成 |

### 阶段B：强化Blog

| 步骤 | 任务 | 依赖 |
|------|------|------|
| B1 | 在Blog添加architecture分类 | 无 |
| B2 | 创建10篇架构设计文章 | B1完成 |
| B3 | 更新Blog列表页支持新分类 | B1完成 |
| B4 | 测试和部署 | B2-B3完成 |

## 5. Sanity数据处理

### Best Practice数据

**建议：保留但不展示**

- `caseStudy` schema 保留（未来可能有用）
- 数据保留（不删除）
- 前端不再展示
- 301重定向到Blog

### Blog内容策略

**分类（保持简单）：**

| 分类 | 说明 |
|------|------|
| technical | 技术文章（所有技术内容） |
| industry | 行业分析 |
| news | 公司新闻 |

**标签系统（灵活筛选）：**

标签无限制，根据内容自由添加，例如：
- 产品标签：`vmware`, `sangfor`, `fortinet`, `nutanix`, `proxmox`
- 技术标签：`hci`, `disaster-recovery`, `sdwan`, `firewall`, `virtualization`
- 内容类型标签：`tutorial`, `comparison`, `architecture`, `quick-tip`

**内容深度：**

| 深度 | 字数 | 示例 |
|------|------|------|
| 快速提示 | 300-800字 | "如何配置FortiGate VLAN" |
| 入门指南 | 800-1500字 | "什么是HCI？5分钟了解" |
| 技术对比 | 1500-3000字 | "VMware vs Proxmox: 2025 Comparison" |
| 深度指南 | 3000-5000字 | "VMware SRM Disaster Recovery Design Guide" |

**第一批文章（10篇，涵盖不同深度）：**

1. VMware SRM Disaster Recovery: Complete Design Guide (深度)
2. Migrating from VMware to Sangfor HCI: Step-by-Step (教程)
3. VMware vSphere 8: What's New and Should You Upgrade? (对比)
4. How to Configure NSX-T for Enterprise Networks (教程)
5. VMware vs Proxmox vs Sangfor: Virtualization Comparison (对比)
6. Nutanix HCI for Healthcare: Architecture Guide (深度)
7. Zero Trust Network: Beginner's Guide (入门)
8. FortiGate vs Palo Alto vs Sangfor: Firewall Comparison (对比)
9. SD-WAN for Multi-Branch: Design Guide (深度)
10. Hybrid Cloud: On-Premises + AWS Integration (深度)

## 6. 验证清单

### Best Practice移除验证

- [ ] 301重定向生效（/en/case-studies → /en/blog）
- [ ] 导航菜单不再显示Best Practice
- [ ] Sitemap不再包含case-studies URLs
- [ ] 404页面不再出现

### Blog强化验证

- [ ] 标签筛选功能正常
- [ ] 10篇新文章内容完整
- [ ] 不同深度文章正常显示
- [ ] Playwright截图验证

## 7. 风险

| 风险 | 缓解 |
|------|------|
| SEO权重丢失 | 301重定向保留权重 |
| 外部链接失效 | 重定向到Blog |
| 用户习惯改变 | 导航清晰指引 |
| 内容工作量 | 10篇分批完成，优先核心5篇 |
| 内容质量 | 专注我们代理的产品（Sangfor/Fortinet/Nutanix），确保专业性 |
