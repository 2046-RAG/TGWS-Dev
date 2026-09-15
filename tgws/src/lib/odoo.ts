import { logServiceError } from '@/lib/errors';

/** Build a Cookie header from Set-Cookie values (AUDIT-045). */
function sessionCookie(setCookie: string | null): string {
  if (!setCookie) return '';
  // set-cookie may be a single header; Node fetch joins multiples with ", "
  const parts = setCookie.split(/,(?=\s*[a-zA-Z0-9_]+=)/);
  const pairs: string[] = [];
  for (const part of parts) {
    const first = part.split(';')[0]?.trim();
    if (first && first.includes('=')) pairs.push(first);
  }
  return pairs.join('; ');
}

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

  if (!url || !db || !username || !password || url === 'YOUR_ODOO_URL') {
    logServiceError({
      service: 'Odoo',
      operation: 'createLead',
      error: 'missing env vars',
      extra: { configured: false },
    });
    return { success: false, error: 'Odoo CRM not configured' };
  }

  try {
    const authResponse = await fetch(`${url}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ db, login: username, password }),
    });

    if (!authResponse.ok) {
      logServiceError({
        service: 'Odoo',
        operation: 'authenticate',
        error: `HTTP ${authResponse.status}`,
      });
      return { success: false, error: 'Odoo CRM authentication failed' };
    }

    const cookie = sessionCookie(authResponse.headers.get('set-cookie'));
    if (!cookie) {
      logServiceError({
        service: 'Odoo',
        operation: 'authenticate',
        error: 'no session cookie',
      });
      return { success: false, error: 'Odoo CRM session missing' };
    }

    const leadResponse = await fetch(`${url}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        model: 'crm.lead',
        method: 'create',
        args: [
          [
            {
              name: data.name,
              // Do not log full email (AUDIT-049) — caller already avoids logging body.
              email_from: data.email,
              partner_name: data.company,
              phone: data.phone,
              description: data.description,
              // source_id must be a numeric id — omit rather than send a string
              // that Odoo would reject (AUDIT-050). Map it in Sanity/Odoo setup
              // if a named source is required.
            },
          ],
        ],
        kwargs: {},
      }),
    });

    if (!leadResponse.ok) {
      logServiceError({
        service: 'Odoo',
        operation: 'createLead',
        error: `HTTP ${leadResponse.status}`,
      });
      return { success: false, error: 'Odoo CRM request failed' };
    }

    const result = (await leadResponse.json()) as { error?: unknown; result?: unknown };
    if (result?.error) {
      logServiceError({
        service: 'Odoo',
        operation: 'createLead',
        error: result.error,
      });
      return { success: false, error: 'Odoo CRM returned an error' };
    }

    return { success: true, data: result.result ?? result };
  } catch (error) {
    // Hash/omit email from logs (AUDIT-049)
    logServiceError({
      service: 'Odoo',
      operation: 'createLead',
      error,
      extra: { emailDomain: data.email.split('@')[1] || 'unknown' },
    });
    return { success: false, error: 'Odoo CRM request failed' };
  }
}
