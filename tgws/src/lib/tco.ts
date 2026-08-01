/**
 * TCO Calculator Engine
 *
 * Handles two pricing models:
 * 1. Subscription per core/year (VMware, Nutanix)
 * 2. Buyout per CPU + service fee rate (Sangfor)
 *
 * Input parameters:
 * - coresPerCPU: physical cores per CPU socket
 * - cpuCount: number of CPU sockets (shared across all vendors)
 * - years: subscription/license years
 */

export type PricingModel = 'subscription_per_core' | 'buyout_per_cpu';

export interface Bundle {
  vendor: 'vmware' | 'sangfor' | 'nutanix';
  bundleName: string;
  bundleNameZh?: string;
  pricingModel: PricingModel;
  pricePerCore?: number;       // subscription_per_core only
  listPricePerCPU?: number;    // buyout_per_cpu only
  serviceFeeRate?: number;     // buyout_per_cpu only (e.g. 0.15)
  includedModules: string[];
  isEstimated: boolean;
  notes?: string;
}

export interface Scenario {
  name: string;
  nameZh?: string;
  slug: string;
  description?: string;
  descriptionZh?: string;
  order: number;
  bundles: Bundle[];
}

export interface TcoCalculatorConfig {
  serviceFeeRate: number;  // global default for Sangfor
  disclaimer?: string;
  lastUpdated: string;
  scenarios: Scenario[];
}

export interface TcoInput {
  coresPerCPU: number;
  cpuCount: number;
  years: number;
}

export interface TcoResult {
  vendor: string;
  bundleName: string;
  bundleNameZh?: string;
  totalCores: number;
  totalCost: number;
  costPerCore: number;       // normalized for comparison
  costPerYear: number;       // annualized
  pricingModel: PricingModel;
  isEstimated: boolean;
  includedModules: string[];
  notes?: string;
  breakdown: {
    licenseCost?: number;
    annualCost?: number;
    serviceFeeTotal?: number;
  };
}

export interface TcoScenarioResult {
  scenario: Scenario;
  input: TcoInput;
  results: TcoResult[];
  disclaimer?: string;
  lastUpdated: string;
}

/**
 * Calculate TCO for a single bundle
 */
function calcBundle(bundle: Bundle, input: TcoInput, defaultServiceFeeRate: number): TcoResult {
  const totalCores = input.coresPerCPU * input.cpuCount;

  if (bundle.pricingModel === 'subscription_per_core') {
    // VMware / Nutanix: pricePerCore × totalCores × years
    const pricePerCore = bundle.pricePerCore ?? 0;
    const totalCost = pricePerCore * totalCores * input.years;
    const costPerYear = totalCost / input.years;

    return {
      vendor: bundle.vendor,
      bundleName: bundle.bundleName,
      bundleNameZh: bundle.bundleNameZh,
      totalCores,
      totalCost,
      costPerCore: pricePerCore,
      costPerYear,
      pricingModel: bundle.pricingModel,
      isEstimated: bundle.isEstimated,
      includedModules: bundle.includedModules,
      notes: bundle.notes,
      breakdown: {
        annualCost: totalCost / input.years,
      },
    };
  }

  // buyout_per_cpu: Sangfor
  // Total = listPrice × cpuCount + listPrice × serviceFeeRate × years × cpuCount
  //       = listPrice × cpuCount × (1 + serviceFeeRate × years)
  const listPrice = bundle.listPricePerCPU ?? 0;
  const serviceFeeRate = bundle.serviceFeeRate ?? defaultServiceFeeRate;
  const licenseCost = listPrice * input.cpuCount;
  const serviceFeeTotal = listPrice * serviceFeeRate * input.years * input.cpuCount;
  const totalCost = licenseCost + serviceFeeTotal;
  const costPerYear = totalCost / input.years;
  const costPerCore = totalCost / totalCores;

  return {
    vendor: bundle.vendor,
    bundleName: bundle.bundleName,
    bundleNameZh: bundle.bundleNameZh,
    totalCores,
    totalCost,
    costPerCore,
    costPerYear,
    pricingModel: bundle.pricingModel,
    isEstimated: bundle.isEstimated,
    includedModules: bundle.includedModules,
    notes: bundle.notes,
    breakdown: {
      licenseCost,
      serviceFeeTotal,
    },
  };
}

/**
 * Calculate TCO for all bundles in a scenario
 */
export function calcScenario(
  config: TcoCalculatorConfig,
  scenarioIndex: number,
  input: TcoInput,
): TcoScenarioResult | null {
  const scenario = config.scenarios[scenarioIndex];
  if (!scenario) return null;

  const results = scenario.bundles.map((bundle) =>
    calcBundle(bundle, input, config.serviceFeeRate),
  );

  // Sort by total cost ascending
  results.sort((a, b) => a.totalCost - b.totalCost);

  return {
    scenario,
    input,
    results,
    disclaimer: config.disclaimer,
    lastUpdated: config.lastUpdated,
  };
}

/**
 * Get all scenarios from config
 */
export function getScenarios(config: TcoCalculatorConfig): Scenario[] {
  return config.scenarios.sort((a, b) => a.order - b.order);
}

/**
 * Fuzz a price for estimated vendors — round to nearest $500
 */
export function fuzzPrice(price: number): number {
  return Math.round(price / 500) * 500;
}

/**
 * Calculate cumulative costs for chart (year by year)
 */
export function calcCumulative(
  config: TcoCalculatorConfig,
  scenarioIndex: number,
  input: TcoInput,
): { year: number; results: { vendor: string; bundleName: string; cost: number; isEstimated: boolean }[] }[] | null {
  const scenario = config.scenarios[scenarioIndex];
  if (!scenario) return null;

  const cumulative: ReturnType<typeof calcCumulative> = [];

  for (let y = 1; y <= input.years; y++) {
    const yearInput = { ...input, years: y };
    const yearResults = scenario.bundles.map((bundle) => {
      const result = calcBundle(bundle, yearInput, config.serviceFeeRate);
      return {
        vendor: result.vendor,
        bundleName: result.bundleName,
        cost: result.totalCost,
        isEstimated: result.isEstimated,
      };
    });

    cumulative.push({ year: y, results: yearResults });
  }

  return cumulative;
}
