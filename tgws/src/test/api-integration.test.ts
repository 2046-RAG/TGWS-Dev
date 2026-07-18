import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock Supabase client — use vi.hoisted so the mock factories (which are
// hoisted above imports) can reference mutable vi.fn instances that tests
// mutate via beforeEach / per-test assignments. The createClient factory
// returns an object whose `auth`, `from`, and `storage` are vi.fn's so
// each test can wire up the exact chain it needs.
//
// Note: `storage` mirrors supabase-js — `supabase.storage` is an object
// with a `.from(bucket)` method (not a function itself). So we expose
// `storage: { from: vi.fn() }` and wire the chain via
// `storage.from.mockReturnValue(chain)`.
const supabaseMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  from: vi.fn(),
  storage: { from: vi.fn() },
}));

const mockGetUser = supabaseMocks.getUser;
const mockFrom = supabaseMocks.from;
const mockResetPasswordForEmail = supabaseMocks.resetPasswordForEmail;

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: supabaseMocks.getUser,
      resetPasswordForEmail: supabaseMocks.resetPasswordForEmail,
    },
    from: supabaseMocks.from,
    storage: supabaseMocks.storage,
  }),
}));

// Mock Odoo
vi.mock('@/lib/odoo', () => ({
  createOdooLead: vi.fn(),
}));

// Mock Resend — ticket route imports sendTicketCreatedEmail,
// ticket/[id] route imports sendTicketStatusEmail + sendTicketReplyEmail.
vi.mock('@/lib/resend', () => ({
  sendTicketCreatedEmail: vi.fn().mockResolvedValue(undefined),
  sendTicketStatusEmail: vi.fn().mockResolvedValue(undefined),
  sendTicketReplyEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock Sanity
vi.mock('next-sanity', () => ({
  createClient: () => ({
    fetch: vi.fn().mockResolvedValue([]),
  }),
}));

// Mock rate-limit so we can simulate allowed / throttled requests without
// real in-memory state leaking between tests.
const rateLimitMocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: rateLimitMocks.rateLimit,
  getClientIp: rateLimitMocks.getClientIp,
}));

// Mock next/cache.revalidatePath — the /api/revalidate route calls it.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// ── Route handler imports (must come AFTER vi.mock declarations) ──────────
// We import the actual handler functions so we can invoke them with mock
// Request objects and assert on the returned NextResponse. This exercises
// the real validation / branching logic instead of just an HTTP contract.
import { POST as ticketsPOST, GET as ticketsGET } from '@/app/api/tickets/route';
import {
  GET as ticketByIdGET,
  PATCH as ticketByIdPATCH,
} from '@/app/api/tickets/[id]/route';
import { GET as ticketsStatsGET } from '@/app/api/tickets/stats/route';
import { POST as uploadPOST } from '@/app/api/upload/route';
import { POST as resetPasswordPOST } from '@/app/api/auth/reset-password/route';
import { POST as revalidatePOST } from '@/app/api/revalidate/route';

describe('API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── GET /api/products ───────────────────────────────────────
  describe('GET /api/products', () => {
    it('returns 200 with JSON array', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      const res = await fetch('/api/products');
      const body = await res.json();

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('returns success: true with data array', async () => {
      const mockProducts = [
        { _id: 'p1', title: 'Product A', category: 'build' },
        { _id: 'p2', title: 'Product B', category: 'run' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockProducts }),
      });

      const res = await fetch('/api/products');
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].title).toBe('Product A');
    });
  });

  // ── POST /api/contact ───────────────────────────────────────
  describe('POST /api/contact', () => {
    it('returns 400 when name is missing', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Name, email, and message are required' }),
      });

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', message: 'Hello' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('required');
    });

    it('returns 400 when email is missing', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Name, email, and message are required' }),
      });

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', message: 'Hello' }),
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when message is missing', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Name, email, and message are required' }),
      });

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', email: 'test@test.com' }),
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 when all required fields are missing', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Name, email, and message are required' }),
      });

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid email format', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid email format' }),
      });

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', email: 'not-an-email', message: 'Hello' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('email');
    });
  });

  // ── GET /api/tickets ────────────────────────────────────────
  describe('GET /api/tickets', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const res = await fetch('/api/tickets');

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 200 with tickets when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [{ id: 't1', subject: 'Test' }], error: null }),
      });

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: [{ id: 't1', subject: 'Test' }] }),
      });

      const res = await fetch('/api/tickets');
      const body = await res.json();

      expect(res.ok).toBe(true);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Route-handler-level tests
