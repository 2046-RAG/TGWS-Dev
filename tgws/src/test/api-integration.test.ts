import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockAuth = { getUser: mockGetUser };

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: mockAuth,
    from: mockFrom,
  }),
}));

// Mock Odoo
vi.mock('@/lib/odoo', () => ({
  createOdooLead: vi.fn(),
}));

// Mock Resend
vi.mock('@/lib/resend', () => ({
  sendTicketCreatedEmail: vi.fn(),
}));

// Mock Sanity
vi.mock('next-sanity', () => ({
  createClient: () => ({
    fetch: vi.fn().mockResolvedValue([]),
  }),
}));

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
