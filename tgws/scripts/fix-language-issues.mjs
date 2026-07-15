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

// Known technical terms that should be kept in English even in Chinese articles
const TECH_TERMS = [
  'VMware', 'vSphere', 'NSX-T', 'SRM', 'FortiGate', 'Fortinet', 'Sangfor', 'Nutanix',
  'CrowdStrike', 'SentinelOne', 'Palo Alto', 'Cisco', 'Hyper-V', 'Proxmox',
  'HCI', 'SD-WAN', 'EDR', 'XDR', 'MDR', 'VPN', 'ZTNA', 'NAC', 'DDoS',
  'ISO', 'GDPR', 'PCI', 'DSS', 'Kubernetes', 'Docker', 'AWS', 'Azure',
  'Cloudflare', 'Veeam', 'StarWind', 'H3C', 'Ruijie', 'Arcfra', 'Sophos',
  'Alibaba Cloud', 'ByteDance', 'Hillstone', 'Lenovo', 'Dell', 'HP',
  'AIGC', 'AI', 'OCR', 'NLP', 'API', 'SDK', 'HTTP', 'REST', 'SQL',
  'CRM', 'ERP', 'OA', 'EHR', 'LIS', 'RPO', 'RTO', 'DR', 'HA', 'FT',
  'VDI', 'DMZ', 'LAN', 'WAN', 'WiFi', 'NGFW', 'SOC', 'MFA', 'SSO',
  'Foundation', 'WorkSpaces', 'ExpressRoute', 'Repatriation',
  'Mastercard', 'QuickBooks', 'Lansweeper', 'ServiceNow', 'Freshservice',
  'CrowdStrike', 'SentinelOne', 'FortiGuard', 'Generation',
  'Enterprise', 'Kubernetes',
];

function isTechTerm(word) {
  return TECH_TERMS.some(t => t.toLowerCase() === word.toLowerCase());
}

// Fix English content that contains Chinese characters
function fixEnglishContent(text) {
  if (!text) return text;
  // Remove Chinese characters from English text (keep technical terms)
  return text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]+/g, (match) => {
    // Common Chinese words that appear in mixed content
    const translations = {
      '适合': '', '备份': 'backup', '预留': 'reserved',
      '端點安全的戰場正在快速演變': 'The endpoint security battlefield is rapidly evolving',
      '年的超融合基礎架構市場': 'The hyper-converged infrastructure market',
      '正在經歷過去十年來最大的結構性變化': 'is experiencing the biggest structural changes in the past decade',
      '根據多份行業報告': 'According to multiple industry reports',
      '年': '', '幾乎每個企業都在談': 'nearly every enterprise is talking about',
      '從': '', '收購': 'acquisition', '滿一年之際': 'on the one-year anniversary',
      '我們針對亞太區企業': 'We surveyed Asia-Pacific enterprises',
      '上雲': 'Cloud migration', '曾是企業': 'was once the enterprise',
      '的標準答案': 'standard answer',
      '雲端遷移聽起來簡單': 'Cloud migration sounds simple',
      '把數據和應用從本地搬到雲端': 'moving data and applications from on-premises to cloud',
      '但現實中': 'but in reality',
      '災難恢復': 'disaster recovery', '是企業': 'is the enterprise',
      '的最後保險': 'last insurance',
      '防火牆是企業網路安全的第一道防線': 'Firewalls are the first line of defense for enterprise network security',
      '但在品牌選擇上': 'but in brand selection',
      '很多': 'many',
      '資產管理': 'Asset management', '是企業': 'is the enterprise',
      '治理的基礎': 'foundation of governance',
      '存儲是企業': 'Storage is the enterprise',
      '基礎架構中最容易被低估的組件': 'most underestimated component in infrastructure',
      '選對存儲方案': 'choosing the right storage solution',
      '混合雲已經成為企業': 'Hybrid cloud has become the enterprise',
      '架構的主流選擇': 'mainstream architecture choice',
      '和': 'and', '是虛擬化市場的兩大巨頭': 'are the two giants of the virtualization market',
      '它們的競爭已持續超過十五年': 'their competition has lasted over fifteen years',
      '我們的': 'our', '系統是': 'system was',
      '年前上線的': 'launched years ago',
      '對於在多個國家設有分支機構的企業來說': 'For enterprises with branches in multiple countries',
      '統一管理是一場持久戰': 'unified management is a long-term battle',
      '每個國家的基礎設施條件不同': 'each country has different infrastructure conditions',
      '作為開源虛擬化平台的代表': 'As a representative of open-source virtualization platforms',
      '近年在企業市場的採用率快速紅利上升': 'adoption in enterprise markets has risen rapidly in recent years',
      '它結合了': 'it combines',
      '正在改變網路犯罪的格局': 'is changing the landscape of cybercrime',
      '過去需要高超技術才能發動的勒索攻擊': 'ransomware attacks that once required advanced skills',
      '現在任何有基本電腦知識的人都可以通過暗網租用攻擊工具': 'now anyone with basic computer knowledge can rent attack tools via the dark web',
      '是': 'is', '平台的虛擬化核心引擎': "the platform's virtualization core engine",
      '相較於': 'compared to',
      '是深信服在超融合領域的核心產品': 'is Sangfor\'s core product in the hyper-converged field',
      '近年在東南亞市場的增長速度令人矚目': 'its growth rate in the Southeast Asian market in recent years has been remarkable',
      '它的成功不只是因為價格優勢': 'its success is not just because of price advantage',
      '在': 'in', '替代方案的討論中': 'the discussion of alternatives',
      '和': 'and',
      '對於在多個國家設有分支機構的企業來說': 'For enterprises with branches in multiple countries',
      '廣域網': 'WAN', '的性能和成本一直是': 'performance and cost have always been',
      '在企業網路架構的演進中': 'In the evolution of enterprise network architecture',
      '是兩個經常被混淆的概念': 'are two concepts that are often confused',
      '虛擬化平台遷移是': 'Virtualization platform migration is',
      '年企業': 'enterprise', '最常見的大型項目之一': 'one of the most common large projects',
      '伺服器虛擬化是現代企業': 'Server virtualization is the modern enterprise',
      '的基石': 'cornerstone', '選對平台可以節省大量成本和運維精力': 'choosing the right platform can save significant costs and operational effort',
      '人以下的企業': 'enterprises with fewer than people',
      '規劃的核心原則是': 'the core principle of planning is',
      '夠用就好': 'good enough',
      '我們只有': 'we only have', '美元的年度安全預算': 'annual security budget in dollars',
      '能做什麼': 'what can we do',
      '年底': 'end of year', '完成收購': 'completed the acquisition', '後': 'after',
    };

    // Check if the Chinese text has a known translation
    for (const [cn, en] of Object.entries(translations)) {
      if (match.includes(cn)) return en;
    }
    // For unmatched Chinese, remove it (it's likely garbage from bad translation)
    return '';
  }).replace(/\s+/g, ' ').trim();
}

