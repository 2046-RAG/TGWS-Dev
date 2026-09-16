# 厂商 Battlecard 草稿（待审批 · 未上线）

**范围**: 优先 HCI / 虚拟化 / NGFW / 无线 AP（其余可按同模板扩）  
**维度**: 公司规模 · 目标客群 · 方案组件 · 优势 · 劣势  
**来源**: 公开资料整理，非厂商官方口径；**上线前需你法务/商务确认**  
**日期**: 2026-09-16  

---

## 使用说明

- Battlecard 挂在对应 Solution 详情的 Vendor Options 下（展开卡片）  
- 「劣势」用中性表述，避免贬损性措辞  
- 建议每条优势/劣势 ≤ 25 字，便于卡片 UI  

---

## 1. Hyper-Converged Infrastructure（HCI）

| 维度 | Sangfor aCloud / aServer | Nutanix NX / NCP | H3C UIS | Huawei FusionCube | VMware vSAN / VCF（对照） |
|------|--------------------------|------------------|---------|-------------------|---------------------------|
| **公司规模** | 中国头部网安+云计算厂商，全球有分支 | 美国上市 HCI 标杆，全球企业市场 | 新华三（紫光），中国网络与算力主力 | 华为，全球 ICT，政企生态强 | Broadcom 收购后的企业虚拟化巨头 |
| **目标客群** | 中国及亚太政企、安全敏感行业 | 全球中大型企业、多云 | 中国政企、教育、园区 | 中国大型政企、运营商、全球伙伴渠道 | 存量 VMware 企业、需生态兼容者 |
| **方案组件** | aSV 虚拟化 + aSAN 存储 + aNET 网络 + 统一管理 | AOS + AHV（可选 ESXi）+ NCM 管理 | UIS 计算存储融合 + 管理 | FusionCube 计算存储 + FusionSphere 管理 | vSphere + vSAN + NSX + Aria |
| **优势** | 安全能力内生；本地交付快；许可模式灵活；对国内信创场景友好 | 软件成熟度高；多云扩展；运维体验好；生态文档全 | 网络基因强；性价比；与园区网一体交付 | 全栈自研；政企服务网；与华为网络/存储协同 | 生态最大；ISV/人才储备深；混合云工具链完整 |
| **劣势** | 海外生态与文档相对少；高端全球案例弱于 Nutanix/VMware | 许可与硬件绑定成本偏高；中国本地化节奏看区域 | 虚拟化软件深度弱于专业 HCI 厂商 | 方案颗粒度粗，中小场景偏重 | 许可复杂且近年涨价；被 Broadcom 收购后策略不确定 |
| **TechGuru 话术** | 安全+HCI 一体、迁移周期短 | 全球标杆、运维省心 | 网络+HCI 一栈 | 全栈国产生态 | 保留投资、分阶段替换 |

---

## 2. Server Virtualization

| 维度 | Sangfor aSV | Proxmox VE | Nutanix AHV | Huawei FusionSphere | VMware vSphere |
|------|-------------|------------|-------------|---------------------|----------------|
| **公司规模** | 同上 | 开源社区+商业支持公司 | 同上 | 同上 | 同上 |
| **目标客群** | 亚太政企 | 中小/实验室/成本敏感 | 中大型企业 | 中国政企 | 全球企业存量 |
| **方案组件** | aSV + 管理 | KVM + LXC + 集群 | AHV + AOS | FusionSphere | ESXi + vCenter |
| **优势** | 与安全栈联动；买断制可选 | 开源零许可费；轻量 | 与 HCI 一体；无额外 hypervisor 费 | 与华为硬件协同 | 生态与人才 |
| **劣势** | 第三方生态较浅 | 企业级支持与生态弱于商业方案 | 绑定 Nutanix 平台 | 国际生态有限 | 成本与授权复杂 |
| **TechGuru 话术** | 降本且可管 | 极致性价比 | 简化栈 | 信创/华为栈 | 平滑兼容路径 |

---

## 3. Next-Gen Firewall（NGFW）

| 维度 | Fortinet FortiGate | Sangfor NGAF | Hillstone SG-6000 | Sophos XGS |
|------|-------------------|--------------|-------------------|------------|
| **公司规模** | 全球网安龙头之一 | 中国网安头部 | 中国专业防火墙厂商 | 全球端点+网关安全 |
| **目标客群** | 全球中大型、MSSP | 中国政企、等保场景 | 中国政企、运营商 | 中小及中型企业 |
| **方案组件** | NGFW + Security Fabric + SD-WAN | NGAF 应用层安全 + 检测 | NGFW + 未知威胁检测 | XGS + Synchronized Security |
| **优势** | 性能与功能面广；Fabric 生态 | 应用识别与国内业务适配好 | 性价比；硬件稳定 | 与端点联动简单 |
| **劣势** | 价格与学习曲线 | 海外生态较弱 | 品牌国际认知弱 | 高端数据中心场景较弱 |
| **TechGuru 话术** | 一栈安全 | 国内合规+应用层 | 高性价比边界 | 端点+网关联动 |

---

## 4. Enterprise Wireless AP

| 维度 | Huawei AirEngine | H3C WA | Ruijie RG-AP | Sundray | Aruba (HPE) |
|------|------------------|--------|--------------|---------|-------------|
| **公司规模** | 全球 ICT | 中国网络主力 | 中国无线市占高 | 中国无线专业厂 | HPE 全球无线标杆 |
| **目标客群** | 大型园区/全球 | 政企园区 | 教育/中小企业/连锁 | 教育/政企 | 全球企业园区 |
| **方案组件** | AP + AC + iMaster NCE | AP + AC + AD-Campus | AP + AC + 云管理 | AP + AC | AP + Central 云管 |
| **优势** | Wi-Fi 6/7 领先；全栈协同 | 有线无线一体 | 交付快、性价比 | 专注无线、教育场景 | 云管体验与全球案例 |
| **劣势** | 成本偏高 | 国际生态一般 | 高端场景深度看项目 | 品牌与产品线宽度有限 | 国内交付与价格 |
| **TechGuru 话术** | 高密园区 | 园区一体 | 快速落地 | 教育优选 | 国际标准云管 |

---

## 5. 与你决策的对应

| 你的决定 | 落地 |
|----------|------|
| HCI 补 Sangfor | Studio `relatedVendors` 增加 Sangfor aCloud HCI |
| 保留 VMware 对照 | 建议默认 **VMware vSphere Foundation / VCF + vSAN**（企业最常见） |
| 无线补 Sundray / Aruba | Studio 增加两家；logo 文件 `public/logos/sundray.png`、`aruba.png` |
| 标题维持 Related Vendor Solutions | 不改 UI 文案 |
| 厂商用统一英文 Logo | `VendorLogo` 组件（80×32 object-contain）；缺文件回退文字牌 |

---

## 6. 待你审批

- [ ] 批准本草稿结构与中性「劣势」表述  
- [ ] 确认 VMware 对照品牌：**vSphere Foundation** / **VCF** / 其它：____  
- [ ] 批准后：写入 Sanity `vendorBattlecard` 或 i18n，详情页 Vendor 卡可展开  
- [ ] 补 logo 文件：Sundray / Aruba（可你提供官方英文 logo PNG）  

**未批准前不上线 battlecard 文案。**
