const solutions = [
  {
    title: 'VMware替代方案 - 金融機構虛擬化轉型',
    slug: 'finance-vmware-alternative',
    industry: 'finance',
    description:
      '提供金融機構完整的VMware替代方案，結合高效能伺服器虛擬化平台、超融合基礎設施與災難復原服務，協助企業在降低成本的同時維持金融級別的可靠性與效能。此方案特別針對金融業對高可用性與災難復原的嚴格要求而設計。',
    descriptionZh:
      '提供金融機構完整的VMware替代方案，結合高效能伺服器虛擬化平台、超融合基礎設施與災難復原服務，協助企業在降低成本的同時維持金融級別的可靠性與效能。此方案特別針對金融業對高可用性與災難復原的嚴格要求而設計。',
    challenges: [
      'VMware授權費用持續攀升，壓縮IT預算空間',
      '既有虛擬化環境缺乏統一管理工具，維運複雜度高',
      '金融法規要求災難復原時間目標（RTO）不超過4小時',
      '伺服器老舊導致交易系統效能不足'
    ],
    recommendedProducts: [
      'Server Virtualization Platform',
      'Hyper-Converged Infrastructure',
      'Disaster Recovery as a Service'
    ],
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'
  },
  {
    title: '混合雲架構 - 金融數位轉型',
    slug: 'finance-hybrid-cloud',
    industry: 'finance',
    description:
      '協助金融機構建構安全的混合雲架構，將核心銀行系統與雲端服務無縫整合。透過超融合基礎設施作為本地端運算基座，搭配專業雲端遷移服務與多層次安全防護，實現業務敏捷性與數據主權的雙重目標。',
    descriptionZh:
      '協助金融機構建構安全的混合雲架構，將核心銀行系統與雲端服務無縫整合。透過超融合基礎設施作為本地端運算基座，搭配專業雲端遷移服務與多層次安全防護，實現業務敏捷性與數據主權的雙重目標。',
    challenges: [
      '核心系統上雲風險評估困難，缺乏明確遷移路徑',
      '混合雲環境下的數據安全與存取控管複雜',
      '雲端成本缺乏有效監控機制，容易超支',
      '既有應用程式需改造才能適應雲端架構'
    ],
    recommendedProducts: [
      'Cloud Migration Service',
      'Hyper-Converged Infrastructure',
      'Cybersecurity Solution Suite'
    ],
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80'
  },
  {
    title: '金融端點安全防護',
    slug: 'finance-endpoint-security',
    industry: 'finance',
    description:
      '建構金融機構專屬的端點安全防護體系，整合端點偵測與回應、網路偵測與回應以及下一代防火牆，形成完整的威脅防禦縱深。此方案針對金融業高價值目標特性，提供即時威脅偵測與自動化回應能力。',
    descriptionZh:
      '建構金融機構專屬的端點安全防護體系，整合端點偵測與回應、網路偵測與回應以及下一代防火牆，形成完整的威脅防禦縱深。此方案針對金融業高價值目標特性，提供即時威脅偵測與自動化回應能力。',
    challenges: [
      '金融機構為APT攻擊首要目標，傳統防禦難以應對',
      '端點裝置數量龐大，安全策略難以一致執行',
      '內部威脅與社交工程攻擊日益增多',
      '安全事件回應時間過長，影響業務營運'
    ],
    recommendedProducts: [
      'Endpoint Detection and Response (EDR)',
      'Network Detection and Response (NDR)',
      'Next-Generation Firewall'
    ],
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=1200&q=80'
  },
  {
    title: '零售全通路基礎設施',
    slug: 'retail-omnichannel-infra',
    industry: 'retail',
    description:
      '為零售業打造支撐全通路營運的IT基礎設施，結合雲端遷移、SD-WAN與超融合技術，確保線上商城、實體門市與行動裝置的顧客體驗一致且流暢。此方案協助零售商快速部署新門市並擴展線上服務。',
    descriptionZh:
      '為零售業打造支撐全通路營運的IT基礎設施，結合雲端遷移、SD-WAN與超融合技術，確保線上商城、實體門市與行動裝置的顧客體驗一致且流暢。此方案協助零售商快速部署新門市並擴展線上服務。',
    challenges: [
      '多門市網路連線品質不一，影響POS系統穩定性',
      '線上線下庫存數據同步延遲，導致超賣或缺貨',
      '促銷活動期間流量暴增，基礎設施無法即時擴展',
      '新門市開幕IT部署週期過長'
    ],
    recommendedProducts: [
      'Cloud Migration Service',
      'SD-WAN Solution',
      'Hyper-Converged Infrastructure'
    ],
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'
  },
  {
    title: '零售AI智能運營',
    slug: 'retail-ai-operations',
    industry: 'retail',
    description:
      '運用AI代理技術與雲端數據分析平台，協助零售業實現智慧化營運。從顧客行為預測、庫存優化到動態定價，AI方案整合數據驅動決策，提升營運效率與顧客滿意度。',
    descriptionZh:
      '運用AI代理技術與雲端數據分析平台，協助零售業實現智慧化營運。從顧客行為預測、庫存優化到動態定價，AI方案整合數據驅動決策，提升營運效率與顧客滿意度。',
    challenges: [
      '銷售數據分散在多個系統，難以整合分析',
      '人工預測準確度不足，導致庫存積壓或缺貨',
      '顧客個人化推薦效果有限，轉換率偏低',
      '缺乏即時營運儀表板，決策速度慢'
    ],
    recommendedProducts: [
      'AI Agent Platform',
      'Cloud Computing Service',
      'Data Analytics Solution'
    ],
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80'
  },
  {
    title: '醫療基礎設施現代化',
    slug: 'healthcare-infra-modernization',
    industry: 'healthcare',
    description:
      '協助醫療機構將老舊IT基礎設施升級為現代化超融合平台，整合伺服器虛擬化與災難復原服務。此方案確保HIS、PACS等關鍵醫療系統7x24小時不中斷運行，同時降低長期營運成本。',
    descriptionZh:
      '協助醫療機構將老舊IT基礎設施升級為現代化超融合平台，整合伺服器虛擬化與災難復原服務。此方案確保HIS、PACS等關鍵醫療系統7x24小時不中斷運行，同時降低長期營運成本。',
    challenges: [
      'HIS與PACS系統對可用性要求極高，停機將影響病人安全',
      '醫療影像數據量龐大，儲存與備份壓力沉重',
      '老舊伺服器維護成本高，原廠已停止支援',
      '缺乏異地災難復原機制'
    ],
    recommendedProducts: [
      'Hyper-Converged Infrastructure',
      'Server Virtualization Platform',
      'Disaster Recovery as a Service'
    ],
    coverImage: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80'
  },
  {
    title: '遠距醫療平台建置',
    slug: 'healthcare-telemedicine',
    industry: 'healthcare',
    description:
      '建構安全穩定的遠距醫療平台，整合雲端運算、SD-WAN網路優化與醫療級資安防護。確保視訊問診、遠端監測與電子病歷傳輸的品質與安全性，讓醫療服務突破地理限制。',
    descriptionZh:
      '建構安全穩定的遠距醫療平台，整合雲端運算、SD-WAN網路優化與醫療級資安防護。確保視訊問診、遠端監測與電子病歷傳輸的品質與安全性，讓醫療服務突破地理限制。',
    challenges: [
      '偏遠地區醫療資源不足，病患就醫困難',
      '視訊問診對網路延遲與品質要求嚴格',
      '醫療數據傳輸須符合資安規範',
      '跨院所系統整合困難，數據無法共享'
    ],
    recommendedProducts: [
      'Cloud Migration Service',
      'SD-WAN Solution',
      'Cybersecurity Solution Suite'
    ],
    coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=80'
  },
  {
    title: '物流全球網路優化',
    slug: 'logistics-global-network',
    industry: 'logistics',
    description:
      '為物流業打造全球分支機構互連方案，透過SD-WAN技術優化跨國網路連線，結合雲端服務擴展營運彈性，並部署防火牆保護供應鏈數據安全。此方案確保倉儲、運輸與關務系統即時同步。',
    descriptionZh:
      '為物流業打造全球分支機構互連方案，透過SD-WAN技術優化跨國網路連線，結合雲端服務擴展營運彈性，並部署防火牆保護供應鏈數據安全。此方案確保倉儲、運輸與關務系統即時同步。',
    challenges: [
      '跨國據點網路延遲高，WMS系統反應慢',
      ' MPLS專線成本高昂，難以負擔多據點部署',
      '供應鏈數據傳輸缺乏加密保護',
      '不同國家法規對數據落地有不同要求'
    ],
    recommendedProducts: [
      'SD-WAN Solution',
      'Cloud Computing Service',
      'Next-Generation Firewall'
    ],
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80'
  },
  {
    title: '智慧倉儲解決方案',
    slug: 'logistics-smart-warehouse',
    industry: 'logistics',
    description:
      '運用超融合基礎設施作為運算基底，整合AI代理技術與IoT感測網路，打造智慧倉儲管理系統。從自動化庫存盤點、貨物追蹤到揀貨路徑優化，全面提升倉儲營運效率。',
    descriptionZh:
      '運用超融合基礎設施作為運算基底，整合AI代理技術與IoT感測網路，打造智慧倉儲管理系統。從自動化庫存盤點、貨物追蹤到揀貨路徑優化，全面提升倉儲營運效率。',
    challenges: [
      '倉儲人力短缺，旺季難以即時調度',
      '庫存精確度不足，影響訂單履行率',
      '傳統倉儲系統無法整合IoT感測數據',
      '揀貨效率低落，出貨速度無法滿足電商需求'
    ],
    recommendedProducts: [
      'Hyper-Converged Infrastructure',
      'AI Agent Platform',
      'IoT Gateway Solution'
    ],
    coverImage: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80'
  },
  {
    title: '教育雲端學習平台',
    slug: 'education-cloud-learning',
    industry: 'education',
    description:
      '協助教育機構建構可彈性擴展的雲端學習平台，透過自動擴縮技術因應學期初高峰流量，搭配CDN加速全球師生存取速度。從線上課程、即時互動到作業批改，提供穩定流畅的學習體驗。',
    descriptionZh:
      '協助教育機構建構可彈性擴展的雲端學習平台，透過自動擴縮技術因應學期初高峰流量，搭配CDN加速全球師生存取速度。從線上課程、即時互動到作業批改，提供穩定流畅的學習體驗。',
    challenges: [
      '開學期間流量暴增，系統頻繁當機',
      '海外分校師生存取速度慢，學習體驗差',
      '系統擴展需提前數月規劃，缺乏彈性',
      '影片課程串流品質不穩定'
    ],
    recommendedProducts: [
      'Cloud Migration Service',
      'Auto Scaling Solution',
      'Content Delivery Network (CDN)'
    ],
    coverImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&q=80'
  },
  {
    title: '校園網路安全防護',
    slug: 'education-campus-security',
    industry: 'education',
    description:
      '建構教育機構專屬的網路安全防護體系，整合防火牆、端點偵測與回應及網路偵測技術，保護師生個資與學術研究數據。此方案兼顧開放學術環境與資安防護的平衡需求。',
    descriptionZh:
      '建構教育機構專屬的網路安全防護體系，整合防火牆、端點偵測與回應及網路偵測技術，保護師生個資與學術研究數據。此方案兼顧開放學術環境與資安防護的平衡需求。',
    challenges: [
      '校園網路開放性高，容易成為攻擊跳板',
      '師生裝置多元，端點安全策略難以統一',
      '學術研究數據價值高，遭竊損失重大',
      '資安預算有限，難以部署完整防護'
    ],
    recommendedProducts: [
      'Next-Generation Firewall',
      'Endpoint Detection and Response (EDR)',
      'Network Detection and Response (NDR)'
    ],
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80'
  },
  {
    title: '製造業OT/IT融合方案',
    slug: 'manufacturing-ot-it-convergence',
    industry: 'manufacturing',
    description:
      '協助製造業將OT營運技術與IT資訊技術安全融合，透過網路偵測與回應技術監控OT網路異常，端點防護保護工業控制系統，並以微分段技術隔離OT/IT網路邊界。',
    descriptionZh:
      '協助製造業將OT營運技術與IT資訊技術安全融合，透過網路偵測與回應技術監控OT網路異常，端點防護保護工業控制系統，並以微分段技術隔離OT/IT網路邊界。',
    challenges: [
      'OT網路與IT網路直接連通，攻擊面擴大',
      '工業控制系統無法接受頻繁更新，漏洞難以修補',
      'OT設備生命週期長，老舊系統缺乏安全機制',
      '缺乏OT網路可視性，無法即時偵測異常'
    ],
    recommendedProducts: [
      'Network Detection and Response (NDR)',
      'Endpoint Detection and Response (EDR)',
      'Micro-segmentation Solution'
    ],
    coverImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1200&q=80'
  },
  {
    title: '製造業工廠虛擬化',
    slug: 'manufacturing-factory-virtualization',
    industry: 'manufacturing',
    description:
      '將製造業工廠的IT系統導入虛擬化與超融合架構，整合伺服器虛擬化平台、HCI與災難復原服務。此方案協助工廠整合多套獨立系統（MES、ERP、SCADA），降低硬體管理複雜度。',
    descriptionZh:
      '將製造業工廠的IT系統導入虛擬化與超融合架構，整合伺服器虛擬化平台、HCI與災難復原服務。此方案協助工廠整合多套獨立系統（MES、ERP、SCADA），降低硬體管理複雜度。',
    challenges: [
      '工廠IT機房環境嚴苛，設備故障率高',
      'MES與ERP系統各自獨立，資料難以整合',
      '硬體採購週期長，無法因應產線擴展需求',
      '缺乏備援機制，系統中斷導致產線停擺'
    ],
    recommendedProducts: [
      'Server Virtualization Platform',
      'Hyper-Converged Infrastructure',
      'Disaster Recovery as a Service'
    ],
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80'
  },
  {
    title: '房地產集團IT基礎設施',
    slug: 'realestate-group-infra',
    industry: 'finance',
    description:
      '為房地產集團建構統一的IT基礎設施平台，整合超融合技術簡化多案場管理、雲端服務支援跨區域協作、SD-WAN優化總部與據點間連線。此方案協助集團實現IT集中管理與營運效率提升。',
    descriptionZh:
      '為房地產集團建構統一的IT基礎設施平台，整合超融合技術簡化多案場管理、雲端服務支援跨區域協作、SD-WAN優化總部與據點間連線。此方案協助集團實現IT集中管理與營運效率提升。',
    challenges: [
      '多據點IT基礎設施分散，管理成本高',
      '銷售中心需要快速部署與撤收IT設備',
      '跨區域案場資料同步困難',
      '銷售旺季基礎設施無法即時擴展'
    ],
    recommendedProducts: [
      'Hyper-Converged Infrastructure',
      'Cloud Computing Service',
      'SD-WAN Solution'
    ],
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80'
  },
  {
    title: '菲律賓政府數位轉型',
    slug: 'government-philippines-digital',
    industry: 'government',
    description:
      '協助菲律賓政府機關推動數位轉型，透過雲端遷移將傳統系統現代化，超融合基礎設施簡化機房管理，資安方案確保政府數據安全。此方案支援菲律賓政府eGov數位政務願景。',
    descriptionZh:
      '協助菲律賓政府機關推動數位轉型，透過雲端遷移將傳統系統現代化，超融合基礎設施簡化機房管理，資安方案確保政府數據安全。此方案支援菲律賓政府eGov數位政務願景。',
    challenges: [
      '政府機關IT系統老舊，維護成本高',
      '各單位系統獨立運作，資料無法共享',
      '資安防護能力不足，屢遭網路攻擊',
      'IT人力短缺，難以維運複雜系統'
    ],
    recommendedProducts: [
      'Cloud Migration Service',
      'Hyper-Converged Infrastructure',
      'Cybersecurity Solution Suite'
    ],
    coverImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&q=80'
  },
  {
    title: '中小企業一鍵上雲',
    slug: 'sme-cloud-migration',
    industry: 'education',
    description:
      '為中小企業提供簡單快速的雲端遷移服務，搭配託管主機方案，無需專業IT人員即可完成系統上雲。從網站、ERP到電子郵件，一站式解決中小企業IT基礎建設需求。',
    descriptionZh:
      '為中小企業提供簡單快速的雲端遷移服務，搭配託管主機方案，無需專業IT人員即可完成系統上雲。從網站、ERP到電子郵件，一站式解決中小企業IT基礎建設需求。',
    challenges: [
      '缺乏IT專業人力，系統維運困難',
      '自有機房維護成本高，佔用辦公空間',
      '老舊系統難以支援遠端工作需求',
      '資料備份不完整，遭逢災難無法復原'
    ],
    recommendedProducts: [
      'Cloud Migration Service',
      'Managed Hosting Service'
    ],
    coverImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80'
  },
  {
    title: '企業全球IT統管平台',
    slug: 'enterprise-global-it-management',
    industry: 'government',
    description:
      '為跨國企業打造全球IT統管平台，整合SD-WAN全球網路、雲端運算、超融合基礎設施與資安防護，實現總部對全球據點的集中化管理與監控。此方案支援企業快速拓展海外市場。',
    descriptionZh:
      '為跨國企業打造全球IT統管平台，整合SD-WAN全球網路、雲端運算、超融合基礎設施與資安防護，實現總部對全球據點的集中化管理與監控。此方案支援企業快速拓展海外市場。',
    challenges: [
      '全球據點IT架構不一致，難以集中管理',
      '跨國網路連線成本高且品質不穩定',
      '各地資安標準不同，難以統一管控',
      '新據點IT部署週期長，影響業務拓展速度'
    ],
    recommendedProducts: [
      'SD-WAN Solution',
      'Cloud Computing Service',
      'Hyper-Converged Infrastructure',
      'Cybersecurity Solution Suite'
    ],
    coverImage: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1200&q=80'
  }
];

module.exports = { solutions };
