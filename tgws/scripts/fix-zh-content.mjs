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
const h3 = t => b(t,'h3');
const p = t => b(t);

// Find posts needing Chinese content fix
const posts = await client.fetch(`*[_type=="post" && publishedAt < "2025-02-01T00:00:00Z"]{
  _id, title, slug, content, contentZh
} | order(publishedAt asc)`);

const needFix = posts.filter(p => {
  const zhWords = p.contentZh?.reduce((a,b) => a+(b._type==='block'?(b.children?.map(c=>c.text).join(' ')||'').split(/\s+/).length:0),0)||0;
  return zhWords < 500;
});

console.log(`Posts needing Chinese content fix: ${needFix.length}\n`);

// Chinese translations for each post
const zhMap = {
  'vmware-srm-dr-healthcare-philippines': {
    titleZh: '我們如何為菲律賓醫療機構設計VMware SRM災難恢復',
    blocks: [
      h2('凌晨2點的電話'),
      p('上個月，一家位於奎松市的醫療客戶凌晨2點打電話給我們。他們的主要數據中心斷電，EHR系統當機。急診室的患者在等待，IT團隊一片混亂。幸好他們已經部署了VMware SRM，我們在12分鐘內完成了故障轉移。以下是我們的設置過程。'),
      h2('為什麼醫療機構需要災難恢復'),
      p('在醫療領域，停機不僅昂貴——而且危險。我們見過醫院在中斷期間每小時損失50萬披索。更糟糕的是，患者護理受到影響。SRM可以將這種風險降低90%。'),
      h2('我們的5步SRM部署流程'),
      p('步驟1：評估RPO/RTO需求。醫療機構通常需要RPO小於15分鐘，RTO小於1小時。步驟2：配置複製。我們對大多數工作負載使用非同步複製，對關鍵數據庫使用同步複製。步驟3：測試故障轉移。我們每月運行測試。步驟4：文檔化運行手冊。步驟5：培訓員工。'),
      h2('常見錯誤'),
      p('錯誤1：不定期測試。我們見過客戶設置SRM後從不測試。等到災難發生時，才發現配置有問題。錯誤2：忽略網絡故障轉移。SRM處理VM故障轉移，但DNS、負載均衡器、防火牆規則呢？你需要為所有這些做計劃。'),
      h2('結論'),
      p('如果你在運行VMware但最近沒有測試災難恢復，現在是時候了。從最關鍵的工作負載開始，運行一次故障轉移測試。你會睡得更安稳。'),
    ],
  },
  'vmware-vsphere-8-upgrade-lessons': {
    titleZh: 'VMware vSphere 8升級：我們從50多次遷移中學到的',
    blocks: [
      h2('vSphere 8升級的現實'),
      p('VMware vSphere 8帶來了許多新功能：裝置視圖改進、NSX深度整合、vSAN 8增強。但升級過程比你想像的複雜。我們已經幫助50多家企業完成了升級，以下是我們學到的經驗。'),
      h2('升級前必須做的事'),
      p('1. 檢查相容性：確保所有硬件在VMware HCL上。2. 備份vCenter資料庫。3. 閱讀發行說明——每個次要版本都有已知問題。4. 在測試環境中驗證升級路徑。'),
      h2('升級過程'),
      p('步驟1：升級vCenter Server。這是第一步，也是最關鍵的。步驟2：升級ESXi主機。使用vSphere Lifecycle Manager（以前稱為Update Manager）。步驟3：升級VMware Tools和虛擬機硬體版本。步驟4：驗證所有功能正常。'),
      h2('我們遇到的問題'),
      p('問題1：第三方VIB不兼容。某些備份代理和監控工具需要更新。問題2：NSX升級順序。NSX Manager必須在ESXi升級之前升級。問題3：vSAN升級。vSAN 8引入了新格式，升級是單向的，無法回滾。'),
      h2('結論'),
      p('vSphere 8升級是值得的，但需要仔細規劃。預算2-4週的升級窗口，先在測試環境驗證，然後分階段推廣到生產環境。'),
    ],
  },
  'vmware-proxmox-hyperv-comparison-2025': {
    titleZh: 'VMware vs Proxmox vs Hyper-V：2025年該選哪個？',
    blocks: [
      h2('虛擬化平台之爭'),
      p('Broadcom收購VMware後，許多企業開始尋找替代方案。Proxmox VE和Microsoft Hyper-V成為熱門選擇。但哪個適合你？我們在菲律賓部署了所有三個平台，以下是真實對比。'),
      h2('功能對比'),
      p('VMware：最成熟的生態系統，最豐富的第三方支持，但授權費用最高。Hyper-V：與Windows Server深度整合，適合已投入微軟生態的企業。Proxmox VE：開源免費，基於KVM和LXC，但企業級支持有限。'),
      h2('成本分析'),
      p('VMware vSphere 8 Standard：每CPU插槽約$5,000-8,000。Hyper-V：免費包含在Windows Server中（但需要Windows Server授權）。Proxmox VE：免費開源，企業訂閱€110/年/CPU。'),
      h2('何時選擇哪個'),
      p('選VMware：需要最廣泛的硬件兼容性、已有VMware投資、需要企業級支持。選Hyper-V：已深度使用微軟技術棧、預算有限、需要與Active Directory整合。選Proxmox：預算緊張、技術團隊有能力自助、Linux工作負載為主。'),
      h2('結論'),
      p('沒有「最好」的平台，只有最適合你的。評估你的現有投資、團隊技能、預算和工作負載類型，然後做出決定。'),
    ],
  },
  'nsx-t-enterprise-network-deployment': {
    titleZh: 'NSX-T企業網絡部署實戰指南',
    blocks: [
      h2('NSX-T是什麼'),
      p('NSX-T是VMware的網路虛擬化平台。它在實體網路之上創建虛擬網路層，提供微分段、分散式防火牆和邏輯路由。對於需要先進網路安全的企業來說，NSX-T是強大的工具。'),
      h2('部署前提'),
      p('你需要：vSphere 7.0+環境、至少3台主機、10GbE網路、專用管理VLAN。NSX-T不能在單主機上運行——它設計用於多主機叢集。'),
      h2('部署步驟'),
      p('步驟1：部署NSX Manager叢集（3個節點）。步驟2：配置傳輸區域和傳輸節點。步驟3：創建邏輯交換器和閘道。步驟4：配置分散式防火牆規則。步驟5：測試微分段策略。'),
      h2('注意事項'),
      p('NSX-T學習曲線陡峭。預算至少40小時的培訓。從非關鍵網段開始測試。不要試圖一次虛擬化整個網路。'),
      h2('結論'),
      p('NSX-T是企業網路安全的遊戲規則改變者，但需要仔細規劃和熟練的團隊。'),
    ],
  },
  'vmware-horizon-vdi-remote-workforce': {
    titleZh: 'VMware Horizon VDI：為遠程工作團隊設計',
    blocks: [
      h2('遠程工作的VDI挑戰'),
      p('疫情後，遠程工作成為常態。VMware Horizon VDI讓員工可以在任何設備上訪問Windows桌面。但部署Horizon需要仔細規劃。'),
      h2('Horizon架構'),
      p('核心組件：連接伺服器（處理認證）、統一存取閘道（安全外部存取）、App Volumes（動態應用交付）、FSLogix（配置文件管理）。'),
      h2('部署建議'),
      p('從20-30用戶的試點開始。使用即時複製而非完整複製。為高級用戶配置GPU加速。外部用戶使用Blast協議。'),
      h2('常見問題'),
      p('問題1：基礎設施配置不足。200用戶需要約20台ESXi主機。問題2：網路延遲。VDI對網路品質敏感。問題3：用戶體驗。培訓用戶使用新界面。'),
      h2('結論'),
      p('Horizon是成熟的VDI平台。成功關鍵是適當配置、良好的配置文件管理和徹底測試。'),
    ],
  },
  'vmware-cloud-foundation-private-cloud': {
    titleZh: 'VMware Cloud Foundation：正確建構你的私有雲',
    blocks: [
      h2('為什麼私有雲仍然重要'),
      p('每年都有人宣佈私有雲已死。但每年企業繼續建構。某些工作負載無法遷移到公有雲。受監管行業有數據主權要求。延遲敏感的應用需要本地計算。'),
      h2('什麼是VCF'),
      p('VCF是VMware全棧私有雲平台，捆綁vSphere、vSAN、NSX和Aria。它提供雲端體驗，但運行在你自己的硬體上。'),
      h2('部署流程'),
      p('評估工作負載→調整叢集大小→規劃網路→安裝硬體→部署管理域→建立工作負載域→遷移工作負載。'),
      h2('常見錯誤'),
      p('管理叢集配置不足、忽略網路需求、一次遷移所有內容、跳過設計階段。'),
      h2('結論'),
      p('VCF是需要私有雲的企業的可靠選擇。從概念驗證開始，運行60天後再決定。'),
    ],
  },
  'veeam-backup-vmware-best-practice': {
    titleZh: 'Veeam備份VMware：我們的最佳實踐架構',
    blocks: [
      h2('為什麼選擇Veeam'),
      p('Veeam是VMware環境中最流行的備份解決方案。它支持即時恢復、增量備份、雲端備份，並且與vSphere深度整合。'),
      h2('架構設計'),
      p('推薦架構：一個Veeam Backup Server + 一個Repository Server + 磁帶或雲端存儲。對於大型環境，使用多個Repository分散負載。'),
      h2('備份策略'),
      p('3-2-1規則：3份副本、2種媒體、1份異地。每日增量備份、每週完整備份、每月歸檔。使用Veeam的即時恢復功能可在15分鐘內恢復VM。'),
      h2('最佳實踐'),
      p('啟用備份加密、配置備份驗證（自動恢復測試）、使用Rescan自動清理過期備份、監控備份作業狀態。'),
      h2('結論'),
      p('Veeam + VMware是黃金組合。正確配置後，你可以安心入睡。'),
    ],
  },
  'vmware-ha-vs-ft-which-need': {
    titleZh: 'VMware HA vs FT：你到底需要哪個？',
    blocks: [
      p('當虛擬機崩潰時，你需要多快恢復？HA提供30秒到2分鐘的恢復時間，FT提供零停機。但大多數企業只需要HA。'),
      h2('HA vs FT對比'),
      p('HA：免費、自動重啟VM、30秒-2分鐘恢復、支持所有硬體。FT：需要授權、即時故障轉移、零停機零數據丟失、硬體要求嚴格。'),
      h2('95/5法則'),
      p('95%的工作負載由HA完美服務。剩餘5%通常可以通過應用層叢集或負載均衡解決。FT只在真正需要零停機且無法應用層冗餘時使用。'),
      h2('結論'),
      p('對大多數企業來說，HA是正確答案。免費、簡單、處理95%的故障場景。'),
    ],
  },
  'vmware-migration-checklist-10-steps': {
    titleZh: 'VMware遷移清單：10個我們從不跳過的步驟',
    blocks: [
      h2('遷移前'),
      p('步驟1：盤點所有VM。步驟2：識別依賴關係。步驟3：檢查相容性。步驟4：規劃網路。步驟5：調整目標大小。'),
      h2('遷移中'),
      p('步驟6：拍攝快照。步驟7：先用非關鍵VM測試。步驟8：安排遷移窗口。步驟9：分波遷移。步驟10：遷移後驗證。'),
      h2('結論'),
      p('按照清單逐步執行，在每個階段驗證。關鍵是準備和回滾計劃。'),
    ],
  },
  'what-is-hci-beginners-guide': {
    titleZh: '什麼是HCI？5分鐘入門指南',
    blocks: [
      h2('HCI是什麼'),
      p('HCI（超融合基礎設施）將計算、儲存和網路整合到一個軟體定義平台中。你不再需要單獨的伺服器、SAN和交換器——一個HCI叢集搞定一切。'),
      h2('HCI的三大支柱'),
      p('計算（CPU和記憶體）、儲存（軟體定義儲存池）、網路（軟體定義網路）。三者通過單一軟體層管理。'),
      h2('誰適合HCI'),
      p('中小型企業、分支辦公室、需要簡單基礎設施的組織。不適合：超大規模儲存需求、GPU密集型工作負載。'),
      h2('主要廠商'),
      p('Nutanix（先驅）、Sangfor（亞太強勢）、VMware vSAN（與VMware生態整合）。'),
      h2('結論'),
      p('HCI是現代基礎設施的入門選擇。從3節點開始，逐步擴展。'),
    ],
  },
  'nutanix-hci-healthcare-architecture': {
    titleZh: 'Nutanix HCI醫療行業架構指南',
    blocks: [
      h2('醫療行業的基礎設施需求'),
      p('醫療機構需要高可用性、數據主權和嚴格的合規性。Nutanix HCI可以滿足這些需求，同時簡化管理。'),
      h2('推薦架構'),
      p('3-4節點Nutanix叢集，運行AHV虛擬化。EHR系統、PACS影像、實驗室系統各自獨立VM。使用Nutanix Metro Availability實現雙活。'),
      h2('合規性考慮'),
      p('HIPAA要求：加密靜態數據、存取控制、審計日誌。Nutanix原生支持這些功能。'),
      h2('結論'),
      p('Nutanix是醫療行業HCI的首選。它簡單、可靠，並且符合合規要求。'),
    ],
  },
  'sangfor-hci-smb-deployment': {
    titleZh: 'Sangfor HCI：中小企業簡化部署',
    blocks: [
      h2('為什麼選擇Sangfor'),
      p('Sangfor HCI在亞太地區增長迅速。它的優勢是：價格有競爭力、管理簡單、本地支持好。'),
      h2('部署流程'),
      p('步驟1：評估工作負載。步驟2：選擇節點配置（推薦3節點起步）。步驟3：安裝aCloud管理平台。步驟4：遷移VM。'),
      h2('適用場景'),
      p('100-500人的企業、分支辦公室、非關鍵業務系統。'),
      h2('結論'),
      p('Sangfor是預算有限的中小企業的好選擇。'),
    ],
  },
  'hci-sizing-enterprise-guide': {
    titleZh: 'HCI配置指南：企業正確調整大小',
    blocks: [
      h2('為什麼配置很重要'),
      p('配置不足導致性能問題，過度配置浪費資金。正確配置是HCI成功的關鍵。'),
      h2('配置方法'),
      p('步驟1：盤點現有工作負載（CPU、記憶體、儲存）。步驟2：添加20-30%增長空間。步驟3：計算節點數量。步驟4：驗證IOPS需求。'),
      h2('常見錯誤'),
      p('不考慮故障轉移開銷、忽略網路頻寬、低估儲存需求。'),
      h2('結論'),
      p('花時間在配置上，避免日後的痛苦。'),
    ],
  },
  'nutanix-sangfor-vmware-hci-comparison': {
    titleZh: 'Nutanix vs Sangfor vs VMware：HCI大對比',
    blocks: [
      h2('三大HCI平台'),
      p('Nutanix：功能最全面，價格最高。Sangfor：性價比最高，亞太市場強勢。VMware vSAN：與VMware生態最佳整合。'),
      h2('功能對比'),
      p('管理界面：Nutanix最直觀，Sangfor簡單，VMware功能最豐富。儲存性能：Nutanix略優。價格：Sangfor最低。'),
      h2('選擇建議'),
      p('預算充足選Nutanix，預算有限選Sangfor，已用VMware選vSAN。'),
      h2('結論'),
      p('三個平台都能滿足企業需求。選擇取決於預算、現有投資和團隊技能。'),
    ],
  },
  'hci-data-protection-backup': {
    titleZh: 'HCI數據保護：備份架構設計',
    blocks: [
      h2('HCI的數據保護挑戰'),
      p('HCI提供了叢集內的高可用性，但你仍然需要災難恢復計劃。'),
      h2('備份策略'),
      p('3-2-1規則：本地複製（vSAN）+ 備份到次要存儲 + 雲端異地備份。'),
      h2('工具選擇'),
      p('Veeam、Commvault、Nutanix Leap（僅Nutanix）。'),
      h2('結論'),
      p('數據保護不是可選的——它是必需的。從第一天就規劃。'),
    ],
  },
  'hybrid-hci-cloud-extension': {
    titleZh: '混合HCI-雲端：擴展到公有雲',
    blocks: [
      h2('混合雲的價值'),
      p('HCI + 公有雲讓你靈活擴展。本地運行關鍵負載，雲端處理突發需求。'),
      h2('擴展方式'),
      p('Nutanix NX:公有雲、VMware Cloud on AWS、Azure Stack HCI。'),
      h2('注意事項'),
      p('網路延遲、數據主權、成本管理。'),
      h2('結論'),
      p('混合雲是未來，但需要仔細規劃。'),
    ],
  },
  'hci-troubleshooting-common-issues': {
    titleZh: 'HCI故障排除：常見問題與解決方案',
    blocks: [
      h2('性能問題'),
      p('問題：VM運行緩慢。解決：檢查vSAN健康狀態、驗證網路延遲、確認沒有資源爭用。'),
      h2('儲存問題'),
      p('問題：vSAN降級。解決：檢查磁碟健康、替換故障磁碟、等待再同步完成。'),
      h2('網路問題'),
      p('問題：VM之間無法通信。解決：檢查虛擬交換器配置、驗證VLAN設置、確認防火牆規則。'),
      h2('結論'),
      p('大部分HCI問題可以通過系統化排查解決。記錄問題和解決方案，建立知識庫。'),
    ],
  },
  'hybrid-cloud-architecture-guide': {
    titleZh: '混合雲架構設計指南',
    blocks: [
      h2('混合雲架構原則'),
      p('混合雲不是簡單地連接本地和雲端。它需要統一的管理平面、一致的安全策略和靈活的工作負載遷移。'),
      h2('架構模式'),
      p('雲端擴展（本地為主，雲端備份）、雲端優先（雲端為主，本地保留）、平衡模式（兩者並重）。'),
      h2('技術選擇'),
      p('AWS Outposts、Azure Stack HCI、Google Distributed Cloud。'),
      h2('結論'),
      p('混合雲架構需要根據業務需求定制，沒有萬能方案。'),
    ],
  },
};

// Process each post
for (const post of needFix) {
  const slug = post.slug?.current;
  const translation = zhMap[slug];

  if (!translation) {
    console.log(`⚠️ ${slug}: 無翻譯模板，跳過`);
    continue;
  }

  const title = typeof post.title === 'object' ? post.title.en : post.title;
  const enWords = post.content?.reduce((a,b) => a+(b._type==='block'?(b.children?.map(c=>c.text).join(' ')||'').split(/\s+/).length:0),0)||0;

  try {
    await client.patch(post._id).set({
      titleZh: translation.titleZh,
      contentZh: translation.blocks,
    }).commit();
    console.log(`✅ ${slug}: 中文內容已添加 (${translation.blocks.length} blocks, EN:${enWords}w)`);
  } catch(e) {
    console.error(`❌ ${slug}: ${e.message}`);
  }
}

console.log('\nDone!');
