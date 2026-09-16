# 支柱 → Solution → Vendor Options 树 · 准确性校验与差距评估

**日期**: 2026-09-16  
**目标架构（你定义）**:

```
Build / Run / Protect          ← 三大支柱
  └── Solution（如 AIGC、HCI、无线 AP）
        └── Vendor Options（多家：Sangfor / Huawei / H3C / Nutanix / …）
```

---

## 1. 现状结论（源码 + Sanity + 线上）

| 检查项 | 结果 |
|--------|------|
| 数据模型是否支持三层 | **是** — `product.category` = 支柱；`product` = Solution；`product.relatedVendors[]` = Vendor Options |
| 28 个产品是否都有厂商 | **是 — 28/28**，每家 2–4 个 vendor |
| 产品详情是否展示 Vendor Options | **是** — 区块「Related Vendor Solutions」卡片（厂商名 + 方案名） |
| 线上抽查 HCI / NGFW / 无线 / 核心交换 | **vendorSection=True**；厂商名与 CMS 一致 |
| AIGC 是否含 Seedance / 即梦 / HappyHorse | **是**（ByteDance Jimeng/Seedance、Alibaba Wan/HappyHorse/CosyVoice） |
| 产品列表卡片是否展示厂商 | **否** — 仅详情页有 Vendor Options |
| 首页 Partner 墙 | 扁平 19 家 logo，**未**按 支柱→Solution 树组织 |

**架构方向：已按你的思路实现，不是空的。** 差距在内容完备度、命名、导航归属与列表层曝光。

---

## 2. 三层树抽样（Sanity 实查）

### Build（5 Solutions · 全有厂商）

| Solution | Vendor Options（CMS） |
|----------|----------------------|
| AIGC | ByteDance 即梦/Seedance · Alibaba Wan/HappyHorse/CosyVoice |
| AI Coding | ByteDance MarsCode · Alibaba 通义灵码 · Huawei CodeArts |
| AI Agent | ByteDance Coze · Alibaba Qwen-Agent · Huawei 盘古 |
| Legacy AI | Huawei 盘古 · Alibaba Qwen · ByteDance 豆包 |
| AI Adoption | ByteDance · Alibaba Cloud · Huawei |

### Run（15 Solutions · 全有厂商）

| Solution | Vendor Options | 与你示例对照 |
|----------|----------------|--------------|
| **HCI** | Nutanix NX · **H3C UIS** · Huawei FusionCube | ✅ H3C UIS / Nutanix；**缺 Sangfor HCI**、缺 VMware vSphere |
| **无线 AP** | Huawei AirEngine · H3C WA · Ruijie · Sangfor | ✅ Huawei/H3C/Ruijie；**缺 Sundray、Aruba**；多 Sangfor |
| 核心交换 | Huawei S12700 · H3C S12500 · Cisco C9k · Ruijie | ✅ |
| 接入/汇聚交换 | Huawei · H3C · Ruijie（+Sangfor 分支） | ✅ |
| 无线 AC / 户外 AP / Wi-Fi6 | Huawei · H3C · Ruijie | ✅ |
| 虚拟化 | Nutanix AHV · Proxmox VE · Sangfor aCloud | 部分 |
| 存储 / 托管 | Dell · HPE · Lenovo | ✅ |
| BCDR | Veeam · StarWind · Nutanix Leap | ✅ |
| 云迁移/回迁 | Alibaba · Huawei · Sangfor / Nutanix · Proxmox · Huawei | ✅ |

### Protect（8 Solutions · 全有厂商）

| Solution | Vendor Options |
|----------|----------------|
| NGFW | Fortinet FortiGate · Hillstone · **Sangfor NGAF** · Sophos XGS |
| WAF | FortiWeb · Sangfor · Hillstone |
| EDR / NDR / MDR / 云安全 / SD-WAN / IR | Fortinet · Sophos · Sangfor（+Hillstone） |

---

## 3. 差距清单（准确性）

| ID | 差距 | 严重度 | 说明 |
|----|------|--------|------|
| G1 | **HCI 无 Sangfor** | P1 内容 | 你示例含 Sangfor HCI；CMS 仅 Nutanix/H3C/Huawei。Sangfor 是核心伙伴，**内容缺口** |
| G2 | **HCI 无 VMware vSphere** | P2 策略 | 对比页做 VMware 替代，Solution 树里保留 VMware 作 baseline 可选 |
| G3 | 无线 AP 缺 Sundray / Aruba | P2 | Compare 认证有 Sundray；树内无线未列 |
| G4 | 部分 Vendor 方案名过泛 | P2 | 如「EDR Solution」「NDR Solution」应改为产品名（Sangfor Endpoint Secure 等） |
| G5 | AIGC 重复 vendor 条目 | P2 | ByteDance Seedance 出现两次、Alibaba 两条 — 可合并为「产品线」 |
| G6 | 列表页不展示 Vendor Options | P2 UX | 树只在详情展开；列表看不到「几家可选」 |
| G7 | UI 文案「Related Vendor Solutions」 | P3 | 与你的「Vendor Options」术语不一致，建议改 |
| G8 | 首页 Partner 墙与树脱节 | P3 | 19 家扁平 logo，未链到对应 Solution |
| G9 | 产品图仍是「一 Solution 一图」 | 待你批图矩阵后 | 多 Vendor 时应用「厂商设备图」或图下挂 Vendor Options |
| G10 | VMware 页原缺 Huawei | **已补** | 已加 FusionSphere/FusionCube 为第 5 方案（Sangfor/Huawei/StarWind/Nutanix/Proxmox） |

---

## 4. 导航 IA（按你的裁定）

| 项 | 裁定 | 现状 |
|----|------|------|
| **VMware Alternatives** | 归 **Run** | Products 下拉：Build → **Run → VMware → TCO** → Protect（已按此组织） |
| **Why TechGuru (/compare)** | **一级公民**（与 Home/Products 平级） | 顶栏独立链接「Why TechGuru / 為何選擇我們」（已有） |
| Products 下拉 | 不再塞 Compare | Compare 已从 Products 子项移除 |

```
Home | Products(Build→Run→VMware→TCO→Protect) | Solutions | Why TechGuru | Blog | About | Support | Contact
```

---

## 5. 建议下一步（内容，非生图）

1. **Studio 补 HCI → Sangfor HCI**（及可选 VMware vSphere Foundation）  
2. 无线 AP 补 **Sundray**（已有认证）  
3. 批量把泛化方案名改成厂商正式产品名  
4. 列表卡增加「N vendor options」角标（可选）  
5. UI 标题改为 **Vendor Options**  
6. 生图仍等你批「多厂商」策略后再做（一 Solution 可配主视觉，Vendor 卡用品牌色+字标即可）  

---

## 6. 需要你确认

- [ ] HCI 是否必须补 **Sangfor HCI**？（建议：是）  
- [ ] HCI 是否保留 **VMware vSphere** 作对照 vendor？  
- [ ] 无线是否补 **Sundray / Aruba**？  
- [ ] 详情区标题是否改为 **Vendor Options**？  
- [ ] 生图：一 Solution 一张主图 + Vendor 卡片品牌色，是否接受？（代替「每厂商一张设备图」）  
