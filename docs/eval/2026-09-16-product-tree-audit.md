# 产品树架构校验：Pillar → Solution → Vendor Options

**基准（你定义）**:  
`Build/Run/Protect` → Solution（如 AIGC、HCI、无线 AP）→ **多厂商 Vendor Options**（Sangfor HCI / Huawei DCS / H3C UIS / Nutanix NCP / …）

**数据源**: Sanity 28 products + `relatedVendors[]` + 详情 UI + 导航  
**日期**: 2026-09-16

---

## 1. 架构符合度总览

| 层级 | 期望 | 现状 | 判定 |
|------|------|------|------|
| L1 Pillar | Build / Run / Protect | category 三值齐全；UI 三 Tab | ✅ |
| L2 Solution | 产品/solution 条目 | 28 条 product = Solution | ✅ |
| L3 Vendor Options | 每 Solution **多个** vendor+产品名 | **28/28 均有 relatedVendors（2–4 家）** | ✅ 数据层 |
| 详情页展示 | Vendor Options 可见 | ProductDetail「Related Vendor Solutions」卡片 | ✅ |
| 列表页展示 | 是否露出 vendor | **列表只显示 solution 标题+图标/图**，无 vendor | ⚠ |
| 导航 | VMware∈Run；Why TechGuru 一级 | 本轮已按你决策调整 | ✅ 见 §4 |
| 图片 | 多 vendor 场景 | **每 solution 一张 Hero**，无法表达多厂商 | ⚠ 策略问题 |

**结论**: **数据模型已符合你的三层树**；主要差距在 **展示层（列表未露 vendor、图无法多厂商）** 与 **少数 vendor 清单缺口**。

---

## 2. 三层树现状（CMS 实查）

```
Products
├── Build (5 solutions) — 全部有 3–4 vendor options
│   ├── AI Adoption Services → ByteDance / Alibaba / Huawei
│   ├── AIGC → ByteDance Seedance·即梦 / Alibaba Wan·HappyHorse·CosyVoice
│   ├── AI-Assisted Coding → MarsCode / 通义灵码 / CodeArts
│   ├── AI Agent → Coze / Qwen-Agent / Pangu Agent
│   └── Legacy AI → Pangu / Qwen / 豆包
├── Run (15)
│   ├── Infrastructure (7) — 虚拟化/HCI/云迁移/云回迁/存储/托管/BCDR
│   ├── Routing & Switching (4)
│   └── Wireless (4)
└── Protect (8) — NGFW/WAF/EDR/NDR/云安全/SD-WAN/MDR/IR
```

### 与你的举例对照

| 你的举例 | CMS 现状 | 差距 |
|----------|----------|------|
| AIGC: Seedance、即梦、HappyHorse | ✅ ByteDance+Alibaba 均在 | 可补 **Huawei** 若业务有 |
| HCI: Sangfor / Huawei DCS / H3C UIS / Nutanix NCP / **VMware vSphere** | 现有: Nutanix NX、H3C UIS、Huawei FusionCube | **缺 Sangfor HCI、缺 VMware vSphere** |
| 无线 AP: Ruijie / **Sundray** / Huawei / H3C / **Aruba** | 现有: Huawei / H3C / Ruijie / Sangfor | **缺 Sundray、Aruba** |

---

## 3. 差距清单（按优先级）

### P0 数据缺口（Sanity 补 relatedVendors）

| Solution | 建议补的 Vendor Options |
|----------|-------------------------|
| **hyper-converged-infrastructure** | **Sangfor** aServer/aCloud HCI；**VMware** vSphere Foundation（若仍作对比/迁移源） |
| **server-virtualization-platform** | 已有 Sangfor aCloud；可强调与 VMware 对照 |
| **enterprise-wireless-ap** / wifi6 | **Sundray**、**Aruba**（若代理） |
| **core-switches** 等 | 已较全；按真实代理清单微调 |

### P1 展示层

| 差距 | 说明 | 建议 |
|------|------|------|
| 列表不显示 Vendor Options | 用户在 Products 总览看不到「一家 solution 多家厂」 | 卡片下增加 vendor 色点/名称条（最多 3 + +N） |
| 详情 Vendor 用通用 Building2 | 无品牌辨识 | 厂商色块+字标（已有色）或 logo 文件 |
| Hero 单图 | 一张设备图无法表达 5 家 vendor | 详情改为「Solution 概览图 + Vendor Options 网格」为主；图仅作氛围 |
| Build 无 subgroup | Run 有分组，Build/Protect 平铺 | 可选：Build 按 AI 服务类型分组 |
| VMware Alternatives 页 | 应与 Run·HCI/虚拟化 vendor 矩阵对齐 | 核对页面是否列 Sangfor/Huawei/StarWind/Nutanix |

### P2 导航/信息架构（已按你的决策实现）

见 §4。

---

## 4. 导航落地（你的决策）

| 决策 | 实现 |
|------|------|
| VMware Alternatives ∈ **Run** | Products 下拉顺序：Build → **Run → VMware Alternatives → TCO** → Protect；desc 标明 Run·Sangfor/Huawei/StarWind/Nutanix |
| **Why TechGuru** 一级公民 | 顶栏与 Home、Products 同级 → `/compare`；Footer **Company** 列增加 Why TechGuru |
| 不塞进 Products 当 SKU | Compare 不再作为 Products 子项 |

---

## 5. 图片策略修正（相对上一轮「一厂商一图」）

按你「多厂商 Vendor Options」模型：

1. **Solution 主图** = 场景/机房氛围（可无单一厂商霸屏）  
2. **Vendor Options** = 文字/色块/小 logo 列表（数据已有）  
3. 若坚持设备图带厂商 Logo：应做成 **Vendor 级资产**（`vendor/sangfor-hci.jpg`），挂在 Vendor Option 上，而不是 28 个 solution 各绑一家  

**待你确认**: 图片是否改为「Solution 场景图 + Vendor 卡片 logo」？

---

## 6. 建议下一步（审批后执行）

1. Sanity 补 HCI（Sangfor/VMware）、无线（Sundray/Aruba）等 vendor  
2. 产品列表卡片露出 Vendor Options  
3. Vendor 卡片用品牌色字标（可选小图）  
4. 核对 VMware Alternatives 页厂商列表 = Sangfor/Huawei/StarWind/Nutanix  
5. 再定图片：场景图 vs 厂商设备图库  

**导航代码已按你的决策修改，待构建部署。**
