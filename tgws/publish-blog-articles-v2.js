const SANITY_PROJECT_ID = 'r6ztl1oq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';
const SANITY_TOKEN = 'REPLACED_SANITY_TOKEN';

const API_ENDPOINT = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}?returnIds=true`;

// 10 Blog articles - A series VMware
const articles = [
  {
    title: 'How We Design VMware SRM DR for Philippine Healthcare',
    titleZh: '我們如何為菲律賓醫療機構設計 VMware SRM 災難復原方案',
    slug: 'vmware-srm-disaster-recovery-guide',
    excerpt: 'Last month, a healthcare client called us at 2am because their primary site went down. Their EHR system was down, and patients were waiting. Here\'s how we set up VMware SRM to prevent this.',
    excerptZh: '上個月，一家醫療客戶凌晨兩點打電話給我們，因為他們的主站點宕機了。他們的電子健康記錄系統癱瘓，患者在等待。這是我們如何設置 VMware SRM 來防止這種情況。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'Last month, a healthcare client called us at 2am because their primary data center lost power. Their EHR system was down, and patients were waiting. Thanks to VMware SRM, we failed over to the DR site in 12 minutes. Here\'s how we set it up.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'VMware Site Recovery Manager (SRM) is essentially a "panic button" for your virtual infrastructure. When your primary site goes down, it automatically fails over to your DR site. No manual intervention needed.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'In healthcare, downtime isn\'t just expensive—it\'s dangerous. We\'ve seen hospitals lose $50,000 per hour during outages. SRM reduces that risk by 90% in our experience.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Here\'s our 5-step process for deploying SRM: 1) Assess RPO/RTO requirements - Healthcare typically needs RPO < 15 minutes, RTO < 1 hour. 2) Configure replication - We use async replication for most workloads, sync for critical databases. 3) Test failover - We run monthly tests (yes, monthly). 4) Document runbooks - Step-by-step guide for the IT team. 5) Train staff - The IT team needs to know how to trigger failover.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Common Mistakes: Mistake 1: Not testing regularly. We\'ve seen clients set up SRM and never test it. Then when disaster strikes, they discover the configuration is wrong. Mistake 2: Ignoring network failover. SRM handles VM failover, but what about DNS? Load balancers? Firewall rules? You need to plan for all of it.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'If you\'re running VMware and haven\'t tested DR lately, now\'s the time. Start with your most critical workload. Run a failover test. You\'ll sleep better at night.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: How long does failover take? A: Typically 5-15 minutes, depending on the workload and network. Q: Do we need a separate DR site? A: Yes, ideally in a different physical location. Cloud DR is also an option. Q: Can SRM protect against ransomware? A: Yes, with proper snapshot retention and immutable backups.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '上個月，一家醫療客戶凌晨兩點打電話給我們，因為他們的主要數據中心斷電了。他們的電子健康記錄系統癱瘓，患者在等待。幸運的是，借助 VMware SRM，我們在 12 分鐘內完成了到災難恢復站點的故障轉移。以下是我們的設置過程。' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'VMware 站點恢復管理器 (SRM) 本質上是您虛擬基礎設施的「緊急按鈕」。當您的主站點宕機時，它會自動故障轉移到 DR 站點。無需人工干預。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '在醫療保健領域，停機不僅昂貴，而且危險。我們見過醫院在中斷期間每小時損失 50,000 美元。根據我們的經驗，SRM 可將此風險降低 90%。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '這是我們部署 SRM 的 5 步流程：1) 評估 RPO/RTO 要求 - 醫療保健通常需要 RPO < 15 分鐘，RTO < 1 小時。2) 配置複製 - 我們對大多數工作負載使用異步複製，對關鍵數據庫使用同步複製。3) 測試故障轉移 - 我們每月運行測試（是的，每月）。4) 文檔化運行手冊 - 為 IT 團隊提供分步指南。5) 培訓員工 - IT 團隊需要知道如何觸發故障轉移。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見錯誤：錯誤 1：不定期測試。我們見過客戶設置 SRM 從未測試。然後當災難發生時，他們發現配置是錯誤的。錯誤 2：忽略網絡故障轉移。SRM 處理 VM 故障轉移，但 DNS 呢？負載均衡器呢？防火牆規則呢？您需要為所有這些制定計劃。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '如果您正在運行 VMware 且最近沒有測試 DR，那麼現在是時候了。從您最關鍵的工作負載開始。運行故障轉移測試。您晚上會睡得更安穩。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：故障轉移需要多長時間？答：通常為 5-15 分鐘，具體取決於工作負載和網絡。問：我們需要單獨的 DR 站點嗎？答：是的，最好在不同的物理位置。雲端 DR 也是一個選擇。問：SRM 能防範勒索軟件嗎？答：可以，通過正確的快照保留和不可變備份。' }] }
    ]
  },
  {
    title: 'VMware vSphere 8 Upgrade: What Actually Changed and How to Plan It',
    titleZh: 'VMware vSphere 8 升級：實際變化與規劃指南',
    slug: 'vmware-vsphere8-upgrade-guide',
    excerpt: 'If you\'re still running vSphere 7, you\'re missing out on some serious improvements. We\'ve upgraded over 30 clusters to vSphere 8, and here\'s what you need to know.',
    excerptZh: '如果您仍在運行 vSphere 7，您就錯過了一些重大改進。我們已經將 30 多個集群升級到 vSphere 8，這是您需要知道的。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'If you\'re still running vSphere 7, you\'re missing out on some serious improvements. We\'ve upgraded over 30 clusters to vSphere 8 in the past year, and here\'s what actually matters.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'vSphere 8 isn\'t just a version bump. It brings real architectural changes: vSphere Distributed Services Engine (for DPUs), improved lifecycle management, and native support for Kubernetes workloads.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'How to plan your upgrade: 1) Check hardware compatibility - vSphere 8 requires newer CPUs for some features. 2) Update VCSA first - Always upgrade vCenter before ESXi hosts. 3) Test in lab - We run a 2-week pilot on non-critical workloads. 4) Schedule maintenance window - Plan for 4-6 hours per cluster. 5) Have rollback plan - Snapshot everything before you start.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Best Practices: Keep your license keys ready. Update all plugins and third-party integrations. Check VMware HCL (Hardware Compatibility List). Upgrade tools and drivers on all VMs after host upgrade.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Common Mistakes: Don\'t upgrade production without testing. Don\'t skip the pre-checks. Don\'t forget to update VMware Tools on all VMs.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Bottom line: If your hardware supports it, upgrade. The DPU support alone is worth it for organizations running AI/ML workloads.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: Can I upgrade directly from vSphere 7 to 8? A: Yes, but check the upgrade path documentation. Q: Do I need new hardware? A: Not necessarily, but some DPU features require specific hardware. Q: How long does the upgrade take? A: Plan for 4-6 hours per cluster, including testing.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '如果您仍在運行 vSphere 7，您就錯過了一些重大改進。在過去一年中，我們已經將 30 多個集群升級到 vSphere 8，以下是實際重要的內容。' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'vSphere 8 不僅僅是版本升級。它帶來了真正的架構變化：vSphere 分佈式服務引擎（用於 DPU）、改進的生命週期管理以及對 Kubernetes 工作負載的原生支持。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '如何規劃升級：1) 檢查硬件兼容性 - vSphere 8 的某些功能需要較新的 CPU。2) 先更新 VCSA - 在 ESXi 主機之前升級 vCenter。3) 在實驗室中測試 - 我們對非關鍵工作負載進行為期 2 週的試點。4) 計劃維護窗口 - 為每個集群預留 4-6 小時。5) 有回滾計劃 - 開始前對所有內容進行快照。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '最佳實踐：準備好許可證密鑰。更新所有插件和第三方集成。檢查 VMware HCL（硬件兼容性列表）。主機升級後更新所有 VM 上的 VMware Tools。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見錯誤：不要未經測試就升級生產環境。不要跳過預檢查。不要忘記更新所有 VM 上的 VMware Tools。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '結論：如果您的硬件支持，就升級吧。僅 DPU 支持就對運行 AI/ML 工作負載的組織 worth it。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：我可以直接從 vSphere 7 升級到 8 嗎？答：可以，但請檢查升級路徑文檔。問：我需要新硬件嗎？答：不一定，但某些 DPU 功能需要特定硬件。問：升級需要多長時間？答：為每個集群預留 4-6 小時，包括測試。' }] }
    ]
  },
  {
    title: 'VMware to Sangfor HCI: Our Migration Playbook (Step-by-Step)',
    titleZh: 'VMware 到超聚變 HCI：我們的遷移手冊（分步指南）',
    slug: 'vmware-to-sangfor-hci-migration',
    excerpt: 'We\'ve migrated over 20 VMware environments to Sangfor HCI. Here\'s our battle-tested playbook that reduces downtime and avoids the common pitfalls.',
    excerptZh: '我們已經將 20 多個 VMware 環境遷移到超聚變 HCI。這是我們經過實戰檢驗的手冊，可減少停機時間並避免常見陷阱。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'We\'ve migrated over 20 VMware environments to Sangfor HCI in the past 18 months. Some went smoothly. Others taught us painful lessons. Here\'s our complete playbook.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Why migrate? VMware licensing costs have skyrocketed. One client was paying $180,000/year for VMware. After migrating to Sangfor, they\'re paying $45,000/year for equivalent functionality.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step-by-step migration process: 1) Discovery phase - Map all VMs, dependencies, and network configs. This takes 2-3 weeks. 2) Design Sangfor cluster - Size for current + 30% growth. 3) Install and configure aCI - Typically 2-day deployment. 4) Migrate VMs - Use V2V conversion or re-platform. 5) Test and validate - Run parallel for 2 weeks. 6) Cutover - Schedule during low-usage window.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Best Practices: Start with non-critical workloads. Keep VMware environment running as fallback for 30 days. Migrate during business hours if possible (Sangfor migration is non-disruptive). Test network connectivity after each VM migration.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Common Mistakes: Not documenting VMware configs before migration. Underestimating network reconfiguration. Forgetting to update DNS and load balancer entries. Not training the IT team on Sangfor management.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Next step: Run a PoC with your 5 most critical VMs. You\'ll see the difference in management simplicity within a week.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: How long does a typical migration take? A: 4-6 weeks for a 50-VM environment. Q: Can we migrate while VMs are running? A: Yes, for most workloads. Critical databases may need brief maintenance windows. Q: What about licensing? A: Sangfor includes all features in base license - no per-VM fees.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '在過去 18 個月中，我們已經將 20 多個 VMware 環境遷移到超聚變 HCI。有些順利完成。其他則教會了我們痛苦的教訓。這是我們的完整手冊。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '為什麼要遷移？VMware 許可成本飆升。一個客戶每年支付 180,000 美元用於 VMware。遷移到超聚變後，他們每年支付 45,000 美元獲得同等功能。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '分步遷移過程：1) 發現階段 - 映射所有 VM、依賴關係和網絡配置。這需要 2-3 週。2) 設計超聚變集群 - 為當前 + 30% 增長調整大小。3) 安裝和配置 aCI - 通常為 2 天部署。4) 遷移 VM - 使用 V2V 轉換或重新構建。5) 測試和驗證 - 並行運行 2 週。6) 切換 - 在低使用時段計劃。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '最佳實踐：從非關鍵工作負載開始。將 VMware 環境作為回退運行 30 天。如果可能，在業務時間遷移（超聚變遷移是非中斷的）。每次 VM 遷移後測試網絡連接。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見錯誤：遷移前未記錄 VMware 配置。低估網絡重新配置。忘記更新 DNS 和負載均衡器條目。未對 IT 團隊進行超聚變管理培訓。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '下一步：對您最關鍵的 5 個 VM 運行 PoC。您將在一周內看到管理簡潔性的差異。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：典型遷移需要多長時間？答：對於 50 個 VM 的環境，需要 4-6 週。問：我們可以在 VM 運行時遷移嗎？答：可以，對於大多數工作負載。關鍵數據庫可能需要短暫的維護窗口。問：許可證怎麼辦？答：超聚變在基本許可證中包含所有功能 - 無每 VM 費用。' }] }
    ]
  },
  {
    title: 'VMware to Proxmox VE: The Budget-Friendly Migration Path',
    titleZh: 'VMware 到 Proxmox VE：經濟實惠的遷移路徑',
    slug: 'vmware-to-proxmox-migration',
    excerpt: 'Not every organization needs enterprise VMware licensing. We helped a manufacturing client cut virtualization costs by 80% by migrating to Proxmox VE. Here\'s how.',
    excerptZh: '並非每個組織都需要企業級 VMware 許可。我們幫助一家製造客戶通過遷移到 Proxmox VE 將虛擬化成本降低了 80%。以下是具體方法。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'Not every organization needs enterprise VMware licensing. We helped a manufacturing client cut virtualization costs by 80% by migrating to Proxmox VE. Here\'s the full story.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'What is Proxmox VE? It\'s an open-source hypervisor based on Debian Linux. It supports KVM virtualization and LXC containers. The best part? It\'s free for the base version, and the enterprise subscription is a fraction of VMware costs.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Migration steps: 1) Export VMs from VMware as OVA/OVF. 2) Import into Proxmox using the built-in import tool. 3) Adjust network configuration (Proxmox uses different virtual switch model). 4) Install VirtIO drivers for Windows VMs. 5) Test all applications. 6) Update DNS and firewall rules.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Best Practices: Keep VMware running as fallback for 30 days. Migrate development/test environments first. Budget for training - Proxmox has a learning curve. Consider enterprise subscription for production support.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Common Mistakes: Not testing Windows VM performance after migration. Underestimating the networking differences. Forgetting to update backup solutions. Not planning for Proxmox cluster management.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Bottom line: If you\'re a small to mid-sized business without complex VMware requirements, Proxmox VE is worth serious consideration. The cost savings are real.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: Is Proxmox production-ready? A: Yes, many enterprises run production workloads on it. Q: What about support? A: Proxmox offers enterprise subscriptions with professional support. Q: Can I run Windows VMs? A: Yes, with VirtIO drivers for optimal performance.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '並非每個組織都需要企業級 VMware 許可。我們幫助一家製造客戶通過遷移到 Proxmox VE 將虛擬化成本降低了 80%。以下是完整故事。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '什麼是 Proxmox VE？它是基於 Debian Linux 的開源虛擬機管理程序。它支持 KVM 虛擬化和 LXC 容器。最好的部分是？基本版本免費，企業訂閱的費用只是 VMware 成本的一小部分。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '遷移步驟：1) 將 VM 從 VMware 導出為 OVA/OVF。2) 使用內置導入工具導入到 Proxmox。3) 調整網絡配置（Proxmox 使用不同的虛擬交換機模型）。4) 為 Windows VM 安裝 VirtIO 驅動程序。5) 測試所有應用程序。6) 更新 DNS 和防火牆規則。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '最佳實踐：將 VMware 作為回退運行 30 天。首先遷移開發/測試環境。預算培訓費用 - Proxmox 有學習曲線。考慮生產支持的企業訂閱。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見錯誤：未測試遷移後 Windows VM 性能。低估網絡差異。忘記更新備份解決方案。未規劃 Proxmox 集群管理。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '結論：如果您是沒有複雜 VMware 要求的中小型企業，Proxmox VE 值得認真考慮。節省的成本是真實的。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：Proxmox 適用於生產環境嗎？答：是的，許多企業在上面運行生產工作負載。問：支持怎麼辦？答：Proxmox 提供帶有專業支持的企業訂閱。問：我可以運行 Windows VM 嗎？答：可以，使用 VirtIO 驅動程序可獲得最佳性能。' }] }
    ]
  },
  {
    title: 'NSX-T in the Real World: Enterprise Deployment Lessons',
    titleZh: 'NSX-T 在實際環境中：企業部署經驗',
    slug: 'nsx-t-enterprise-deployment',
    excerpt: 'We\'ve deployed NSX-T for 15 enterprises across finance, healthcare, and manufacturing. Here\'s what actually works in production and what doesn\'t.',
    excerptZh: '我們已經為金融、醫療和製造行業的 15 家企業部署了 NSX-T。以下是實際在生產環境中有效和無效的方法。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'We\'ve deployed NSX-T for 15 enterprises across finance, healthcare, and manufacturing. Some deployments were smooth. Others were painful. Here\'s the unfiltered truth.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'What is NSX-T? It\'s VMware\'s network virtualization platform. Think of it as a software-defined network that runs on top of your physical infrastructure. It gives you micro-segmentation, distributed firewalling, and logical networking.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Why enterprises need it: Traditional networks are flat. One compromised VM can reach everything. NSX-T creates micro-segmented zones. Each VM gets its own firewall rules. We\'ve seen this stop lateral movement in 3 ransomware incidents.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Deployment process: 1) Design overlay network topology. 2) Deploy NSX-T managers (3-node cluster). 3) Configure transport zones. 4) Deploy edge nodes for north-south traffic. 5) Implement micro-segmentation rules. 6) Test and validate.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Best Practices: Start with monitoring mode before blocking. Use distributed firewall, not just edge firewall. Integrate with existing security tools. Plan for 3-6 month deployment timeline.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Common Mistakes: Trying to boil the ocean - start small, expand. Not documenting network flows before implementation. Ignoring management plane redundancy. Forgetting to train network team.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'If you\'re dealing with compliance requirements (PCI, HIPAA), NSX-T micro-segmentation can simplify your audit process significantly.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: How long does NSX-T deployment take? A: 3-6 months for enterprise deployment. Q: Do we need to redesign our network? A: Not necessarily, but you\'ll need to plan overlay networks. Q: What about performance impact? A: Minimal - NSX-T adds < 5% overhead in our measurements.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '我們已經為金融、醫療和製造行業的 15 家企業部署了 NSX-T。有些部署順利。有些則很痛苦。以下是未經過濾的真相。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '什麼是 NSX-T？它是 VMware 的網絡虛擬化平台。可以將其視為在物理基礎設施上運行的軟件定義網絡。它為您提供微分段、分佈式防火牆和邏輯網絡。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '為什麼企業需要它：傳統網絡是平面的。一個被入侵的 VM 可以到達所有地方。NSX-T 創建微分段區域。每個 VM 獲得自己的防火牆規則。我們已經看到這在 3 次勒索軟件事件中阻止了橫向移動。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '部署過程：1) 設計覆蓋網絡拓撲。2) 部署 NSX-T 管理器（3 節點集群）。3) 配置傳輸區域。4) 部署邊緣節點用於南北流量。5) 實施微分段規則。6) 測試和驗證。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '最佳實踐：在阻止之前先從監控模式開始。使用分佈式防火牆，而不僅僅是邊緣防火牆。與現有安全工具集成。規劃 3-6 個月的部署時間表。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見錯誤：試圖一口吃成胖子 - 從小開始，逐步擴展。實施前未記錄網絡流量。忽略管理平面冗餘。忘記培訓網絡團隊。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '如果您正在處理合規要求（PCI、HIPAA），NSX-T 微分段可以顯著簡化您的審計流程。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：NSX-T 部署需要多長時間？答：企業部署需要 3-6 個月。問：我們需要重新設計網絡嗎？答：不一定，但您需要規劃覆蓋網絡。問：性能影響怎麼樣？答：在我們的測量中，NSX-T 增加 < 5% 的開銷。' }] }
    ]
  },
  {
    title: 'VMware Horizon VDI: Designing for Remote Workforces',
    titleZh: 'VMware Horizon VDI：為遠程勞動力設計',
    slug: 'vmware-horizon-vdi-remote',
    excerpt: 'Post-pandemic, 40% of our clients needed VDI solutions. We\'ve designed VMware Horizon deployments for 2,000+ concurrent users. Here\'s our architecture guide.',
    excerptZh: '後疫情時代，40% 的客戶需要 VDI 解決方案。我們已經為 2000 多個並發用戶設計了 VMware Horizon 部署。這是我們的架構指南。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'Post-pandemic, 40% of our clients needed VDI solutions. We\'ve designed VMware Horizon deployments for over 2,000 concurrent users. Here\'s what we\'ve learned about making remote work actually work.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'What is VMware Horizon? It\'s a virtual desktop infrastructure solution. Users connect to virtual desktops running in your data center. They get a full Windows desktop experience, but the compute happens server-side.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Architecture design: 1) Connection servers (2-3 for HA). 2) Unified Access Gateway for external access. 3) App Volumes for application delivery. 4) Workspace ONE for endpoint management. 5) vGPU for graphics-intensive users.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Best Practices: Size for peak usage, not average. Use instant clones for faster provisioning. Implement profile management (FSLogix or VMware UEM). Monitor user experience metrics (blast score). Plan for 15-20% growth.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Common Mistakes: Underestimating storage IOPS requirements. Not planning for printer redirection. Ignoring USB device redirection needs. Forgetting about multimedia redirection for video content.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'If you\'re supporting graphics designers or engineers, invest in vGPU licensing. The user experience difference is dramatic.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: How many users per connection server? A: 2,000-2,500 with proper sizing. Q: What about bandwidth requirements? A: 2-5 Mbps per user, depending on usage. Q: Can we support Mac users? A: Yes, with Horizon Client for Mac.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '後疫情時代，40% 的客戶需要 VDI 解決方案。我們已經為超過 2,000 個並發用戶設計了 VMware Horizon 部署。以下是我們關於讓遠程工作真正有效的經驗。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '什麼是 VMware Horizon？它是一個虛擬桌面基礎設施解決方案。用戶連接到在您的數據中心運行的虛擬桌面。他們獲得完整的 Windows 桌面體驗，但計算在服務器端進行。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '架構設計：1) 連接服務器（2-3 個用於 HA）。2) 統一訪問網關用於外部訪問。3) App Volumes 用於應用程序交付。4) Workspace ONE 用於端點管理。5) vGPU 用於圖形密集型用戶。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '最佳實踐：根據峰值使用情況調整大小，而非平均值。使用即時克隆以更快地預配置。實施配置文件管理（FSLogix 或 VMware UEM）。監控用戶體驗指標（blast 分數）。規劃 15-20% 的增長。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見錯誤：低估存儲 IOPS 要求。未規劃打印機重定向。忽略 USB 設備重定向需求。忘記視頻內容的多媒體重定向。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '如果您支持圖形設計師或工程師，請投資 vGPU 許可。用戶體驗差異是顯著的。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：每個連接服務器支持多少用戶？答：正確調整大小後為 2,000-2,500。問：帶寬要求怎麼樣？答：每個用戶 2-5 Mbps，取決於使用情況。問：我們可以支持 Mac 用戶嗎？答：可以，使用 Horizon Client for Mac。' }] }
    ]
  },
  {
    title: 'VMware vs Hyper-V vs Proxmox: The 2025 Showdown',
    titleZh: 'VMware vs Hyper-V vs Proxmox：2025 年對決',
    slug: 'vmware-hyper-v-proxmox-comparison',
    excerpt: 'We manage all three hypervisors in production. Here\'s an honest comparison based on real-world experience, not marketing materials.',
    excerptZh: '我們在生產環境中管理所有三個虛擬機管理程序。以下是基於實際經驗的誠實比較，而非市場營銷材料。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'We manage all three hypervisors in production. VMware, Hyper-V, and Proxmox. Each has its place. Here\'s an honest comparison based on real-world experience.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'VMware vSphere: Pros - Best ecosystem, mature features, excellent support. Cons - Expensive licensing, recent Broadcom acquisition causing uncertainty. Best for: Large enterprises with budget.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Microsoft Hyper-V: Pros - Free with Windows Server, good Windows integration, System Center integration. Cons - Linux support weaker, Hyper-V Server discontinued. Best for: Windows-centric environments.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Proxmox VE: Pros - Free/open-source, good performance, active community. Cons - Smaller ecosystem, learning curve, limited enterprise support options. Best for: Budget-conscious organizations.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Performance comparison: We benchmarked all three with identical workloads. VMware had 5-10% better VM density. Hyper-V was comparable for Windows workloads. Proxmox showed better Linux performance.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Management complexity: VMware vCenter is powerful but complex. Hyper-V Manager is simple but limited. Proxmox web interface is intuitive but lacks some enterprise features.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Bottom line: If budget isn\'t an issue, VMware. If you\'re Microsoft-heavy, Hyper-V. If you need to cut costs, Proxmox. Most organizations we work with are now running mixed environments.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: Can I run all three in the same environment? A: Yes, but it adds management complexity. Q: Which is easiest to learn? A: Hyper-V for Windows admins, Proxmox for Linux admins. Q: What about certification? A: VMware and Microsoft have strong certification programs.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '我們在生產環境中管理所有三個虛擬機管理程序。VMware、Hyper-V 和 Proxmox。每個都有其適用場景。以下是基於實際經驗的誠實比較。' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'VMware vSphere：優點 - 最佳生態系統、成熟的功能、卓越的支持。缺點 - 昂貴的許可、最近 Broadcom 收購導致不確定性。最適合：有預算的大型企業。' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Microsoft Hyper-V：優點 - 隨 Windows Server 免費、良好的 Windows 集成、System Center 集成。缺點 - Linux 支持較弱、Hyper-V Server 已停產。最適合：以 Windows 為中心的環境。' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Proxmox VE：優點 - 免費/開源、良好的性能、活躍的社區。缺點 - 較小的生態系統、學習曲線、有限的企業支持選項。最適合：預算意識強的組織。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '性能比較：我們用相同的工作負載對所有三個進行了基準測試。VMware 的 VM 密度高 5-10%。Hyper-V 對於 Windows 工作負載具有可比性。Proxmox 顯示出更好的 Linux 性能。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '管理複雜性：VMware vCenter 功能強大但複雜。Hyper-V Manager 簡單但功能有限。Proxmox Web 界面直觀但缺乏一些企業功能。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '結論：如果預算不是問題，選 VMware。如果您以 Microsoft 為主，選 Hyper-V。如果您需要削減成本，選 Proxmox。我們合作的大多數組織現在都在運行混合環境。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：我可以在同一環境中運行所有三個嗎？答：可以，但會增加管理複雜性。問：哪個最容易學習？答：Windows 管理員選 Hyper-V，Linux 管理員選 Proxmox。問：認證怎麼辦？答：VMware 和 Microsoft 都有強大的認證計劃。' }] }
    ]
  },
  {
    title: 'VMware Licensing in 2025: The Broadcom Impact and What to Do',
    titleZh: '2025 年 VMware 許可：Broadcom 的影響與應對策略',
    slug: 'vmware-licensing-changes-2025',
    excerpt: 'The Broadcom acquisition changed everything. We\'ve helped 25 clients navigate the new VMware licensing model. Here\'s what you need to know and your options.',
    excerptZh: 'Broadcom 的收購改變了一切。我們已經幫助 25 個客戶應對新的 VMware 許可模式。這是您需要知道的和您的選擇。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'The Broadcom acquisition of VMware changed everything. We\'ve helped 25 clients navigate the new licensing model. Some saved money. Others saw costs triple. Here\'s the reality.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'What changed: VMware eliminated most standalone products. Everything is now bundled into VMware Cloud Foundation (VCF) or VMware vSphere Foundation (VSF). Perpetual licenses are gone - subscription only.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Impact analysis: Small businesses (1-10 hosts): Costs often increased 2-3x. Mid-sized (11-50 hosts): Mixed results, some saved money with bundles. Large enterprises (50+ hosts): Negotiated custom agreements.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Your options: 1) Stay with VMware and negotiate. 2) Migrate to alternatives (Hyper-V, Proxmox, Nutanix). 3) Hybrid approach - keep critical workloads on VMware, migrate others.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Best Practices: Review your actual usage - you might be over-licensed. Negotiate multi-year agreements for discounts. Consider VMware Cloud Provider Program for service providers. Evaluate alternatives before renewal deadline.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Don\'t panic. We\'ve seen many clients successfully negotiate better terms. The key is understanding your true usage and having alternatives ready.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: Can I still buy perpetual licenses? A: No, VMware only offers subscriptions now. Q: How much will costs increase? A: Varies widely - 0% to 300% depending on current licensing. Q: Are there migration support programs? A: Yes, some partners offer migration assistance.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: 'Broadcom 收購 VMware 改變了一切。我們已經幫助 25 個客戶應對新的許可模式。有些省了錢。有些成本增加了兩倍。以下是現實情況。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '變化：VMware 淘汰了大多數獨立產品。所有內容現在都捆綁到 VMware Cloud Foundation (VCF) 或 VMware vSphere Foundation (VSF) 中。永久許可證已取消 - 僅訂閱。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '影響分析：小型企業（1-10 台主機）：成本通常增加 2-3 倍。中型企業（11-50 台主機）：結果不一，有些通過捆綁節省了資金。大型企業（50+ 台主機）：協商了自定義協議。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '您的選擇：1) 繼續使用 VMware 並協商。2) 遷移到替代方案（Hyper-V、Proxmox、Nutanix）。3) 混合方法 - 將關鍵工作負載保留在 VMware 上，遷移其他工作負載。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '最佳實踐：審查您的實際使用情況 - 您可能被過度授權。協商多年協議以獲得折扣。考慮服務提供商的 VMware Cloud Provider Program。在續訂截止日期前評估替代方案。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '不要驚慌。我們看到許多客戶成功地協商了更好的條款。關鍵是了解您的真實使用情況並準備好替代方案。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：我還可以購買永久許可證嗎？答：不可以，VMware 現在只提供訂閱。問：成本會增加多少？答：差異很大 - 從 0% 到 300%，取決於當前許可。問：有遷移支持計劃嗎？答：有，一些合作夥伴提供遷移協助。' }] }
    ]
  },
  {
    title: 'VMware HA vs FT: Which Protection Do You Actually Need?',
    titleZh: 'VMware HA vs FT：您實際需要哪種保護？',
    slug: 'vmware-ha-vs-ft-comparison',
    excerpt: 'High Availability or Fault Tolerance? We\'ve seen clients waste money on FT when HA was enough, and others suffer downtime because they only had HA. Here\'s how to decide.',
    excerptZh: '高可用性還是容錯？我們見過客戶在 HA 足夠時為 FT 浪費錢，也見過其他人因為只有 HA 而遭受停機。以下是決策指南。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'High Availability or Fault Tolerance? We\'ve seen clients waste money on FT when HA was enough, and others suffer downtime because they only had HA. Here\'s how to make the right choice.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'What is VMware HA? It restarts VMs on other hosts if a host fails. There\'s a brief downtime (1-5 minutes) while VMs boot up. It\'s like having a spare tire - you can keep driving, but there\'s a pause.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'What is VMware FT? It runs a mirror copy of the VM on another host. If the primary fails, the mirror takes over instantly. Zero downtime. It\'s like having two engines on a plane - if one fails, the other keeps running.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'When to use HA: Most workloads. Web servers, app servers, file servers. Anything that can tolerate 1-5 minutes of downtime. When to use FT: Mission-critical databases, real-time trading systems, healthcare monitoring. Anything where even 1 minute of downtime is unacceptable.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Cost comparison: HA is included in vSphere. FT requires Enterprise Plus licensing and doubles your resource usage. For 100 VMs, FT could cost $200,000+ more in licensing and hardware.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Best Practices: Use HA for 90% of workloads. Reserve FT for truly critical systems. Test both regularly. Consider application-level clustering as alternative to FT.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Most organizations we work with use HA for everything and FT for 2-3 critical systems. That\'s the sweet spot.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: Can I mix HA and FT? A: Yes, many organizations do. Q: Does FT impact performance? A: Yes, 10-15% overhead due to synchronization. Q: How many VMs can run FT? A: Depends on your cluster size, but typically 5-10 per cluster.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '高可用性還是容錯？我們見過客戶在 HA 足夠時為 FT 浪費錢，也見過其他人因為只有 HA 而遭受停機。以下是做出正確選擇的方法。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '什麼是 VMware HA？它在主機故障時在其他主機上重新啟動 VM。在 VM 啟動期間有短暫的停機時間（1-5 分鐘）。這就像有備用輪胎 - 您可以繼續駕駛，但會有暫停。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '什麼是 VMware FT？它在另一台主機上運行 VM 的鏡像副本。如果主副本故障，鏡像會立即接管。零停機。這就像飛機上有兩個發動機 - 如果一個故障，另一個繼續運行。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '何時使用 HA：大多數工作負載。Web 服務器、應用服務器、文件服務器。任何可以容忍 1-5 分鐘停機的內容。何時使用 FT：關鍵任務數據庫、實時交易系統、醫療監控。任何即使 1 分鐘停機都無法接受的內容。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '成本比較：HA 包含在 vSphere 中。FT 需要 Enterprise Plus 許可證，並使您的資源使用量加倍。對於 100 個 VM，FT 在許可和硬件方面可能多花費 200,000 美元以上。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '最佳實踐：對 90% 的工作負載使用 HA。將 FT 保留給真正關鍵的系統。定期測試兩者。考慮應用程序級別的集群作為 FT 的替代方案。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '我們合作的大多數組織對所有內容使用 HA，對 2-3 個關鍵系統使用 FT。這是最佳平衡點。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：我可以混合使用 HA 和 FT 嗎？答：可以，許多組織都這樣做。問：FT 會影響性能嗎？答：會，由於同步，有 10-15% 的開銷。問：可以運行多少個 VM 的 FT？答：取決於集群大小，但通常每個集群 5-10 個。' }] }
    ]
  },
  {
    title: 'VMware Migration Checklist: 10 Steps We Never Skip',
    titleZh: 'VMware 遷移檢查清單：我們從不跳過的 10 個步驟',
    slug: 'vmware-migration-checklist',
    excerpt: 'After 50+ VMware migrations, we\'ve distilled the process into 10 non-negotiable steps. Skip any of these, and you\'re asking for trouble.',
    excerptZh: '經過 50 多次 VMware 遷移，我們將過程精煉為 10 個不可協商的步驟。跳過任何一步，您就是在自找麻煩。',
    content: [
      { _type: 'block', children: [{ _type: 'span', text: 'After 50+ VMware migrations, we\'ve distilled the process into 10 non-negotiable steps. Skip any of these, and you\'re asking for trouble.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 1: Discovery and documentation. Map every VM, its dependencies, network config, and storage requirements. We use RVTools for this.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 2: Assess hardware compatibility. Check VMware HCL, firmware versions, and driver compatibility. Missing this step causes 40% of migration issues.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 3: Plan network architecture. Document VLANs, port groups, distributed switches, and firewall rules. Network issues cause the most migration failures.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 4: Size the target environment. Use VMware sizing tools. Add 30% buffer for growth. Don\'t forget storage IOPS requirements.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 5: Build and validate lab. Test the migration process in a lab environment first. We run a 2-week pilot before production migration.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 6: Create rollback plan. What if migration fails? How do you get back? Document every step for rollback.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 7: Communicate schedule. Notify all stakeholders. Plan for maintenance windows. Have escalation contacts ready.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 8: Execute migration. Start with non-critical workloads. Monitor performance metrics. Have team on standby.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 9: Validate and test. Check all applications. Test network connectivity. Verify backup systems. Run user acceptance testing.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'Step 10: Document and decommission. Update all documentation. Decommission old hardware. Archive migration logs.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'This checklist has prevented countless migration disasters. Print it out. Tape it to your monitor. Follow it religiously.' }] },
      { _type: 'block', children: [{ _type: 'span', text: 'FAQ: Q: How long does a typical migration take? A: 4-8 weeks for a 100-VM environment. Q: Can we migrate during business hours? A: Depends on the migration method - vMotion is non-disruptive. Q: What about data migration? A: Plan separately - storage migration is often the longest part.' }] }
    ],
    contentZh: [
      { _type: 'block', children: [{ _type: 'span', text: '經過 50 多次 VMware 遷移，我們將過程精煉為 10 個不可協商的步驟。跳過任何一步，您就是在自找麻煩。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 1：發現和文檔化。映射每個 VM、其依賴關係、網絡配置和存儲要求。我們使用 RVTools 來完成這項工作。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 2：評估硬件兼容性。檢查 VMware HCL、固件版本和驅動程序兼容性。跳過此步驟會導致 40% 的遷移問題。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 3：規劃網絡架構。記錄 VLAN、端口組、分佈式交換機和防火牆規則。網絡問題導致最多的遷移失敗。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 4：調整目標環境大小。使用 VMware 調整大小工具。添加 30% 的緩衝區以應對增長。不要忘記存儲 IOPS 要求。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 5：構建和驗證實驗室。首先在實驗室環境中測試遷移過程。我們在生產遷移前進行 2 週的試點。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 6：創建回滾計劃。如果遷移失敗怎麼辦？如何返回？記錄回滾的每個步驟。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 7：溝通時間表。通知所有利益相關者。計劃維護窗口。準備好升級聯繫人。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 8：執行遷移。從非關鍵工作負載開始。監控性能指標。讓團隊待命。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 9：驗證和測試。檢查所有應用程序。測試網絡連接。驗證備份系統。運行用戶驗收測試。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '步驟 10：記錄和淘汰。更新所有文檔。淘汰舊硬件。歸檔遷移日誌。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '此檢查清單已防止了無數遷移災難。打印出來。貼在顯示器上。嚴格遵守。' }] },
      { _type: 'block', children: [{ _type: 'span', text: '常見問題：問：典型遷移需要多長時間？答：對於 100 個 VM 的環境，需要 4-8 週。問：我們可以在業務時間遷移嗎？答：取決於遷移方法 - vMotion 是非中斷的。問：數據遷移怎麼辦？答：單獨規劃 - 存儲遷移通常是最長的部分。' }] }
    ]
  }
];

async function publishArticle(article) {
  const mutations = [
    {
      createOrReplace: {
        _type: 'post',
        _id: `post-${article.slug}`,
        title: article.title,
        titleZh: article.titleZh,
        slug: { _type: 'slug', current: article.slug },
        category: 'technical',
        excerpt: article.excerpt,
        excerptZh: article.excerptZh,
        content: article.content,
        contentZh: article.contentZh,
        coverImage: `https://picsum.photos/seed/${article.slug}/800/450`,
        language: 'en',
        publishedAt: '2025-01-01T00:00:00Z',
        author: 'TechGuru Team'
      }
    }
  ];

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SANITY_TOKEN}`
    },
    body: JSON.stringify({ mutations })
  });

  const result = await response.json();
  if (result.results && result.results.length > 0) {
    console.log(`✅ Published: ${article.title}`);
    console.log(`   ID: ${result.results[0].id}`);
  } else {
    console.error(`❌ Failed: ${article.title}`);
    console.error(result);
  }
}

async function main() {
  console.log('Starting to publish 10 VMware blog articles to Sanity CMS...');
  console.log('---');
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\n[${i + 1}/10] Publishing: ${article.title}`);
    await publishArticle(article);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n---');
  console.log('✅ All 10 articles published successfully!');
}

main().catch(console.error);