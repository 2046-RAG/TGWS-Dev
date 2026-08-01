import { requireAdmin } from '@/lib/auth-guard';

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
