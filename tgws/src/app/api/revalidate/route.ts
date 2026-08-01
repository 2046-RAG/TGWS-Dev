import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { logServiceError } from '@/lib/errors';
import { createHmac, timingSafeEqual } from 'crypto';

// Constant-time comparison of two equal-length strings (AUDIT-006).
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || !secret || !safeEqual(secret, expected)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Parse the Sanity webhook payload to revalidate only affected content
  // (AUDIT-007). Falls back to the full path list when no body is present.
  let body: { _type?: string; _id?: string } = {};
  try {
    body = (await request.json()) as { _type?: string; _id?: string };
  } catch {
    // No JSON body — treat as a generic revalidation request.
  }

  const localePaths = ['/en', '/zh'];
  const contentPaths: Record<string, string[]> = {
    post: localePaths.map((l) => `${l}/blog`),
    product: localePaths.map((l) => `${l}/products`),
    solution: localePaths.map((l) => `${l}/solutions`),
    teamMember: localePaths.map((l) => `${l}/about`),
    timelineEvent: localePaths.map((l) => `${l}/about/timeline`),
    qualification: localePaths.map((l) => `${l}/about`),
    partner: localePaths.map((l) => `${l}/home`),
    tcoCalculator: localePaths.map((l) => `${l}/vmware-alternative`),
  };

  const affected = body._type
    ? contentPaths[body._type] ?? ['/en', '/zh']
    : ['/en/about', '/zh/about', '/en/about/timeline', '/zh/about/timeline', '/en/home', '/zh/home', '/'];

  const failures: string[] = [];
  for (const path of affected) {
    try {
      revalidatePath(path);
    } catch (error) {
      failures.push(path);
      logServiceError({ service: 'Revalidate', operation: 'revalidatePath', error, extra: { path } });
    }
  }

  // Revalidate the layout to catch any shared components.
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    logServiceError({ service: 'Revalidate', operation: 'revalidateLayout', error });
  }

  // Tags are revalidation targets for Sanity webhooks; revalidateTag is
  // intentionally exercised so content types keyed by tag stay fresh.
  // Next.js 16 requires a cache-life profile as the second argument.
  if (body._type) {
    revalidateTag(body._type, { expire: 3600 });
  }

  return NextResponse.json({ revalidated: failures.length === 0, paths: affected, failures });
}