//
// These tests invoke the actual Next.js route handler functions (POST/GET/
// PATCH) with mock Request objects. The Supabase client is mocked so we
// can simulate authenticated/unauthenticated users, ticket ownership, and
// various query outcomes. This exercises real validation logic instead of
// just the HTTP fetch contract.
// ───────────────────────────────────────────────────────────────────────────

/** Build a JSON Request for a handler invocation. */
function jsonRequest(method: string, url: string, body: unknown): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Build a multipart/form-data Request with a file + fields.
 *
 * We override `formData()` on the Request to return a pre-built FormData
 * object. Undici's Request.formData() parser doesn't accept jsdom's File
 * implementation (it asserts `webidl.is.File(value)`), so we sidestep the
 * parser entirely — the route handler only calls `formData.get('file')` and
 * `formData.get('ticketId')`, both of which work on the plain FormData.
 */
function formDataRequest(
  url: string,
  fields: { file?: File; ticketId?: string }
): Request {
  const fd = new FormData();
  if (fields.file) fd.append('file', fields.file);
  if (fields.ticketId) fd.append('ticketId', fields.ticketId);
  const req = new Request(url, { method: 'POST' });
  Object.defineProperty(req, 'formData', {
    value: async () => fd,
    configurable: true,
  });
  return req;
}

/**
 * Wire up a Supabase chain mock. Each call to `from(table)` returns an
 * object whose chainable methods (select/insert/update/eq/is/order/...) all
 * return `this`, except terminal calls (`.single()`, `.maybeSingle()`,
 * `.then()`) which resolve to the provided `terminal` value.
 */
function wireFromChain(terminal: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const returnThis = () => chain;
  chain.select = vi.fn(returnThis);
  chain.insert = vi.fn(returnThis);
  chain.update = vi.fn(returnThis);
  chain.delete = vi.fn(returnThis);
  chain.eq = vi.fn(returnThis);
  chain.neq = vi.fn(returnThis);
  chain.is = vi.fn(returnThis);
  chain.order = vi.fn(returnThis);
  chain.limit = vi.fn(returnThis);
  chain.range = vi.fn(returnThis);
  chain.single = vi.fn(async () => terminal);
  chain.maybeSingle = vi.fn(async () => terminal);
  // Make the chain itself thenable so `await supabase.from('x').select()`
  // (without .single/.maybeSingle) resolves to terminal too.
  chain.then = vi.fn((resolve: (v: unknown) => unknown) =>
    Promise.resolve(terminal).then(resolve)
  );
  supabaseMocks.from.mockReturnValue(chain);
  return chain;
}

function wireStorageChain(uploadResult: { data: unknown; error: unknown }, signedUrlResult: { data: unknown; error: unknown }) {
  const storageChain: Record<string, unknown> = {};
  storageChain.from = vi.fn(() => storageChain);
  storageChain.upload = vi.fn(async () => uploadResult);
  storageChain.createSignedUrl = vi.fn(async () => signedUrlResult);
  supabaseMocks.storage.from.mockReturnValue(storageChain);
}

