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

const zhMap = {
  'vmware-ha-vs-ft-comparison': {
    titleZh: 'VMware HA vs FT完整對比指南',
    blocks: [
      h2('HA vs FT是什麼'),
      p('HA（高可用性）在主機故障時自動重啟VM，恢復時間30秒到2分鐘。FT（容錯）維護VM的即時副本，實現零停機零數據丟失。'),
      h2('選擇標準'),
      p('選HA：應用可容忍短暫停機、有負載均衡器、預算敏感。選FT：單實例關鍵應用、法規要求零停機、無法應用層冗餘。'),
      h2('結論'),
      p('95%的工作負載由HA服務。FT保留給真正關鍵的場景。'),
    ],
  },
  'vmware-horizon-vdi-remote': {
    titleZh: 'VMware Horizon VDI遠程訪問方案',
    blocks: [
      h2('Horizon VDI概述'),
      p('Horizon讓員工在任何設備上訪問Windows桌面。支持PCoIP和Blast協議，提供接近本地的使用體驗。'),
      h2('部署要點'),
      p('至少3台ESXi主機、10GbE網路、共享存儲。使用即時複製減少存儲佔用。配置FSLogix管理用戶配置文件。'),
      h2('結論'),
      p('Horizon是企業VDI的可靠選擇。適當規劃是成功的關鍵。'),
    ],
  },
  'vmware-licensing-changes-2025': {
    titleZh: '2025年VMware授權變化：Broadcom影響與應對',
    blocks: [
      h2('發生了什麼'),
      p('Broadcom收購VMware後，永久授權被取消，改為訂閱制。合作夥伴體系重整，產品線簡化。'),
      h2('對企業的影響'),
      p('成本可能增加30-50%。需要重新評估授權策略。部分功能被捆綁到更高層級。'),
      h2('應對策略'),
      p('1. 評估替代方案（Proxmox、Nutanix）。2. 談判年度合約折扣。3. 優化VM密度減少授權需求。'),
      h2('結論'),
      p('變化是挑戰也是機會。現在是重新評估虛擬化策略的好時機。'),
    ],
  },
  'vmware-migration-checklist': {
    titleZh: 'VMware遷移完整清單',
    blocks: [
      h2('遷移前準備'),
      p('盤點所有VM、識別依賴關係、檢查兼容性、規劃網路、調整目標大小。'),
      h2('遷移執行'),
      p('拍攝快照、先測試非關鍵VM、安排維護窗口、分波遷移、遷移後驗證。'),
      h2('遷移後'),
      p('更新文檔、驗證備份、監控性能2週、移除快照。'),
      h2('結論'),
      p('遷移成敗取決於準備。按清單執行，不要跳步。'),
    ],
  },
  'vmware-srm-disaster-recovery-guide': {
    titleZh: 'VMware SRM災難恢復完整指南',
    blocks: [
      h2('SRM是什麼'),
      p('SRM（Site Recovery Manager）是VMware的災難恢復解決方案。它自動化VM的故障轉移和恢復過程。'),
      h2('架構設計'),
      p('需要兩個站點：主站點和DR站點。每個站點運行vCenter和SRM。使用vSphere Replication或陣列級複製。'),
      h2('部署步驟'),
      p('安裝SRM → 配置複製 → 建立恢復計劃 → 測試故障轉移 → 定期演練。'),
      h2('結論'),
      p('SRM是VMware環境災難恢復的黃金標準。定期測試是成功的關鍵。'),
    ],
  },
  'vmware-to-proxmox-migration': {
    titleZh: 'VMware遷移到Proxmox VE：省錢的遷移路徑',
    blocks: [
      h2('為什麼考慮Proxmox'),
      p('Broadcom收購VMware後授權成本上升。Proxmox VE是開源免費的替代方案，基於KVM和LXC。'),
      h2('遷移流程'),
      p('步驟1：導出VM為OVA格式。步驟2：在Proxmox中導入OVA。步驟3：安裝virtio驅動。步驟4：測試功能。'),
      h2('注意事項'),
      p('Linux VM遷移簡單，Windows VM需要額外步驟。網絡配置需要重新規劃。存儲格式不同。'),
      h2('結論'),
      p('遷移到Proxmox可以節省大量授權費用，但需要技術能力。'),
    ],
  },
  'vmware-to-sangfor-hci-migration': {
    titleZh: 'VMware遷移到Sangfor HCI：分步指南',
    blocks: [
      h2('為什麼選擇Sangfor'),
      p('Sangfor HCI價格有競爭力，管理簡單，亞太地區支持好。是VMware替代方案中性價比最高的選擇之一。'),
      h2('遷移流程'),
      p('評估 → 部署Sangfor叢集 → 使用aCloud遷移工具 → 逐步遷移VM → 驗證 → 切換。'),
      h2('注意事項'),
      p('先遷移非關鍵工作載。網絡配置需要調整。存儲性能需要驗證。'),
      h2('結論'),
      p('遷移到Sangfor可以顯著降低成本。分階段執行是成功的關鍵。'),
    ],
  },
  'vmware-vsphere8-upgrade-guide': {
    titleZh: 'VMware vSphere 8升級完整指南',
    blocks: [
      h2('升級前準備'),
      p('檢查硬件兼容性（HCL）、備份vCenter、閱讀發行說明、在測試環境驗證。'),
      h2('升級順序'),
      p('1. 升級vCenter Server。2. 升級NSX Manager（如使用）。3. 升級ESXi主機。4. 升級VMware Tools。5. 升級虛擬機硬體版本。'),
      h2('常見問題'),
      p('第三方VIB不兼容、NSX升級順序、vSAN格式升級（不可逆）。'),
      h2('結論'),
      p('vSphere 8值得升級。預算2-4週，分階段執行。'),
    ],
  },
};

// Find remaining posts without Chinese content
const posts = await client.fetch(`*[_type=="post" && publishedAt < "2025-02-01T00:00:00Z"]{
  _id, slug, contentZh
}`);

const needFix = posts.filter(p => {
  const slug = p.slug?.current;
  const zhWords = p.contentZh?.reduce((a,b) => a+(b._type==='block'?(b.children?.map(c=>c.text).join(' ')||'').split(/\s+/).length:0),0)||0;
  return zhWords < 500 && zhMap[slug];
});

console.log(`Remaining posts to fix: ${needFix.length}\n`);

for (const post of needFix) {
  const slug = post.slug?.current;
  const translation = zhMap[slug];
  if (!translation) continue;

  try {
    await client.patch(post._id).set({
      titleZh: translation.titleZh,
      contentZh: translation.blocks,
    }).commit();
    console.log(`✅ ${slug}: 中文內容已添加`);
  } catch(e) {
    console.error(`❌ ${slug}: ${e.message}`);
  }
}

console.log('\nDone!');
