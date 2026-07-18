import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TicketDetailClient from './TicketDetailClient';

// Force dynamic rendering — ticket data is user-scoped, must not be cached.
export const dynamic = 'force-dynamic';

interface Attachment {
  id: string;
  ticket_id: string;
  file_name: string | null;
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  uploaded_at: string;
}

interface Comment {
  id: string;
  ticket_id: string;
  user_id: string | null;
  content: string | null;
  is_internal: boolean;
  created_at: string;
}

interface TicketDetail {
  id: string;
  ticket_number: string;
  user_id: string;
  category: string | null;
  product_service: string | null;
  subject: string;
  description: string | null;
  status: string;
  priority: string | null;
  assigned_to: string | null;
  version: number | null;
  occurred_at: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  deleted_at: string | null;
  idempotency_key: string | null;
}

export interface TicketDetailData extends TicketDetail {
  attachments: Attachment[];
  comments: Comment[];
  is_admin_viewer: boolean;
  assigned_to_email: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'support.ticketDetail' });
  return {
    title: t('title'),
    description: t('title'),
    robots: { index: false, follow: false },
  };
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'support.ticketDetail' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Auth redirect is handled by middleware; render not-found as a safety net.
    notFound();
  }

  // Fetch ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (ticketErr || !ticket) {
    notFound();
  }

  // Resolve viewer role
  const { data: userRoleRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user!.id)
    .single();
  const isAdmin = userRoleRow?.role === 'admin' || userRoleRow?.role === 'super_admin';

  // Authorize: only owner or admin can view
  if (!isAdmin && ticket.user_id !== user!.id) {
    notFound();
  }

  // Fetch attachments (visible to owner + admin via RLS)
  const { data: attachments } = await supabase
    .from('ticket_attachments')
    .select('*')
    .eq('ticket_id', id)
    .order('uploaded_at', { ascending: true });

  // Fetch comments — customers can only see non-internal comments (enforced by RLS)
  let commentsQuery = supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });
  if (!isAdmin) {
    commentsQuery = commentsQuery.eq('is_internal', false);
  }
  const { data: comments } = await commentsQuery;

  // Resolve assigned_to email (admin only sees it)
  let assignedToEmail: string | null = null;
  if (isAdmin && ticket.assigned_to) {
    const { data: assignee } = await supabase
      .from('users')
      .select('email')
      .eq('id', ticket.assigned_to)
      .single();
    assignedToEmail = assignee?.email ?? null;
  }

  const data: TicketDetailData = {
    ...ticket,
    attachments: attachments || [],
    comments: comments || [],
    is_admin_viewer: isAdmin,
    assigned_to_email: assignedToEmail,
  };

  const breadcrumbItems = [
    { label: t('title'), href: `/${locale}/support` },
    { label: ticket.ticket_number },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <Breadcrumb items={breadcrumbItems} />
      <main className="px-5 sm:px-8 max-w-5xl mx-auto pb-16">
        <TicketDetailClient
          ticket={data}
          locale={locale}
          currentUserId={user!.id}
          currentUserEmail={user!.email || null}
        />
      </main>
    </div>
  );
}
