import fs from 'fs';

const envContent = fs.readFileSync('D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

const sanityMutate = async (mutations) => {
  const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/mutate/${dataset}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  return res.json();
};

// Manually crafted translations for all 36 case studies
const translations = [
  // 1
  { id: 'BZ85Eqv24r5Z0vAD4dsv3l', titleZh: '全球供應鏈管理系統', clientNameZh: '菲律賓物流公司' },
  // 2
  { id: 'DLVjtXUBis542cKgdAuZ3R', titleZh: '醫院資訊系統現代化', clientNameZh: '馬尼拉大都會醫院集團' },
  // 3
  { id: 'DLVjtXUBis542cKgdAuaQ5', titleZh: '全通路電商平台', clientNameZh: '菲律賓零售企業' },
  // 4
  { id: 'HMEVAgNB1kwhype2XVURNh', titleZh: '金融企業工作負載現代化', clientNameZh: '菲律賓金融機構' },
  // 5
  { id: 'HMEVAgNB1kwhype2XVURib', titleZh: '數位校園基礎架構', clientNameZh: '馬尼拉大都會大學' },
  // 6
  { id: 'HMEVAgNB1kwhype2XVURyr', titleZh: '數位政府服務平台', clientNameZh: '菲律賓政府機構' },
  // 7 - 2GO Group (real company)
  { id: 'case-2go-group-warehouse-optimization', titleZh: '2GO Group 透過 TechGuru WMS 優化倉儲營運', clientNameZh: '2GO Group' },
  // 8 - International Insurance Group (generic)
  { id: 'case-axa-philippines-cloud-migration', titleZh: '國際保險集團透過 TechGuru 遷移實現雲端敏捷性', clientNameZh: '國際保險集團' },
  // 9 - Ayala Land (real company)
  { id: 'case-ayala-land-smart-building', titleZh: 'Ayala Land 在整個組合中導入智慧建築技術', clientNameZh: 'Ayala Land' },
  // 10 - Major Commercial Bank (generic)
  { id: 'case-bdo-unibank-data-center-modernization', titleZh: '主要商業銀行如何現代化其資料中心基礎架構', clientNameZh: '主要商業銀行' },
  // 11 - Prominent Fashion Brand (generic)
  { id: 'case-bench-ecommerce-scaling', titleZh: '知名時尚品牌透過 TechGuru 擴展電商平台', clientNameZh: '知名時尚品牌' },
  // 12 - Cebu Doctors' University Hospital (real)
  { id: 'case-cebu-doctors-patient-digitization', titleZh: '宿務醫生大學醫院實現病患體驗數位化', clientNameZh: 'Cebu Doctors\' University Hospital' },
  // 13 - The Coffee Bean & Tea Leaf Philippines (real)
  { id: 'case-coffee-bean-philippines-instore-tech', titleZh: 'The Coffee Bean & Tea Leaf Philippines 轉型店內體驗', clientNameZh: 'The Coffee Bean & Tea Leaf Philippines' },
  // 14 - Department of Education (real gov)
  { id: 'case-deped-learning-materials-distribution', titleZh: '教育部實現教材分發數位化', clientNameZh: 'Department of Education' },
  // 15 - DICT (real gov)
  { id: 'case-dict-citizen-portal', titleZh: '資訊通信技術部部署市民服務入口網站', clientNameZh: 'Department of Information and Communications Technology' },
  // 16 - De La Salle University (real)
  { id: 'case-dlsu-research-computing-hpc', titleZh: 'De La Salle 大學透過 TechGuru HPC 提升研究運算能力', clientNameZh: 'De La Salle University' },
  // 17 - Fast Cargo Logistics (real)
  { id: 'case-fast-cargo-fleet-telematics', titleZh: 'Fast Cargo Logistics 透過 TechGuru 導入車隊遠端資訊系統', clientNameZh: 'Fast Cargo Logistics' },
  // 18 - Leading Mobile Payment Platform (generic - referring to GCash)
  { id: 'case-gcash-payment-infrastructure-scaling', titleZh: '領先行動支付平台透過 TechGuru 擴展支付基礎架構', clientNameZh: '領先行動支付平台' },
  // 19 - ICTSI (real)
  { id: 'case-ictsi-port-operations-iot', titleZh: 'ICTSI 透過 TechGuru IoT 解決方案實現港口營運現代化', clientNameZh: 'International Container Terminal Services (ICTSI)' },
  // 20 - Integrated Microelectronics (real)
  { id: 'case-integrated-microelectronics-industry-40', titleZh: 'Integrated Microelectronics 透過 TechGuru 導入工業 4.0', clientNameZh: 'Integrated Microelectronics (IMI)' },
  // 21 - Multinational Restaurant Corporation (generic - Jollibee)
  { id: 'case-jollibee-restaurant-technology', titleZh: '跨國餐飲集團提升餐廳技術', clientNameZh: '跨國餐飲集團' },
  // 22 - LBC Express (real)
  { id: 'case-lbc-express-last-mile-delivery', titleZh: 'LBC Express 透過 TechGuru 轉型最後一哩配送', clientNameZh: 'LBC Express' },
  // 23 - Makati Medical Center (real)
  { id: 'case-makati-medical-network-security', titleZh: 'Makati 醫療中心透過 TechGuru 提升網路安全', clientNameZh: 'Makati Medical Center' },
  // 24 - The Manila Hotel (real)
  { id: 'case-manila-hotel-guest-experience-tech', titleZh: 'Manila Hotel 透過 TechGuru 酒店技術升級賓客體驗', clientNameZh: 'The Manila Hotel' },
  // 25 - Manila Science High School (real)
  { id: 'case-manila-science-high-school-digital-learning', titleZh: 'Manila Science 中學導入 1:1 數位學習計畫', clientNameZh: 'Manila Science High School' },
  // 26 - Megaworld Corporation (real)
  { id: 'case-megaworld-smart-township', titleZh: 'Megaworld Corporation 導入智慧城鎮技術', clientNameZh: 'Megaworld Corporation' },
  // 27 - Major Banking Group (generic - Metrobank)
  { id: 'case-metrobank-hybrid-cloud-security', titleZh: '主要銀行集團保障其混合雲環境', clientNameZh: '主要銀行集團' },
  // 28 - Monde Nissin Corporation (real)
  { id: 'case-monde-nissin-production-automation', titleZh: 'Monde Nissin 透過 TechGuru 機器人技術實現產線自動化', clientNameZh: 'Monde Nissin Corporation' },
  // 29 - National Health Insurance Provider (generic - PhilHealth)
  { id: 'case-philhealth-claims-modernization', titleZh: '國家健康保險提供者現代化理賠處理', clientNameZh: '國家健康保險提供者' },
  // 30 - Philippine General Hospital (real)
  { id: 'case-philippine-general-hospital-it-modernization', titleZh: '大型公立醫院現代化其 IT 基礎架構', clientNameZh: 'Philippine General Hospital' },
  // 31 - Retail Chain (generic - Robinsons)
  { id: 'case-robinsons-retail-omnichannel', titleZh: '零售連鎖透過 TechGuru 優化全通路營運', clientNameZh: '零售連鎖' },
  // 32 - Texas Instruments Philippines (real)
  { id: 'case-semiconductor-mfg-quality-control-ai', titleZh: '半導體製造透過 TechGuru AI 轉型品質控制', clientNameZh: 'Texas Instruments Philippines' },
  // 33 - Large Retail Group (generic - SM)
  { id: 'case-sm-retail-supply-chain-digitalization', titleZh: '大型零售集團透過 TechGuru 實現供應鏈數位化', clientNameZh: '大型零售集團' },
  // 34 - Leading Medical Center (generic - St. Luke's)
  { id: 'case-st-lukes-vdi-implementation', titleZh: '領先醫療中心導入虛擬桌面基礎架構', clientNameZh: '領先醫療中心' },
  // 35 - Philippine Digital Bank (generic - UnionBank)
  { id: 'case-unionbank-sdn-transformation', titleZh: '菲律賓數位銀行透過軟體定義網路實現轉型', clientNameZh: '菲律賓數位銀行' },
  // 36 - University of the Philippines (real)
  { id: 'case-university-of-philippines-network-upgrade', titleZh: 'University of the Philippines 導入全校網路升級', clientNameZh: 'University of the Philippines' },
];

console.log(`Total: ${translations.length} case studies to update\n`);

// Batch update
const batchSize = 10;
let updated = 0;
let failed = 0;

for (let i = 0; i < translations.length; i += batchSize) {
  const batch = translations.slice(i, i + batchSize);
  const mutations = batch.map(t => ({
    patch: {
      id: t.id,
      set: { titleZh: t.titleZh, clientNameZh: t.clientNameZh }
    }
  }));

  try {
    const result = await sanityMutate(mutations);
    if (result.results) {
      updated += batch.length;
      console.log(`Batch ${Math.floor(i/batchSize)+1}: Updated ${batch.length} items`);
    } else {
      failed += batch.length;
      console.error(`Batch ${Math.floor(i/batchSize)+1}: Failed -`, JSON.stringify(result).substring(0, 200));
    }
  } catch (err) {
    failed += batch.length;
    console.error(`Batch ${Math.floor(i/batchSize)+1}: Error -`, err.message);
  }
}

console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
