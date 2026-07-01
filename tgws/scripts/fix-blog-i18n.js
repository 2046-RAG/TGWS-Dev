const { createClient } = require('next-sanity');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
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

const titleMap = {
  'vmware-broadcom-acquisition-alternatives-comparison': 'VMware Post-Acquisition: Complete Alternatives Comparison',
  'broadcom-vmware-one-year-customer-feedback': 'Broadcom VMware One Year Later: Real Customer Feedback',
  '2025-hyperconverged-infrastructure-market-trends': '2025 Hyper-Converged Infrastructure Market Trends',
  'ai-infra-hype-cold-reality-check': 'AI Infrastructure Hype: A Cold Reality Check',
  'sangfor-vs-nutanix-vs-proxmox-comparison': 'Sangfor vs Nutanix vs Proxmox: Comprehensive Comparison',
  'cloud-cost-repatriation-trend-2025': 'Cloud Cost Crisis: The Repatriation Trend of 2025',
  'sd-wan-vs-sase-selection-guide': 'SD-WAN vs SASE: Selection Guide',
  'ransomware-as-a-service-defense-sme': 'Ransomware-as-a-Service: SME Defense Strategies',
  'sangfor-hci-deep-dive-analysis': 'Sangfor HCI Deep Dive Analysis',
  'proxmox-ve-enterprise-deployment-guide': 'Proxmox VE Enterprise Deployment Guide',
  'hyper-v-vs-vmware-esxi-ultimate-comparison': 'Hyper-V vs VMware ESXi: Ultimate Comparison',
  'sangfor-asv-performance-review': 'Sangfor aSV Performance Review',
  'enterprise-firewall-palo-alto-fortinet-sangfor': 'Enterprise Firewall: Palo Alto vs Fortinet vs Sangfor',
  'edr-comparison-crowdstrike-sentinelone-sangfor': 'EDR Comparison: CrowdStrike vs SentinelOne vs Sangfor',
  'nutanix-philippines-finance-case-study': 'Nutanix in Philippines Finance: Case Study',
  'server-virtualization-platform-guide': 'Server Virtualization Platform Selection Guide',
  'hybrid-cloud-architecture-design-guide': 'Hybrid Cloud Architecture Design Guide',
  'legacy-system-ai-augmentation-methodology': 'Legacy System AI Augmentation Methodology',
  '2025-endpoint-security-threat-trends': '2025 Endpoint Security Threat Trends',
  'server-virtualization-migration-best-practices': 'Server Virtualization Migration Best Practices',
  'sd-wan-multinational-network-optimization': 'SD-WAN for Multinational Network Optimization',
  'enterprise-storage-solution-selection': 'Enterprise Storage Solution Selection',
  'draas-vs-self-built-disaster-recovery': 'DRaaS vs Self-Built Disaster Recovery',
  'zero-trust-network-architecture-implementation': 'Zero Trust Network Architecture Implementation',
  'philippines-enterprise-it-challenges': 'Philippines Enterprise IT Challenges',
  'sme-budget-security-solutions': 'SME Budget Security Solutions',
  'sub-100-employee-it-planning': 'IT Planning for Companies Under 100 Employees',
  'multinational-global-branch-it-management': 'Multinational Global Branch IT Management',
  'cloud-migration-failure-5-reasons': 'Cloud Migration Failure: 5 Reasons',
  'enterprise-it-asset-inventory-methodology': 'Enterprise IT Asset Inventory Methodology'
};