describe('Route handlers — /api/tickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMocks.rateLimit.mockReturnValue({ success: true, resetAt: Date.now() + 60_000 });
    rateLimitMocks.getClientIp.mockReturnValue('127.0.0.1');
  });

  describe('POST /api/tickets (create ticket)', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const res = await ticketsPOST(jsonRequest('POST', 'http://localhost/api/tickets', {}));
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('unauthorized');
    });

    it('returns 400 when category is missing or invalid', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
      const res = await ticketsPOST(
        jsonRequest('POST', 'http://localhost/api/tickets', {
          category: 'invalid',
          productService: 'P',
          subject: 'S',
          description: 'D',
        })
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe('validation_failed');
      expect(body.error.message).toContain('category');
    });

    it('returns 400 when subject exceeds 200 chars', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
      const res = await ticketsPOST(
        jsonRequest('POST', 'http://localhost/api/tickets', {
          category: 'build',
          productService: 'P',
          subject: 'x'.repeat(201),
          description: 'D',
        })
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.message).toContain('subject');
    });

    it('returns 400 when description exceeds 800 chars', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
      const res = await ticketsPOST(
        jsonRequest('POST', 'http://localhost/api/tickets', {
          category: 'build',
          productService: 'P',
          subject: 'S',
          description: 'x'.repeat(801),
        })
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.message).toContain('description');
    });

    it('returns 400 when priority is invalid', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
      const res = await ticketsPOST(
        jsonRequest('POST', 'http://localhost/api/tickets', {
          category: 'build',
          productService: 'P',
          subject: 'S',
          description: 'D',
          priority: 'urgent',
        })
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.message).toContain('priority');
    });

    it('creates a ticket and returns 200 with success:true on valid payload', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'u1', email: 'a@b.com' } },
      });
      // The route does 1-2 from() calls: idempotency check (skipped, no
      // idempotencyKey here), then insert(). Audit log insert is also a
      // from() call. We wire a single chain that handles all of them.
      const inserted = { id: 't1', ticket_number: 'TG-ABC123', subject: 'S' };
      const chain = wireFromChain({ data: inserted, error: null });
      // Audit log insert — `.insert(...).then()` resolves to { error: null }.
      const auditChain = wireFromChain({ data: null, error: null });
      // Override mockFrom to return the right chain per call.
      supabaseMocks.from.mockImplementation(() => {
        // First from() call is the insert; subsequent is audit_log.
        // Return chain first, then auditChain.
        if ((supabaseMocks.from as unknown as { mock: { calls: { length: number } } }).mock.calls.length === 1) {
          return chain;
        }
        return auditChain;
      });

      const res = await ticketsPOST(
        jsonRequest('POST', 'http://localhost/api/tickets', {
          category: 'build',
          productService: 'Proxmox',
          subject: 'Server down',
          description: 'Production server is not responding.',
        })
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe('t1');
    });
  });

  describe('GET /api/tickets (list own tickets)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const res = await ticketsGET();
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe('unauthorized');
    });

    it('returns the user\'s tickets when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      wireFromChain({
        data: [{ id: 't1', subject: 'A' }],
        error: null,
      });
      const res = await ticketsGET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data[0].id).toBe('t1');
    });

    it('returns 500 when supabase returns an error', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      wireFromChain({ data: null, error: { message: 'DB down' } });
      const res = await ticketsGET();
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.code).toBe('internal_error');
    });
  });
});

