import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { logServiceError } from '@/lib/errors';

export async function GET() {
  try {
    const query = `*[_type == "product"] | order(category asc, order asc) {
      _id,
      title,
      category
    }`;
    const products = await client.fetch(query);
    return NextResponse.json({ success: true, data: products || [] });
  } catch (error) {
    logServiceError({ service: 'Sanity', operation: 'fetchProducts', error });
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}
