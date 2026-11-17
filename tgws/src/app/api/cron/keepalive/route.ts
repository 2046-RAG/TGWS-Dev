import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';

/**
 * Keep the Supabase Free project awake.
 *
 * Supabase pauses Free projects after 7 days with too little database
 * activity (supabase.com/docs/guides/platform/free-project-pausing). A few
 * real DB queries per day is enough. Vercel Hobby allows one cron per day,
 * which fits this purpose.
 *
 * Auth: Vercel Cron adds `x-vercel-cron: 1` to invocations (not spoofable by
 * normal browsers due to CORS, and this endpoint is a read-only one-row
 * query). If CRON_SECRET is set we additionally require it — best of both
 * worlds: zero-config on Hobby, stronger auth when a secret is available.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const bearerOk = secret
    ? request.headers.get('authorization') === `Bearer ${secret}`
    : false;

  if (!isVercelCron && !bearerOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    // Real (tiny) query — Supabase counts DB activity, not HTTP pings.
    const { error } = await supabase
      .from('ticket_audit_log')
      .select('id')
      .limit(1);

    if (error) {
      logServiceError({ service: 'KeepAlive', operation: 'dbPing', error });
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (error) {
    logServiceError({ service: 'KeepAlive', operation: 'dbPing', error });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
