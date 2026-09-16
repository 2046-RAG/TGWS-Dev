# 术语全检 + 厂商 Battlecard 草稿 + Logo 策略（待审批）

**日期**: 2026-09-16  
**状态**: 草稿 · **未写入 CMS / 未上线 Battlecard UI**

---

## 1. 术语全检（中立技术方案名）

你确认：**EDR / NDR / HCI 等泛化名是正确的**——指中立技术方案，下层才落到厂商。以下按此标准核对。

### 1.1 结论：整体正确

| 类型 | 判定 | 示例 |
|------|------|------|
| 中立方案名 | ✅ 正确 | HCI、EDR、NDR、MDR、WAF、NGFW、SD-WAN、AIGC、BCDR |
| 支柱词 | ✅ | Build / Run / Protect |
| 硬件类目 | ✅ | Core Switches、Enterprise Routers、Wireless AP |
| 详情 UI「Related Vendor Solutions」 | ✅ 维持（你拍板 #4） |

### 1.2 术语不一致 / 建议微调（非错误，是打磨）

| # | 现状 EN | 现状 ZH | 问题 | 建议 |
|---|---------|---------|------|------|
| T1 | Cloud Platform | 雲平台 | slug 是 `cloud-migration`，名与 slug 语义不完全对齐 | EN 可改为 **Cloud Migration** 或 slug 改名（动 URL，慎） |
| T2 | Hardware | 硬體設備 | slug `enterprise-storage-solutions`，名过泛 | 改为 **Enterprise Storage** / 企業存儲 |
| T3 | Managed Hosting | 託管服務 | slug 含 services | **Managed Hosting Services** / 託管主機服務 |
| T4 | Business Continuity | 業務連續性 | slug 含 disaster-recovery，标题丢了 DR | **Business Continuity & Disaster Recovery** |
| T5 | AI Coding | AI程式開發 | 可接受 | 统一 **AI-Assisted Coding**（与 slug 一致） |
| T6 | Legacy System AI Transformation | 傳統業務智能化改造 | 中英不完全对等 | ZH 建议 **傳統系統 AI 改造** |
| T7 | AI落地服務 | — | 「落地」偏口语 | **AI 導入服務** 或 **AI 採用服務** |
| T8 | 企业级无线AP | — | 中英空格 | **企業級無線 AP**（全半角统一） |

**未发现**把厂商名误当成中立方案名的情况；Vendor 层在 `relatedVendors` 内，与方案名分离 — **符合你的树模型**。

---

## 2. VMware 在 Run 下的专题卡（已实现）

按参考图：Run 标签下与 Infrastructure 等分组并列的**专题入口**。

- 位置：Products → **Run** 标签顶部（无搜索时显示）
- 样式：紫色系 Featured topic 卡
- 链接：现有 `/vmware-alternative`（不新建第二套页面）
- 内容摘要：双 Hypervisor 路径 + 五厂商 + TCO

---

## 3. 厂商 Battlecard 草稿（审批后才上线）

> 来源：公开产品定位与常见对比维度整理；**上线前建议你方销售/售前再核一遍**。  
> 维度：公司规模 · 目标客群 · 方案组件 · 优势 · 劣势  

### 3.1 HCI / 虚拟化（含 VMware 对照）

#### VMware vSphere / VCF（基线）

| 维度 | 草稿 |
|------|------|
| 公司规模 | Broadcom 旗下；全球虚拟化事实标准，生态最大 |
| 目标客群 | 已深度绑定 VMware 的中大型企业、强合规/ISV 认证依赖场景 |
| 方案组件 | ESXi / vCenter / vSAN / NSX（VCF 打包） |
| 优势 | 生态与人才储备最强；ISV 认证最全；运维成熟 |
| 劣势 | **Broadcom 授权涨价与捆绑 VCF**；锁定深；2027 节点压力；许可复杂 |

#### Sangfor aSV / aCloud / FusionAccess 类

| 维度 | 草稿 |
|------|------|
| 公司规模 | 中国头部网安+云厂商；亚太企业/政企份额强 |
| 目标客群 | 中国及亚太中大型政企、希望 VMware 降本与本地服务 |
| 方案组件 | aSV 虚拟化 · aCloud HCI · aNET/aSEC 融合 · 统一管理 |
| 优势 | 软硬一体交付快；安全与虚拟化同栈；本地服务与价格竞争力；VMware 迁移方案成熟 |
| 劣势 | 欧美生态与 ISV 认证弱于 VMware；海外人才池较小；国际案例需个案评估 |

#### Huawei FusionSphere / FusionCube

| 维度 | 草稿 |
|------|------|
| 公司规模 | 全球 ICT 巨头；政企与运营商根基深 |
| 目标客群 | 运营商、大型政企、已有华为数通生态 |
| 方案组件 | FusionSphere 虚拟化 · FusionCube HCI · FusionStorage · iMaster |
| 优势 | 全栈（计算/存储/网络/安全）；大项目交付能力；国产化与信创场景强 |
| 劣势 | 部分国际市场合规/供应受限；项目制偏重，中小客户 TCO 门槛高 |

