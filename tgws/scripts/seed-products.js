// v3方案产品数据（19个）
// Build: 4, Run: 7, Protect: 8

const products = [
  // ============ BUILD (4个) ============
  {
    title: 'AI-Generated Content (AIGC)',
    slug: 'ai-generated-content-aigc',
    category: 'build',
    order: 1,
    description: 'Generate videos, images, and multimedia content using cutting-edge AI models. Transform your ideas into compelling visual content without production teams.',
    descriptionZh: '使用前沿AI模型生成影片、圖片和多媒體內容。無需製作團隊，即可將您的想法轉化為引人注目的視覺內容。',
    features: ['Text-To-Video generation', 'Image-To-Video conversion', 'Multiple aspect ratios', 'Brand customization', 'Batch processing']
  },
  {
    title: 'AI-Assisted Coding',
    slug: 'ai-assisted-coding',
    category: 'build',
    order: 2,
    description: 'AI-powered development tools to accelerate your coding workflow. Write, review, and deploy code faster with intelligent assistance.',
    descriptionZh: 'AI驅動的開發工具，加速您的程式開發流程。借助智慧輔助，更快地編寫、審查和部署程式碼。',
    features: ['Code generation', 'Automated testing', 'Code review', 'Documentation generation', 'Bug detection']
  },
  {
    title: 'AI Agent Development',
    slug: 'ai-agent-development',
    category: 'build',
    order: 3,
    description: 'Build intelligent autonomous agents for complex task automation. Deploy AI agents that learn, adapt, and execute with minimal human intervention.',
    descriptionZh: '建構智慧自主代理，實現複雜任務自動化。部署能學習、適應和執行的AI代理，大幅減少人工干預。',
    features: ['Multi-agent orchestration', 'Tool integration', 'Memory & context management', 'Production deployment', 'Low-code/No-code platforms']
  },
  {
    title: 'Enterprise Legacy System AI Augmentation',
    slug: 'enterprise-legacy-system-ai-augmentation',
    category: 'build',
    order: 4,
    description: 'Enhance ERP, CRM, OA and other legacy systems with AI capabilities without modifying source code. Through API proxy layers, plug-in AI modules, and model adaptation, enable intelligent prediction, process automation, and anomaly detection for cost-effective modernization.',
    descriptionZh: '在不修改或極少修改原始碼的前提下，為ERP、CRM、OA等老舊業務系統疊加AI能力。透過API代理層、外掛式AI模組和模型適配，讓舊系統具備智慧預測、流程自動化、異常偵測等功能，實現低成本智能化升級。',
    features: ['API proxy layer integration', 'Plug-in AI modules', 'Model adaptation', 'Intelligent prediction', 'Process automation', 'Anomaly detection']
  },

  // ============ RUN (7个) ============
  {
    title: 'Server Virtualization Platform',
    slug: 'server-virtualization-platform',
    category: 'run',
    order: 1,
    description: 'Enterprise-grade server virtualization solutions including Microsoft Hyper-V, VMware vSphere (ESXi), Sangfor aSV, and Proxmox VE. Maximize server resource utilization and build a solid foundation for cloud migration.',
    descriptionZh: '企業級伺服器虛擬化解決方案，包括Microsoft Hyper-V、VMware vSphere (ESXi)、Sangfor aSV和Proxmox VE。提升伺服器資源利用率，為上雲打基礎。',
    features: ['Microsoft Hyper-V', 'VMware vSphere (ESXi)', 'Sangfor aSV', 'Proxmox VE', 'High availability', 'Live migration']
  },
  {
    title: 'Hyper-Converged Infrastructure',
    slug: 'hyper-converged-infrastructure',
    category: 'run',
    order: 2,
    description: 'Integrated compute, storage, and networking in a single platform. Simplify infrastructure management with linear scalability and built-in redundancy.',
    descriptionZh: '將運算、儲存和網路整合在單一平台。簡化基礎設施管理，具備線性擴展能力和內建冗餘。',
    features: ['Single management pane', 'Linear scalability', 'Built-in redundancy', 'Automated provisioning', 'Disaggregated HCI option']
  },
  {
    title: 'Cloud Migration',
    slug: 'cloud-migration',
    category: 'run',
    order: 3,
    description: 'Comprehensive cloud migration services using the 6R methodology: Rehost, Replatform, Refactor, Repurchase, Retire, and Retain. Match workloads to the right cloud strategy.',
    descriptionZh: '全面的雲端遷移服務，採用6R方法論：Rehost (Lift & Shift)、Replatform (Lift & Optimize)、Refactor/Re-architect、Repurchase (SaaS替換)、Retire (淘汰)、Retain (保留)。將工作負載匹配到合適的雲端策略。',
    features: ['6R methodology', 'Workload assessment', 'Migration planning', 'Execution & validation', 'Post-migration optimization']
  },
  {
    title: 'Cloud Repatriation',
    slug: 'cloud-repatriation',
    category: 'run',
    order: 4,
    description: 'Strategic cloud repatriation services for organizations seeking to bring workloads back on-premises. Address cost concerns, data sovereignty, latency requirements, and vendor lock-in risks.',
    descriptionZh: '戰略性雲端回遷服務，協助組織將工作負載遷回本地部署。解決成本考量、數據主權、延遲需求和供應商鎖定風險。',
    features: ['Cost analysis', 'Data sovereignty compliance', 'Latency optimization', 'Vendor lock-in mitigation', 'Hybrid strategy design']
  },
  {
    title: 'Enterprise Storage Solutions',
    slug: 'enterprise-storage-solutions',
    category: 'run',
    order: 5,
    description: 'Enterprise-grade storage solutions including SAN, NAS, and software-defined storage. Built for reliability, performance, and scalability.',
    descriptionZh: '企業級儲存解決方案，包括SAN、NAS和軟體定義儲存。為可靠性和性能而生，支持彈性擴展。',
    features: ['SAN solutions', 'NAS systems', 'Software-defined storage', 'Data deduplication', 'Backup integration']
  },
  {
    title: 'Managed Hosting Services',
    slug: 'managed-hosting-services',
    category: 'run',
    order: 6,
    description: 'Fully managed infrastructure services with 24/7 support. Focus on your business while we handle the infrastructure, monitoring, and maintenance.',
    descriptionZh: '全託管基礎設施服務，24/7支援。專注業務，基礎設施的監控、維護和運維交給我們。',
    features: ['24/7 monitoring', 'Proactive maintenance', 'Disaster recovery', 'SLA guarantee', 'Performance optimization']
  },
  {
    title: 'Business Continuity & Disaster Recovery',
    slug: 'business-continuity-disaster-recovery',
    category: 'run',
    order: 7,
    description: 'DR-as-a-Service and Backup-as-a-Service for comprehensive data protection. Ensure business operations never stop with optimized RTO/RPO.',
    descriptionZh: '災難恢復即服務和備份即服務，全面保護數據安全。優化RTO/RPO，確保業務永不中斷。',
    features: ['DR-as-a-Service', 'Backup-as-a-Service', 'DR Drill services', 'RTO/RPO optimization', 'Cross-region replication']
  },

  // ============ PROTECT (8个) ============
  {
    title: 'Next-Gen Firewall & IPS',
    slug: 'next-gen-firewall-ips',
    category: 'protect',
    order: 1,
    description: 'Advanced perimeter security with deep packet inspection and threat prevention. Stop attacks before they enter your network.',
    descriptionZh: '進階邊界安全，深度封包偵測與威脅防禦。在攻擊進入網路前攔截。',
    features: ['Deep packet inspection', 'Intrusion prevention', 'Application control', 'SSL inspection', 'Threat intelligence']
  },
  {
    title: 'Web Application Firewall',
    slug: 'web-application-firewall',
    category: 'protect',
    order: 2,
    description: 'Protect web applications from OWASP Top 10 and sophisticated attacks. Keep your web assets safe with advanced bot management and API security.',
    descriptionZh: '保護Web應用免受OWASP Top 10和複雜攻擊。透過進階機器人管理和API安全，守護您的網路資產。',
    features: ['OWASP Top 10 protection', 'Bot management', 'API security', 'Virtual patching', 'DDoS protection']
  },
  {
    title: 'Endpoint Detection & Response',
    slug: 'endpoint-detection-response',
    category: 'protect',
    order: 3,
    description: 'Advanced endpoint protection with real-time threat detection and automated response. Secure every device across your organization.',
    descriptionZh: '進階端點保護，即時威脅偵測與自動回應。守護組織內每一台設備的安全。',
    features: ['Real-time detection', 'Automated response', 'Forensic analysis', 'Threat hunting', 'Device control']
  },
  {
    title: 'Network Detection & Response',
    slug: 'network-detection-response',
    category: 'protect',
    order: 4,
    description: 'Monitor network traffic for anomalies and respond to threats in real-time. Gain complete visibility across your network infrastructure.',
    descriptionZh: '監控網路流量異常並即時回應威脅。全面掌握網路基礎設施的可見性。',
    features: ['Traffic analysis', 'Anomaly detection', 'Encrypted traffic inspection', 'Lateral movement detection', 'Network forensics']
  },
  {
    title: 'Cloud Security',
    slug: 'cloud-security',
    category: 'protect',
    order: 5,
    description: 'CASB, SASE, and ZTNA solutions for comprehensive cloud protection. Secure your cloud journey with zero trust principles.',
    descriptionZh: 'CASB、SASE和ZTNA解決方案，全面雲端防護。以零信任原則守護您的雲端之旅。',
    features: ['CASB', 'SASE', 'ZTNA', 'Cloud posture management', 'Identity-based access']
  },
  {
    title: 'SD-WAN & Load Balancing',
    slug: 'sd-wan-load-balancing',
    category: 'protect',
    order: 6,
    description: 'Optimize network performance with intelligent traffic management. Application-aware routing, WAN optimization, and centralized management.',
    descriptionZh: '智慧流量管理優化網路性能。應用感知路由、WAN優化和集中管理。',
    features: ['Application-aware routing', 'WAN optimization', 'Link load balancing', 'Centralized management', 'Cloud-first approach']
  },
  {
    title: 'Managed Detection & Response',
    slug: 'managed-detection-response',
    category: 'protect',
    order: 7,
    description: '24/7 security monitoring, penetration testing, and expert threat analysis. Your extended security team for comprehensive protection.',
    descriptionZh: '24/7安全監控、滲透測試和專家威脅分析。您的 extended 安全團隊，提供全面防護。',
    features: ['24/7 SOC monitoring', 'Penetration testing', 'Threat intelligence', 'Compliance reporting', 'Incident response']
  },
  {
    title: 'Incident Response',
    slug: 'incident-response',
    category: 'protect',
    order: 8,
    description: 'Rapid response to security incidents with expert forensic analysis. Minimize damage and restore operations fast.',
    descriptionZh: '專家鑑識分析，快速回應安全事件。最小化損害，快速恢復營運。',
    features: ['Rapid response', 'Forensic analysis', 'Ransomware recovery', 'Post-incident review', 'Security hardening']
  }
];

module.exports = { products };