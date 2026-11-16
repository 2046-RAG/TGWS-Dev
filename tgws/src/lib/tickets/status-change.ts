/**
 * Single source of truth for ticket field/status mutations (P1-1 / G4 / G5 / G13).
 *
 * Before this module the single-ticket PATCH and the bulk PATCH each had their
 * own update statement, and they disagreed on three things:
 *   - `resolved_at` was only written by the single path
 *   - the customer notification email was only sent by the single path
 *   - the optimistic `version` guard was only used by the single path
 *
 * Both routes now call `applyStatusChange()`, so a status change behaves the
 * same no matter which button the agent pressed.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendTicketStatusEmail } from '@/lib/resend';
import { logServiceError } from '@/lib/errors';

export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === 'string' && (TICKET_STATUSES as readonly string[]).includes(value);
}

export function isTicketPriority(value: unknown): value is TicketPriority {
  return typeof value === 'string' && (TICKET_PRIORITIES as readonly string[]).includes(value);
}

type TicketRow = Record<string, unknown> & {
  id: string;
  ticket_number: string;
  user_id: string | null;
  status: string;
  version: number | null;
};

export type StatusChangeOutcome =
  | { ok: true; data: TicketRow; changed: boolean }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'conflict' }
  | { ok: false; reason: 'error'; error: unknown };

export interface StatusChangeParams {
  ticketId: string;
  /** Omit to keep the current status and only apply `extraPatch`. */
  nextStatus?: TicketStatus;
  /** auth.uid() of the caller; recorded as `performed_by` in the audit log. */
  performedBy: string;
  /**
   * Additional columns committed in the same UPDATE (priority / assigned_to).
   * Kept in one statement so saving the admin detail form does not bump
   * `version` twice and split a single user action across two audit rows.
   */
  extraPatch?: Record<string, unknown>;
  /** Set false for silent migrations; defaults to notifying the owner. */
  notify?: boolean;
}

const AUDITED_EXTRA_FIELDS = ['priority', 'assigned_to'] as const;

export async function applyStatusChange(
  supabase: SupabaseClient,
  params: StatusChangeParams,
): Promise<StatusChangeOutcome> {
  const { ticketId, nextStatus, performedBy, extraPatch, notify = true } = params;

  const { data: currentRaw, error: fetchError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !currentRaw) {
    return { ok: false, reason: 'not_found' };
  }
  const current = currentRaw as TicketRow;
  const targetStatus = nextStatus ?? (current.status as TicketStatus);

  const statusChanged = current.status !== targetStatus;

  const extraChanges: Record<string, unknown> = {};
  for (const key of AUDITED_EXTRA_FIELDS) {
    const next = extraPatch?.[key];
    if (next !== undefined && next !== current[key]) {
      extraChanges[key] = next;
    }
  }
  const hasExtraChanges = Object.keys(extraChanges).length > 0;

  // Re-applying the same values is a no-op: no version bump, no audit entry,
  // no email. This keeps bulk operations from spamming customers.
  if (!statusChanged && !hasExtraChanges) {
    return { ok: true, data: current, changed: false };
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    ...extraChanges,
    status: targetStatus,
    version: (current.version ?? 0) + 1,
    updated_at: now,
  };

  if (statusChanged) {
    // G5: leaving `resolved` must clear the timestamp, otherwise a reopened
    // ticket keeps a stale resolution time and pollutes SLA statistics.
    patch.resolved_at = targetStatus === 'resolved' ? now : null;
  }

  const { data: updatedRaw, error: updateError } = await supabase
    .from('tickets')
    .update(patch)
    .eq('id', ticketId)
    .eq('version', current.version ?? 0)
    .select()
    .single();

  if (updateError || !updatedRaw) {
    logServiceError({ service: 'Tickets', operation: 'applyStatusChange', error: updateError });
    // PGRST116 = ".single() matched zero rows", which is exactly what a lost
    // optimistic lock looks like. Anything else is a real server error and
    // must not be reported to the client as a retryable conflict.
    const code = (updateError as { code?: string } | null)?.code;
    if (code === 'PGRST116') {
      return { ok: false, reason: 'conflict' };
    }
    return { ok: false, reason: 'error', error: updateError };
  }

  const changes: Record<string, unknown> = { ...extraChanges };
  const oldValues: Record<string, unknown> = {};
  if (statusChanged) {
    changes.status = targetStatus;
    oldValues.status = current.status;
  }
  for (const key of Object.keys(extraChanges)) {
    oldValues[key] = current[key];
  }

  const { error: auditError } = await supabase.from('ticket_audit_log').insert({
    ticket_id: ticketId,
    action: statusChanged ? 'status_changed' : 'updated',
    old_value: JSON.stringify(oldValues),
    new_value: JSON.stringify(changes),
    performed_by: performedBy,
  });
  if (auditError) {
    logServiceError({ service: 'Tickets', operation: 'auditStatusChange', error: auditError });
  }

  if (statusChanged && notify && current.user_id) {
    // G8 sibling: reading `users.email` with the caller's session is blocked
    // by the "view own profile" policy for staff acting on a customer ticket.
    // The SECURITY DEFINER helper returns the owner email only when the
    // caller can already see that ticket.
    const { data: ownerEmail, error: emailError } = await supabase.rpc(
      'get_ticket_owner_email',
      { p_ticket_id: ticketId },
    );

    if (emailError) {
      logServiceError({ service: 'Tickets', operation: 'ownerEmailLookup', error: emailError });
    } else if (ownerEmail) {
      sendTicketStatusEmail(
        String(ownerEmail),
        current.ticket_number,
        current.status,
        targetStatus,
      ).catch((err) => {
        logServiceError({ service: 'Resend', operation: 'ticketStatusEmail', error: err });
      });
    }
  }

  return { ok: true, data: updatedRaw as TicketRow, changed: statusChanged || hasExtraChanges };
}