// Fix Chinese content that contains long English sentences
function fixChineseContent(text) {
  if (!text) return text;
  // Replace long English strings (10+ chars) that are NOT tech terms
  return text.replace(/\b([A-Za-z]{10,})\b/g, (match) => {
    if (isTechTerm(match)) return match;
    // Translate common English words found in Chinese articles
    const commonWords = {
      'Philippine': '菲律賓', 'philippine': '菲律賓',
      'healthcare': '醫療', 'production': '生產', 'functional': '功能性',
      'recruitment': '招聘', 'discriminated': '歧視', 'applicants': '申請者',
      'calculating': '計算', 'generating': '生成',
      'application': '應用', 'processing': '處理',
      'warehouses': '倉庫', 'restocking': '補貨',
      'enterprise': '企業', 'automatically': '自動',
      'Understanding': '理解', 'difference': '差異',
      'prototypes': '原型', 'frameworks': '框架',
      'systematically': '系統性', 'undervaluing': '低估', 'historical': '歷史',
      'traditional': '傳統', 'freelancers': '自由職業者',
      'commercial': '商業', 'descriptions': '描述',
      'beautifully': '完美地', 'compliance': '合規',
      'generation': '世代', 'Architect': '架構',
      'Infrastructure': '基礎設施',
    };
    return commonWords[match] || commonWords[match.toLowerCase()] || match;
  });
}

// Main fix loop
const posts = await client.fetch(`*[_type=="post"]{
  _id, title, titleZh, slug, content, contentZh
}`);

console.log(`Checking ${posts.length} posts for language issues...\n`);

let fixed = 0;
let skipped = 0;

for (const post of posts) {
  const slug = post.slug?.current;
  let needsUpdate = false;
  const patch = {};

  // Check English content for Chinese characters
  if (post.content) {
    for (const block of post.content) {
      if (block._type === 'block' && block.children) {
        for (const child of block.children) {
          if (child.text && /[\u4e00-\u9fff]/.test(child.text)) {
            // Has Chinese in English content - fix it
            child.text = fixEnglishContent(child.text);
            needsUpdate = true;
          }
        }
      }
    }
    if (needsUpdate) patch.content = post.content;
  }

  // Check Chinese content for English sentences
  if (post.contentZh) {
    let zhNeedsUpdate = false;
    for (const block of post.contentZh) {
      if (block._type === 'block' && block.children) {
        for (const child of block.children) {
          if (child.text && /[A-Za-z]{10,}/.test(child.text)) {
            const fixed = fixChineseContent(child.text);
            if (fixed !== child.text) {
              child.text = fixed;
              zhNeedsUpdate = true;
            }
          }
        }
      }
    }
    if (zhNeedsUpdate) {
      patch.contentZh = post.contentZh;
      needsUpdate = true;
    }
  }

  // Check Chinese title for English sentences
  if (post.titleZh && /[A-Za-z]{5,}/.test(post.titleZh)) {
    // Title has long English - might need fixing
    // But keep tech terms like "VMware", "EDR" etc
    const words = post.titleZh.match(/\b[A-Za-z]{5,}\b/g) || [];
    const nonTech = words.filter(w => !isTechTerm(w));
    if (nonTech.length > 0) {
      console.log(`  TITLE FIX NEEDED: ${slug} - "${post.titleZh}" contains: ${nonTech.join(', ')}`);
    }
  }

  if (needsUpdate) {
    try {
      await client.patch(post._id).set(patch).commit();
      console.log(`FIXED: ${slug}`);
      fixed++;
    } catch (err) {
      console.error(`FAILED: ${slug} - ${err.message}`);
    }
  } else {
    skipped++;
  }
}

console.log(`\n=== DONE ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Skipped (no issues): ${skipped}`);
console.log(`Total: ${posts.length}`);
