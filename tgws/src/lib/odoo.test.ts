import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createOdooLead } from './odoo';

const { mockLogError, mockIsConfigured } = vi.hoisted(() => ({
  mockLogError: vi.fn(),
  mockIsConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/errors', () => ({
  logServiceError: mockLogError,
  isConfigured: mockIsConfigured,
}));

const fetchMock = vi.fn();

const lead = { name: 'Jane', email: 'j@x.com', company: 'ACME', phone: '123', description: 'Hello' };

describe('createOdooLead', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockLogError.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    process.env.ODOO_URL = 'https://odoo.example';
    process.env.ODOO_DB = 'db';
    process.env.ODOO_USERNAME = 'u';
    process.env.ODOO_PASSWORD = 'p';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ODOO_URL;
    delete process.env.ODOO_DB;
    delete process.env.ODOO_USERNAME;
    delete process.env.ODOO_PASSWORD;
  });

  it('returns failure when env vars missing', async () => {
    delete process.env.ODOO_URL;
    const result = await createOdooLead(lead);
    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('authenticates then creates the CRM lead', async () => {
    fetchMock
      .mockResolvedValueOnce({ headers: { get: () => 'session=xyz' } }) // auth
      .mockResolvedValueOnce({ json: async () => ({ id: 42 }) }); // create
    const result = await createOdooLead(lead);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 42 });
    // auth call
    expect(fetchMock.mock.calls[0][0]).toContain('/web/session/authenticate');
    // create call passes the cookie
    const createCall = fetchMock.mock.calls[1];
    expect(createCall[0]).toContain('/web/dataset/call_kw');
    expect(JSON.parse(createCall[1].body).model).toBe('crm.lead');
    expect(createCall[1].headers.Cookie).toBe('session=xyz');
  });

  it('returns failure when fetch throws', async () => {
    fetchMock.mockRejectedValue(new Error('network'));
    const result = await createOdooLead(lead);
    expect(result.success).toBe(false);
    expect(result.error).toContain('request failed');
    expect(mockLogError).toHaveBeenCalled();
  });
});
