import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Server-side auth guards for protected routes.
 * These must run in Server Components / layouts BEFORE any client bundle
 * loads, so unauthenticated / non-admin users never see protected UI
 * (AUDIT-117, AUDIT-224).
 */

export interface AuthUser {
  id: string;
  email?: string;
  role: string;
}

// Reads the current session + role from Supabase. Returns null when the
// user is not logged in or the role lookup fails.
async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? undefined,
    role: userRole?.role || 'user',
  };
}

/** Redirect to login when not authenticated. Returns the user when OK. */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect('/support/login');
  return user;
}

/** Redirect to login (anon) or support (non-admin) when unauthorized. */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect('/support/login');
  if (user.role !== 'admin' && user.role !== 'super_admin') redirect('/support');
  return user;
}

/** Redirect already-authenticated users away from login/register pages. */
export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getAuthUser();
  if (user) redirect('/support');
}
