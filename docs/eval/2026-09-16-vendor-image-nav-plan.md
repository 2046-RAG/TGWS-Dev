# 厂商×产品图片矩阵 + 导航信息架构计划（待审批 · 未生成图片）

**日期**: 2026-09-16  
**状态**: 仅计划 · **禁止在批准前批量生图**  
**数据源**: Sanity `product.relatedVendors` + Compare 认证列表 + Home partner 墙  

---

## 一、AI 产品图规范（你已定 + 我方执行约束）

| 规则 | 执行标准 |
|------|----------|
| 无水印 | Prompt 明确 no watermark / no text overlay；交付前目视抽检 |
| **设备上可见厂商名/Logo** | 机箱前面板丝印厂商字标 + 品牌色饰条（如 Sangfor 蓝、Fortinet 红） |
| 一机一图不重复 | 每个 slug **独立**构图/机位/色温；禁止复用同一底图改色 |
| 真实感 | 机房冷通道/工作室台面、金属反光、端口/指示灯细节；写实摄影，非插画 |
| 分辨率 | 1536×1024（16:9），文件名 = slug.jpg，覆盖 `public/images/products/real/` |

**主视觉厂商策略（建议）**：每个产品选 **1 个主推厂商** 做 Hero（与 relatedVendors 第一条或品牌主推一致），避免一张图塞多个 Logo。

---

## 二、厂商 × 产品矩阵（请逐行审批）

### A. Build · AI（无机架硬件，用「平台/工作站」意象 + 厂商色/字标）

| 产品 slug | 产品名 | 主推厂商（图上 Logo） | 备选厂商 | 图像意象 | 生成？ |
|-----------|--------|----------------------|----------|----------|--------|
| ai-generated-content-aigc | AIGC | **ByteDance**（Seedance/即梦） | Alibaba Cloud | 创作工作站 + 生成界面，机箱/显示器 **ByteDance** 字标 | ☐ |
| ai-assisted-coding | AI Coding | **ByteDance**（MarsCode） | Alibaba 通义灵码 | 开发者终端集群，**ByteDance** | ☐ |
| ai-agent-development | AI Agent | **ByteDance**（Coze） | Huawei 盘古 | Agent 编排大屏/机柜，**ByteDance** | ☐ |
| enterprise-legacy-system-ai-augmentation | Legacy AI | **Huawei**（盘古） | Alibaba Qwen | 旧系统改造+新 AI 机柜，**Huawei** | ☐ |
| ai-adoption-services | AI Adoption | **Alibaba Cloud** | ByteDance | 咨询工作坊白板+云控制台，**Alibaba Cloud** | ☐ |

### B. Run · 基础设施

