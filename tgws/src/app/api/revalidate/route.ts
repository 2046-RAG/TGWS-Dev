import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Revalidate all locale pages
  const paths = [
    '/en/about',
    '/zh/about',
    '/en/about/timeline',
    '/zh/about/timeline',
    '/en/home',
    '/zh/home',
    '/',
  ];

  paths.forEach(path => revalidatePath(path));

  // Also revalidate layout to catch any shared components
  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, paths });
}