#### H3C UIS / CAS

| 维度 | 草稿 |
|------|------|
| 公司规模 | 新华三；中国政企网络与计算主力 |
| 目标客群 | 教育/医疗/政府/园区；已有 H3C 数通 |
| 方案组件 | UIS 超融合 · CAS 虚拟化 · 统一运维 |
| 优势 | 与园区网/无线/交换协同好；政企渠道深；性价比与服务网点 |
| 劣势 | 国际品牌认知弱于 VMware/Nutanix；高端生态依赖伙伴 |

#### Nutanix AHV / NCI

| 维度 | 草稿 |
|------|------|
| 公司规模 | 超融合国际一线；多云软件公司 |
| 目标客群 | 追求简单运维的中大型企业、多云 |
| 方案组件 | AOS · AHV · Prism · NCI/NCM |
| 优势 | 开箱即用体验好；AHV 免虚拟化许可费；多云管理强 |
| 劣势 | 硬件与订阅成本不低；对「纯软件自建」客户偏重 |

#### Proxmox VE

| 维度 | 草稿 |
|------|------|
| 公司规模 | 欧洲开源厂商，社区与商业支持双轨 |
| 目标客群 | 技术团队强、预算敏感、要避免许可绑架 |
| 方案组件 | PVE · PBS 备份 · 集群 |
| 优势 | 开源可控、许可简单、KVM+LXC 灵活 |
| 劣势 | 大型政企支持与认证生态弱于商业套件；需自建运维能力 |

#### StarWind HCI

| 维度 | 草稿 |
|------|------|
| 公司规模 | 软件定义存储/双节点 HCI 专精 |
| 目标客群 | 中小与分支、双节点 ROBO |
| 方案组件 | StarWind VSAN / HCI Appliance |
| 优势 | 双节点经济性；可跑 Hyper-V/VMware/Proxmox |
| 劣势 | 超大规模场景与品牌体量小于前三 |

**对比谁 vs VMware（回答你的 #2）**：  
推荐销售话术主轴 — **Sangfor（降本+安全同栈）∥ Nutanix（体验/多云）∥ Proxmox（开源可控）**；Huawei/H3C 用于**已有其数通生态**的客户；StarWind 用于**双节点/ROBO**。  
不是「一个品牌打天下」，而是 **场景分发**。

---

### 3.2 无线 AP（Sundray / Aruba 补录后）

| 厂商 | 客群 | 优势 | 劣势 |
|------|------|------|------|
| Huawei AirEngine | 大型园区、已有华为网 | Wi-Fi6/7 产品线全、与交换协同 | 海外合规场景需评估 |
| H3C WA | 政企园区、教育医疗 | 性价比、渠道服务 | 国际认知有限 |
| Ruijie RG-AP | 中大型商业/教育 | 无线场景方案多 | 高端射频生态依赖项目 |
| **Sundray** | 中大型无线专案 | 无线专注、性价比 | 品牌体量小于华为/H3C |
| **Aruba (HPE)** | 外企/高端办公 | 国际生态、AOS-CX 协同 | 价格与供货周期 |

---

## 4. Vendor Logo 策略（你拍板 #5）

| 要求 | 执行 |
|------|------|
| 真实厂商 **英文 Logo** | 使用官方品牌标识（SVG/PNG），**不用 AI 画 Logo** |
| 大小规格统一 | 统一容器 120×40 或 160×48，`object-contain`，灰底/白底卡片 |
| 放置位置 | Product 详情「Related Vendor Solutions」每张 Vendor 卡左上/居中；列表卡可选角标 |
| 来源 | 优先 `public/logos/` 已有文件；缺的用清晰官方标识资源，**禁止水印图** |
| 本批需核对清单 | Sangfor, Huawei, H3C, Nutanix, Fortinet, Sophos, Hillstone, Dell, HPE, Lenovo, Veeam, StarWind, Proxmox, Cisco, Ruijie, ByteDance, Alibaba Cloud, **Sundray**, **Aruba** |

**不做**：每厂商一张「带 Logo 的机架渲染大图」（与 #5 冲突）；Hero 产品图可继续用中立设备摄影（无厂商侵权风险）或中性机房图。

---

## 5. 请你审批

- [ ] 术语微调 T1–T8 是否执行（可逐条）  
- [ ] Run 专题卡样式是否 OK（已实现，待你看线上）  
- [ ] HCI Battlecard 草稿是否通过？通过后我做成详情页可折叠对比区  
- [ ] 无线是否按上表补 Sundray / Aruba 到 CMS relatedVendors  
- [ ] Logo：确认「统一英文 Logo + 中立 Hero 设备图」方案  
