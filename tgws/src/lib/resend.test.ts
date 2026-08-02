import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTicketCreatedEmail, sendTicketStatusEmail, sendPasswordResetEmail, sendTicketReplyEmail } from './resend';

const mockSend = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

vi.mock('@/lib/errors', () => ({ logServiceError: vi.fn() }));

describe('resend emails', () => {
  beforeEach(() => {
    mockSend.mockReset();
    process.env.RESEND_API_KEY = 're_test_key';
    mockSend.mockResolvedValue({ data: { id: 'm1' }, error: null });
  });
  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it('sends ticket created email with escaped content', async () => {
    const result = await sendTicketCreatedEmail('u@x.com', 'TG-001', '<b>VM down</b>', 'run');
    expect(result.success).toBe(true);
    expect(result.id).toBe('m1');
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toBe('u@x.com');
    expect(call.subject).toBe('Ticket TG-001 Created');
    // HTML-escaped subject — no raw <b>
    expect(call.html).toContain('&lt;b&gt;VM down&lt;/b&gt;');
    expect(call.html).not.toContain('<b>VM down</b>');
    expect(call.html).toContain('Run');
  });

  it('sends status change email with status labels', async () => {
    await sendTicketStatusEmail('u@x.com', 'TG-001', 'open', 'resolved');
    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toBe('Ticket TG-001 Status Updated: Resolved');
    expect(call.html).toContain('Previous Status:');
    expect(call.html).toContain('Open');
    expect(call.html).toContain('Resolved');
  });

  it('sends password reset email with reset URL', async () => {
    await sendPasswordResetEmail('u@x.com', 'https://www.techguru-it.asia/reset?t=abc');
    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toBe('Reset Your Password');
    expect(call.html).toContain('https://www.techguru-it.asia/reset?t=abc');
  });

  it('sends reply email escaping author and content', async () => {
    await sendTicketReplyEmail('u@x.com', 'TG-001', 'Issue', '<img src=x onerror=alert(1)>', 'Script <b>bold</b> here');
    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toBe('New Reply on Ticket TG-001');
    expect(call.html).toContain('&lt;img');
    expect(call.html).not.toContain('<img src=x');
    expect(call.html).toContain('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('returns failure when Resend not configured', async () => {
    delete process.env.RESEND_API_KEY;
    // reset module cache so the resend singleton is rebuilt without a key
    vi.resetModules();
    const fresh = await import('./resend');
    const result = await fresh.sendTicketCreatedEmail('u@x.com', 'TG-001', 's', 'run');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('returns failure when Resend returns an error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'rate limited' } });
    const result = await sendTicketCreatedEmail('u@x.com', 'TG-001', 's', 'run');
    expect(result.success).toBe(false);
    expect(result.error).toBe('rate limited');
  });

  it('returns failure when send throws', async () => {
    mockSend.mockRejectedValue(new Error('network down'));
    const result = await sendTicketCreatedEmail('u@x.com', 'TG-001', 's', 'run');
    expect(result.success).toBe(false);
  });
});
