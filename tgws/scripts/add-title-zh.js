const { createClient } = require('next-sanity');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: envVars.SANITY_API_TOKEN
});

const titleZhMap = {
  'vmware-broadcom-acquisition-alternatives-comparison': 'VMware被博通收購後：替代方案全面比較',
  'broadcom-vmware-one-year-customer-feedback': 'Broadcom收購VMware一年後：客戶真實反饋',
  '2025-hyperconverged-infrastructure-market-trends': '2025年超融合架構市場趨勢',
  'ai-infra-hype-cold-reality-check': 'AI Infra熱潮下的冷思考',
  'sangfor-vs-nutanix-vs-proxmox-comparison': 'Sangfor vs Nutanix vs Proxmox 橫評',
  'cloud-cost-repatriation-trend-2025': '雲成本失控：Cloud Repatriation趨勢',
  'sd-wan-vs-sase-selection-guide': 'SD-WAN vs SASE 選擇指南',
  'ransomware-as-a-service-defense-sme': 'Ransomware-as-a-Service 中小企業防禦',
  'sangfor-hci-deep-dive-analysis': 'Sangfor HCI超融合深度解析',
  'proxmox-ve-enterprise-deployment-guide': 'Proxmox VE企業部署完全指南',
  'hyper-v-vs-vmware-esxi-ultimate-comparison': 'Hyper-V vs VMware ESXi 終極比較',
  'sangfor-asv-performance-review': 'Sangfor aSV功能與性能評測',
  'enterprise-firewall-palo-alto-fortinet-sangfor': '企業防火牆選型：Palo Alto vs Fortinet vs Sangfor',
  'edr-comparison-crowdstrike-sentinelone-sangfor': 'EDR比較：CrowdStrike vs SentinelOne vs Sangfor',
  'nutanix-hci-philippines-finance-case-study': 'Nutanix超融合在菲律賓金融業的應用案例',
  'server-virtualization-platform-selection-guide': '伺服器虛擬化平台選型指南：四大平台橫評',
  'hybrid-cloud-architecture-design-guide': '混合雲架構設計實戰指南',
  'legacy-system-ai-enablement-methodology': '老舊系統AI賦能方法論',
  '2025-endpoint-security-threat-trends': '2025端點安全威脅趨勢',
  'server-virtualization-migration-best-practices': '伺服器虛擬化遷移最佳實踐',
  'sd-wan-multinational-enterprise-network-optimization': 'SD-WAN跨國企業網路優化',
  'enterprise-storage-solution-selection': '企業級存儲方案選型',
  'draas-vs-self-built-disaster-recovery': 'DRaaS vs 自建災備比較',
  'zero-trust-network-architecture-implementation': '零信任網路架構落地',
  'philippines-enterprise-it-pain-points-solutions': '菲律賓企業IT痛點與方案',
  'sme-cybersecurity-limited-budget-solutions': '中小企業有限預算安全方案',
  'small-business-under-100-employees-it-planning': '100人以下企業IT規劃',
  'multinational-enterprise-global-branch-it-management': '跨國企業全球分支IT統管',
  'cloud-migration-failure-five-reasons': '雲端遷移失敗5個原因',
  'enterprise-it-asset-inventory-methodology': '企業IT資產盤點方法論'
};

async function main() {
  const query = '*[_type == "post"] | order(publishedAt asc)';
  const posts = await client.fetch(query);

  console.log('Found ' + posts.length + ' posts');

  let fixed = 0;
  for (const post of posts) {
    const slug = post.slug && post.slug.current;
    const titleZh = titleZhMap[slug];

    if (!titleZh) {
      console.log('SKIP: ' + slug);
      continue;
    }

    const patch = client.patch(post._id).set({ titleZh: titleZh });
    await patch.commit();
    fixed++;
    console.log('FIXED: ' + slug);
  }

  console.log('\nDone. Fixed ' + fixed + ' posts.');
}

main().catch(console.error);
