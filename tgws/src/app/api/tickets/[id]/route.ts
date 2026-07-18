import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTicketStatusEmail, sendTicketReplyEmail } from '@/lib/resend';

// --- Constants ---------------------------------------------------------------

const VALID_CATEGORIES = ['build', 'run', 'protect'] as const;
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

const LIMITS = {
  subject: 200,
  description: 800,
  productService: 100,
  comment: 4000,
} as const;

// Fields a non-admin user is allowed to PATCH on their own ticket.
const CUSTOMER_PATCHABLE_FIELDS = new Set(['description', 'comment']);

// Fields an admin is allowed to PATCH.
const ADMIN_PATCHABLE_FIELDS = new Set([
  'status',
  'priority',
  'assignedTo',
  'assigned_to',
  'description',
  'comment',
  'category',
  'productService',
  'product_service',
  'subject',
  'isInternal',
  'is_internal',
]);

type ErrorCode =
  | 'unauthorized'
  | 'validation_failed'
  | 'forbidden'
  | 'not_found'
  | 'version_conflict'
  | 'internal_error';

function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}

// --- GET: ticket detail ------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse('unauthorized', 'Unauthorized', 401);
  }

  const { id } = await params;

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !ticket) {
    return errorResponse('not_found', 'Ticket not found', 404);
  }

  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';
  if (!isAdmin && ticket.user_id !== user.id) {
    return errorResponse('forbidden', 'Forbidden', 403);
  }

  // Customers should not see internal comments. Admins see all.
  let commentsQuery = supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  if (!isAdmin) {
    commentsQuery = commentsQuery.eq('is_internal', false);
  }

  const { data: attachments } = await supabase
    .from('ticket_attachments')
    .select('*')
    .eq('ticket_id', id);

  const { data: comments } = await commentsQuery;

  return NextResponse.json({
    success: true,
    data: {
      ...ticket,
      attachments: attachments || [],
      comments: comments || [],
      is_admin_viewer: isAdmin,
    },
  });
}

