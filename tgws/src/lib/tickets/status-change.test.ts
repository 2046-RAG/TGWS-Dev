import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { applyStatusChange } from './status-change';

const { mockSendEmail, mockLogError } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendTicketStatusEmail: (...args: unknown[]) => mockSendEmail(...args) as Promise<unknown>,
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

const OPEN_TICKET = {
  id: 't1',
  ticket_number: 'TG-1',
  user_id: 'u1',
  status: 'open',
  version: 1,
  priority: 'medium',
  assigned_to: null,
};

type DbOptions = {
  current?: Record<string, unknown> | null;
  updateResult?: { data: unknown; error: unknown };
  auditError?: unknown;
  ownerEmail?: string | null;
  rpcError?: unknown;
};

function makeDb(opts: DbOptions = {}) {
  const updates: Record<string, unknown>[] = [];
  const audits: Record<string, unknown>[] = [];
  const rpcCalls: string[] = [];

  const current = 'current' in opts ? opts.current : OPEN_TICKET;
  const updateResult = opts.updateResult ?? {
    data: { ...OPEN_TICKET, status: 'resolved', version: 2 },
    error: null,
  };

  const db = {
    from(table: string) {
      if (table === 'tickets') {
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                single: async () => ({
                  data: current,
                  error: current ? null : { code: 'PGRST116' },
                }),
              }),
            }),
          }),
          update: (payload: Record<string, unknown>) => {
            updates.push(payload);
            return {
              eq: () => ({
                eq: () => ({
                  select: () => ({ single: async () => updateResult }),
                }),
              }),
            };
          },
        };
      }
      if (table === 'ticket_audit_log') {
        return {
          insert: async (row: Record<string, unknown>) => {
            audits.push(row);
            return { error: opts.auditError ?? null };
          },
        };
      }
      throw new Error(`unexpected table: ${table}`);
    },
    rpc: async (fn: string) => {
      rpcCalls.push(fn);
      if (opts.rpcError) return { data: null, error: opts.rpcError };
      return { data: opts.ownerEmail === undefined ? 'owner@x.com' : opts.ownerEmail, error: null };
    },
  };

  return { db: db as unknown as SupabaseClient, updates, audits, rpcCalls };
}

describe('applyStatusChange', () => {
  beforeEach(() => {
    mockSendEmail.mockReset();
    mockLogError.mockReset();
    mockSendEmail.mockResolvedValue(undefined);
  });

  it('returns not_found when the ticket does not exist', async () => {
    const { db } = makeDb({ current: null });
    const outcome = await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'resolved',
      performedBy: 'admin1',
    });
    expect(outcome).toEqual({ ok: false, reason: 'not_found' });
  });

  it('is a no-op when the status is unchanged (no audit, no email)', async () => {
    const { db, updates, audits, rpcCalls } = makeDb({ current: { ...OPEN_TICKET, status: 'open' } });
    const outcome = await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'open',
      performedBy: 'admin1',
    });

    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.changed).toBe(false);
    expect(updates).toHaveLength(0);
    expect(audits).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sets resolved_at when moving to resolved', async () => {
    const { db, updates, audits } = makeDb();
    const outcome = await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'resolved',
      performedBy: 'admin1',
    });

    expect(outcome.ok).toBe(true);
    expect(updates[0].resolved_at).toEqual(expect.any(String));
    expect(updates[0].version).toBe(2);
    expect(audits[0].action).toBe('status_changed');
    expect(JSON.parse(String(audits[0].old_value))).toEqual({ status: 'open' });
    expect(JSON.parse(String(audits[0].new_value))).toEqual({ status: 'resolved' });
  });

  it('clears resolved_at when a resolved ticket is reopened (G5)', async () => {
    const { db, updates } = makeDb({
      current: { ...OPEN_TICKET, status: 'resolved', version: 3 },
      updateResult: { data: { ...OPEN_TICKET, status: 'open', version: 4 }, error: null },
    });

    await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'open',
      performedBy: 'admin1',
    });

    expect(updates[0]).toHaveProperty('resolved_at', null);
    expect(updates[0].version).toBe(4);
  });

  it('notifies the owner exactly once using the helper RPC', async () => {
    const { db, rpcCalls } = makeDb();
    await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'resolved',
      performedBy: 'admin1',
    });

    expect(rpcCalls).toContain('get_ticket_owner_email');
    expect(mockSendEmail).toHaveBeenCalledWith('owner@x.com', 'TG-1', 'open', 'resolved');
  });

  it('skips the email when the owner has no address', async () => {
    const { db } = makeDb({ ownerEmail: null });
    await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'resolved',
      performedBy: 'admin1',
    });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('reports a conflict when the optimistic lock is lost', async () => {
    const { db } = makeDb({
      updateResult: { data: null, error: { code: 'PGRST116', message: 'no rows' } },
    });
    const outcome = await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'closed',
      performedBy: 'admin1',
    });
    expect(outcome).toEqual({ ok: false, reason: 'conflict' });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('reports a server error for non-conflict failures', async () => {
    const { db } = makeDb({
      updateResult: { data: null, error: { code: '42501', message: 'permission denied' } },
    });
    const outcome = await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'closed',
      performedBy: 'admin1',
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe('error');
  });

  it('commits priority changes in the same update and audits them', async () => {
    const { db, updates, audits } = makeDb({
      updateResult: { data: { ...OPEN_TICKET, priority: 'critical', version: 2 }, error: null },
    });

    await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'open',
      extraPatch: { priority: 'critical' },
      performedBy: 'admin1',
    });

    expect(updates).toHaveLength(1);
    expect(updates[0].priority).toBe('critical');
    expect(updates[0].version).toBe(2);
    expect(audits[0].action).toBe('updated');
    expect(JSON.parse(String(audits[0].new_value))).toEqual({ priority: 'critical' });
  });

  it('does not bump the version when extra fields are unchanged', async () => {
    const { db, updates } = makeDb({
      current: { ...OPEN_TICKET, priority: 'high' },
    });

    const outcome = await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'open',
      extraPatch: { priority: 'high' },
      performedBy: 'admin1',
    });

    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.changed).toBe(false);
    expect(updates).toHaveLength(0);
  });

  it('keeps the update even when the audit insert fails', async () => {
    const { db } = makeDb({ auditError: { message: 'boom' } });
    const outcome = await applyStatusChange(db, {
      ticketId: 't1',
      nextStatus: 'resolved',
      performedBy: 'admin1',
    });
    expect(outcome.ok).toBe(true);
    // The audit failure is logged, never surfaced as a failed status change.
    expect(mockLogError).toHaveBeenCalled();
  });
});