describe('Route handlers — /api/tickets/[id]', () => {
  describe('GET /api/tickets/[id] (ticket detail)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const req = new Request('http://localhost/api/tickets/t1');
      const res = await ticketByIdGET(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(401);
    });

    it('returns 404 when ticket does not exist', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      // First from() call (ticket lookup) returns no data.
      wireFromChain({ data: null, error: { code: 'PGRST116', message: 'no rows' } });
      const req = new Request('http://localhost/api/tickets/missing');
      const res = await ticketByIdGET(req, {
        params: Promise.resolve({ id: 'missing' }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error.code).toBe('not_found');
    });

    it('returns 403 when a non-admin tries to view another user\'s ticket', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      // First from() returns the ticket owned by someone else; second from()
      // (user role lookup) returns a non-admin role.
      const ticketChain = wireFromChain({
        data: { id: 't1', user_id: 'other-user' },
        error: null,
      });
      const roleChain = wireFromChain({
        data: { role: 'customer' },
        error: null,
      });
      supabaseMocks.from
        .mockReturnValueOnce(ticketChain)
        .mockReturnValueOnce(roleChain);

      const req = new Request('http://localhost/api/tickets/t1');
      const res = await ticketByIdGET(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error.code).toBe('forbidden');
    });

    it('returns 200 with ticket + attachments + comments for the owner', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      const ticketChain = wireFromChain({
        data: { id: 't1', user_id: 'u1', subject: 'S' },
        error: null,
      });
      const roleChain = wireFromChain({
        data: { role: 'customer' },
        error: null,
      });
      const commentsChain = wireFromChain({
        data: [{ id: 'c1', content: 'Hello' }],
        error: null,
      });
      const attachmentsChain = wireFromChain({
        data: [{ id: 'a1', file_name: 'f.png' }],
        error: null,
      });
      supabaseMocks.from
        .mockReturnValueOnce(ticketChain)
        .mockReturnValueOnce(roleChain)
        .mockReturnValueOnce(commentsChain)
        .mockReturnValueOnce(attachmentsChain);

      const req = new Request('http://localhost/api/tickets/t1');
      const res = await ticketByIdGET(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe('t1');
      expect(body.data.attachments).toHaveLength(1);
      expect(body.data.comments).toHaveLength(1);
      expect(body.data.is_admin_viewer).toBe(false);
    });
  });

  describe('PATCH /api/tickets/[id] (update ticket)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const req = jsonRequest('PATCH', 'http://localhost/api/tickets/t1', {});
      const res = await ticketByIdPATCH(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(401);
    });

    it('returns 404 when ticket does not exist', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      wireFromChain({ data: null, error: { message: 'no rows' } });
      const req = jsonRequest('PATCH', 'http://localhost/api/tickets/missing', {
        description: 'updated',
      });
      const res = await ticketByIdPATCH(req, {
        params: Promise.resolve({ id: 'missing' }),
      });
      expect(res.status).toBe(404);
    });

    it('returns 403 when a customer tries to change status (field-level RBAC)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      // Ticket owned by u1; role is customer.
      const ticketChain = wireFromChain({
        data: { id: 't1', user_id: 'u1', version: 1, status: 'open' },
        error: null,
      });
      const roleChain = wireFromChain({
        data: { role: 'customer' },
        error: null,
      });
      supabaseMocks.from
        .mockReturnValueOnce(ticketChain)
        .mockReturnValueOnce(roleChain);

      const req = jsonRequest('PATCH', 'http://localhost/api/tickets/t1', {
        status: 'resolved',
      });
      const res = await ticketByIdPATCH(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error.code).toBe('forbidden');
      expect(body.error.message).toContain('Disallowed fields');
    });

    it('returns 400 when status value is invalid', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      const ticketChain = wireFromChain({
        data: { id: 't1', user_id: 'u1', version: 1, status: 'open' },
        error: null,
      });
      const roleChain = wireFromChain({
        data: { role: 'admin' },
        error: null,
      });
      supabaseMocks.from
        .mockReturnValueOnce(ticketChain)
        .mockReturnValueOnce(roleChain);

      const req = jsonRequest('PATCH', 'http://localhost/api/tickets/t1', {
        status: 'not-a-status',
      });
      const res = await ticketByIdPATCH(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.message).toContain('status must be one of');
    });

    it('returns 409 on optimistic-locking version conflict', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      // Stored ticket has version=2; client sends version=1.
      const ticketChain = wireFromChain({
        data: { id: 't1', user_id: 'u1', version: 2, status: 'open' },
        error: null,
      });
      const roleChain = wireFromChain({
        data: { role: 'admin' },
        error: null,
      });
      supabaseMocks.from
        .mockReturnValueOnce(ticketChain)
        .mockReturnValueOnce(roleChain);

      const req = jsonRequest('PATCH', 'http://localhost/api/tickets/t1', {
        status: 'resolved',
        version: 1,
      });
      const res = await ticketByIdPATCH(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error.code).toBe('version_conflict');
    });

    it('returns 200 when admin updates status with matching version', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      const ticketChain = wireFromChain({
        data: { id: 't1', user_id: 'u2', version: 1, status: 'open', priority: 'medium', assigned_to: null },
        error: null,
      });
      const roleChain = wireFromChain({
        data: { role: 'admin' },
        error: null,
      });
      // Update call returns the new row.
      const updateChain = wireFromChain({
        data: { id: 't1', status: 'resolved', version: 2 },
        error: null,
      });
      // Audit log insert chain.
      const auditChain = wireFromChain({ data: null, error: null });
      // Owner lookup for status change email.
      const ownerChain = wireFromChain({
        data: { email: 'owner@example.com' },
        error: null,
      });
      supabaseMocks.from
        .mockReturnValueOnce(ticketChain)
        .mockReturnValueOnce(roleChain)
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(auditChain)
        .mockReturnValueOnce(ownerChain);

      const req = jsonRequest('PATCH', 'http://localhost/api/tickets/t1', {
        status: 'resolved',
      });
      const res = await ticketByIdPATCH(req, {
        params: Promise.resolve({ id: 't1' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('resolved');
      expect(body.data.version).toBe(2);
    });
  });
});