// --- PATCH: update ticket (role-based field whitelist) -----------------------

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse('unauthorized', 'Unauthorized', 401);
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('validation_failed', 'Invalid JSON body', 400);
  }

  // Lookup ticket first
  const { data: current, error: currentErr } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (currentErr || !current) {
    return errorResponse('not_found', 'Ticket not found', 404);
  }

  // Lookup user role
  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';
  if (!isAdmin && current.user_id !== user.id) {
    return errorResponse('forbidden', 'Forbidden', 403);
  }

  // --- Field-level role whitelist -------------------------------------------
  // Non-admin: only description OR add comment. Cannot touch status/priority/assigned_to.
  // Admin: any field in ADMIN_PATCHABLE_FIELDS.
  const allowedFields = isAdmin ? ADMIN_PATCHABLE_FIELDS : CUSTOMER_PATCHABLE_FIELDS;
  const requestedFields = Object.keys(body);
  const disallowedFields = requestedFields.filter((k) => !allowedFields.has(k));

  // `version` is allowed for everyone (optimistic locking) — strip it before the check.
  const disallowedReal = disallowedFields.filter((k) => k !== 'version');
  if (disallowedReal.length > 0) {
    return errorResponse(
      'forbidden',
      isAdmin
        ? `Fields not allowed: ${disallowedReal.join(', ')}`
        : `Customers can only update description or add a comment. Disallowed fields: ${disallowedReal.join(', ')}`,
      403
    );
  }

  // --- Validate field values ------------------------------------------------
  const {
    status,
    priority,
    assignedTo,
    assigned_to,
    description,
    subject,
    category,
    productService,
    product_service,
    comment,
    isInternal,
    is_internal,
    version,
  } = body as {
    status?: string;
    priority?: string;
    assignedTo?: string;
    assigned_to?: string;
    description?: string;
    subject?: string;
    category?: string;
    productService?: string;
    product_service?: string;
    comment?: string;
    isInternal?: boolean;
    is_internal?: boolean;
    version?: number;
  };

  if (status !== undefined && !VALID_STATUSES.includes(status as never)) {
    return errorResponse(
      'validation_failed',
      `status must be one of: ${VALID_STATUSES.join(', ')}`,
      400
    );
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority as never)) {
    return errorResponse(
      'validation_failed',
      `priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
      400
    );
  }
  if (category !== undefined && !VALID_CATEGORIES.includes(category as never)) {
    return errorResponse(
      'validation_failed',
      `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      400
    );
  }
  if (subject !== undefined && (typeof subject !== 'string' || subject.length > LIMITS.subject)) {
    return errorResponse('validation_failed', `subject must be ≤ ${LIMITS.subject} chars`, 400);
  }
  if (description !== undefined && (typeof description !== 'string' || description.length > LIMITS.description)) {
    return errorResponse('validation_failed', `description must be ≤ ${LIMITS.description} chars`, 400);
  }
  const productServiceVal = productService ?? product_service;
  if (productServiceVal !== undefined && (typeof productServiceVal !== 'string' || productServiceVal.length > LIMITS.productService)) {
    return errorResponse('validation_failed', `productService must be ≤ ${LIMITS.productService} chars`, 400);
  }
  if (comment !== undefined) {
    if (typeof comment !== 'string' || comment.trim().length === 0) {
      return errorResponse('validation_failed', 'comment cannot be empty', 400);
    }
    if (comment.length > LIMITS.comment) {
      return errorResponse('validation_failed', `comment must be ≤ ${LIMITS.comment} chars`, 400);
    }
  }

  // --- Optimistic locking check ---------------------------------------------
  const currentVersion = (current.version as number) || 1;
  const expectedVersion = typeof version === 'number' ? version : currentVersion;
  if (expectedVersion !== currentVersion) {
    return errorResponse(
      'version_conflict',
      `Ticket was modified by another user. Current version: ${currentVersion}`,
      409
    );
  }

  // --- Build update payload (only fields actually being changed) ------------
  const updatePayload: Record<string, unknown> = {
    version: currentVersion + 1,
    updated_at: new Date().toISOString(),
  };

  if (status !== undefined) updatePayload.status = status;
  if (priority !== undefined) updatePayload.priority = priority;
  if (assignedTo !== undefined) updatePayload.assigned_to = assignedTo;
  if (assigned_to !== undefined) updatePayload.assigned_to = assigned_to;
  if (description !== undefined) updatePayload.description = description;
  if (subject !== undefined) updatePayload.subject = subject;
  if (category !== undefined) updatePayload.category = category;
  if (productService !== undefined) updatePayload.product_service = productService;
  if (product_service !== undefined) updatePayload.product_service = product_service;
  if (status === 'resolved' && current.status !== 'resolved') {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tickets')
    .update(updatePayload)
    .eq('id', id)
    .eq('version', currentVersion)
    .select()
    .single();

  if (error) {
    if (error.code === '23505' || error.message?.includes('version')) {
      return errorResponse(
        'version_conflict',
        'Ticket was modified by another user. Please reload and try again.',
        409
      );
    }
    console.error('[tickets/PATCH] update failed:', error.message);
    return errorResponse('internal_error', error.message, 500);
  }

  // --- Audit log (best-effort) ----------------------------------------------
  const auditActions: { action: string; old_value: unknown; new_value: unknown }[] = [];
  if (status !== undefined && status !== current.status) {
    auditActions.push({
      action: 'status_changed',
      old_value: JSON.stringify({ status: current.status }),
      new_value: JSON.stringify({ status }),
    });
  }
  if (priority !== undefined && priority !== current.priority) {
    auditActions.push({
      action: 'priority_changed',
      old_value: JSON.stringify({ priority: current.priority }),
      new_value: JSON.stringify({ priority }),
    });
  }
  if (assignedTo !== undefined && assignedTo !== current.assigned_to) {
    auditActions.push({
      action: 'assigned',
      old_value: JSON.stringify({ assigned_to: current.assigned_to }),
      new_value: JSON.stringify({ assigned_to: assignedTo }),
    });
  }
  if (assigned_to !== undefined && assigned_to !== current.assigned_to) {
    auditActions.push({
      action: 'assigned',
      old_value: JSON.stringify({ assigned_to: current.assigned_to }),
      new_value: JSON.stringify({ assigned_to: assigned_to }),
    });
  }
  if (description !== undefined && description !== current.description) {
    auditActions.push({
      action: 'description_updated',
      old_value: null,
      new_value: null,
    });
  }

  for (const a of auditActions) {
    const { error: auditErr } = await supabase.from('ticket_audit_log').insert({
      ticket_id: id,
      action: a.action,
      old_value: a.old_value as string | null,
      new_value: a.new_value as string | null,
      performed_by: user.id,
    });
    if (auditErr) {
      console.warn('[tickets/PATCH] audit_log insert failed:', auditErr.message);
    }
  }

  // --- Optional inline comment (treated as a comment, not a ticket field) ----
  let insertedComment = null;
  if (comment !== undefined) {
    const internalFlag = isAdmin && (isInternal === true || is_internal === true);
    const { data: cmt, error: cmtErr } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: id,
        user_id: user.id,
        content: comment,
        is_internal: internalFlag,
      })
      .select()
      .single();
    if (cmtErr) {
      console.warn('[tickets/PATCH] comment insert failed:', cmtErr.message);
    } else {
      insertedComment = cmt;
    }

    // Notify ticket owner (only if commenter is not the owner, and comment is not internal)
    if (!internalFlag && current.user_id !== user.id) {
      const { data: owner } = await supabase
        .from('users')
        .select('email')
        .eq('id', current.user_id)
        .single();
      if (owner?.email) {
        const authorLabel = user.email || 'Support Team';
        sendTicketReplyEmail(
          owner.email,
          current.ticket_number,
          current.subject,
          authorLabel,
          comment
        ).catch((err) => {
          console.warn('[tickets/PATCH] sendTicketReplyEmail failed:', String(err));
        });
      }
    }
  }

  // --- Status change email (non-blocking, no rollback) ----------------------
  if (status && status !== current.status) {
    const { data: owner } = await supabase
      .from('users')
      .select('email')
      .eq('id', current.user_id)
      .single();
    if (owner?.email) {
      sendTicketStatusEmail(
        owner.email,
        current.ticket_number,
        current.status,
        status
      ).catch((err) => {
        console.warn('[tickets/PATCH] sendTicketStatusEmail failed:', String(err));
      });
    }
  }

  return NextResponse.json({
    success: true,
    data,
    ...(insertedComment ? { comment: insertedComment } : {}),
  });
}

