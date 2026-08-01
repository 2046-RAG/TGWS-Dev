/**
 * Sanity CMS 数据种子脚本 (CommonJS版本)
 * 将内容数据写入Sanity后端，实现真正的headless架构
 */

const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: '.env.local' });

// Sanity配置
const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 时间轴事件数据
const timelineEvents = [
  {
    _type: 'timelineEvent',
    year: 2020,
    quarter: 'Q2',
    title: 'Company Founded',
    titleZh: '公司成立',
    description: 'TechGuru founded in Manila by three IT veterans with 12-15 years of enterprise experience from top cybersecurity, cloud, and networking companies.',
    descriptionZh: '泰谷科技在馬尼拉成立，由三位來自頂尖網路安全、雲端和數通公司的IT資深專家創辦，平均從業12-15年。',
    highlights: ['3 Co-founders', 'Manila HQ', 'Cybersecurity + Cloud + Networking'],
    highlightsZh: ['3位聯合創始人', '馬尼拉總部', '網路安全+雲端+數通'],
    icon: 'rocket',
    color: '#00D4FF',
    order: 1,
  },
  {
    _type: 'timelineEvent',
    year: 2021,
    quarter: 'Q1',
    title: 'Core Partnerships Secured',
    titleZh: '取得核心合作夥伴資格',
    description: 'Secured core partnerships with Sangfor, Fortinet, and H3C. Launched first enterprise security and infrastructure projects.',
    descriptionZh: '取得Sangfor、Fortinet和H3C核心合作夥伴資格。啟動首個企業安全和基礎設施項目。',
    highlights: ['Sangfor Partner', 'Fortinet Partner', 'H3C Partner'],
    highlightsZh: ['深信服合作夥伴', '飛塔合作夥伴', '新華三合作夥伴'],
    icon: 'building',
    color: '#7B61FF',
    order: 2,
  },
  {
    _type: 'timelineEvent',
    year: 2022,
    quarter: 'Q1',
    title: 'Ecosystem Expansion',
    titleZh: '生態系統擴展',
    description: 'Expanded vendor ecosystem to Nutanix, Sophos, Hillstone, and Alibaba Cloud. Grew team to 10 members.',
    descriptionZh: '擴展廠商生態至Nutanix、Sophos、Hillstone和阿里雲。團隊成長至10人。',
    highlights: ['Nutanix', 'Sophos', 'Alibaba Cloud', 'Team: 10'],
    highlightsZh: ['Nutanix', 'Sophos', '阿里雲', '團隊: 10人'],
    icon: 'trending',
    color: '#22C55E',
    order: 3,
  },
  {
    _type: 'timelineEvent',
    year: 2023,
    quarter: 'Q1',
    title: 'VMware Alternative Program',
    titleZh: 'VMware替代方案',
    description: "Following Broadcom's acquisition of VMware, launched VMware Alternative Program with Sangfor, H3C, and Proxmox VE as cost-effective migration paths.",
    descriptionZh: '博通收購VMware後，聯合Sangfor、H3C和Proxmox VE推出VMware替代方案，提供高性價比遷移路徑。',
    highlights: ['Sangfor aSV', 'H3C UIS', 'Proxmox VE', 'Migration Services'],
    highlightsZh: ['深信服aSV', '新華三UIS', 'Proxmox VE', '遷移服務'],
    icon: 'rocket',
    color: '#F59E0B',
    order: 4,
  },
  {
    _type: 'timelineEvent',
    year: 2024,
    quarter: 'Q1',
    title: 'AI Capabilities Introduced',
    titleZh: '引入AI能力',
    description: 'Introduced AIGC and AI Agent development capabilities through Alibaba Cloud Bailian and ByteDance Volcengine partnerships.',
    descriptionZh: '透過阿里雲百煉和字節跳動火山引擎合作夥伴關係，引入AIGC和AI Agent開發能力。',
    highlights: ['AIGC', 'AI Agent', 'Alibaba Bailian', 'Volcengine'],
    highlightsZh: ['AIGC', 'AI Agent', '阿里雲百煉', '火山引擎'],
    icon: 'code',
    color: '#EC4899',
    order: 5,
  },
  {
    _type: 'timelineEvent',
    year: 2025,
    quarter: 'Q1',
    title: 'Build-Run-Protect Full Stack',
    titleZh: '構建-承載-保護全棧',
    description: 'Expanded to 25+ vendor partnerships covering Build, Run, and Protect. Serving 200+ clients across Philippines and Southeast Asia.',
    descriptionZh: '合作夥伴擴展至25+，涵蓋構建(Build)、承載(Run)、保護(Protect)全棧。服務菲律賓及東南亞200+客戶。',
    highlights: ['25+ Partners', '200+ Clients', 'Build-Run-Protect', 'SEA Coverage'],
    highlightsZh: ['25+合作夥伴', '200+客戶', '構建-承載-保護', '東南亞覆蓋'],
    icon: 'award',
    color: '#00D4FF',
    order: 6,
  },
];