const excerptMap = {
  'vmware-broadcom-acquisition-alternatives-comparison': 'After Broadcom completed its acquisition of VMware, licensing models changed dramatically. This article compares five major alternatives.',
  'broadcom-vmware-one-year-customer-feedback': 'Over a year after the acquisition, how are VMware customers progressing with migration? We interviewed dozens of IT leaders across Asia-Pacific.',
  '2025-hyperconverged-infrastructure-market-trends': 'The HCI market is undergoing structural transformation. From VMware exit to rising domestic solutions, 2025 brings a new order.',
  'ai-infra-hype-cold-reality-check': 'Every enterprise wants AI, but not every needs to build its own AI infrastructure. A pragmatic path matters more than following trends.',
  'sangfor-vs-nutanix-vs-proxmox-comparison': 'A comprehensive comparison of three major HCI solutions: deployment complexity, scalability, licensing costs, and local support.',
  'cloud-cost-repatriation-trend-2025': 'More enterprises are moving workloads back from public cloud. Cloud is not a silver bullet.',
  'sd-wan-vs-sase-selection-guide': 'SD-WAN and SASE are not mutually exclusive. Understanding their differences helps you choose based on actual needs.',
  'ransomware-as-a-service-defense-sme': 'Ransomware has become commercialized with attack costs dropping to hundreds of dollars. SMEs are now primary targets.',
  'sangfor-hci-deep-dive-analysis': 'Sangfor HCI rise in Asia-Pacific is not accidental. This analysis shows how it appeals to enterprise IT teams.',
  'proxmox-ve-enterprise-deployment-guide': 'From installation to high-availability clusters, this guide covers every key aspect of Proxmox VE deployment.',
  'hyper-v-vs-vmware-esxi-ultimate-comparison': 'A head-to-head comparison of two veteran virtualization platforms: features, performance, licensing, and ecosystem.',
  'sangfor-asv-performance-review': 'How does Sangfor aSV perform in real-world environments? We measure from IOPS to live migration.',
  'enterprise-firewall-palo-alto-fortinet-sangfor': 'Three leading firewall brands compared on features, pricing, management experience, and best-fit enterprise sizes.',
  'edr-comparison-crowdstrike-sentinelone-sangfor': 'EDR has become enterprise security standard. Compare detection capabilities, deployment experience, and pricing.',
  'nutanix-philippines-finance-case-study': 'How a mid-sized Philippine bank completed migration from traditional architecture to Nutanix HCI in six months.',
  'server-virtualization-platform-guide': 'VMware ESXi, Hyper-V, Proxmox VE, Sangfor aSV — comprehensive comparison of four virtualization platforms.',
  'hybrid-cloud-architecture-design-guide': 'Hybrid cloud is not simply local plus public cloud. It requires careful architectural design.',
  'legacy-system-ai-augmentation-methodology': 'No need to rebuild. A systematic methodology to inject AI capabilities into legacy systems.',
  '2025-endpoint-security-threat-trends': 'Ransomware evolution, supply chain attacks, AI-driven phishing — three major threats for 2025.',
  'server-virtualization-migration-best-practices': 'Migrating from VMware to new virtualization environments is a high-risk, high-reward project.',
  'sd-wan-multinational-network-optimization': 'Multinational WAN pain points: high latency, high cost, difficult management. How SD-WAN solves these.',
  'enterprise-storage-solution-selection': 'From SAN to HCI, from all-flash to hybrid storage, enterprise storage selection is more complex than you think.',
  'draas-vs-self-built-disaster-recovery': 'Disaster recovery is enterprise IT final safety net. DRaaS vs self-built — which suits you?',
  'zero-trust-network-architecture-implementation': 'Always verify, never trust — how does zero trust actually land in enterprise environments?',
  'philippines-enterprise-it-challenges': 'Philippines enterprises face unique IT challenges: limited budgets, talent shortages, unstable infrastructure.',
  'sme-budget-security-solutions': 'Security does not require big spending. Building effective protection on a limited budget.',
  'sub-100-employee-it-planning': 'Companies under 100 employees do not need large IT architecture, but need a compact system plan.',
  'multinational-global-branch-it-management': 'From Manila to Jakarta, Bangkok to Ho Chi Minh City — unified global branch IT management.',
  'cloud-migration-failure-5-reasons': 'According to Gartner, over 50% of cloud migration projects exceed budget. Five common failure reasons.',
  'enterprise-it-asset-inventory-methodology': 'If you do not know your IT assets, you cannot manage them. A systematic inventory methodology.'
};

async function main() {
  const query = '*[_type == "post"] | order(publishedAt asc)';
  const posts = await client.fetch(query);

  console.log('Found ' + posts.length + ' posts to fix');

  let fixed = 0;
  for (const post of posts) {
    const slug = post.slug && post.slug.current;
    const newTitle = titleMap[slug];
    const newExcerpt = excerptMap[slug];

    if (!newTitle || !newExcerpt) {
      console.log('SKIP (no mapping): ' + slug);
      continue;
    }

    const chineseExcerpt = post.excerpt || '';

    const patch = client.patch(post._id).set({
      title: newTitle,
      excerpt: newExcerpt,
      excerptZh: chineseExcerpt
    });

    await patch.commit();
    fixed++;
    console.log('FIXED: ' + slug);
  }

  console.log('\nDone. Fixed ' + fixed + ' posts.');
}

main().catch(console.error);