// --- POST: assign ticket (admin only — kept for backward compatibility) ------
// Note: callers should prefer PATCH with `assignedTo` for new code.

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse('unauthorized', 'Unauthorized', 401);
  }

  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';
  if (!isAdmin) {
    return errorResponse('forbidden', 'Forbidden', 403);
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('validation_failed', 'Invalid JSON body', 400);
  }

  if (!body.assignedTo) {
    return errorResponse('validation_failed', 'assignedTo is required', 400);
  }

  const { data: current } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (!current) {
    return errorResponse('not_found', 'Ticket not found', 404);
  }

  const currentVersion = (current.version as number) || 1;
  const { data, error } = await supabase
    .from('tickets')
    .update({
      assigned_to: body.assignedTo,
      status: current.status === 'open' ? 'in_progress' : current.status,
      version: currentVersion + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('version', currentVersion)
    .select()
    .single();

  if (error) {
    console.error('[tickets/POST-assign] update failed:', error.message);
    return errorResponse('internal_error', error.message, 500);
  }

  const { error: auditErr } = await supabase.from('ticket_audit_log').insert({
    ticket_id: id,
    action: 'assigned',
    old_value: JSON.stringify({ assigned_to: current.assigned_to }),
    new_value: JSON.stringify({ assigned_to: body.assignedTo }),
    performed_by: user.id,
  });
  if (auditErr) {
    console.warn('[tickets/POST-assign] audit_log insert failed:', auditErr.message);
  }

  return NextResponse.json({ success: true, data });
}
