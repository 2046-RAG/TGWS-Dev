'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report the fatal error server-side (digest) — UI stays minimal since
    // the root layout is unavailable at this level.
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F4F4F5', color: '#18181B' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
            <div style={{ width: 56, height: 56, background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: '#52525B', margin: '0 0 24px', lineHeight: 1.6 }}>
              An unexpected error occurred while loading the page. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '10px 24px',
                background: '#00D4FF',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
