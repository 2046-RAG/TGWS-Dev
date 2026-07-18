import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
  generateCsrfToken,
  validateCsrfToken,
  isMutatingMethod,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '../csrf';

/**
 * Build a NextRequest with a cookie + header pair for CSRF testing.
 * Passing `null` for either value omits it entirely.
 */
function buildRequest(opts: {
  method?: string;
  cookieToken?: string | null;
  headerToken?: string | null;
  path?: string;
}): NextRequest {
  const headers: Record<string, string> = {};
  if (opts.headerToken != null) {
    headers[CSRF_HEADER_NAME] = opts.headerToken;
  }
  if (opts.cookieToken != null) {
    headers['cookie'] = `${CSRF_COOKIE_NAME}=${opts.cookieToken}`;
  }
  return new NextRequest(
    `http://localhost:3000${opts.path ?? '/api/contact'}`,
    {
      method: opts.method ?? 'POST',
      headers,
    }
  );
}

describe('csrf', () => {
  describe('generateCsrfToken', () => {
    it('returns a non-empty string', () => {
      const token = generateCsrfToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('generates tokens with sufficient entropy (>= 64 hex chars = 256 bits)', () => {
      const token = generateCsrfToken();
      expect(token.length).toBeGreaterThanOrEqual(64);
    });

    it('generates unique tokens across many invocations', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 200; i++) {
        tokens.add(generateCsrfToken());
      }
      // All 200 tokens must be unique — no collisions.
      expect(tokens.size).toBe(200);
    });

    it('produces only hex characters', () => {
      const token = generateCsrfToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('isMutatingMethod', () => {
    it('returns true for POST', () => {
      expect(isMutatingMethod('POST')).toBe(true);
    });
    it('returns true for PUT', () => {
      expect(isMutatingMethod('PUT')).toBe(true);
    });
    it('returns true for PATCH', () => {
      expect(isMutatingMethod('PATCH')).toBe(true);
    });
    it('returns true for DELETE', () => {
      expect(isMutatingMethod('DELETE')).toBe(true);
    });
    it('returns false for GET', () => {
      expect(isMutatingMethod('GET')).toBe(false);
    });
    it('returns false for HEAD', () => {
      expect(isMutatingMethod('HEAD')).toBe(false);
    });
    it('returns false for OPTIONS', () => {
      expect(isMutatingMethod('OPTIONS')).toBe(false);
    });
    it('is case-insensitive', () => {
      expect(isMutatingMethod('post')).toBe(true);
      expect(isMutatingMethod('Patch')).toBe(true);
      expect(isMutatingMethod('Delete')).toBe(true);
      expect(isMutatingMethod('get')).toBe(false);
    });
  });

  describe('validateCsrfToken — happy path', () => {
    it('returns true when cookie and header match', () => {
      const token = generateCsrfToken();
      const req = buildRequest({
        method: 'POST',
        cookieToken: token,
        headerToken: token,
      });
      expect(validateCsrfToken(req)).toBe(true);
    });
  });

  describe('validateCsrfToken — failure cases', () => {
    it('returns false when cookie is missing', () => {
      const token = generateCsrfToken();
      const req = buildRequest({
        method: 'POST',
        cookieToken: null,
        headerToken: token,
      });
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('returns false when header is missing', () => {
      const token = generateCsrfToken();
      const req = buildRequest({
        method: 'POST',
        cookieToken: token,
        headerToken: null,
      });
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('returns false when both are missing', () => {
      const req = buildRequest({
        method: 'POST',
        cookieToken: null,
        headerToken: null,
      });
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('returns false when tokens differ (same length)', () => {
      const cookieToken = 'a'.repeat(64);
      const headerToken = 'b'.repeat(64);
      const req = buildRequest({
        method: 'POST',
        cookieToken,
        headerToken,
      });
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('returns false when tokens differ in length', () => {
      const req = buildRequest({
        method: 'POST',
        cookieToken: 'short',
        headerToken: 'muchlongervalue',
      });
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('returns false for empty cookie value', () => {
      const req = buildRequest({
        method: 'POST',
        cookieToken: '',
        headerToken: 'whatever',
      });
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('returns false for empty header value', () => {
      const req = buildRequest({
        method: 'POST',
        cookieToken: 'whatever',
        headerToken: '',
      });
      expect(validateCsrfToken(req)).toBe(false);
    });
  });

  describe('GET vs mutating method coverage', () => {
    // validateCsrfToken itself is method-agnostic — the middleware decides
    // whether to call it based on method. We document the contract here so
    // future refactors don't accidentally start validating GET requests.
    it('a GET request with matching tokens still validates true (the middleware is responsible for skipping GET)', () => {
      const token = generateCsrfToken();
      const req = buildRequest({
        method: 'GET',
        cookieToken: token,
        headerToken: token,
      });
      expect(validateCsrfToken(req)).toBe(true);
      expect(isMutatingMethod(req.method)).toBe(false);
    });

    it('a POST request with no token header fails validation and is correctly identified as mutating', () => {
      const req = buildRequest({
        method: 'POST',
        cookieToken: null,
        headerToken: null,
      });
      expect(isMutatingMethod(req.method)).toBe(true);
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('a DELETE request without token header fails validation', () => {
      const req = buildRequest({
        method: 'DELETE',
        cookieToken: 'token',
        headerToken: null,
      });
      expect(isMutatingMethod(req.method)).toBe(true);
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('a PATCH request with mismatched token fails validation', () => {
      const req = buildRequest({
        method: 'PATCH',
        cookieToken: 'aaa',
        headerToken: 'bbb',
      });
      expect(isMutatingMethod(req.method)).toBe(true);
      expect(validateCsrfToken(req)).toBe(false);
    });
  });

  describe('timing-safe comparison contract', () => {
    // Smoke test: the comparison must not short-circuit on the first byte.
    // We can't measure timing reliably in unit tests, but we can verify
    // behavior is correct for inputs that differ only in the last byte.
    it('rejects tokens that differ only in the last character', () => {
      const cookie = '0'.repeat(63) + 'a';
      const header = '0'.repeat(63) + 'b';
      const req = buildRequest({
        method: 'POST',
        cookieToken: cookie,
        headerToken: header,
      });
      expect(validateCsrfToken(req)).toBe(false);
    });

    it('accepts tokens that are exactly equal', () => {
      const token = generateCsrfToken();
      const req = buildRequest({
        method: 'POST',
        cookieToken: token,
        headerToken: token,
      });
      expect(validateCsrfToken(req)).toBe(true);
    });
  });
});
