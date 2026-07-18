import { describe, it, expect, beforeEach } from 'vitest';
import {
  rateLimit,
  getClientIp,
  __resetRateLimitStoreForTesting,
} from '../rate-limit';

beforeEach(() => {
  __resetRateLimitStoreForTesting();
});

describe('rateLimit', () => {
  describe('basic behavior', () => {
    it('allows the first request and counts down remaining', () => {
      const result = rateLimit('basic-first', 5, 60_000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('decrements remaining on each subsequent request within the window', () => {
      const key = 'basic-countdown';
      const r1 = rateLimit(key, 3, 60_000);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = rateLimit(key, 3, 60_000);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = rateLimit(key, 3, 60_000);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);
    });
  });

  describe('limit enforcement', () => {
    it('returns success=false when the limit is exceeded', () => {
      const key = 'exceed';
      for (let i = 0; i < 5; i++) {
        rateLimit(key, 5, 60_000);
      }
      const over = rateLimit(key, 5, 60_000);
      expect(over.success).toBe(false);
      expect(over.remaining).toBe(0);
    });

    it('keeps returning success=false for every request after the limit is hit', () => {
      const key = 'exceed-persist';
      const limit = 3;
      for (let i = 0; i < limit; i++) {
        rateLimit(key, limit, 60_000);
      }
      for (let i = 0; i < 10; i++) {
        const r = rateLimit(key, limit, 60_000);
        expect(r.success).toBe(false);
        expect(r.remaining).toBe(0);
      }
    });

    it('exactly `limit` requests succeed, the (limit+1)th fails', () => {
      const key = 'boundary';
      const limit = 4;
      for (let i = 0; i < limit; i++) {
        const r = rateLimit(key, limit, 60_000);
        expect(r.success).toBe(true);
      }
      const oneOver = rateLimit(key, limit, 60_000);
      expect(oneOver.success).toBe(false);
    });
  });

  describe('window reset', () => {
    it('resets the counter after the window expires', async () => {
      const key = 'reset';
      const windowMs = 20; // very short — keeps the test fast
      for (let i = 0; i < 3; i++) {
        rateLimit(key, 3, windowMs);
      }
      const blocked = rateLimit(key, 3, windowMs);
      expect(blocked.success).toBe(false);

      // Wait for the window to expire (+buffer for timer granularity).
      await new Promise((resolve) => setTimeout(resolve, windowMs + 15));

      const after = rateLimit(key, 3, windowMs);
      expect(after.success).toBe(true);
      expect(after.remaining).toBe(2);
    });

    it('resetAt is set to now + windowMs on the first request', () => {
      const before = Date.now();
      const result = rateLimit('resetat', 5, 60_000);
      const after = Date.now();
      expect(result.resetAt).toBeGreaterThanOrEqual(before + 60_000);
      expect(result.resetAt).toBeLessThanOrEqual(after + 60_000);
    });

    it('resetAt stays stable across requests within the same window', () => {
      const key = 'stable-resetat';
      const r1 = rateLimit(key, 10, 60_000);
      const r2 = rateLimit(key, 10, 60_000);
      const r3 = rateLimit(key, 10, 60_000);
      expect(r2.resetAt).toBe(r1.resetAt);
      expect(r3.resetAt).toBe(r1.resetAt);
    });
  });

  describe('key isolation', () => {
    it('different keys maintain independent counters', () => {
      const keyA = 'iso-a';
      const keyB = 'iso-b';
      const limit = 2;

      rateLimit(keyA, limit, 60_000);
      rateLimit(keyA, limit, 60_000);
      const aBlocked = rateLimit(keyA, limit, 60_000);
      expect(aBlocked.success).toBe(false);

      // keyB is untouched.
      const b1 = rateLimit(keyB, limit, 60_000);
      expect(b1.success).toBe(true);
      expect(b1.remaining).toBe(1);
    });

    it('different IPs are isolated buckets (real-world scenario)', () => {
      const ip1 = '203.0.113.1';
      const ip2 = '198.51.100.7';
      // IP1 hammers the endpoint.
      for (let i = 0; i < 5; i++) {
        rateLimit(`contact:${ip1}`, 5, 60_000);
      }
      const ip1Blocked = rateLimit(`contact:${ip1}`, 5, 60_000);
      expect(ip1Blocked.success).toBe(false);

      // IP2 should still get its full quota.
      const ip2First = rateLimit(`contact:${ip2}`, 5, 60_000);
      expect(ip2First.success).toBe(true);
      expect(ip2First.remaining).toBe(4);
    });

    it('different routes (prefixes) for the same IP are isolated', () => {
      const ip = '192.0.2.42';
      // Burn all 5 of the contact quota.
      for (let i = 0; i < 5; i++) {
        rateLimit(`contact:${ip}`, 5, 60_000);
      }
      expect(rateLimit(`contact:${ip}`, 5, 60_000).success).toBe(false);
      // Reset-password uses a different key prefix — must still work.
      const reset = rateLimit(`reset-password:${ip}`, 5, 60_000);
      expect(reset.success).toBe(true);
    });
  });

  describe('default parameters', () => {
    it('defaults to 10 req / 60s window when called with just the key', () => {
      const key = 'default';
      // First 10 must succeed.
      for (let i = 0; i < 10; i++) {
        const r = rateLimit(key);
        expect(r.success).toBe(true);
      }
      // 11th must fail (limit=10).
      const blocked = rateLimit(key);
      expect(blocked.success).toBe(false);
    });
  });

  describe('cleanup behavior', () => {
    it('does not throw when called with many unique keys', () => {
      // Exercises the cleanup path — should not throw or grow unbounded.
      for (let i = 0; i < 1000; i++) {
        rateLimit(`mass-key-${i}`, 5, 60_000);
      }
      // Final call must still return a valid result.
      const r = rateLimit('mass-key-final', 5, 60_000);
      expect(r.success).toBe(true);
    });
  });
});

describe('getClientIp', () => {
  function buildRequest(headers: Record<string, string>): Request {
    return new Request('https://example.com/api/contact', {
      method: 'POST',
      headers,
    });
  }

  it('returns the first IP from X-Forwarded-For', () => {
    const req = buildRequest({
      'x-forwarded-for': '203.0.113.1, 198.51.100.2',
    });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('trims whitespace around the first IP', () => {
    const req = buildRequest({ 'x-forwarded-for': '  203.0.113.1  , 10.0.0.1' });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('falls back to X-Real-IP when X-Forwarded-For is absent', () => {
    const req = buildRequest({ 'x-real-ip': '198.51.100.42' });
    expect(getClientIp(req)).toBe('198.51.100.42');
  });

  it('returns "unknown" when no IP headers are present', () => {
    const req = buildRequest({});
    expect(getClientIp(req)).toBe('unknown');
  });

  it('prefers X-Forwarded-For over X-Real-IP when both are present', () => {
    const req = buildRequest({
      'x-forwarded-for': '203.0.113.1',
      'x-real-ip': '198.51.100.2',
    });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('falls back to X-Real-IP when X-Forwarded-For is empty string', () => {
    const req = buildRequest({
      'x-forwarded-for': '',
      'x-real-ip': '198.51.100.2',
    });
    expect(getClientIp(req)).toBe('198.51.100.2');
  });
});
