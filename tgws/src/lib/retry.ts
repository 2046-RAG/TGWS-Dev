/**
 * Pure-function retry helper for server-side use.
 *
 * `useRetry` (src/hooks/useRetry.ts) is a React hook and cannot be called
 * inside API routes / server utilities. This module exposes the same retry
 * semantics (exponential backoff + jitter) as a plain async function so
 * server code (e.g. `createOdooLead`, the contact route's Odoo sync) can
 * reuse the strategy without pulling in React.
 *
 * Trade-offs (intentional):
 * - Retries on ANY rejection. Callers that want finer control (e.g. skip
 *   4xx) should inspect the error inside `fn` and re-throw a sentinel that
 *   bypasses retry — kept simple here because the only current caller
 *   (Odoo HTTP) wants to retry on network blips and 5xx alike.
 * - Backoff schedule mirrors `useRetry`: baseDelay * 2^attempt, capped at
 *   maxDelay, with up to 30% jitter. Identical math so behaviour is
 *   predictable across client and server.
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 1000;
const DEFAULT_MAX_DELAY = 10000;

function computeDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponential;
  return Math.min(exponential + jitter, maxDelay);
}

/**
 * Run `fn` and, on rejection, retry up to `maxRetries` times with
 * exponential backoff. Resolves with `fn`'s resolved value, or rejects
 * with the last error once retries are exhausted.
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    baseDelay = DEFAULT_BASE_DELAY,
    maxDelay = DEFAULT_MAX_DELAY,
    onRetry,
  } = options;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (attempt >= maxRetries) {
        throw error;
      }
      onRetry?.(attempt + 1, error);
      const delay = computeDelay(attempt, baseDelay, maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
}