| 产品 slug | 产品名 | 主推厂商 | 备选 | 图像意象 | 生成？ |
|-----------|--------|----------|------|----------|--------|
| hyper-converged-infrastructure | HCI | **Sangfor** aCloud/aServer | Nutanix | **2U HCI 一体机**，面板 **SANGFOR** | ☐ |
| server-virtualization-platform | 虚拟化 | **Sangfor** aSV / Huawei FusionSphere | Proxmox | 1U 虚拟化服务器，**SANGFOR** 或 **HUAWEI** | ☐ |
| cloud-migration | 云迁移 | **Alibaba Cloud** | Huawei | 云管大屏+迁移网关机，**Alibaba Cloud** | ☐ |
| cloud-repatriation | 云回迁/私有云 | **Nutanix** | Proxmox / Huawei | Nutanix 风格 HCI 节点，**NUTANIX** | ☐ |
| enterprise-storage-solutions | 企业存储 | **Dell** PowerStore | HPE Alletra / Lenovo | 24 盘位存储，**DELL** | ☐ |
| managed-hosting-services | 托管主机 | **Dell** 机架服务器 | HPE | 双路 2U 服务器，**DELL** | ☐ |
| business-continuity-disaster-recovery | BCDR | **Veeam**（软件+备份一体机意象） | StarWind | 备份一体机/磁带库，**VEEAM** | ☐ |
| enterprise-routers | 企业路由 | **Huawei** AR/NE | H3C | 模块化边缘路由器，**HUAWEI** | ☐ |
| core-switches | 核心交换 | **Huawei** S12700 | H3C S12500 / Cisco | 框式核心交换，**HUAWEI** | ☐ |
| access-switches | 接入交换 | **H3C** S5130 | Ruijie | 48 口接入交换机，**H3C** | ☐ |
| aggregation-switches | 汇聚交换 | **H3C** S6520X | Huawei | 汇聚交换机，**H3C** | ☐ |
| enterprise-wireless-ap | 企业 AP | **Huawei** AirEngine | H3C / Ruijie | 吸顶 AP，**HUAWEI** | ☐ |
| wireless-controllers | 无线控制器 | **H3C** WX3500 | Huawei AC | AC 控制器机箱，**H3C** | ☐ |
| outdoor-wireless-ap | 户外 AP | **Ruijie** RG-AP740 | Huawei | 户外抱杆 AP，**RUIJIE** | ☐ |
| wifi-6-7-ap | Wi-Fi 6/7 AP | **H3C** WA6320 | Huawei | Wi-Fi 6 AP 特写，**H3C** | ☐ |

### C. Protect · 安全

| 产品 slug | 产品名 | 主推厂商 | 备选 | 图像意象 | 生成？ |
|-----------|--------|----------|------|----------|--------|
| next-gen-firewall-ips | NGFW | **Fortinet** FortiGate | Sangfor NGAF / Hillstone | 1U 防火墙，**FORTINET** 红饰条 | ☐ |
| web-application-firewall | WAF | **Sangfor** WAF | FortiWeb / Hillstone | WAF 设备，**SANGFOR** | ☐ |
| endpoint-detection-response | EDR | **Sophos** Intercept X | FortiEDR / Sangfor | 办公终端+安全代理，**SOPHOS** | ☐ |
| network-detection-response | NDR | **Fortinet** FortiNDR | Sangfor / Sophos | 旁路检测探针机，**FORTINET** | ☐ |
| cloud-security | 云安全 | **Sangfor** SASE/云安全网关 | FortiCASB | 云安全网关机架，**SANGFOR** | ☐ |
| sd-wan-load-balancing | SD-WAN | **Fortinet** FortiGate SD-WAN | Sangfor / Hillstone | 分支 SD-WAN CPE，**FORTINET** | ☐ |
| managed-detection-response | MDR | **Sophos MDR** / Fortinet | Sangfor SOC | SOC 大屏+机架，**SOPHOS** | ☐ |
| incident-response | 应急响应 | **Fortinet** FortiGuard IR | Sophos | 应急指挥台（偏服务），**FORTINET** 弱字标 | ☐ |

### D. 厂商汇总（去重）

| 厂商 | 涉及产品数（主推） | 品牌色建议 | Logo 位置 |
|------|-------------------|------------|-----------|
| **Sangfor** | HCI、WAF、云安全、（备选 NGFW/虚拟化） | #00A3E0 | 前面板丝印 + 饰条 |
| **Fortinet** | NGFW、NDR、SD-WAN、IR | #EE2E24 | 前面板 + 红条 |
| **Huawei** | Legacy AI、路由、核心交换、企业 AP | #CF0A2C | 面板 **HUAWEI** |
| **H3C** | 接入/汇聚交换、无线 AC、Wi-Fi6 | #00B0F0 | 面板 **H3C** |
| **ByteDance** | AIGC、Coding、Agent | #FE2C55 | 设备/工作站字标 |
| **Alibaba Cloud** | AI Adoption、云迁移 | #FF6A00 | 云终端/机柜字标 |
| **Nutanix** | 云回迁（+HCI 备选） | #00B0D7 | 前面板 **NUTANIX** |
| **Dell** | 存储、托管主机 | #007DB8 | **DELL** |
| **Veeam** | BCDR | #00B248 | 备份一体机 **VEEAM** |
| **Ruijie** | 户外 AP（+接入备选） | #0099FF | **RUIJIE** |
| **Sophos** | EDR、MDR | #FFB800 | 终端/设备 **SOPHOS** |
| HPE / Lenovo / Cisco / Hillstone / Proxmox / StarWind / Sundray | 仅备选/认证墙 | — | **本批不生主图**（避免与主推冲突） |

