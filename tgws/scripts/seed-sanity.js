const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'REPLACED_SANITY_TOKEN',
  useCdn: false
});

// ============ PRODUCTS ============
const products = [
  // Build
  { title: 'Text-To-Video (AIGC)', slug: 'text-to-video', category: 'build', order: 1,
    description: 'Generate videos from text descriptions using cutting-edge AI models. Transform your ideas into compelling visual content without production teams.',
    descriptionZh: '使用前沿AI模型從文字描述生成影片內容。無需製作團隊，即可將您的想法轉化為引人注目的視覺內容。',
    features: ['AI-powered video generation', 'Multiple aspect ratios', 'Brand customization', 'Batch processing'] },
  { title: 'Image-To-Video (AIGC)', slug: 'image-to-video', category: 'build', order: 2,
    description: 'Transform static images into dynamic video content with AI. Bring your product photos, diagrams, and artwork to life.',
    descriptionZh: '利用AI技術將靜態圖片轉化為動態影片。讓您的產品照片、圖表和藝術作品栩栩如生。',
    features: ['Motion synthesis', 'Style transfer', 'Resolution upscaling', 'Real-time preview'] },
  { title: 'AI Coding', slug: 'ai-coding', category: 'build', order: 3,
    description: 'AI-powered development tools to accelerate your coding workflow. Write, review, and deploy code faster with intelligent assistance.',
    descriptionZh: 'AI驅動的開發工具，加速您的程式開發流程。借助智慧輔助，更快地編寫、審查和部署程式碼。',
    features: ['Code generation', 'Automated testing', 'Code review', 'Documentation'] },
  { title: 'AI Agent Development', slug: 'ai-agent-development', category: 'build', order: 4,
    description: 'Build intelligent autonomous agents for complex task automation. Deploy AI agents that learn, adapt, and execute.',
    descriptionZh: '建構智慧自主代理，實現複雜任務自動化。部署能學習、適應和執行的AI代理。',
    features: ['Multi-agent orchestration', 'Tool integration', 'Memory & context', 'Production deployment'] },
  { title: 'Legacy System AI Transformation', slug: 'legacy-system-ai', category: 'build', order: 5,
    description: 'Modernize traditional systems with AI-driven intelligent upgrades. Bridge the gap between legacy and modern.',
    descriptionZh: '以AI驅動的智慧升級現代化傳統系統。彌合舊系統與現代技術之間的差距。',
    features: ['System assessment', 'Gradual migration', 'AI augmentation', 'Zero downtime'] },

  // Run
  { title: 'Virtualization Platform', slug: 'virtualization-platform', category: 'run', order: 1,
    description: 'VMware alternatives including Proxmox VE, Sangfor aSV, Nutanix, Arcfra, H3C. Reduce costs while maintaining performance.',
    descriptionZh: 'VMware替代方案，包括Proxmox VE、Sangfor aSV、Nutanix、Arcfra、H3C。降低成本同時維持性能。',
    features: ['Proxmox VE & KVM', 'Sangfor aSV & HCI', 'Nutanix & Arcfra', 'H3C hyper-converged'] },
  { title: 'Hyper-Converged Infrastructure', slug: 'hyper-converged', category: 'run', order: 2,
    description: 'Integrated compute, storage, and networking in a single platform. Simplify infrastructure management.',
    descriptionZh: '將運算、儲存和網路整合在單一平台。簡化基礎設施管理。',
    features: ['Single management pane', 'Linear scalability', 'Built-in redundancy', 'Automated provisioning'] },
  { title: 'Cloud Platform', slug: 'cloud-platform', category: 'run', order: 3,
    description: 'Private, public, and hybrid cloud solutions for flexible deployment. Match workload to the right cloud.',
    descriptionZh: '私有雲、公有雲和混合雲解決方案，實現靈活部署。將工作負載匹配到合適的雲端。',
    features: ['Multi-cloud management', 'Cost optimization', 'Security controls', 'Self-service portal'] },
  { title: 'Hardware', slug: 'hardware', category: 'run', order: 4,
    description: 'Enterprise-grade servers and storage solutions for your infrastructure. Built for reliability and performance.',
    descriptionZh: '企業級伺服器和儲存解決方案。為可靠性和性能而生。',
    features: ['Server solutions', 'Storage systems', 'Modular racks', 'Cabling systems'] },
  { title: 'Managed Hosting', slug: 'managed-hosting', category: 'run', order: 5,
    description: 'Fully managed infrastructure services with 24/7 support. Focus on your business, we handle the infrastructure.',
    descriptionZh: '全託管基礎設施服務，24/7支援。專注業務，基礎設施交給我們。',
    features: ['24/7 monitoring', 'Proactive maintenance', 'Disaster recovery', 'SLA guarantee'] },
  { title: 'Business Continuity', slug: 'business-continuity', category: 'run', order: 6,
    description: 'DR-as-a-Service and Backup-as-a-Service for data protection. Ensure business operations never stop.',
    descriptionZh: '災難恢復即服務和備份即服務，保護數據安全。確保業務永不中斷。',
    features: ['DR-as-a-Service', 'Backup-as-a-Service', 'DR Drill services', 'RTO/RPO optimization'] },

  // Protect
  { title: 'Next-Gen Firewall & IPS', slug: 'ngfw-ips', category: 'protect', order: 1,
    description: 'Advanced perimeter security with deep packet inspection and threat prevention. Stop attacks before they enter.',
    descriptionZh: '進階邊界安全，深度封包偵測與威脅防禦。在攻擊進入前攔截。',
    features: ['Deep packet inspection', 'Intrusion prevention', 'Application control', 'SSL inspection'] },
  { title: 'Web Application Firewall', slug: 'waf', category: 'protect', order: 2,
    description: 'Protect web applications from OWASP Top 10 and sophisticated attacks. Keep your web assets safe.',
    descriptionZh: '保護Web應用免受OWASP Top 10和複雜攻擊。守護您的網路資產。',
    features: ['OWASP Top 10 protection', 'Bot management', 'API security', 'Virtual patching'] },
  { title: 'Endpoint Detection & Response', slug: 'edr', category: 'protect', order: 3,
    description: 'Advanced endpoint protection with real-time threat detection and response. Secure every device.',
    descriptionZh: '進階端點保護，即時威脅偵測與回應。守護每一台設備。',
    features: ['Real-time detection', 'Automated response', 'Forensic analysis', 'Threat hunting'] },
  { title: 'Network Detection & Response', slug: 'ndr', category: 'protect', order: 4,
    description: 'Monitor network traffic for anomalies and respond to threats in real-time. See everything on your network.',
    descriptionZh: '監控網路流量異常並即時回應威脅。掌握網路上的一切。',
    features: ['Traffic analysis', 'Anomaly detection', 'Encrypted traffic inspection', 'Lateral movement detection'] },
  { title: 'Cloud Security', slug: 'cloud-security', category: 'protect', order: 5,
    description: 'CASB, SASE, and ZTNA solutions for comprehensive cloud protection. Secure your cloud journey.',
    descriptionZh: 'CASB、SASE和ZTNA解決方案，全面雲端防護。守護您的雲端之旅。',
    features: ['CASB', 'SASE', 'ZTNA', 'Cloud posture management'] },
  { title: 'SD-WAN & Load Balancing', slug: 'sd-wan', category: 'protect', order: 6,
    description: 'Optimize network performance with intelligent traffic management. Faster, more reliable connectivity.',
    descriptionZh: '智慧流量管理優化網路性能。更快、更可靠的連接。',
    features: ['Application-aware routing', 'WAN optimization', 'Link load balancing', 'Centralized management'] },
  { title: 'Managed Detection & Response', slug: 'mdr', category: 'protect', order: 7,
    description: '24/7 security monitoring, penetration testing, and expert threat analysis. Your extended security team.',
    descriptionZh: '24/7安全監控、滲透測試和專家威脅分析。您的 extended 安全團隊。',
    features: ['24/7 SOC monitoring', 'Penetration testing', 'Threat intelligence', 'Compliance reporting'] },
  { title: 'Incident Response', slug: 'incident-response', category: 'protect', order: 8,
    description: 'Rapid response to security incidents with expert forensic analysis. Minimize damage, restore fast.',
    descriptionZh: '專家鑑識分析，快速回應安全事件。最小化損害，快速恢復。',
    features: ['Rapid response', 'Forensic analysis', 'Ransomware recovery', 'Post-incident review'] },
];

