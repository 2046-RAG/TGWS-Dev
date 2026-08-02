import { describe, it, expect } from 'vitest';
import { calcScenario, getScenarios, fuzzPrice, calcCumulative } from './tco';
import type { TcoCalculatorConfig } from './tco';

const config: TcoCalculatorConfig = {
  serviceFeeRate: 0.15,
  disclaimer: 'Estimates only',
  lastUpdated: '2026-07',
  scenarios: [
    {
      name: 'Server Virtualization', nameZh: '伺服器虛擬化', slug: 'server-virt', order: 1,
      bundles: [
        {
          vendor: 'vmware', bundleName: 'VVF', pricingModel: 'subscription_per_core',
          pricePerCore: 150, includedModules: ['vSphere'], isEstimated: false,
        },
        {
          vendor: 'sangfor', bundleName: 'aSV', pricingModel: 'buyout_per_cpu',
          listPricePerCPU: 3700, includedModules: ['aSV'], isEstimated: true,
        },
        {
          vendor: 'nutanix', bundleName: 'NCI Pro', pricingModel: 'subscription_per_core',
          pricePerCore: 433, includedModules: ['NCI'], isEstimated: false,
        },
      ],
    },
    {
      name: 'SDDC', slug: 'sddc', order: 2,
      bundles: [
        { vendor: 'vmware', bundleName: 'VCF', pricingModel: 'subscription_per_core', pricePerCore: 350, includedModules: [], isEstimated: false },
      ],
    },
  ],
};

const input = { coresPerCPU: 16, cpuCount: 4, years: 3 };

describe('calcScenario', () => {
  it('returns null for invalid scenario index', () => {
    expect(calcScenario(config, 99, input)).toBeNull();
  });

  it('calculates subscription_per_core cost correctly (VMware)', () => {
    const result = calcScenario(config, 0, input)!;
    // 16 cores × 4 CPUs = 64 cores × $150 × 3yr = $28,800
    const vmware = result.results.find(r => r.vendor === 'vmware')!;
    expect(vmware.totalCores).toBe(64);
    expect(vmware.totalCost).toBe(28800);
    expect(vmware.costPerYear).toBe(9600);
    expect(vmware.costPerCore).toBe(150);
    expect(vmware.breakdown.annualCost).toBe(9600);
  });

  it('calculates buyout_per_cpu cost correctly (Sangfor)', () => {
    const result = calcScenario(config, 0, input)!;
    const sangfor = result.results.find(r => r.vendor === 'sangfor')!;
    // license 3700×4=14800 + service 3700×0.15×3×4=6660 → 21460
    expect(sangfor.totalCost).toBe(21460);
    expect(sangfor.breakdown.licenseCost).toBe(14800);
    expect(sangfor.breakdown.serviceFeeTotal).toBe(6660);
    expect(sangfor.costPerCore).toBe(21460 / 64);
  });

  it('sorts results by total cost ascending', () => {
    const result = calcScenario(config, 0, input)!;
    const costs = result.results.map(r => r.totalCost);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
    expect(result.results[0].vendor).toBe('sangfor'); // $21,460 cheapest
    expect(result.results[2].vendor).toBe('nutanix'); // $83,136 most expensive
  });

  it('passes through disclaimer and lastUpdated', () => {
    const result = calcScenario(config, 0, input)!;
    expect(result.disclaimer).toBe('Estimates only');
    expect(result.lastUpdated).toBe('2026-07');
  });

  it('uses bundle-specific serviceFeeRate when provided', () => {
    const customConfig: TcoCalculatorConfig = {
      serviceFeeRate: 0.1, lastUpdated: 'x', scenarios: [{
        name: 'T', slug: 't', order: 1, bundles: [{
          vendor: 'sangfor', bundleName: 'B', pricingModel: 'buyout_per_cpu',
          listPricePerCPU: 1000, serviceFeeRate: 0.2, includedModules: [], isEstimated: false,
        }],
      }],
    };
    const result = calcScenario(customConfig, 0, { coresPerCPU: 8, cpuCount: 2, years: 2 })!;
    // license 1000×2=2000 + service 1000×0.2×2×2=800 → 2800
    expect(result.results[0].totalCost).toBe(2800);
  });
});

describe('getScenarios', () => {
  it('sorts scenarios by order', () => {
    const scenarios = getScenarios(config);
    expect(scenarios.map(s => s.order)).toEqual([1, 2]);
  });
});

describe('fuzzPrice', () => {
  it('rounds to nearest 500', () => {
    expect(fuzzPrice(21460)).toBe(21500);
    expect(fuzzPrice(21249)).toBe(21000);
    expect(fuzzPrice(83136)).toBe(83000);
  });
});

describe('calcCumulative', () => {
  it('returns null for invalid index', () => {
    expect(calcCumulative(config, 99, input)).toBeNull();
  });

  it('computes year-by-year cumulative costs', () => {
    const cumulative = calcCumulative(config, 0, input)!;
    expect(cumulative).toHaveLength(3);
    // year 1: VMware 64×150×1 = 9600
    expect(cumulative[0].results.find(r => r.vendor === 'vmware')!.cost).toBe(9600);
    // year 3: VMware 64×150×3 = 28800
    expect(cumulative[2].results.find(r => r.vendor === 'vmware')!.cost).toBe(28800);
    expect(cumulative[2].year).toBe(3);
  });
});
