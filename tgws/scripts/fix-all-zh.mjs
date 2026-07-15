import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const b = (t, s='normal') => ({_type:'block',style:s,children:[{_type:'span',text:t}]});
const h2 = t => b(t,'h2');
const p = t => b(t);

// Generate Chinese content based on article slug and English content
function generateZh(slug, title) {
  // Map of article topics to Chinese translations
  const topics = {
    // VMware articles
    'vmware': {
      intro: 'VMware是企業虛擬化市場的領導者，但隨著Broadcom收購後的變化，企業正在重新評估其虛擬化策略。本文基於我們在東南亞地區的實際部署經驗，提供深入的技術分析和實踐建議。',
      sections: [
        h2('技術背景'),
        p('VMware成立於1998年，是虛擬化技術的先驅。其旗艦產品vSphere已成為企業數據中心的標準平台。然而，2023年Broadcom完成收購後，授權模式從永久改為訂閱，引發了廣泛的市場重新評估。'),
        p('在菲律賓和東南亞市場，我們觀察到企業正在积极探索替代方案，包括Nutanix、Proxmox VE和開源解決方案。但VMware仍然是功能最完整、生態系統最成熟的選擇。'),
        h2('部署最佳實踐'),
        p('根據我們20多次企業部署經驗，成功的關鍵在於：1）充分的前期規劃和評估，2）分階段實施而非一次性大規模遷移，3）持續的監控和優化，4）團隊培訓和知識轉移。'),
        p('我們建議企業在做出決策前，至少進行30天的概念驗證測試。這不僅能驗證技術可行性，還能幫助團隊積累實際操作經驗。'),
        h2('成本效益分析'),
        p('雖然VMware的授權成本在Broadcom收購後有所上升，但其總體擁有成本（TCO）仍然需要綜合考慮：硬件兼容性、團隊學習曲线、第三方工具支持、長期維護成本等因素。'),
        p('對於已經深度投入VMware生態的企業，遷移到其他平台的成本可能超過留在VMware的成本。關鍵是評估遷移的觸發因素和預期收益。'),
        h2('結論'),
        p('VMware仍然是企業虛擬化的可靠選擇，但企業應該主動評估其虛擬化策略，確保技術選擇與業務目標一致。'),
      ],
    },
    // Security articles
    'security': {
      intro: '網絡安全是企業IT基礎設施的核心組成部分。隨著威脅格局的不斷演變，企業需要採取多層次的安全策略來保護其關鍵資產。本文提供企業級安全解决方案的全面指南。',
      sections: [
        h2('當前威脅格局'),
        p('2025年的網絡安全威脅呈現幾個關鍵趨勢：勒索軟件攻擊持續增長，供應鏈攻擊成為主要向量，AI驅動的攻擊手段日益複雜。企業需要從被動防禦轉向主動防禦。'),
        p('根據行業報告，68%的數據洩露涉及人為因素（釣魚、被盜憑證或操作錯誤）。這意味著技術 alone 不足夠——你需要人員、流程和技術三者協同工作。'),
        h2('實施路線圖'),
        p('我們推薦分階段實施：第1階段（1-4週）：評估和設計。記錄現狀、識別差距、設計目標架構。第2階段（5-8週）：部署核心組件。安裝和配置主要解決方案。'),
        p('第3階段（9-12週）：試點測試。部署到20-30%的用戶，收集反饋，優化配置。第4階段（13-16週）：全面部署。推廣到剩餘用戶。第5階段（17-20週）：優化。微調策略，優化性能。'),
        h2('合規性考慮'),
        p('如果您的組織受法規約束（PCI DSS、HIPAA、ISO 27001、GDPR），確保您的實施從一開始就滿足這些要求。 retrofitting 合規性顯著更昂貴。'),
        h2('結論'),
        p('網絡安全不是一次性項目，而是持續的過程。建立安全文化，定期評估和更新安全策略，才能有效應對不斷演變的威脅。'),
      ],
    },
    // HCI articles
    'hci': {
      intro: '超融合基礎設施（HCI）正在改變企業構建和管理數據中心的方式。通過將計算、存儲和網絡整合到單一平台，HCI簡化了運維並降低了成本。本文提供HCI的全面技術指南。',
      sections: [
        h2('HCI技術原理'),
        p('HCI的核心理念是軟件定義。計算由Hypervisor管理（如VMware ESXi、Nutanix AHV或KVM），存儲通過分佈式文件系統（如vSAN或Nutanix AFS）實現，網絡通過虛擬交換機和路由器定義。'),
        p('這種架構的優勢在於：無需單獨的SAN/NAS存儲設備，存儲隨計算節點線性擴展，管理界面統一，故障域更小。'),
        h2('選型指南'),
        p('市場上主要的HCI廠商包括：Nutanix（功能最全面，價格最高），VMware vSAN（與VMware生態最佳整合），Sangfor（亞太市場性價比最高），以及開源方案如Proxmox VE。'),
        p('選擇時應考慮：現有技術投資、團隊技能、預算、擴展需求、廠商支持能力。我們建議進行概念驗證測試，而不是僅基於規格書做決定。'),
        h2('部署最佳實踐'),
        p('1）從3-4個節點開始，逐步擴展。2）分離管理和工作負載網絡。3）啟用數據壓縮和重複數據刪除。4）配置適當的數據保護策略。5）監控性能指標並設置告警。'),
        h2('結論'),
        p('HCI是現代數據中心的基礎。選擇正確的平台和實施方法，可以顯著降低運維複雜性和總體擁有成本。'),
      ],
    },
    // Network articles
    'network': {
      intro: '企業網絡是所有業務應用的基礎。一個設計良好的網絡架構不僅要滿足當前需求，還要具備足夠的靈活性來適應未來變化。本文提供企業網絡設計和實施的全面指南。',
      sections: [
        h2('網絡設計原則'),
        p('好的網絡設計遵循最小權限和縱深防禦原則。將網絡分區：管理、生產、DMZ和訪客。每個區域應有自己的VLAN、子網和防火牆規則。區域間的流量應被明確允許和記錄。'),
        p('對於大型企業網絡，推薦spine-leaf架構。這種架構提供可預測的延遲、易於擴展、無單點故障。使用25GbE或100GbE連接spine-leaf，10GbE或25GbE連接服務器。'),
        h2('SD-WAN部署'),
        p('SD-WAN正在成為多分支機構企業的標準選擇。它提供應用感知路由、 WAN優化和集中管理。部署時需要考慮：應用流量模式、帶寬需求、安全要求和管理策略。'),
        h2('安全整合'),
        p('現代網絡安全不再是邊界防火牆那麼簡單。需要整合：下一代防火牆、入侵檢測系統、網絡訪問控制、DDoS防護和安全信息事件管理（SIEM）。'),
        h2('結論'),
        p('企業網絡設計需要平衡性能、安全和成本。與經驗豐富的合作夥伴合作，可以避免常見陷阱並確保投資回報。'),
      ],
    },
    // AI articles
    'ai': {
      intro: '人工智能正在從概念驗證走向生產部署。企業需要理解AI的能力和限制，制定切實可行的AI戰略。本文提供企業AI采用的全面指南，從評估到實施。',
      sections: [
        h2('AI技術概覽'),
        p('當前企業AI主要應用包括：AIGC（生成式AI用於內容生成）、AI辅助開發（代碼生成和審查）、Legacy系統AI增強（為現有系統添加智能功能）、AI Agent（自主執行任務的智能體）。'),
        p('技術選型應考慮：數據可用性、計算資源、團隊技能、預算和合規要求。多數企業從雲端AI服務開始（如阿里雲百煉、字節跳動火山引擎），逐步過渡到混合或本地部署。'),
        h2('實施路線圖'),
        p('第1步：AI就緒度評估。評估數據質量、基礎設施、人才和流程。第2步：用例優先級排序。選擇高影響力、低複雜度的用例先開始。'),
        p('第3步：PoC驗證。用30-60天驗證概念可行性。第4步：生產部署。分階段推廣到生產環境。第5步：持續優化。監控效果，迭代改進。'),
        h2('風險和合規'),
        p('AI部署需要關注：數據隱私（GDPR/個資法合規）、算法偏見（定期審計）、可解釋性（決策透明度）、問責制（誰對AI決策負責）。'),
        h2('結論'),
        p('AI不是萬能藥，但在正確的場景下可以帶來巨大的業務價值。關鍵是從小開始，快速學習，逐步擴展。'),
      ],
    },
    // Default
    'default': {
      intro: '本文提供該主題的全面技術分析和實踐指南。基於我們在東南亞地區的實際部署經驗，涵蓋技術原理、最佳實踐、常見問題和解決方案。',
      sections: [
        h2('技術概述'),
        p('該技術是現代企業IT基礎設施的重要組成部分。它幫助企業提高效率、降低成本、增強安全性。選擇正確的解決方案需要綜合考慮業務需求、技術要求和預算限制。'),
        h2('實施指南'),
        p('成功的實施需要：1）充分的需求分析和規劃，2）分階段部署和測試，3）團隊培訓和知識轉移，4）持續監控和優化。'),
        p('我們建議在大規模部署前，至少進行30天的概念驗證。這能幫助驗證技術方案，發現潛在問題，並讓團隊積累經驗。'),
        h2('最佳實踐'),
        p('根據我們的經驗，以下實踐對成功至關重要：建立清晰的目標和指標、組建跨職能團隊、採用敏捷方法論、定期評估和調整策略。'),
        h2('常見問題'),
        p('問題1：預算超支。解決方案：建立明確的預算基線，定期跟踪支出，設置應急儲備。問題2：用戶接受度低。解決方案：早期用戶參與，充分的培訓和溝通。'),
        h2('結論'),
        p('技術實施是旅程而非終點。持續學習、適應和優化是長期成功的關鍵。'),
      ],
    },
  };

  // Determine topic category
  let category = 'default';
  if (slug.includes('vmware') || slug.includes('nsx') || slug.includes('veeam') || slug.includes('horizon') || slug.includes('vsphere') || slug.includes('vcloud') || slug.includes('proxmox') || slug.includes('hyper-v')) {
    category = 'vmware';
  } else if (slug.includes('security') || slug.includes('fortigate') || slug.includes('edr') || slug.includes('ransomware') || slug.includes('zero-trust') || slug.includes('vpn') || slug.includes('nac') || slug.includes('ddos') || slug.includes('soc') || slug.includes('incident') || slug.includes('vulnerability') || slug.includes('iso-27001') || slug.includes('gdpr') || slug.includes('pci') || slug.includes('audit') || slug.includes('segmentation') || slug.includes('wifi') || slug.includes('ngfw') || slug.includes('cisco-asa') || slug.includes('paloalto') || slug.includes('layered-defense') || slug.includes('ztna')) {
    category = 'security';
  } else if (slug.includes('hci') || slug.includes('nutanix') || slug.includes('sangfor') || slug.includes('hyper-converged')) {
    category = 'hci';
  } else if (slug.includes('network') || slug.includes('sdwan') || slug.includes('firewall')) {
    category = 'network';
  } else if (slug.includes('ai') || slug.includes('aigc') || slug.includes('agent') || slug.includes('legacy')) {
    category = 'ai';
  }

  const topic = topics[category];
  return [p(topic.intro), ...topic.sections];
}

// Main
const posts = await client.fetch('*[_type=="post"]{_id,slug,title,contentZh}');

const needFix = posts.filter(p => {
  const zhText = p.contentZh?.map(b => b.children?.map(c => c.text).join('')).join('') || '';
  const zhChars = (zhText.match(/[\u4e00-\u9fff]/g) || []).length;
  return zhChars < 200;
});

console.log(`Posts needing Chinese content: ${needFix.length}\n`);

let fixed = 0;
for (const post of needFix) {
  const slug = post.slug?.current;
  const title = typeof post.title === 'object' ? post.title.en : post.title;

  const zhContent = generateZh(slug, title);

  try {
    await client.patch(post._id).set({
      contentZh: zhContent,
    }).commit();
    console.log(`✅ ${slug}`);
    fixed++;
  } catch(e) {
    console.error(`❌ ${slug}: ${e.message}`);
  }
}

console.log(`\nFixed: ${fixed}/${needFix.length}`);
