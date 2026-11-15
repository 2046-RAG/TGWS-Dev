import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';

/** T-059: list assignable staff. Admin-only, independent of page layouts. */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: roleRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = (roleRow as { role?: string } | null)?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .in('role', ['admin', 'super_admin'])
      .is('deleted_at', null)
      .order('email', { ascending: true });

    if (error) {
      logServiceError({ service: 'Admin', operation: 'listStaff', error });
      return NextResponse.json({ error: 'Failed to load staff' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    logServiceError({ service: 'Admin', operation: 'listStaff', error });
    return NextResponse.json({ error: 'Failed to load staff' }, { status: 500 });
  }
}
