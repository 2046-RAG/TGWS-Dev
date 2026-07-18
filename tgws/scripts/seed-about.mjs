/**
 * W2-5.6 Seed script for About page content (team / qualifications / timeline)
 *
 * Usage:
 *   node scripts/seed-about.mjs            # write to Sanity
 *   node scripts/seed-about.mjs --dry-run  # print payloads only, do not write
 *
 * Required env (read from .env.local or process.env):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - SANITY_API_TOKEN                     (write token)
 *   - NEXT_PUBLIC_SANITY_DATASET           (optional, defaults to 'production')
 */
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const isDryRun = process.argv.includes('--dry-run');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

// In dry-run mode we only print payloads, so env vars are not required.
// For actual writes we need both projectId and a write token.
if (!isDryRun) {
  if (!projectId) {
    console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
    process.exit(1);
  }
  if (!token) {
    console.error('❌ Missing SANITY_API_TOKEN (required for non-dry-run writes)');
    process.exit(1);
  }
}

const client =
  projectId && (token || isDryRun)
    ? createClient({
        projectId,
        dataset,
        apiVersion: '2024-01-01',
        useCdn: false,
        token: token || undefined,
      })
    : null;

// =====================================================================
// Team Members (3) — content mirrors src/messages/{en,zh}.json about.team
// =====================================================================
const teamMembers = [
  {
    _type: 'teamMember',
    name: 'Marco Reyes',
    nameZh: 'Marco Reyes',
    role: 'CEO & Sales Director',
    roleZh: 'CEO兼銷售總監',
    bio: '10+ years in enterprise IT sales. Deep relationships with major vendors and enterprise clients across Asia.',
    bioZh: '10年以上企業IT銷售經驗。與亞洲主要廠商和企業客戶建立深厚關係。',
    order: 1,
  },
  {
    _type: 'teamMember',
    name: 'Rafael Santos',
    nameZh: 'Rafael Santos',
    role: 'CTO & Solutions Architect',
    roleZh: 'CTO兼解決方案架構師',
    bio: '10+ years in IT infrastructure pre-sales. Expert in HCI, cloud migration, and security architecture.',
    bioZh: '10年以上IT基礎設施售前經驗。專精超融合、雲端遷移和安全架構。',
    order: 2,
  },
  {
    _type: 'teamMember',
    name: 'Adrian Mendoza',
    nameZh: 'Adrian Mendoza',
    role: 'VP of Business Development',
    roleZh: '業務發展副總裁',
    bio: '8+ years in IT channel and partner management. Specializes in vendor ecosystem expansion and enterprise client acquisition.',
    bioZh: '8年以上IT通路和合作夥伴管理經驗。專注廠商生態拓展和企業客戶開發。',
    order: 3,
  },
];

// =====================================================================
// Qualifications (4) — content mirrors about.qualifications in i18n
// icon field uses lucide kebab-case names that AboutPage ICON_MAP recognizes
// =====================================================================
const qualifications = [
  {
    _type: 'qualification',
    title: 'Infrastructure & Virtualization',
    titleZh: '基礎架構與虛擬化',
    description:
      'Sangfor, Nutanix, H3C, Huawei, Lenovo, Dell, HPE, HCI, servers, storage, and virtualization platforms.',
    descriptionZh:
      'Sangfor、Nutanix、H3C、華為、聯想、Dell、HPE，超融合、伺服器、儲存和虛擬化平台。',
    icon: 'briefcase',
    order: 1,
  },
  {
    _type: 'qualification',
    title: 'Network & Security',
    titleZh: '網路與安全',
    description:
      'Fortinet, Sophos, Hillstone, Ruijie, Prolink, NGFW, EDR, NDR, SD-WAN, switches, and wireless.',
    descriptionZh:
      'Fortinet、Sophos、Hillstone、Ruijie、Prolink，次世代防火牆、EDR、NDR、SD-WAN、交換機和無線。',
    icon: 'shield',
    order: 2,
  },
  {
    _type: 'qualification',
    title: 'Cloud & AI',
    titleZh: '雲端與AI',
    description:
      'Alibaba Cloud, ByteDance Volcengine, AIGC pipelines, AI platform deployment, and managed cloud services.',
    descriptionZh:
      '阿里雲、字節跳動火山引擎，AIGC流程、AI平台部署和託管雲服務。',
    icon: 'target',
    order: 3,
  },
  {
    _type: 'qualification',
    title: 'Specialized Solutions',
    titleZh: '專項解決方案',
    description:
      'Sifang (北京四方继保), power protection and substation automation. Proxmox VE, open-source virtualization.',
    descriptionZh:
      '四方繼保，電力保護和變電站自動化。Proxmox VE，開源虛擬化。',
    icon: 'users',
    order: 4,
  },
];

