/**
 * Structured service error logging with optional webhook forwarding.
 * Replaces console.error-only patterns with traceable errors.
 * Zero npm deps — sends to any HTTP webhook (Slack/Discord/custom).
 */

interface ErrorContext {
  service: string;
  operation: string;
  error?: unknown;
  extra?: Record<string, unknown>;
}

function logServiceError({ service, operation, error, extra }: ErrorContext) {
  const timestamp = new Date().toISOString();
  const errorMsg = error instanceof Error ? error.message : String(error ?? 'unknown');
  const context = JSON.stringify({ timestamp, service, operation, error: errorMsg, ...extra });

  // Always log to console (Vercel captures these)
  console.error(`[${service}] ${operation} failed:`, context);

  // Forward to webhook if configured (non-blocking, fire-and-forget)
  const webhookUrl = process.env.ERROR_WEBHOOK_URL;
  if (webhookUrl && typeof window === 'undefined') {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp, service, operation, error: errorMsg, ...extra }),
    }).catch(() => {
      // Silently ignore webhook delivery failures to avoid infinite loops
    });
  }
}

function isConfigured(envVar: string) {
  return !!process.env[envVar];
}

/**
 * Track custom analytics events via Umami.
 * Falls back silently if Umami is not loaded.
 */
function trackEvent(name: string, data?: Record<string, string | number>) {
  if (typeof window !== 'undefined') {
    const win = window as unknown as Record<string, unknown>;
    if (win.umami) {
      try {
        (win.umami as { track: (name: string, data?: Record<string, string | number>) => void }).track(name, data);
      } catch {
        // Umami not available — ignore
      }
    }
  }
}

export { logServiceError, isConfigured, trackEvent };
export type { ErrorContext };