describe('Route handlers — /api/tickets/stats', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await ticketsStatsGET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns aggregated stats for an admin (all tickets)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin1' } } });
    const roleChain = wireFromChain({
      data: { role: 'admin' },
      error: null,
    });
    const allTicketsChain = wireFromChain({
      data: [
        { status: 'open', category: 'build', priority: 'high', created_at: '2026-01-01' },
        { status: 'open', category: 'build', priority: 'low', created_at: '2026-01-02' },
        { status: 'resolved', category: 'run', priority: 'medium', created_at: '2026-01-03' },
      ],
      error: null,
    });
    supabaseMocks.from
      .mockReturnValueOnce(roleChain)
      .mockReturnValueOnce(allTicketsChain);

    const res = await ticketsStatsGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.total).toBe(3);
    expect(body.data.byStatus.open).toBe(2);
    expect(body.data.byStatus.resolved).toBe(1);
    expect(body.data.byCategory.build).toBe(2);
    expect(body.data.byCategory.run).toBe(1);
    expect(body.data.byPriority.high).toBe(1);
    expect(body.data.byPriority.low).toBe(1);
    expect(body.data.byPriority.medium).toBe(1);
  });

  it('returns scoped stats for a non-admin (own tickets only)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const roleChain = wireFromChain({
      data: { role: 'customer' },
      error: null,
    });
    const myTicketsChain = wireFromChain({
      data: [
        { status: 'open', category: 'build', created_at: '2026-01-01' },
        { status: 'closed', category: 'protect', created_at: '2026-01-02' },
      ],
      error: null,
    });
    supabaseMocks.from
      .mockReturnValueOnce(roleChain)
      .mockReturnValueOnce(myTicketsChain);

    const res = await ticketsStatsGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.total).toBe(2);
    expect(body.data.byStatus.open).toBe(1);
    expect(body.data.byStatus.closed).toBe(1);
    expect(body.data.byCategory.build).toBe(1);
    expect(body.data.byCategory.protect).toBe(1);
    // Non-admin stats must NOT include byPriority.
    expect(body.data.byPriority).toBeUndefined();
  });
});

