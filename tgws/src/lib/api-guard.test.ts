import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, requireSameOrigin, validateFields, clientIp } from './api-guard';

function req(headers: Record<string, string> = {}) {
  return new Request('https://www.techguru-it.asia/api/test', { headers });
}

describe('api-guard', () => {
  beforeEach(() => {
    // reset module state by exhausting unique IPs — buckets prune by time
  });

  it('clientIp prefers x-forwarded-for', () => {
    expect(clientIp(req({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4');
  });

  it('allows under limit and blocks over limit', () => {
    const ip = `9.9.9.${Math.floor(Math.random() * 200)}`;
    const r1 = rateLimit(req({ 'x-forwarded-for': ip }), { name: 't-ok', limit: 2, windowMs: 60_000 });
    expect(r1).toBeNull();
    const r2 = rateLimit(req({ 'x-forwarded-for': ip }), { name: 't-ok', limit: 2, windowMs: 60_000 });
    expect(r2).toBeNull();
    const r3 = rateLimit(req({ 'x-forwarded-for': ip }), { name: 't-ok', limit: 2, windowMs: 60_000 });
    expect(r3?.status).toBe(429);
  });

  it('requireSameOrigin allows site origin and rejects foreign', () => {
    expect(requireSameOrigin(req({ origin: 'https://www.techguru-it.asia' }))).toBeNull();
    expect(requireSameOrigin(req())).toBeNull();
    const bad = requireSameOrigin(req({ origin: 'https://evil.example' }));
    expect(bad?.status).toBe(403);
  });

  it('validateFields checks required, email, max', () => {
    expect(validateFields({ name: 'a' }, { name: { required: true }, email: { required: true, type: 'email' } })).toBeTruthy();
    expect(validateFields({ email: 'not-an-email' }, { email: { required: true, type: 'email' } })).toMatch(/email/i);
    expect(validateFields({ name: 'ok', email: 'a@b.co' }, { name: { required: true, max: 10 }, email: { required: true, type: 'email' } })).toBeNull();
    expect(validateFields({ name: 'x'.repeat(20) }, { name: { max: 10 } })).toMatch(/10/);
  });
});
