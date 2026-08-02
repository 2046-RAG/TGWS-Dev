import { describe, it, expect } from 'vitest';
import { calculateTCO, fuzzPrice } from './tco-engine';
import type { VendorPricing, Scenario, TcoInput } from './tco-engine';

const vmware: VendorPricing = {
  name: 'VMware', isEstimated: false, isPublic: true, pricingModel: 'per_core', lastUpdated: '2026-07',
  pricingTiers: [{ tierName: 'VVF', pricePerCore: 150, supportFee: 30 }],
};

const sangfor: VendorPricing = {
  name: 'Sangfor', nameZh: '深信服', isEstimated: true, isPublic: false, pricingModel: 'per_node', lastUpdated: '2026-07',
  pricingTiers: [{ tierName: 'aSV', pricePerNode: 5000, supportFee: 100 }],
};

const nutanix: VendorPricing = {
  name: 'Nutanix', isEstimated: false, isPublic: true, pricingModel: 'per_socket', lastUpdated: '2026-07',
  pricingTiers: [{ tierName: 'NCI Pro', pricePerCore: 433, supportFee: 50, minCores: 8, minNodes: 2 }],
};

const subscriptionVendor: VendorPricing = {
  name: 'CloudCo', isEstimated: false, isPublic: true, pricingModel: 'subscription', lastUpdated: '2026-07',
  pricingTiers: [{ tierName: 'Cloud', pricePerNode: 3000, supportFee: 200 }],
};

const scenario: Scenario = {
  name: 'Server Virtualization',
  softwareModules: [],
  multiplierCpu: 1,
  multiplierRam: 1,
  multiplierStorage: 1,
};

const input: TcoInput = { coreCount: 16, nodeCount: 4, yearCount: 3 };

describe('tco-engine', () => {
  it('calculates per_core pricing (VMware)', () => {
    const out = calculateTCO([vmware], scenario, input);
    expect(out.results).toHaveLength(1);
    const r = out.results[0];
    // 16 cores × $150 = 2400 license + 4×30=120 support → 2520/yr × 3 = 7560
    expect(r.licensePerYear).toBe(2400);
    expect(r.supportPerYear).toBe(120);
    expect(r.totalOneYear).toBe(2520);
    expect(r.totalTco).toBe(7560);
    expect(r.isEstimated).toBe(false);
  });

  it('fuzzes estimated vendor results (Sangfor)', () => {
    const out = calculateTCO([sangfor], scenario, input);
    const r = out.results[0];
    // 5000×4=20000 license + 100×4=400 support → 20400/yr × 3 = 61200 → fuzzed
    expect(r.isEstimated).toBe(true);
    expect(r.totalTco % 500).toBe(0);
    expect(r.licensePerYear % 500).toBe(0);
  });

  it('calculates per_socket pricing (Nutanix)', () => {
    const out = calculateTCO([nutanix], scenario, input);
    const r = out.results[0];
    // ceil(16/32)=1 socket × 4 nodes × 433 = 1732 license + 50×4=200 support
    expect(r.licensePerYear).toBe(1732);
    expect(r.supportPerYear).toBe(200);
  });

  it('calculates subscription pricing per node', () => {
    const out = calculateTCO([subscriptionVendor], scenario, input);
    const r = out.results[0];
    // 3000×4=12000 + 200×4=800 → 12800/yr
    expect(r.licensePerYear).toBe(12000);
    expect(r.totalOneYear).toBe(12800);
  });

  it('skips tiers below minimum requirements', () => {
    const strictVendor: VendorPricing = {
      name: 'Strict', isEstimated: false, isPublic: true, pricingModel: 'per_core', lastUpdated: 'x',
      pricingTiers: [{ tierName: 'T1', pricePerCore: 100, minCores: 64, minNodes: 8 }],
    };
    const out = calculateTCO([strictVendor], scenario, input);
    expect(out.results).toHaveLength(0);
  });

  it('uses first matching tier only', () => {
    const multiTier: VendorPricing = {
      name: 'Multi', isEstimated: false, isPublic: true, pricingModel: 'per_core', lastUpdated: 'x',
      pricingTiers: [
        { tierName: 'Basic', pricePerCore: 100, minCores: 8 },
        { tierName: 'Pro', pricePerCore: 200, minCores: 8 },
      ],
    };
    const out = calculateTCO([multiTier], scenario, input);
    expect(out.results).toHaveLength(1);
    expect(out.results[0].tierName).toBe('Basic');
  });

  it('sorts results by total TCO ascending', () => {
    const out = calculateTCO([nutanix, vmware, sangfor], scenario, input);
    const costs = out.results.map(r => r.totalTco);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
  });

  it('sets baseline vendor to VMware', () => {
    const out = calculateTCO([vmware], scenario, input);
    expect(out.baselineVendor).toBe('VMware');
    expect(out.scenarioName).toBe('Server Virtualization');
    expect(out.inputs).toEqual(input);
  });

  it('fuzzPrice rounds to nearest 500', () => {
    expect(fuzzPrice(7560)).toBe(7500);
    expect(fuzzPrice(21460)).toBe(21500);
  });
});