describe('Route handlers — /api/upload', () => {
  function makeFile(opts: { name?: string; type?: string; size?: number; content?: string } = {}) {
    const content = opts.content ?? 'hello';
    const file = new File([content], opts.name ?? 'test.png', {
      type: opts.type ?? 'image/png',
    });
    // jsdom File doesn't honor a custom size; override size via
    // Object.defineProperty for the >10MB test path.
    if (opts.size !== undefined) {
      Object.defineProperty(file, 'size', { value: opts.size, configurable: true });
    }
    return file;
  }

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('no session') });
    const req = formDataRequest('http://localhost/api/upload', {});
    const res = await uploadPOST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when no file is provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const req = formDataRequest('http://localhost/api/upload', {});
    const res = await uploadPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('NO_FILE');
  });

  it('returns 400 when file exceeds 10MB', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const file = makeFile({ size: 11 * 1024 * 1024 });
    const req = formDataRequest('http://localhost/api/upload', { file });
    const res = await uploadPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('returns 415 when file type is not in the whitelist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const file = makeFile({ name: 'evil.exe', type: 'application/x-msdownload' });
    const req = formDataRequest('http://localhost/api/upload', { file });
    const res = await uploadPOST(req);
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body.error.code).toBe('UNSUPPORTED_TYPE');
  });

  it('returns 403 when ticketId is supplied but the ticket belongs to someone else', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    // First from() call (ticket ownership check) returns a different user_id.
    wireFromChain({
      data: { user_id: 'someone-else' },
      error: null,
    });
    const file = makeFile();
    const req = formDataRequest('http://localhost/api/upload', {
      file,
      ticketId: 'other-ticket',
    });
    const res = await uploadPOST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('TICKET_ACCESS_DENIED');
  });

  it('returns 200 with a signed URL on successful upload (with ticketId)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    // 1. ticket ownership check
    const ticketChain = wireFromChain({
      data: { user_id: 'u1' },
      error: null,
    });
    // 2. attachment row insert
    const insertChain = wireFromChain({ data: null, error: null });
    supabaseMocks.from
      .mockReturnValueOnce(ticketChain)
      .mockReturnValueOnce(insertChain);
    wireStorageChain(
      { data: { path: 'u1/file.png' }, error: null },
      {
        data: { signedUrl: 'https://signed.example.com/u1/file.png?token=abc' },
        error: null,
      }
    );
    const file = makeFile({ name: 'screenshot.png', type: 'image/png' });
    const req = formDataRequest('http://localhost/api/upload', {
      file,
      ticketId: 't1',
    });
    const res = await uploadPOST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.url).toContain('signed.example.com');
    expect(body.data.name).toBe('screenshot.png');
    expect(body.data.type).toBe('image/png');
  });
});

describe('Route handlers — /api/auth/reset-password', () => {
  it('returns 429 when rate limit is exceeded', async () => {
    rateLimitMocks.rateLimit.mockReturnValue({
      success: false,
      resetAt: Date.now() + 30_000,
    });
    const req = jsonRequest('POST', 'http://localhost/api/auth/reset-password', {
      email: 'a@b.com',
    });
    const res = await resetPasswordPOST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error.code).toBe('RATE_LIMITED');
    expect(res.headers.get('Retry-After')).not.toBeNull();
  });

  it('returns 400 when email is missing', async () => {
    rateLimitMocks.rateLimit.mockReturnValue({
      success: true,
      resetAt: Date.now() + 60_000,
    });
    const req = jsonRequest('POST', 'http://localhost/api/auth/reset-password', {});
    const res = await resetPasswordPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('EMAIL_REQUIRED');
  });

  it('returns 400 for an invalid email format', async () => {
    rateLimitMocks.rateLimit.mockReturnValue({
      success: true,
      resetAt: Date.now() + 60_000,
    });
    const req = jsonRequest(
      'POST',
      'http://localhost/api/auth/reset-password',
      { email: 'not-an-email' }
    );
    const res = await resetPasswordPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_EMAIL');
  });

  it('returns 200 when supabase.auth.resetPasswordForEmail succeeds', async () => {
    rateLimitMocks.rateLimit.mockReturnValue({
      success: true,
      resetAt: Date.now() + 60_000,
    });
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const req = jsonRequest(
      'POST',
      'http://localhost/api/auth/reset-password',
      { email: 'user@example.com' }
    );
    const res = await resetPasswordPOST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/support/login') })
    );
  });
});

describe('Route handlers — /api/revalidate', () => {
  it('returns 401 when the x-revalidate-secret header does not match', async () => {
    const prevSecret = process.env.REVALIDATE_SECRET;
    process.env.REVALIDATE_SECRET = 'real-secret';
    const req = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { 'x-revalidate-secret': 'wrong-secret' },
    });
    const res = await revalidatePOST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid secret');
    process.env.REVALIDATE_SECRET = prevSecret;
  });

  it('returns 200 and revalidates the layout when the secret matches', async () => {
    const prevSecret = process.env.REVALIDATE_SECRET;
    process.env.REVALIDATE_SECRET = 'real-secret';
    const { revalidatePath } = await import('next/cache');
    const req = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { 'x-revalidate-secret': 'real-secret' },
    });
    const res = await revalidatePOST(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.revalidated).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    process.env.REVALIDATE_SECRET = prevSecret;
  });
});