// ============ BLOG POSTS ============
const posts = [
  { title: 'Building Resilient Hybrid Cloud Architecture', slug: 'building-resilient-hybrid-cloud',
    category: 'technical', author: 'TechGuru Engineering',
    excerpt: 'Learn how to design hybrid cloud environments that balance performance, cost, and compliance for enterprise workloads.',
    excerptZh: '了解如何設計兼顧性能、成本與合規的混合雲環境，滿足企業工作負載需求。',
    tags: ['hybrid cloud', 'architecture', 'enterprise'],
    publishedAt: '2025-05-15T00:00:00Z', featured: true,
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'Enterprise workloads are diverse. Some demand the elasticity of public cloud, while others require the control of private infrastructure. Hybrid cloud architecture bridges both worlds, letting you place each workload where it performs best.\n\nStart with workload classification: classify every application by latency sensitivity, data sovereignty, and burst requirements. Design for failure — assume every component will fail and build automatic failover. Automate everything from provisioning to scaling to recovery.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '企業工作負載多樣化。部分需要公有雲的彈性，部分需要私有基礎設施的掌控力。混合雲架構連接兩者，讓您將每個工作負載放置在最佳執行位置。\n\n從工作負載分類開始：依據延遲敏感度、數據主權和突發需求對每個應用進行分類。為故障而設計——假設每個元件都會故障，建立自動容錯機制。自動化一切，從配置到擴展到恢復。' }] }] },
  { title: 'Zero Trust Security: A Complete Implementation Guide', slug: 'zero-trust-security-guide',
    category: 'technical', author: 'Emily Zhang',
    excerpt: 'Deep dive into implementing zero trust architecture across your organization\'s network and applications.',
    excerptZh: '深入了解如何在組織網路與應用中實施零信任架構。',
    tags: ['zero trust', 'security', 'implementation'],
    publishedAt: '2025-05-10T00:00:00Z', featured: true,
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'Zero Trust is a security model that requires strict identity verification for every person and device trying to access resources, regardless of location. The core principle: never trust, always verify.\n\nImplementation Pillars: Identity (MFA everywhere, conditional access policies), Device (Endpoint detection, compliance checks), Network (Micro-segmentation, encrypted tunnels), Application (Per-app access, API gateway), Data (Classification, DLP, encryption at rest).' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '零信任是一種安全模型，要求對每個嘗試存取資源的人員和設備進行嚴格的身份驗證，不受位置影響。核心原則：永不信任，始終驗證。\n\n實施支柱：身份（全面多因素驗證、條件存取策略）、設備（端點偵測、合規檢查）、網路（微分段、加密隧道）、應用（逐應用存取、API閘道）、數據（分類、DLP、靜態加密）。' }] }] },
  { title: 'AI-Powered Infrastructure Monitoring in 2025', slug: 'ai-infrastructure-monitoring-2025',
    category: 'technical', author: 'Sarah Lin',
    excerpt: 'How machine learning is transforming IT operations with predictive analytics and automated incident response.',
    excerptZh: '機器學習如何透過預測分析與自動化事件回應革新IT運維。',
    tags: ['AI', 'monitoring', 'AIOps'],
    publishedAt: '2025-05-05T00:00:00Z', featured: false,
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'Traditional monitoring generates alerts. AI-powered monitoring generates insights. By analyzing patterns across millions of data points, AIOps platforms can predict failures before they happen.\n\nKey capabilities include anomaly detection without manual thresholds, automatic root cause analysis, capacity forecasting weeks in advance, and auto-remediation for common issues.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '傳統監控產生告警。AI驅動的監控產生洞察。透過分析數百萬數據點的模式，AIOps平台可在故障發生前預測。\n\n關鍵能力包括無需手動閾值的異常偵測、自動根因分析、提前數週的容量預測，以及常見問題的自動修復。' }] }] },
  { title: 'SD-WAN vs SASE: Choosing the Right Network Strategy', slug: 'sd-wan-vs-sase',
    category: 'technical', author: 'James Wang',
    excerpt: 'A practical comparison to help you decide between SD-WAN and SASE for your organization\'s network needs.',
    excerptZh: '實用比較指南，幫助您為組織網路需求選擇SD-WAN或SASE。',
    tags: ['SD-WAN', 'SASE', 'networking'],
    publishedAt: '2025-04-28T00:00:00Z', featured: false,
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'SD-WAN optimizes wide area networking by dynamically selecting the best path for traffic across multiple connection types. SASE combines SD-WAN with cloud-native security services (FWaaS, SWG, CASB, ZTNA) into a single platform.\n\nChoose SD-WAN if your primary need is branch connectivity optimization. Choose SASE if your workforce is distributed/remote and you want to consolidate vendors.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: 'SD-WAN透過跨多種連接類型動態選擇最佳路徑來優化廣域網路。SASE將SD-WAN與雲端原生安全服務整合為單一平台。\n\n選擇SD-WAN：主要需求是分支連接優化。選擇SASE：工作人員分佈式/遠端且希望整合供應商。' }] }] },
  { title: 'Cloud Cost Optimization: 10 Proven Strategies', slug: 'cloud-cost-optimization',
    category: 'industry', author: 'TechGuru Engineering',
    excerpt: 'Discover actionable techniques to reduce cloud spending while maintaining performance and reliability.',
    excerptZh: '發現可操作的技術，在維持性能與可靠性的同時降低雲端支出。',
    tags: ['cloud', 'cost optimization', 'finops'],
    publishedAt: '2025-04-20T00:00:00Z', featured: false,
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'Most over-provisioned instances run at less than 20% utilization. Use monitoring data to match instance sizes to actual workload requirements. Commit to reserved instances for predictable workloads. Use spot instances for fault-tolerant workloads like batch processing and CI/CD.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '大多數過度配置的實例利用率低於20%。使用監控數據匹配實際工作負載需求的實例規格。對可預測的工作負載承諾保留實例。將競價實例用於容錯工作負載如批次處理和CI/CD。' }] }] },
  { title: 'Ransomware Prevention: Enterprise Defense Playbook', slug: 'ransomware-prevention',
    category: 'case-study', author: 'Emily Zhang',
    excerpt: 'Comprehensive strategies to protect your organization against evolving ransomware threats.',
    excerptZh: '全面策略保護您的組織免受持續演變的勒索軟體威脅。',
    tags: ['ransomware', 'security', 'defense'],
    publishedAt: '2025-04-15T00:00:00Z', featured: true,
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'Ransomware attacks have evolved from opportunistic to targeted. Attackers now research victims, customize payloads, and demand multi-million dollar ransoms. Prevention is far cheaper than recovery.\n\nPrevention layers: Email security with sandboxing, endpoint protection with behavioral analysis, network segmentation to limit lateral movement, least privilege access controls, and immutable backup copies following the 3-2-1 rule.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '勒索軟體攻擊已從機會型演變為針對性攻擊。攻擊者現在研究受害者、定制有效載荷，並要求數百萬美元贖金。預防遠比恢復便宜。\n\n預防層級：具備沙箱的郵件安全、具備行為分析的端點保護、限制橫向移動的網路分段、最小權限存取控制，以及遵循3-2-1規則的不可變備份副本。' }] }] },
];

// ============ CASE STUDIES ============
const caseStudies = [
  { title: 'Regional Hospital Network Cloud Migration', slug: 'hospital-cloud-migration',
    industry: 'healthcare', clientName: 'Regional Hospital Network',
    summary: 'Migrated 12 hospitals to a HIPAA-compliant hybrid cloud, reducing IT costs by 35% while improving patient data accessibility.',
    summaryZh: '將12家醫院遷移至HIPAA合規混合雲，降低IT成本35%同時提升患者數據可及性。',
    productsUsed: ['AWS Hybrid Cloud', 'Kubernetes', 'Terraform', 'Splunk'],
    results: ['35% reduction in IT infrastructure costs', '99.99% uptime across all hospitals', 'Unified patient data platform serving 500K+ patients', 'HIPAA compliance certification maintained'],
    publishedAt: '2025-05-01T00:00:00Z',
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'A regional hospital network with 12 facilities struggled with siloed IT systems, rising VMware licensing costs, and HIPAA compliance requirements. Patient data was fragmented across legacy systems, making coordinated care difficult.\n\nWe designed a HIPAA-compliant hybrid cloud architecture connecting all 12 hospitals. Implemented Kubernetes for container orchestration, Terraform for infrastructure-as-code, and Splunk for centralized logging and compliance monitoring. The migration was completed with zero downtime.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '一家擁有12家醫院的區域醫院網路面臨IT系統孤島、VMware授權成本上升和HIPAA合規要求。患者數據分散在老舊系統中，難以提供協調護理。\n\n我們設計了連接所有12家醫院的HIPAA合規混合雲架構。實施Kubernetes容器編排、Terraform基礎設施即代碼，以及Splunk集中日誌和合規監控。遷移過程零停機。' }] }] },
  { title: 'Banking Group Zero Trust Transformation', slug: 'banking-zero-trust',
    industry: 'finance', clientName: 'Major Banking Group',
    summary: 'Implemented zero trust security across 200+ branches, reducing breach risk by 60% with real-time threat detection.',
    summaryZh: '在200+分支機構實施零信任安全，透過即時威脅偵測降低60%入侵風險。',
    productsUsed: ['ZTNA', 'EDR', 'SIEM', 'MFA', 'Micro-segmentation'],
    results: ['60% reduction in breach risk', 'Real-time threat detection across 200+ branches', '30% reduction in security operational costs', 'Mean time to detect reduced from 4 hours to 15 minutes'],
    publishedAt: '2025-04-15T00:00:00Z',
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'A major banking group with 200+ branches faced increasing cyber threats and needed to modernize its security posture. Traditional perimeter-based security was insufficient against sophisticated attacks.\n\nWe implemented a comprehensive zero trust architecture across all branches and digital channels. Deployed micro-segmentation for network isolation, ZTNA for secure access, and advanced SIEM for real-time threat detection.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '一家擁有200+分支機構的銀行集團面臨日益嚴峻的網路威脅，需要現代化安全態勢。傳統基於邊界的安全無法應對複雜攻擊。\n\n我們在所有分支機構和數位渠道實施全面的零信任架構。部署微分段實現網路隔離、ZTNA實現安全存取，以及進階SIEM實現即時威脅偵測。' }] }] },
  { title: 'Retail Chain AI Demand Forecasting', slug: 'retail-ai-forecasting',
    industry: 'retail', clientName: 'National Retail Chain',
    summary: 'Deployed AI-driven inventory management across 500+ stores, reducing stockouts by 40% and improving margins.',
    summaryZh: '在500+門店部署AI庫存管理，減少40%缺貨率並提升利潤率。',
    productsUsed: ['TensorFlow', 'Apache Kafka', 'Snowflake', 'Power BI'],
    results: ['40% reduction in stockouts', '25% decrease in excess inventory', '15% improvement in profit margins', 'Real-time inventory visibility across all stores'],
    publishedAt: '2025-04-01T00:00:00Z',
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'A retail chain with 500+ stores struggled with inventory management, leading to frequent stockouts and overstock situations. Manual forecasting could not keep up with demand fluctuations.\n\nWe deployed AI-driven demand forecasting using TensorFlow models trained on historical sales data, weather patterns, and local events. Integrated with Apache Kafka for real-time data streaming and Snowflake for analytics.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '一家擁有500+門店的零售連鎖面臨庫存管理困難，頻繁缺貨和過度庫存。人工預測無法應對需求波動。\n\n我們使用TensorFlow模型訓練歷史銷售數據、天氣模式和本地活動，部署AI驅動的需求預測。整合Apache Kafka實現即時數據串流，Snowflake實現分析。' }] }] },
  { title: 'Logistics Firm Global Network Upgrade', slug: 'logistics-network-upgrade',
    industry: 'logistics', clientName: 'Global Logistics Firm',
    summary: 'Redesigned global network with SD-WAN, achieving 99.99% uptime and 50% faster cross-border data transfer.',
    summaryZh: '以SD-WAN重新設計全球網路，實現99.99%可用性與50%更快的跨境數據傳輸。',
    productsUsed: ['SD-WAN', 'MPLS', 'Cloudflare', 'Palo Alto'],
    results: ['99.99% network uptime achieved', '50% faster cross-border data transfer', '40% reduction in network operational costs', 'Real-time tracking visibility across 50+ countries'],
    publishedAt: '2025-03-15T00:00:00Z',
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'A global logistics firm experienced frequent network outages and slow cross-border data transfer, impacting real-time shipment tracking and customer service delivery.\n\nWe redesigned the global network with SD-WAN overlay on existing MPLS infrastructure. Implemented Cloudflare for DDoS protection and edge caching, and Palo Alto for next-gen firewall capabilities.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '一家全球物流公司頻繁遭遇網路中斷和跨境數據傳輸緩慢，影響即時貨物追蹤和客戶服務交付。\n\n我們使用SD-WAN疊加現有MPLS基礎設施重新設計全球網路。實施Cloudflare用於DDoS防護和邊緣快取，Palo Alto用於下一代防火牆功能。' }] }] },
  { title: 'University E-Learning Platform Scale-Up', slug: 'university-elearning',
    industry: 'education', clientName: 'National University',
    summary: 'Built scalable infrastructure supporting 100K+ concurrent users during peak exam periods with zero downtime.',
    summaryZh: '建構可擴展基礎設施，在高峰期支援10萬+並發使用者且零停機。',
    productsUsed: ['AWS Auto Scaling', 'CloudFront', 'RDS', 'Redis'],
    results: ['Support for 100K+ concurrent users with zero downtime', 'Sub-second page load times during peak periods', '70% reduction in infrastructure costs', '99.99% availability during exam seasons'],
    publishedAt: '2025-03-01T00:00:00Z',
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'A major university\'s e-learning platform crashed during peak exam periods with 100K+ concurrent users. The existing on-premise infrastructure could not scale to meet demand.\n\nWe migrated the platform to AWS with auto-scaling architecture. Implemented CloudFront CDN for content delivery, RDS for database scaling, and Redis for session management and caching.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '一所大學的線上學習平台在高峰期考試期間崩潰，10萬+並發使用者。現有本地基礎設施無法擴展滿足需求。\n\n我們使用自動擴展架構將平台遷移至AWS。實施CloudFront CDN用於內容交付、RDS用於資料庫擴展，Redis用於工作階段管理和快取。' }] }] },
  { title: 'Government Agency Legacy Modernization', slug: 'government-modernization',
    industry: 'government', clientName: 'Government Agency',
    summary: 'Modernized 20-year-old legacy systems with zero downtime, improving citizen service delivery by 70%.',
    summaryZh: '零停機現代化20年舊系統，提升70%市民服務交付效率。',
    productsUsed: ['Kubernetes', 'Istio', 'Keycloak', 'Vault'],
    results: ['70% improvement in citizen service delivery speed', 'Zero downtime during entire modernization', '90% reduction in security vulnerabilities', '40% reduction in operational costs'],
    publishedAt: '2025-02-15T00:00:00Z',
    content: [{ _type: 'block', children: [{ _type: 'span', text: 'A government agency operated 20-year-old legacy systems that were difficult to maintain, security vulnerabilities were mounting, and citizen service delivery was slow and inefficient.\n\nWe executed a phased modernization using Kubernetes for containerization, Istio for service mesh, Keycloak for identity management, and Vault for secrets management. Zero-downtime migration ensured continuous service availability.' }] }],
    contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '一個政府機關運營20年老舊系統，維護困難、安全漏洞增加，市民服務交付緩慢且效率低下。\n\n我們執行分階段現代化：使用Kubernetes容器化、Istio服務網格、Keycloak身份管理和Vault機密管理。零停機遷移確保服務持續可用。' }] }] },
];

// ============ SOLUTIONS ============
const solutions = [
  { title: 'Healthcare IT Solutions', slug: 'healthcare', industry: 'healthcare',
    description: 'Digital transformation for healthcare providers, improving patient outcomes through secure, compliant technology infrastructure.',
    descriptionZh: '為醫療機構提供數位轉型，透過安全合規的技術基礎設施改善患者預後。',
    challenges: ['Strict regulatory compliance (HIPAA, local data protection laws)', 'Legacy systems hindering digital patient care', 'Cybersecurity threats targeting sensitive health records'],
    recommendedProducts: ['SecureCloud Healthcare', 'DataVault Medical', 'NetGuard Health'] },
  { title: 'Finance IT Solutions', slug: 'finance', industry: 'finance',
    description: 'Robust, secure infrastructure for financial institutions, enabling real-time processing and regulatory compliance.',
    descriptionZh: '為金融機構提供穩健安全的基礎設施，實現即時處理和法規合規。',
    challenges: ['High-frequency transaction processing bottlenecks', 'Evolving financial regulatory requirements', 'Fraud detection and prevention at scale'],
    recommendedProducts: ['FinCloud Pro', 'ComplianceOS', 'RiskShield AI'] },
  { title: 'Retail IT Solutions', slug: 'retail', industry: 'retail',
    description: 'Omnichannel retail technology that personalizes customer experiences and optimizes supply chain operations.',
    descriptionZh: '全通路零售技術，個人化客戶體驗並優化供應鏈運營。',
    challenges: ['Fragmented omnichannel customer experience', 'Inventory visibility across multiple channels', 'Scalability during peak shopping seasons'],
    recommendedProducts: ['RetailCloud Hub', 'DemandSense AI', 'ScaleFlex Retail'] },
  { title: 'Logistics IT Solutions', slug: 'logistics', industry: 'logistics',
    description: 'End-to-end logistics technology solutions for supply chain visibility, optimization, and resilience.',
    descriptionZh: '端到端物流技術解決方案，實現供應鏈可視性、優化和韌性。',
    challenges: ['Limited real-time supply chain visibility', 'Route optimization and delivery efficiency', 'Cross-border data transfer and compliance'],
    recommendedProducts: ['LogiTrack Pro', 'RouteAI', 'BorderLink Secure'] },
  { title: 'Education IT Solutions', slug: 'education', industry: 'education',
    description: 'Scalable, accessible technology infrastructure for modern educational institutions and e-learning platforms.',
    descriptionZh: '為現代教育機構和線上學習平台提供可擴展、可及的技術基礎設施。',
    challenges: ['Supporting large-scale remote learning platforms', 'Protecting student data and privacy', 'Managing hybrid on-premise and cloud environments'],
    recommendedProducts: ['EduCloud Platform', 'StudentShield', 'CampusNet Hybrid'] },
  { title: 'Government IT Solutions', slug: 'government', industry: 'government',
    description: 'Secure, sovereign technology solutions for government agencies, meeting strict compliance and availability requirements.',
    descriptionZh: '為政府機關提供安全、主權的技術解決方案，滿足嚴格合規和可用性要求。',
    challenges: ['Stringent security and data sovereignty mandates', 'Legacy system modernization with zero downtime', 'Citizen-facing services reliability at scale'],
    recommendedProducts: ['GovCloud Sovereign', 'LegacyBridge', 'CitizenHub Platform'] },
];

async function insertAll() {
  console.log('Starting Sanity content insertion...\n');

  // Insert products
  console.log(`Inserting ${products.length} products...`);
  for (const p of products) {
    try {
      await client.createOrReplace({ _type: 'product', _id: `product-${p.slug}`, ...p });
      process.stdout.write('.');
    } catch (e) { console.log(`\nError product ${p.title}: ${e.message}`); }
  }
  console.log(`\nProducts done.\n`);

  // Insert posts
  console.log(`Inserting ${posts.length} blog posts...`);
  for (const p of posts) {
    try {
      await client.createOrReplace({ _type: 'post', _id: `post-${p.slug}`, ...p });
      process.stdout.write('.');
    } catch (e) { console.log(`\nError post ${p.title}: ${e.message}`); }
  }
  console.log(`\nPosts done.\n`);

  // Insert case studies
  console.log(`Inserting ${caseStudies.length} case studies...`);
  for (const c of caseStudies) {
    try {
      await client.createOrReplace({ _type: 'caseStudy', _id: `case-${c.slug}`, ...c });
      process.stdout.write('.');
    } catch (e) { console.log(`\nError case ${c.title}: ${e.message}`); }
  }
  console.log(`\nCase studies done.\n`);

  // Insert solutions
  console.log(`Inserting ${solutions.length} solutions...`);
  for (const s of solutions) {
    try {
      await client.createOrReplace({ _type: 'solution', _id: `solution-${s.slug}`, ...s });
      process.stdout.write('.');
    } catch (e) { console.log(`\nError solution ${s.title}: ${e.message}`); }
  }
  console.log(`\nSolutions done.\n`);

  // Verify
  const counts = await Promise.all([
    client.fetch('count(*[_type == "product"])'),
    client.fetch('count(*[_type == "post"])'),
    client.fetch('count(*[_type == "caseStudy"])'),
    client.fetch('count(*[_type == "solution"])'),
  ]);
  console.log('=== Verification ===');
  console.log(`Products: ${counts[0]}`);
  console.log(`Posts: ${counts[1]}`);
  console.log(`Case Studies: ${counts[2]}`);
  console.log(`Solutions: ${counts[3]}`);
  console.log('Total:', counts.reduce((a, b) => a + b, 0));
  console.log('\nAll content inserted successfully!');
}

insertAll().catch(e => console.error('Fatal error:', e));
