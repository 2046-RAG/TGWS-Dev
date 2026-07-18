/**
 * CSRF protection using the Double Submit Cookie pattern.
 *
 * Flow:
 * 1. Server issues a random token via both a cookie (csrf-token) and exposes
 *    it to client-side JS (httpOnly: false so JS can read it).
 * 2. Client reads the cookie and sends the same value back in a custom header
 *    (x-csrf-token) for every mutating request.
 * 3. Server compares the cookie value to the header value using a timing-safe
 *    comparison. If they match, the request is genuine (same-origin).
 *
 * This file is consumed by `src/middleware.ts`.
 */
import type { NextRequest } from 'next/server';

export const CSRF_COOKIE_NAME = 'csrf-token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const TOKEN_BYTES = 32;

function generateRandomToken(): string {
  const arr = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(arr);
  // Hex-encode (universally available in both Edge and Node runtimes).
  let out = '';
  for (let i = 0; i < arr.length; i++) {
    out += arr[i].toString(16).padStart(2, '0');
  }
  return out;
}

/**
 * Timing-safe string comparison. Returns true if both strings are byte-equal.
 * Falls back to constant-time XOR accumulation; does not short-circuit on
 * length mismatch (length-difference is still leaked, but the comparison itself
 * is constant time for equal-length inputs).
 */
function timingSafeEqualString(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

/** Returns true for POST/PUT/PATCH/DELETE. Case-insensitive. */
export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}

/**
 * Generate a fresh CSRF token string. The caller (middleware) is responsible
 * for actually setting the cookie on the response — keeping this function pure
 * makes it trivially testable.
 */
export function generateCsrfToken(): string {
  return generateRandomToken();
}

/**
 * Validate the CSRF token carried by `request`.
 * Returns true only when both the cookie and the header are present AND equal.
 * GET / HEAD / OPTIONS requests should NOT call this — see `isMutatingMethod`.
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!cookieToken || !headerToken) return false;
  return timingSafeEqualString(cookieToken, headerToken);
}

/**
 * Cookie options for the CSRF cookie. Exposed so middleware and tests share
 * the same definition. httpOnly MUST be false (client JS reads this to send
 * the header) — security comes from the SameSite + the header comparison, not
 * from cookie secrecy.
 */
export const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
};
