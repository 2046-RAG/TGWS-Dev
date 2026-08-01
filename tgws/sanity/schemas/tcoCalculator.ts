import { defineType, defineField } from 'sanity';

interface ParentContext {
  parent?: Record<string, unknown>;
}

interface BundleSelection {
  vendor?: string;
  bundle?: string;
  price?: number;
  listPrice?: number;
}

interface ScenarioSelection {
  name?: string;
  order?: number;
}

// 内联 bundle 定义（defineField 提供上下文类型推断，validation 参数无需显式注解）
const bundleFields = [
  defineField({ name: 'vendor', type: 'string', title: 'Vendor', options: { list: [{ title: 'VMware', value: 'vmware' }, { title: 'Sangfor', value: 'sangfor' }, { title: 'Nutanix', value: 'nutanix' }] }, validation: (r) => r.required() }),
  defineField({ name: 'bundleName', type: 'string', title: 'Bundle Name', validation: (r) => r.required() }),
  defineField({ name: 'bundleNameZh', type: 'string', title: 'Bundle Name (Traditional Chinese)' }),
  defineField({ name: 'pricingModel', type: 'string', title: 'Pricing Model', options: { list: [{ title: 'Per Core/Year (Subscription)', value: 'subscription_per_core' }, { title: 'Per CPU Buyout + Service Fee', value: 'buyout_per_cpu' }] }, validation: (r) => r.required() }),
  defineField({ name: 'pricePerCore', type: 'number', title: 'Price Per Core/Year (USD)', description: 'For subscription_per_core model', hidden: ({ parent }: ParentContext) => parent?.pricingModel !== 'subscription_per_core' }),
  defineField({ name: 'listPricePerCPU', type: 'number', title: 'List Price Per CPU (USD, Buyout)', description: 'For buyout_per_cpu model — one-time license', hidden: ({ parent }: ParentContext) => parent?.pricingModel !== 'buyout_per_cpu' }),
  defineField({ name: 'serviceFeeRate', type: 'number', title: 'Annual Service Fee Rate', description: 'e.g. 0.15 = 15%. For buyout_per_cpu only.', initialValue: 0, hidden: ({ parent }: ParentContext) => parent?.pricingModel !== 'buyout_per_cpu' }),
  defineField({ name: 'includedModules', type: 'array', of: [{ type: 'string' }], title: 'Included Modules', description: 'List of software modules included in this bundle' }),
  defineField({ name: 'isEstimated', type: 'boolean', title: 'Estimated Price (fuzzed display)', description: 'Frontend shows rounded prices and dashed lines', initialValue: false }),
  defineField({ name: 'notes', type: 'text', title: 'Notes' }),
];

// 内联 scenario 定义
const scenarioFields = [
  defineField({ name: 'name', type: 'string', title: 'Scenario Name', validation: (r) => r.required() }),
  defineField({ name: 'nameZh', type: 'string', title: 'Scenario Name (Traditional Chinese)' }),
  defineField({ name: 'slug', type: 'slug', options: { source: 'name' } }),
  defineField({ name: 'description', type: 'text', title: 'Description' }),
  defineField({ name: 'descriptionZh', type: 'text', title: 'Description (Traditional Chinese)' }),
  defineField({ name: 'order', type: 'number', title: 'Display Order', initialValue: 0 }),
  defineField({ name: 'bundles', type: 'array', title: 'Vendor Bundles', of: [{ type: 'object', fields: bundleFields, preview: { select: { vendor: 'vendor', bundle: 'bundleName', price: 'pricePerCore', listPrice: 'listPricePerCPU' }, prepare({ vendor, bundle, price, listPrice }: BundleSelection) { return { title: `${bundle}`, subtitle: vendor === 'sangfor' ? `$${listPrice}/CPU buyout` : `$${price}/core/yr` }; } } }],
    validation: (r) => r.min(3).max(3).error('Exactly 3 vendor bundles required (VMware + Sangfor + Nutanix)'),
  }),
];

export default defineType({
  name: 'tcoCalculator',
  title: 'TCO Calculator',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Title', initialValue: 'TCO Calculator Config', hidden: true }),
    defineField({ name: 'serviceFeeRate', type: 'number', title: 'Default Service Fee Rate (Sangfor)', description: 'Applied to Sangfor buyout bundles. e.g. 0.15 = 15%/year', initialValue: 0.15, validation: (r) => r.min(0).max(1) }),
    defineField({ name: 'disclaimer', type: 'text', title: 'Disclaimer Text', description: 'Shown below the calculator on the website' }),
    defineField({ name: 'lastUpdated', type: 'date', title: 'Last Updated', validation: (r) => r.required() }),
    defineField({ name: 'scenarios', type: 'array', title: 'Scenarios', of: [{ type: 'object', fields: scenarioFields, preview: { select: { name: 'name', order: 'order' }, prepare({ name, order }: ScenarioSelection) { return { title: name, subtitle: `Order: ${order}` }; } } }],
      validation: (r) => r.min(1).error('At least 1 scenario required'),
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'lastUpdated' } },
});
