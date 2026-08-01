/**
 * TCO calculation engine.
 * Deterministic: same inputs → same outputs. No side effects.
 * All pricing data comes from Sanity (not hardcoded).
 */

interface VendorPricingTier {
  tierName: string;
  tierNameZh?: string;
  pricePerCore?: number;
  pricePerNode?: number;
  supportFee?: number;
  minCores?: number;
  minNodes?: number;
  notes?: string;
}

interface VendorPricing {
  name: string;
  nameZh?: string;
  isEstimated: boolean;
  isPublic: boolean;
  pricingModel: 'per_core' | 'per_node' | 'per_socket' | 'subscription';
  pricingTiers: VendorPricingTier[];
  pricingSource?: string;
  pricingDisclaimer?: string;
  lastUpdated: string;
}

interface ScenarioModule {
  _id: string;
  name: string;
  nameZh?: string;
  category: string;
  typicalCostShare?: number;
}

interface Scenario {
  name: string;
  nameZh?: string;
  softwareModules: ScenarioModule[];
  multiplierCpu: number;
  multiplierRam: number;
  multiplierStorage: number;
}

interface TcoInput {
  coreCount: number;
  nodeCount: number;
  yearCount: number;
}

interface VendorTcoResult {
  vendorName: string;
  vendorNameZh?: string;
  tierName: string;
  tierNameZh?: string;
  licensePerYear: number;
  supportPerYear: number;
  totalOneYear: number;
  totalTco: number;
  isEstimated: boolean;
  isPublic: boolean;
  pricingSource?: string;
  pricingDisclaimer?: string;
  lastUpdated: string;
}

interface TcoOutput {
  scenarioName: string;
  inputs: TcoInput;
  results: VendorTcoResult[];
  baselineVendor: string;
}

/**
 * Calculate the cost of one vendor × one tier for given scenario and input params.
 * Returns null if the tier doesn't meet minimum core/node requirements.
 */
function calcVendorTierCost(
  vendor: VendorPricing,
  tier: VendorPricingTier,
  scenario: Scenario,
  input: TcoInput,
): VendorTcoResult | null {
  const minCores = tier.minCores ?? 16;
  const minNodes = tier.minNodes ?? 3;
  if (input.coreCount < minCores || input.nodeCount < minNodes) return null;

  const effectiveCores = Math.ceil(input.coreCount * scenario.multiplierCpu);

  let licensePerYear: number;
  switch (vendor.pricingModel) {
    case 'per_core':
      licensePerYear = (tier.pricePerCore ?? 0) * effectiveCores;
      break;
    case 'per_node':
      licensePerYear = (tier.pricePerNode ?? 0) * input.nodeCount;
      break;
    case 'per_socket':
      licensePerYear = (tier.pricePerCore ?? 0) * Math.ceil(input.coreCount / 32) * input.nodeCount;
      break;
    case 'subscription':
      licensePerYear = (tier.pricePerNode ?? 0) * input.nodeCount;
      break;
  }

  const supportPerYear = (tier.supportFee ?? 0) * input.nodeCount;

  return {
    vendorName: vendor.name,
    vendorNameZh: vendor.nameZh,
    tierName: tier.tierName,
    tierNameZh: tier.tierNameZh,
    licensePerYear: Math.round(licensePerYear),
    supportPerYear: Math.round(supportPerYear),
    totalOneYear: Math.round(licensePerYear + supportPerYear),
    totalTco: Math.round((licensePerYear + supportPerYear) * input.yearCount),
    isEstimated: vendor.isEstimated,
    isPublic: vendor.isPublic,
    pricingSource: vendor.pricingSource,
    pricingDisclaimer: vendor.pricingDisclaimer,
    lastUpdated: vendor.lastUpdated,
  };
}

/**
 * For estimated vendors, fuzz the displayed price: round to nearest $500.
 * Real prices stay in Sanity; only display is fuzzed.
 */
function fuzzPrice(price: number): number {
  return Math.round(price / 500) * 500;
}

/**
 * For estimated vendors, fuzz all money fields in the result.
 */
function fuzzVendorResult(result: VendorTcoResult): VendorTcoResult {
  return {
    ...result,
    licensePerYear: fuzzPrice(result.licensePerYear),
    supportPerYear: fuzzPrice(result.supportPerYear),
    totalOneYear: fuzzPrice(result.totalOneYear),
    totalTco: fuzzPrice(result.totalTco),
  };
}

/**
 * Main TCO calculator. Takes vendors, scenario, and user input → returns compared costs.
 */
function calculateTCO(
  vendors: VendorPricing[],
  scenario: Scenario,
  input: TcoInput,
): TcoOutput {
  const results: VendorTcoResult[] = [];

  for (const vendor of vendors) {
    for (const tier of vendor.pricingTiers) {
      let result = calcVendorTierCost(vendor, tier, scenario, input);
      if (!result) continue;

      if (vendor.isEstimated) {
        result = fuzzVendorResult(result);
      }

      results.push(result);
      break; // Use first matching tier only
    }
  }

  // Sort by total TCO ascending
  results.sort((a, b) => a.totalTco - b.totalTco);

  return {
    scenarioName: scenario.name,
    inputs: input,
    results,
    baselineVendor: 'VMware', // VMware is always the baseline comparison
  };
}

export type {
  VendorPricing,
  VendorPricingTier,
  Scenario,
  ScenarioModule,
  TcoInput,
  TcoOutput,
  VendorTcoResult,
};
export { calculateTCO, fuzzPrice };
