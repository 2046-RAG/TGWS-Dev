/**
 * Migration: Populate relatedVendors for all 28 products
 * Each product gets vendor-specific solutions instead of generic same-category links
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
  }
}

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Vendor solution mappings per product slug
const vendorMap = {
  // === BUILD (AI) ===
  'ai-adoption-services': [
    { vendor: 'ByteDance', solution: 'AI Readiness Assessment', description: 'Enterprise AI maturity evaluation and adoption roadmap', descriptionZh: '企業AI成熟度評估與導入路線圖' },
    { vendor: 'Alibaba Cloud', solution: 'AI Adoption Program', description: 'Cloud-native AI assessment and deployment services', descriptionZh: '雲原生AI評估與部署服務' },
    { vendor: 'Huawei', solution: 'AI Consultation Services', description: 'End-to-end AI strategy consulting and implementation', descriptionZh: '端到端AI策略諮詢與實施' },
  ],
  'ai-generated-content-aigc': [
    { vendor: 'ByteDance', solution: 'Jimeng (即梦) / Seedance', description: 'Text-to-video and image-to-video generation platform', descriptionZh: '文字轉影片與圖片轉影片生成平台' },
    { vendor: 'Alibaba Cloud', solution: 'Wan 2.7 / HappyHorse', description: 'Multi-modal generative AI for images and video', descriptionZh: '多模態生成式AI圖像與影片' },
    { vendor: 'Alibaba Cloud', solution: 'CosyVoice', description: 'Natural text-to-speech synthesis engine', descriptionZh: '自然文字轉語音合成引擎' },
    { vendor: 'ByteDance', solution: 'Seedance 1.0', description: 'Professional-grade video generation from text prompts', descriptionZh: '專業級文字提示影片生成' },
  ],
  'ai-assisted-coding': [
    { vendor: 'ByteDance', solution: 'MarsCode IDE', description: 'AI-native IDE with code completion and generation', descriptionZh: 'AI原生IDE，支援程式碼補全與生成' },
    { vendor: 'Alibaba Cloud', solution: 'Tongyi Lingma (通義靈碼)', description: 'AI pair programmer for enterprise development', descriptionZh: '企業開發AI結對程式設計師' },
    { vendor: 'Huawei', solution: 'CodeArts Snap', description: 'AI-powered code assistant for DevOps pipeline', descriptionZh: 'AI驅動的DevOps程式碼助手' },
  ],
  'ai-agent-development': [
    { vendor: 'ByteDance', solution: 'Coze (扣子) Platform', description: 'No-code AI agent building and deployment platform', descriptionZh: '無程式碼AI智能體建構與部署平台' },
    { vendor: 'Alibaba Cloud', solution: 'Qwen-Agent Framework', description: 'Open-source agent framework for complex task orchestration', descriptionZh: '開源智能體框架，複雜任務編排' },
    { vendor: 'Huawei', solution: 'Pangu Agent Engine', description: 'Enterprise-grade AI agent runtime and management', descriptionZh: '企業級AI智能體運行時與管理' },
  ],
  'enterprise-legacy-system-ai-augmentation': [
    { vendor: 'Huawei', solution: 'Pangu Large Model', description: 'Industry-specific LLM for legacy system modernization', descriptionZh: '行業專用大模型，老舊系統現代化' },
    { vendor: 'Alibaba Cloud', solution: 'Qwen (通義千問)', description: 'Multi-modal LLM for document understanding and automation', descriptionZh: '多模態大模型，文件理解與自動化' },
    { vendor: 'ByteDance', solution: 'Doubao (豆包) Pro', description: 'Enterprise AI assistant for legacy workflow augmentation', descriptionZh: '企業AI助手，老舊工作流增強' },
  ],

  // === RUN (Infrastructure) ===
  'server-virtualization-platform': [
    { vendor: 'Nutanix', solution: 'AHV Virtualization', description: 'Hyper-converged virtualization with built-in management', descriptionZh: '內建管理的超融合虛擬化' },
    { vendor: 'Proxmox', solution: 'VE Virtualization', description: 'Open-source server virtualization management platform', descriptionZh: '開源伺服器虛擬化管理平台' },
    { vendor: 'Sangfor', solution: 'aCloud Virtualization', description: 'HCI-integrated virtualization for SMB and enterprise', descriptionZh: '超融合整合虛擬化，適用中小企業與企業' },
  ],
  'hyper-converged-infrastructure': [
    { vendor: 'Nutanix', solution: 'NX Series HCI', description: 'Industry-leading hyper-converged infrastructure appliances', descriptionZh: '業界領先的超融合基礎設施設備' },
    { vendor: 'H3C', solution: 'UIS Hyper Converged', description: 'Converged infrastructure for cloud and virtualization', descriptionZh: '雲端與虛擬化融合基礎設施' },
    { vendor: 'Huawei', solution: 'FusionCube HCI', description: 'All-in-one hyper-converged infrastructure system', descriptionZh: '一站式超融合基礎設施系統' },
  ],
  'cloud-migration': [
    { vendor: 'Alibaba Cloud', solution: 'Enterprise Migration Service', description: 'Full-lifecycle cloud migration assessment and execution', descriptionZh: '全生命週期雲端遷移評估與執行' },
    { vendor: 'Huawei', solution: 'Cloud Migration Center', description: 'Automated workload migration to Huawei Cloud', descriptionZh: '自動化工作負載遷移至華為雲' },
    { vendor: 'Sangfor', solution: 'aCloud Migration', description: 'Hybrid cloud migration with minimal downtime', descriptionZh: '混合雲遷移，最小停機時間' },
  ],
  'cloud-repatriation': [
    { vendor: 'Nutanix', solution: 'Private Cloud Solution', description: 'On-premise private cloud as public cloud alternative', descriptionZh: '本地私有雲替代公有雲方案' },
    { vendor: 'Proxmox', solution: 'Private Cloud Stack', description: 'Cost-effective on-premise cloud infrastructure', descriptionZh: '具成本效益的本地雲端基礎設施' },
    { vendor: 'Huawei', solution: 'FusionSphere Private Cloud', description: 'Enterprise private cloud platform for data sovereignty', descriptionZh: '企業私有雲平台，資料主權保障' },
  ],
  'managed-hosting-services': [
    { vendor: 'Dell', solution: 'PowerEdge Servers', description: 'Enterprise server hardware for managed hosting', descriptionZh: '企業級託管主機伺服器硬體' },
    { vendor: 'HP', solution: 'ProLiant Servers', description: 'Reliable server platform for managed infrastructure', descriptionZh: '可靠伺服器平台，託管基礎設施' },
    { vendor: 'Lenovo', solution: 'ThinkSystem Servers', description: 'High-performance servers for managed hosting environments', descriptionZh: '高效能伺服器，託管主機環境' },
  ],
  'business-continuity-disaster-recovery': [
    { vendor: 'Veeam', solution: 'Backup & Replication', description: 'Industry-leading data protection and disaster recovery', descriptionZh: '業界領先的資料保護與災難復原' },
    { vendor: 'StarWind', solution: 'Backup & Replication', description: 'Cost-effective BCDR for SMB environments', descriptionZh: '具成本效益的中小企業BCDR' },
    { vendor: 'Nutanix', solution: 'Leap DRaaS', description: 'Cloud-based disaster recovery as a service', descriptionZh: '雲端災難復原即服務' },
  ],
  'enterprise-storage-solutions': [
    { vendor: 'Dell', solution: 'PowerStore / PowerScale', description: 'Enterprise all-flash and scale-out storage', descriptionZh: '企業級全快閃與橫向擴展儲存' },
    { vendor: 'HP', solution: 'Alletra / Nimble', description: 'Intelligent storage for hybrid cloud', descriptionZh: '混合雲智慧儲存' },
    { vendor: 'Lenovo', solution: 'DM Series Storage', description: 'Unified storage for block and file workloads', descriptionZh: '區塊與檔案工作負載統一儲存' },
  ],

  // RUN - Network
  'enterprise-routers': [
    { vendor: 'Huawei', solution: 'NetEngine AR Series', description: 'Enterprise WAN routers with SD-WAN capability', descriptionZh: '企業WAN路由器，支援SD-WAN' },
    { vendor: 'H3C', solution: 'MSR Series Routers', description: 'Multi-service routers for enterprise networks', descriptionZh: '多業務路由器，企業網路' },
    { vendor: 'Ruijie', solution: 'EG Series Gateway', description: 'Enterprise gateway and routing solutions', descriptionZh: '企業閘道器與路由方案' },
    { vendor: 'Sangfor', solution: 'SD-WAN Appliance', description: 'Integrated SD-WAN and routing platform', descriptionZh: '整合SD-WAN與路由平台' },
  ],
  'core-switches': [
    { vendor: 'Huawei', solution: 'S12700 Series', description: 'Campus core switches for large enterprises', descriptionZh: '大型企業園區核心交換機' },
    { vendor: 'H3C', solution: 'S12500 Series', description: 'High-performance data center and campus core', descriptionZh: "高效能資料中心與園區核心" },
    { vendor: 'Cisco', solution: 'Catalyst 9000 Series', description: 'Next-gen campus core switching platform', descriptionZh: '新一代園區核心交換平台' },
    { vendor: 'Ruijie', solution: 'RG-S7800C Series', description: 'Cloud-scale core switches', descriptionZh: '雲級核心交換機' },
  ],
  'access-switches': [
    { vendor: 'Huawei', solution: 'S5700/S5735 Series', description: 'Enterprise access layer switches', descriptionZh: '企業接入層交換機' },
    { vendor: 'H3C', solution: 'S5130/S5560X Series', description: 'PoE access switches for campus networks', descriptionZh: 'PoE接入交換機，園區網路' },
    { vendor: 'Ruijie', solution: 'RG-S5750 Series', description: 'Smart managed access switches', descriptionZh: '智能管理型接入交換機' },
    { vendor: 'Sangfor', solution: 'SD-WAN Branch Switch', description: 'Branch access switching with SD-WAN integration', descriptionZh: '分支接入交換，SD-WAN整合' },
  ],
  'aggregation-switches': [
    { vendor: 'Huawei', solution: 'S6700 Series', description: 'Aggregation layer switches for campus', descriptionZh: '園區匯聚層交換機' },
    { vendor: 'H3C', solution: 'S6520X Series', description: '10GbE aggregation switching', descriptionZh: '10GbE匯聚交換' },
    { vendor: 'Ruijie', solution: 'RG-S5760C Series', description: 'Multi-gigabit aggregation switches', descriptionZh: '多千兆匯聚交換機' },
  ],
  'enterprise-wireless-ap': [
    { vendor: 'Huawei', solution: 'AirEngine 5700 Series', description: 'Wi-Fi 6 enterprise access points', descriptionZh: 'Wi-Fi 6企業接入點' },
    { vendor: 'H3C', solution: 'WA6600 Series', description: 'High-density wireless access points', descriptionZh: '高密度無線接入點' },
    { vendor: 'Ruijie', solution: 'RG-AP880-I', description: 'Enterprise Wi-Fi 6 access points', descriptionZh: '企業Wi-Fi 6接入點' },
    { vendor: 'Sangfor', solution: 'AI WLAN AP', description: 'AI-optimized wireless access points', descriptionZh: 'AI優化無線接入點' },
  ],
  'wireless-controllers': [
    { vendor: 'Huawei', solution: 'AC6500/AC6800', description: 'Wireless LAN controllers for large campus', descriptionZh: '大型園區無線區域網路控制器' },
    { vendor: 'H3C', solution: 'WX3500 Series', description: 'Centralized wireless management controllers', descriptionZh: '集中式無線管理控制器' },
    { vendor: 'Ruijie', solution: 'RG-WS6800 Series', description: 'Cloud-managed wireless controllers', descriptionZh: '雲端管理無線控制器' },
  ],
  'outdoor-wireless-ap': [
    { vendor: 'Huawei', solution: 'AirEngine 5760-15 Series', description: 'Outdoor-rated Wi-Fi 6 access points', descriptionZh: '室外型Wi-Fi 6接入點' },
    { vendor: 'H3C', solution: 'WA6320-C', description: 'Ruggedized outdoor wireless AP', descriptionZh: '堅固型室外無線AP' },
    { vendor: 'Ruijie', solution: 'RG-AP740-I', description: 'Outdoor enterprise access points', descriptionZh: '室外企業接入點' },
  ],
  'wifi-6-7-ap': [
    { vendor: 'Huawei', solution: 'AirEngine 7700 Series', description: 'Wi-Fi 7 next-gen access points', descriptionZh: 'Wi-Fi 7下一代接入點' },
    { vendor: 'H3C', solution: 'WA7600 Series', description: 'Wi-Fi 7 high-performance APs', descriptionZh: 'Wi-Fi 7高效能AP' },
    { vendor: 'Ruijie', solution: 'RG-AP970-I', description: 'Wi-Fi 7 flagship access points', descriptionZh: 'Wi-Fi 7旗艦接入點' },
  ],

  // === PROTECT (Security) ===
  'next-gen-firewall-ips': [
    { vendor: 'Fortinet', solution: 'FortiGate Series', description: 'Industry-leading next-gen firewall with ASIC acceleration', descriptionZh: '業界領先的下一代防火牆，ASIC加速' },
    { vendor: 'Hillstone', solution: 'SG-6000 Series', description: 'High-performance next-gen firewall appliances', descriptionZh: '高效能下一代防火牆設備' },
    { vendor: 'Sangfor', solution: 'NGAF Firewall', description: 'AI-powered next-gen application firewall', descriptionZh: 'AI驅動的下一代應用防火牆' },
    { vendor: 'Sophos', solution: 'XGS Series', description: 'Synchronized next-gen firewall with threat intelligence', descriptionZh: '同步威脅情報的下一代防火牆' },
  ],
  'web-application-firewall': [
    { vendor: 'Fortinet', solution: 'FortiWeb', description: 'Web application firewall with AI-based threat detection', descriptionZh: 'Web應用防火牆，AI威脅檢測' },
    { vendor: 'Sangfor', solution: 'WAF Appliance', description: 'Web application protection against OWASP Top 10', descriptionZh: 'Web應用保護，防禦OWASP Top 10' },
    { vendor: 'Hillstone', solution: 'SA Series WAF', description: 'Application-layer security gateway', descriptionZh: '應用層安全閘道' },
  ],
  'endpoint-detection-response': [
    { vendor: 'Sophos', solution: 'Intercept X EDR', description: 'Advanced endpoint detection and response with deep learning', descriptionZh: '進階端點偵測與回應，深度學習' },
    { vendor: 'Fortinet', solution: 'FortiEDR', description: 'Real-time endpoint protection and incident response', descriptionZh: '即時端點保護與事件回應' },
    { vendor: 'Sangfor', solution: 'EDR Solution', description: 'Behavior-based endpoint detection and response', descriptionZh: '行為偵測的端點偵測與回應' },
  ],
  'network-detection-response': [
    { vendor: 'Fortinet', solution: 'FortiNDR', description: 'AI-driven network detection and response platform', descriptionZh: 'AI驅動的網路偵測與回應平台' },
    { vendor: 'Sangfor', solution: 'NDR Solution', description: 'Network traffic analysis and threat detection', descriptionZh: '網路流量分析與威脅偵測' },
    { vendor: 'Sophos', solution: 'NDR Module', description: 'Network detection with deep packet inspection', descriptionZh: '深度封包檢測的網路偵測' },
  ],
  'cloud-security': [
    { vendor: 'Fortinet', solution: 'FortiCASB', description: 'Cloud access security broker for SaaS protection', descriptionZh: '雲端存取安全代理，SaaS保護' },
    { vendor: 'Sophos', solution: 'Cloud Optix', description: 'Cloud security posture management and compliance', descriptionZh: '雲端安全態勢管理與合規' },
    { vendor: 'Sangfor', solution: 'Cloud Security Gateway', description: 'Integrated cloud workload protection platform', descriptionZh: '整合雲端工作負載保護平台' },
  ],
  'sd-wan-load-balancing': [
    { vendor: 'Fortinet', solution: 'FortiGate SD-WAN', description: 'Integrated SD-WAN with security in single appliance', descriptionZh: '整合SD-WAN與安全，單一設備' },
    { vendor: 'Sangfor', solution: 'SD-WAN Solution', description: 'Intelligent WAN optimization and load balancing', descriptionZh: '智能WAN優化與負載均衡' },
    { vendor: 'Hillstone', solution: 'SD-WAN Gateway', description: 'Cost-effective SD-WAN for branch connectivity', descriptionZh: '具成本效益的SD-WAN，分支連接' },
  ],
  'managed-detection-response': [
    { vendor: 'Fortinet', solution: 'FortiGuard MDR', description: '24/7 managed detection and response service', descriptionZh: '24/7託管偵測與回應服務' },
    { vendor: 'Sophos', solution: 'Sophos MDR', description: 'Fully managed threat detection and response', descriptionZh: '全託管威脅偵測與回應' },
    { vendor: 'Sangfor', solution: 'SOC-as-a-Service', description: 'Managed security operations center service', descriptionZh: '託管安全營運中心服務' },
  ],
  'incident-response': [
    { vendor: 'Fortinet', solution: 'FortiGuard IR Services', description: 'Expert incident response and forensic investigation', descriptionZh: '專家事件回應與取證調查' },
    { vendor: 'Sophos', solution: 'Incident Response Retainer', description: 'Pre-purchased IR services with rapid response SLA', descriptionZh: '預購IR服務，快速回應SLA' },
  ],
};

async function migrate() {
  console.log('Starting relatedVendors migration...');
  console.log(`Products to update: ${Object.keys(vendorMap).length}`);

  let success = 0;
  let errors = 0;

  for (const [slug, vendors] of Object.entries(vendorMap)) {
    try {
      // Find the product by slug
      const product = await client.fetch(
        `*[_type == "product" && slug.current == $slug][0]._id`,
        { slug }
      );

      if (!product) {
        console.log(`  SKIP: ${slug} (not found in Sanity)`);
        continue;
      }

      // Patch the document
      await client
        .patch(product)
        .set({ relatedVendors: vendors })
        .commit();

      console.log(`  OK: ${slug} → ${vendors.length} vendors`);
      success++;
    } catch (err) {
      console.error(`  FAIL: ${slug} → ${err.message}`);
      errors++;
    }
  }

  console.log(`\nMigration complete: ${success} updated, ${errors} errors`);
}

migrate().catch(console.error);
