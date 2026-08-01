import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity.server';
import { logServiceError } from '@/lib/errors';
import type { TcoCalculatorConfig } from '@/lib/tco';

export const dynamic = 'force-dynamic';

const QUERY = `*[_type == "tcoCalculator"][0] {
  serviceFeeRate,
  disclaimer,
  lastUpdated,
  scenarios[] {
    name,
    nameZh,
    "slug": slug.current,
    description,
    descriptionZh,
    order,
    bundles[] {
      vendor,
      bundleName,
      bundleNameZh,
      pricingModel,
      pricePerCore,
      listPricePerCPU,
      serviceFeeRate,
      includedModules[],
      isEstimated,
      notes
    }
  }
}`;

export async function GET() {
  try {
    const config = await client.fetch<TcoCalculatorConfig>(QUERY);
    if (!config) {
      return NextResponse.json({ success: false, error: 'TCO calculator not configured' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    logServiceError({ service: 'Sanity', operation: 'fetchTcoConfig', error });
    return NextResponse.json({ success: false, error: 'Failed to load TCO configuration' }, { status: 500 });
  }
}
