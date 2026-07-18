import { retryAsync } from '@/lib/retry';

export async function createOdooLead(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  description?: string;
}) {
  const url = process.env.ODOO_URL;
  const db = process.env.ODOO_DB;
  const username = process.env.ODOO_USERNAME;
  const password = process.env.ODOO_PASSWORD;

  if (!url || !db || !username || !password) {
    console.warn('Odoo not configured');
    return null;
  }

  // Each attempt re-authenticates — Odoo's session cookie is short-lived and
  // a retry that reuses a stale cookie would just fail again, so the whole
  // auth + create flow lives inside the retried closure.
  try {
    return await retryAsync(
      async () => {
        const authResponse = await fetch(`${url}/web/session/authenticate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ db, login: username, password }),
        });

        const cookies = authResponse.headers.get('set-cookie');

        const leadResponse = await fetch(`${url}/web/dataset/call_kw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookies || '',
          },
          body: JSON.stringify({
            model: 'crm.lead',
            method: 'create',
            args: [
              [
                {
                  name: data.name,
                  email_from: data.email,
                  partner_name: data.company,
                  phone: data.phone,
                  description: data.description,
                  source_id: 'TechGuru Website',
                },
              ],
            ],
            kwargs: {},
          }),
        });

        return await leadResponse.json();
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        onRetry: (attempt, err) => {
          console.warn(`Odoo lead create retry #${attempt}:`, err.message);
        },
      }
    );
  } catch (error) {
    console.error('Odoo integration error after retries:', error);
    return null;
  }
}
