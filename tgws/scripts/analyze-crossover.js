/**
 * TCO 交叉点分析：求 VMware/Nutanix 何时高于 Sangfor
 *
 * 公式（与 tco.ts 引擎一致）：
 *   VMware/Nutanix: totalCost = pricePerCore × (coresPerCPU × cpuCount) × years
 *   Sangfor:        totalCost = listPrice × cpuCount × (1 + serviceFeeRate × years)
 *
 * 令两者相等，cpuCount 可约去：
 *   pricePerCore × coresPerCPU × years = listPrice × (1 + rate × years)
 *   coresPerCPU = listPrice × (1 + rate × years) / (pricePerCore × years)
 */
const fetch = global.fetch;

async function main() {
  const res = await fetch('http://localhost:3000/api/tco');
  const json = await res.json();
  if (!json.success) {
    console.error('API error:', json.error);
    process.exit(1);
  }
  const config = json.data;
  const rate = config.serviceFeeRate; // 0.15

  console.log('全局服务费率:', rate);
  console.log('='.repeat(78));

  for (const scenario of config.scenarios.sort((a, b) => a.order - b.order)) {
    const vmware = scenario.bundles.find((b) => b.vendor === 'vmware');
    const sangfor = scenario.bundles.find((b) => b.vendor === 'sangfor');
    const nutanix = scenario.bundles.find((b) => b.vendor === 'nutanix');
    console.log(`\n【场景】${scenario.name} (${scenario.nameZh || ''})`);
    console.log(`  VMware ${vmware.bundleName}: $${vmware.pricePerCore}/核/年 | Nutanix ${nutanix.bundleName}: $${nutanix.pricePerCore}/核/年 | Sangfor ${sangfor.bundleName}: $${sangfor.listPricePerCPU}/CPU买断(服务费${(sangfor.serviceFeeRate ?? rate) * 100}%)`);

    for (const years of [1, 3, 5]) {
      // 交叉点 coresPerCPU（每颗CPU的核数）：
      const vmCrossover = (sangfor.listPricePerCPU * (1 + (sangfor.serviceFeeRate ?? rate) * years)) / (vmware.pricePerCore * years);
      const nuCrossover = (sangfor.listPricePerCPU * (1 + (sangfor.serviceFeeRate ?? rate) * years)) / (nutanix.pricePerCore * years);
      console.log(`  ── ${years}年 ──`);
      console.log(`     每CPU核数 > ${Math.round(vmCrossover)} 核时，VMware 高过 Sangfor`);
      console.log(`     每CPU核数 > ${Math.round(nuCrossover)} 核时，Nutanix 高过 Sangfor`);
    }
  }

  // 补充：固定 coresPerCPU=16 时，看 CPU 颗数无关、仅与核数相关 → 直接用交叉核数说明即可
  console.log('\n' + '='.repeat(78));
  console.log('说明：交叉点由「每CPU核数 × 年数」决定，与 CPU 颗数无关（约去）。');
  console.log('即：VMware/Nutanix 总价 ∝ 核数×年数；Sangfor 总价 ∝ CPU颗数×年数，买断部分一次性。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
