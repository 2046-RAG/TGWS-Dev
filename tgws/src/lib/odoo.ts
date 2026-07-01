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

  try {
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
  } catch (error) {
    console.error('Odoo integration error:', error);
    return null;
  }
}