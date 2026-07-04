import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function GET() {
  try {
    const query = `*[_type == "product"] | order(category asc, order asc) {
      _id,
      title,
      category
    }`;
    const products = await client.fetch(query);
    return NextResponse.json({ success: true, data: products || [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
