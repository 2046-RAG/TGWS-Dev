import { NextResponse } from 'next/server';
import { logServiceError } from '@/lib/errors';

/**
 * Zero-dep guards for public mutating API routes (zod/rate-limit/CSRF stand-in).
 * In-memory sliding window — adequate per serverless instance; pair with
 * platform WAF if abuse persists.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size >= MAX_BUCKETS) buckets.clear();
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(
  request: Request,
  opts: { limit: number; windowMs: number; name: string },
): NextResponse | null {
  const now = Date.now();
  prune(now);
  const key = `${opts.name}:${clientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > opts.limit) {
    logServiceError({
      service: 'RateLimit',
      operation: opts.name,
      error: 'limit exceeded',
      extra: { ip: clientIp(request), limit: opts.limit },
    });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', success: false },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((bucket.resetAt - now) / 1000)) } },
    );
  }
  return null;
}

/** Reject cross-site browser POSTs when Origin is present and foreign. */
export function requireSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  if (!origin) return null; // non-browser / same-origin form posts without Origin

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  const allowed: string[] = [];
  try {
    if (site) allowed.push(new URL(site).origin);
  } catch {
    /* ignore bad env */
  }
  allowed.push('https://www.techguru-it.asia', 'https://techguru-it.asia');
  if (process.env.VERCEL_URL) allowed.push(`https://${process.env.VERCEL_URL}`);

  if (!allowed.includes(origin)) {
    logServiceError({
      service: 'CSRF',
      operation: 'requireSameOrigin',
      error: 'foreign origin',
      extra: { origin },
    });
    return NextResponse.json({ error: 'Forbidden origin', success: false }, { status: 403 });
  }
  return null;
}

type FieldSpec = {
  required?: boolean;
  type?: 'string' | 'email';
  max?: number;
  min?: number;
};

export function validateFields(
  body: Record<string, unknown>,
  specs: Record<string, FieldSpec>,
): string | null {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const [field, spec] of Object.entries(specs)) {
    const value = body[field];

    if (value === undefined || value === null || value === '') {
      if (spec.required) return `${field} is required`;
      continue;
    }

    if (typeof value !== 'string') return `${field} must be a string`;
    const trimmed = value.trim();
    if (spec.required && !trimmed) return `${field} is required`;
    if (spec.min && trimmed.length < spec.min) return `${field} is too short`;
    if (spec.max && trimmed.length > spec.max) return `${field} must be ${spec.max} characters or less`;
    if (spec.type === 'email' && !emailRe.test(trimmed)) return 'Invalid email format';
  }

  return null;
}

/** Parse JSON body; return 400 response instead of throwing on bad JSON. */
export async function parseJsonBody(
  request: Request,
): Promise<{ body: Record<string, unknown> } | { response: NextResponse }> {
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return {
        response: NextResponse.json(
          { error: 'Invalid JSON body', success: false },
          { status: 400 },
        ),
      };
    }
    return { body: raw as Record<string, unknown> };
  } catch {
    return {
      response: NextResponse.json(
        { error: 'Invalid JSON body', success: false },
        { status: 400 },
      ),
    };
  }
}