// =====================================================================
// Timeline Events (6) — content mirrors about.timeline.events in i18n
// Task spec said 5; we seed 6 to preserve all existing i18n content
// (per AGENTS.md #33 — do not break existing functionality).
// =====================================================================
const timelineEvents = [
  {
    _type: 'timelineEvent',
    year: 2023,
    month: null,
    title: 'TechGuru Founded',
    titleZh: '泰谷科技成立',
    description:
      'TechGuru founded in Manila by three IT veterans with 5-10 years of enterprise sales and pre-sales experience.',
    descriptionZh:
      '泰谷科技在馬尼拉成立，由三位擁有5-10年企業銷售和售前經驗的IT老兵創辦。',
    order: 1,
  },
  {
    _type: 'timelineEvent',
    year: 2023,
    month: null,
    title: 'Initial Vendor Partnerships',
    titleZh: '首批廠商合作夥伴',
    description:
      'Secured partnerships with Sangfor, Fortinet, and H3C. Launched core infrastructure and security portfolio.',
    descriptionZh:
      '取得Sangfor、Fortinet和H3C合作夥伴資格，啟動基礎架構和安全產品組合。',
    order: 2,
  },
  {
    _type: 'timelineEvent',
    year: 2024,
    month: null,
    title: 'Vendor Ecosystem Expansion',
    titleZh: '廠商生態擴展',
    description:
      'Expanded vendor ecosystem to Nutanix, Sophos, Hillstone, Alibaba Cloud, and Huawei. Grew team to 10.',
    descriptionZh:
      '擴展廠商生態至Nutanix、Sophos、Hillstone、阿里雲和華為。團隊成長至10人。',
    order: 3,
  },
  {
    _type: 'timelineEvent',
    year: 2024,
    month: null,
    title: 'VMware Alternative Program',
    titleZh: 'VMware替代方案計畫',
    description:
      'Launched VMware alternative program with Proxmox VE, Sangfor HCI, and Nutanix AHV migration paths.',
    descriptionZh:
      '推出VMware替代方案，提供Proxmox VE、Sangfor HCI和Nutanix AHV遷移路徑。',
    order: 4,
  },
  {
    _type: 'timelineEvent',
    year: 2025,
    month: null,
    title: 'AI Capabilities Launched',
    titleZh: 'AI能力導入',
    description:
      'Added AI capabilities through Alibaba Cloud Bailian and ByteDance Volcengine partnerships. Introduced AIGC and AI Adoption services.',
    descriptionZh:
      '透過阿里雲百煉和字節跳動火山引擎合作夥伴關係引入AI能力。推出AIGC和AI落地服務。',
    order: 5,
  },
  {
    _type: 'timelineEvent',
    year: 2025,
    month: null,
    title: '20+ Partner Ecosystem',
    titleZh: '20+合作夥伴生態',
    description:
      'Expanded to 20+ vendor partnerships covering HCI, security, networking, cloud, and AI. Serving clients across Philippines and Southeast Asia.',
    descriptionZh:
      '擴展至20+合作夥伴，涵蓋超融合、安全、網路、雲端和AI。服務菲律賓及東南亞客戶。',
    order: 6,
  },
];

async function seed(docs, label) {
  console.log(`\n=== ${label} (${docs.length} items) ===`);
  let created = 0;
  let failed = 0;
  for (const doc of docs) {
    const preview =
      doc._type === 'timelineEvent'
        ? `${doc.year} ${doc.title}`
        : doc.title || doc.name;
    if (isDryRun) {
      console.log(`[dry-run] would create ${doc._type}: ${preview}`);
      continue;
    }
    if (!client) {
      console.error(`❌ Sanity client not initialized (missing env vars)`);
      failed++;
      continue;
    }
    try {
      await client.create(doc);
      created++;
      console.log(`✅ Created ${doc._type}: ${preview}`);
    } catch (error) {
      failed++;
      console.error(`❌ Failed ${doc._type} (${preview}): ${error.message}`);
    }
  }
  if (!isDryRun) {
    console.log(`→ ${label}: created=${created}, failed=${failed}`);
  }
}

async function main() {
  console.log(`Sanity project: ${projectId}`);
  console.log(`Sanity dataset: ${dataset}`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (no writes)' : 'WRITE'}`);

  await seed(teamMembers, 'Team Members');
  await seed(qualifications, 'Qualifications');
  await seed(timelineEvents, 'Timeline Events');

  console.log('\n=== Done ===');
  if (isDryRun) {
    console.log('No documents were written (dry-run mode).');
    console.log('Re-run without --dry-run to write to Sanity.');
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