// 团队成员数据
const teamMembers = [
  {
    _type: 'teamMember',
    name: 'Regil De Claro',
    nameZh: 'Regil De Claro',
    role: 'Managing Director',
    roleZh: '董事總經理',
    bio: '17 years of IT industry experience. Former Sales Director at Sangfor and Key Account Manager at Ruijie. Expert in enterprise sales, pre-sales consulting, and channel partner management.',
    bioZh: '17年IT行業經驗。曾任深信服Sangfor銷售總監、銳捷Ruijie大客戶經理。專精企業銷售、售前諮詢和通路合作夥伴管理。',
    order: 1,
  },
  {
    _type: 'teamMember',
    name: 'Co-Founder',
    nameZh: '聯合創始人',
    role: 'Chief Technology Officer',
    roleZh: '首席技術官',
    bio: '15+ years in cybersecurity and network infrastructure. Former technical lead at top-tier security vendors.',
    bioZh: '15年以上網路安全和基礎設施經驗。曾任頂尖安全廠商技術主管。',
    order: 2,
  },
  {
    _type: 'teamMember',
    name: 'Co-Founder',
    nameZh: '聯合創始人',
    role: 'Chief Operating Officer',
    roleZh: '首席營運官',
    bio: '12+ years in cloud computing and virtualization. Former solutions architect at leading cloud providers.',
    bioZh: '12年以上雲端計算和虛擬化經驗。曾任領先雲端供應商解決方案架構師。',
    order: 3,
  },
];

// 资质/合作伙伴数据
const qualifications = [
  {
    _type: 'qualification',
    title: 'Infrastructure & Virtualization',
    titleZh: '基礎架構與虛擬化',
    description: 'Sangfor HCI, Nutanix, H3C, Huawei, Lenovo, Dell, HP, Arcfra, StarWind. HCI, servers, storage, and VMware alternative platforms.',
    descriptionZh: 'Sangfor HCI、Nutanix、H3C、華為、聯想、Dell、HP、Arcfra、StarWind。超融合、伺服器、儲存和VMware替代平台。',
    icon: 'building',
    color: '#00D4FF',
    category: 'infrastructure',
    order: 1,
  },
  {
    _type: 'qualification',
    title: 'Network & Security',
    titleZh: '網路與安全',
    description: 'Fortinet NGFW, Sophos EDR, Hillstone, Ruijie. Firewalls, EDR, NDR, SD-WAN, switches, and wireless solutions.',
    descriptionZh: 'Fortinet次世代防火牆、Sophos EDR、Hillstone、Ruijie。防火牆、EDR、NDR、SD-WAN、交換機和無線解決方案。',
    icon: 'shield',
    color: '#7B61FF',
    category: 'security',
    order: 2,
  },
  {
    _type: 'qualification',
    title: 'Cloud & AI',
    titleZh: '雲端與AI',
    description: 'Alibaba Cloud, ByteDance Volcengine, Proxmox VE, KVM/QEMU. AIGC, AI Agent development, and managed cloud services.',
    descriptionZh: '阿里雲、字節跳動火山引擎、Proxmox VE、KVM/QEMU。AIGC、AI Agent開發和託管雲服務。',
    icon: 'cloud',
    color: '#22C55E',
    category: 'cloud',
    order: 3,
  },
  {
    _type: 'qualification',
    title: 'Data Protection & Backup',
    titleZh: '數據保護與備份',
    description: 'Veeam, StarWind. Backup-as-a-Service, disaster recovery, and business continuity solutions.',
    descriptionZh: 'Veeam、StarWind。備份即服務、災難恢復和業務連續性解決方案。',
    icon: 'shield',
    color: '#F59E0B',
    category: 'specialized',
    order: 4,
  },
];

// 主函数：写入数据到Sanity
async function seedSanity() {
  console.log('开始写入数据到Sanity CMS...\n');

  let successCount = 0;
  let failCount = 0;

  try {
    // 1. 写入时间轴事件
    console.log('1. 写入时间轴事件...');
    for (const event of timelineEvents) {
      try {
        const result = await client.create(event);
        console.log(`   ✓ ${event.title} (${result._id})`);
        successCount++;
        await delay(500); // 延迟避免限流
      } catch (e) {
        console.log(`   ✗ ${event.title}: ${e.message}`);
        failCount++;
      }
    }
    console.log(`   完成: ${timelineEvents.length} 个事件\n`);

    // 2. 写入团队成员
    console.log('2. 写入团队成员...');
    for (const member of teamMembers) {
      try {
        const result = await client.create(member);
        console.log(`   ✓ ${member.name} (${result._id})`);
        successCount++;
        await delay(500);
      } catch (e) {
        console.log(`   ✗ ${member.name}: ${e.message}`);
        failCount++;
      }
    }
    console.log(`   完成: ${teamMembers.length} 个成员\n`);

    // 3. 写入资质/合作伙伴
    console.log('3. 写入资质/合作伙伴...');
    for (const qual of qualifications) {
      try {
        const result = await client.create(qual);
        console.log(`   ✓ ${qual.title} (${result._id})`);
        successCount++;
        await delay(500);
      } catch (e) {
        console.log(`   ✗ ${qual.title}: ${e.message}`);
        failCount++;
      }
    }
    console.log(`   完成: ${qualifications.length} 个资质\n`);

    console.log('========================================');
    console.log(`✅ 写入完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);
    console.log('========================================');
    console.log('\n下一步：');
    console.log('1. 访问 https://r6ztl1oq.sanity.studio/ 查看数据');
    console.log('2. 前端页面将自动从Sanity获取数据');

  } catch (error) {
    console.error('❌ 写入失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
seedSanity();