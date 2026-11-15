import { requireAdmin } from '@/lib/auth-guard';
import type { Metadata } from 'next';

// Back-office pages must never be indexed by search engines (T-085).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin gate: runs before the client bundle loads so
  // non-admins are redirected to /support before any admin UI is rendered
  // (AUDIT-117).
  await requireAdmin();
  return <>{children}</>;
}
