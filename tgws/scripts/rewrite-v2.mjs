import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const b = (t, s='normal') => ({_type:'block',style:s,children:[{_type:'span',text:t}]});
const h2 = t => b(t,'h2');
const h3 = t => b(t,'h3');
const p = t => b(t);

// Helper to create article object
function article(id, title, titleZh, slug, excerpt, excerptZh, tags, enBlocks, zhBlocks) {
  return {
    _id: 'post-'+slug,
    _type: 'post',
    title, titleZh,
    slug: {current: slug},
    category: 'technical',
    excerpt, excerptZh,
    tags,
    content: enBlocks,
    contentZh: zhBlocks,
    coverImage: 'https://picsum.photos/seed/'+slug+'/800/450',
    author: 'TechGuru Team',
    publishedAt: '2025-02-01T00:00:00Z',
    featured: false,
  };
}

const articles = [
  article('vmware-cloud-foundation-private-cloud',
    'VMware Cloud Foundation: Building Your Private Cloud the Right Way',
    'VMware Cloud Foundation：正確建構你的私有雲',
    'vmware-cloud-foundation-private-cloud',
    'Most private cloud projects fail because teams skip the foundation. Here is what we learned deploying VCF across 20+ enterprises.',
    '大多數私有雲項目失敗是因為團隊跳過了基礎工作。這是我們在20多家企業部署VCF的經驗。',
    ['vmware','vcf','private-cloud'],
    [
      h2('Why Private Cloud Still Matters'),
      p('Every year someone declares private cloud dead. And every year enterprises keep building them. Some workloads cannot move to public cloud. Regulated industries like healthcare and finance have data sovereignty requirements. Latency-sensitive applications need local compute.'),
      p('VMware Cloud Foundation (VCF) bundles vSphere, vSAN, NSX, and Aria into a single platform providing cloud-like experience on your own hardware. But deploying VCF is not as simple as installing four products together.'),
      h2('What is VMware Cloud Foundation?'),
      p('VCF is VMware full-stack private cloud platform with four core components:'),
      p('1. vSphere 8 for compute virtualization that runs your VMs.'),
      p('2. vSAN for software-defined storage turning local disks into shared storage pools.'),
      p('3. NSX for network virtualization providing micro-segmentation, load balancing, and VPN.'),
      p('4. Aria for cloud management with automation, monitoring, and cost analysis.'),
      p('Together these create a Software-Defined Data Center (SDDC) with a self-service portal where developers can spin up VMs in minutes.'),
      h2('Our 7-Step VCF Deployment Process'),
      p('Step 1: Assess workloads. Not everything belongs on VCF. We typically find 60-70% are good candidates.'),
      p('Step 2: Size the cluster. VCF needs 4 nodes minimum for management plus additional workload nodes. Start with 4+4.'),
      p('Step 3: Plan the network. NSX needs dedicated VLANs for management, overlay, and gateway.'),
      p('Step 4: Install and validate hardware. Check VMware HCL before buying. We have seen months of delays from incompatible NICs.'),
      p('Step 5: Deploy Management Domain with Cloud Builder appliance taking 2-3 hours.'),
      p('Step 6: Create Workload Domains for production, development, and DR.'),
      p('Step 7: Migrate with HCX for live migration. We have migrated 500+ VMs without downtime.'),
      h2('Common Mistakes'),
      p('Mistake 1: Under-sizing management cluster. Each node needs 256GB RAM, 32 cores, 1.5TB storage.'),
      p('Mistake 2: Ignoring network requirements. VCF needs specific VLAN configurations.'),
      p('Mistake 3: Trying to migrate everything at once. Start with non-critical workloads.'),
      p('Mistake 4: Skipping the design phase. We spend 2-4 weeks on design before hardware.'),
      h2('Best Practices'),
      p('Use separate vCenter instances for production and development. Enable vSAN encryption from day one. Set up Aria Operations for monitoring. Document everything with runbooks. Budget 40+ hours of team training.'),
      h2('Conclusion'),
      p('VCF is solid for enterprises needing private cloud. Start with a proof of concept: 10-20 non-critical workloads on a small cluster for 60 days. VCF is not a product you install but a platform you build on.'),
      h2('FAQ'),
      h3('Q: How much does VCF cost?'),
      p('A: Licensed per CPU socket at $5,000-8,000 per socket. A 4-node cluster with 2 sockets each costs roughly $40,000-64,000 in licensing.'),
      h3('Q: Can I run VCF on existing hardware?'),
      p('A: Check the VMware HCL first. Most servers from the last 3-4 years are supported.'),
      h3('Q: How long does deployment take?'),
      p('A: Design to production-ready: 6-12 weeks. Cloud Builder installation takes 2-3 hours but surrounding work takes much longer.'),
    ],
    [
      h2('為什麼私有雲仍然重要'),
      p('每年都有人宣佈私有雲已死。但每年企業繼續建構。某些工作負載無法遷移到公有雲。受監管行業如醫療和金融有數據主權要求。'),
      p('VMware Cloud Foundation（VCF）將vSphere、vSAN、NSX和Aria捆綁成一個平台，在自有硬體上提供雲端體驗。'),
      h2('什麼是VMware Cloud Foundation？'),
      p('VCF是VMware全棧私有雲平台：vSphere 8計算虛擬化、vSAN軟體定義儲存、NSX網路虛擬化、Aria雲端管理。共同構成軟體定義數據中心（SDDC）。'),
      h2('我們的7步部署流程'),
      p('步驟1：評估工作負載，60-70%適合VCF。步驟2：調整叢集大小，管理最少4節點。步驟3：規劃網路，NSX需要專用VLAN。步驟4：安裝驗證硬體，檢查HCL。步驟5：部署管理域。步驟6：建立工作負載域。步驟7：使用HCX遷移。'),
      h2('常見錯誤'),
      p('錯誤1：管理叢集配置不足。錯誤2：忽略網路需求。錯誤3：一次遷移所有內容。錯誤4：跳過設計階段。'),
      h2('最佳實踐'),
      p('生產和開發使用獨立vCenter。第一天啟用vSAN加密。設置Aria Operations監控。記錄一切。培訓團隊40小時以上。'),
      h2('結論'),
      p('VCF是需要私有雲的企業的可靠選擇。從概念驗證開始：10-20個非關鍵工作負載運行60天。'),
    ]
  ),

  article('nsx-t-enterprise-deployment',
    'NSX-T in the Real World: Enterprise Deployment Lessons',
    'NSX-T實戰：企業部署經驗談',
    'nsx-t-enterprise-deployment',
    'NSX-T promises micro-segmentation but enterprise deployments are rarely straightforward. Here are lessons from 15+ deployments.',
    'NSX-T承諾微分段但企業部署很少直截了當。這是15多次部署的經驗。',
    ['vmware','nsx-t','networking'],
    [
      h2('The Promise and Reality of NSX-T'),
      p('NSX-T creates a virtual network layer on top of your physical infrastructure. Instead of configuring VLANs on physical switches, you define everything in software.'),
      p('Key capabilities: micro-segmentation (each VM gets its own firewall rules), distributed firewall (rules follow VMs), logical switching and routing, built-in load balancing, and VPN without dedicated appliances.'),
      h2('Our Deployment Process'),
      p('Step 1: Network discovery - 1-2 weeks mapping existing VLANs, subnets, firewall rules, routing protocols.'),
      p('Step 2: Design overlay - NSX-T uses Geneve protocol. Each transport node needs 2+ NICs. Recommend 25GbE for overlay.'),
      p('Step 3: Deploy management cluster - 3 nodes minimum, separate from vCenter.'),
      p('Step 4: Configure transport nodes - install NSX-T kernel modules on every ESXi host.'),
      p('Step 5: Create logical switches - map existing VLANs to NSX-T logical switches.'),
      p('Step 6: Migrate firewall rules - convert physical rules to distributed rules using NSX-T Intelligence.'),
      p('Step 7: Test in monitoring mode for 2 weeks before going live.'),
      h2('Hard-Won Lessons'),
      p('Start small - pick one application, one VLAN segment. Plan for failure with redundancy. Monitor everything from day one. Train your network team 40+ hours. Document rules with tags and sections.'),
      h2('When NSX-T Is Not Right'),
      p('If your network is simple with few VLANs, physical firewalls may be simpler. If your team lacks virtualization expertise, the learning curve may be too steep. Under 50 VMs, NSX-T is overkill.'),
      h2('Conclusion'),
      p('NSX-T is a game-changer for advanced network virtualization but requires planning, skilled staff, and phased approach. Start with proof of concept and expand gradually.'),
      h2('FAQ'),
      h3('Q: How many nodes needed?'),
      p('A: Minimum 3 for management plus transport nodes for every host. Typical deployment: 20-50 transport nodes.'),
      h3('Q: Can it replace physical firewalls?'),
      p('A: Partially. NSX-T handles east-west traffic. You still need physical firewalls for north-south (internet). Most enterprises use both.'),
    ],
    [
      h2('NSX-T的承諾與現實'),
      p('NSX-T在實體基礎設施之上創建虛擬網路層。無需在實體交換器上配置VLAN，用軟體定義一切。'),
      h2('我們的部署流程'),
      p('步驟1：網路發現。步驟2：設計覆蓋網路。步驟3：部署管理叢集。步驟4：配置傳輸節點。步驟5：創建邏輯交換器。步驟6：遷移防火牆規則。步驟7：監控模式測試2週。'),
      h2('經驗教訓'),
      p('從小開始。為故障做計劃。從第一天監控一切。培訓團隊。記錄規則。'),
      h2('結論'),
      p('NSX-T是高級網路虛擬化的改變者，但需要規劃和分階段方法。'),
    ]
  ),
];

let ok=0, fail=0;
for (const a of articles) {
  try {
    await client.createOrReplace(a);
    console.log(`✅ ${a.slug.current}`);
    ok++;
  } catch(e) {
    console.error(`❌ ${a.slug.current}: ${e.message}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