**建议首批生成（P0，12 张）**：  
HCI-Sangfor · NGFW-Fortinet · 核心交换-Huawei · 接入交换-H3C · 存储-Dell · 企业AP-Huawei · AIGC-ByteDance · WAF-Sangfor · 云回迁-Nutanix · EDR-Sophos · 路由-Huawei · 户外AP-Ruijie  

**第二批（P1，16 张）**：其余 slug 补齐，严格一图一构图。

---

## 三、导航信息架构：为什么「全塞进 Products」失败

### 3.1 失败原因

| 问题 | 说明 |
|------|------|
| **语义错误** | Compare /「为何选择我们」是**决策页**，不是产品 SKU；放进 Products 让用户以为是第 4 类产品 |
| **菜单过载** | Products 下拉从 3 项变成 6+ 项，扫描成本↑，Build/Run/Protect 被稀释 |
| **转化路径断裂** | 用户心智：产品目录 → 评估对比 → 联系。Compare 藏在产品菜单里，评估入口不可见 |
| **SEO/IA 不一致** | `/compare` 是独立落地页，导航应是一级或 Company 级，不是产品子项 |
| **VMware/TCO 位置模糊** | 它们是「替代方案/工具」，更接近 **Solutions 或独立活动页**，不是产品类目 |

### 3.2 建议信息架构（方案 A · 推荐）

```
一级导航
├── Home
├── Products          ← 仅 Build / Run / Protect（纯目录）
│   ├── Build
│   ├── Run
│   └── Protect
├── Solutions         ← 行业 6 项 + VMware Alternative（作为「基础设施现代化」方案）
│   ├── Healthcare … Government
│   └── VMware Alternatives（含页内 TCO 锚点）
├── Why TechGuru      ← 新一级：/compare（对比表 + 证言 + 认证）
├── Blog
├── About
├── Support
└── Contact           ← 保持右侧主 CTA
```

**Footer**

| 列 | 链接 |
|----|------|
| Products | Build / Run / Protect |
| Solutions | 行业 + VMware Alternatives |
| **Company** | About / Blog / **Why Choose Us (/compare)** / Contact |
| Support | Tickets / FAQ |

### 3.3 备选方案 B（若不想加一级菜单）

- Compare 放 **About 下拉**：`About → Why Choose Us / Company Story / Timeline`  
- VMware 仍挂 Solutions 或顶部独立活动链  
- 缺点：对比页曝光弱于一级  

### 3.4 不建议

- 继续把 Compare/VMware/TCO 堆在 Products  
- 为 TCO 单独占一级（它是工具锚点，跟 VMware 走即可）  

---

## 四、待你审批的勾选项

### 图片

- [ ] 批准上表「主推厂商」策略（每图一个主 Logo）  
- [ ] 批准 **P0 12 张** 先做  
- [ ] 或指定：必须改主推厂商的产品 slug 列表：________  

### 导航

- [ ] **方案 A**：Products 只留三类；Compare 升一级「Why TechGuru」；VMware+TCO → Solutions  
- [ ] 方案 B：Compare → About 下拉  
- [ ] 其它：________  

**批准后我再：改导航 → 按矩阵生成/替换图片 → 部署。**  
（当前线上 Products 菜单里的 Compare 入口会在导航方案批准后一并挪正。）
