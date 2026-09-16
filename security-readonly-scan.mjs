/**
 * TGWS 安全检测 · 线上只读 + 安全探测（不对生产做限流/上传攻击）
 */
const BASE = 'https://www.techguru-it.asia';
const results = [];

function rec(id, name, expected, actual, pass, note = '') {
  results.push({ id, name, expected, actual, pass, note });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name} | expect=${expected} actual=${actual}${note ? ' | ' + note : ''}`);
}

async function get(path, init = {}) {
  const r = await fetch(BASE + path, { redirect: 'manual', ...init });
  const text = await r.text().catch(() => '');
  return { status: r.status, headers: r.headers, text, location: r.headers.get('location') };
}

// SEC-A1 Security headers on homepage
{
  const { status, headers } = await get('/en');
  const h = {
    'x-frame-options': headers.get('x-frame-options'),
    'x-content-type-options': headers.get('x-content-type-options'),
    'referrer-policy': headers.get('referrer-policy'),
    'strict-transport-security': headers.get('strict-transport-security'),
    csp: headers.get('content-security-policy'),
  };
  rec('HDR-01', 'homepage status', 200, status, status === 200);
  rec('HDR-02', 'X-Frame-Options', 'DENY', h['x-frame-options'], h['x-frame-options'] === 'DENY');
  rec('HDR-03', 'X-Content-Type-Options', 'nosniff', h['x-content-type-options'], h['x-content-type-options'] === 'nosniff');
  rec('HDR-04', 'Referrer-Policy', 'strict-origin-when-cross-origin', h['referrer-policy'], h['referrer-policy'] === 'strict-origin-when-cross-origin');
  rec('HDR-05', 'HSTS present', 'max-age', String(h['strict-transport-security']).slice(0, 20), Boolean(h['strict-transport-security']?.includes('max-age')));
  rec('HDR-06', 'CSP present', 'default-src', h.csp ? 'yes' : 'no', Boolean(h.csp?.includes('default-src')));
}

// SEC-A2 Open redirect on auth callback
{
  for (const next of ['//evil.example', '/\\evil.com', 'https://evil.example', '/en/products']) {
    const { status, location } = await get(`/api/auth/callback?code=x&next=${encodeURIComponent(next)}`);
    const bad = location && /evil\.example/i.test(location);
    rec('REDIR-01', `callback next=${next.slice(0, 20)}`, 'no evil host in Location', `status=${status} loc=${location}`, !bad);
  }
}

// SEC-A3 CSRF foreign origin (single probe, not flood)
{
  const r = await fetch(BASE + '/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
    body: JSON.stringify({ name: 'a', email: 'a@b.co', message: 'x' }),
  });
  const body = await r.text();
  rec('CSRF-01', 'contact foreign origin', 403, r.status, r.status === 403, body.slice(0, 60));
}

// SEC-A4 Bad JSON / missing fields (single)
{
  const r1 = await fetch(BASE + '/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://www.techguru-it.asia' },
    body: '{',
  });
  rec('VAL-01', 'contact bad JSON', 400, r1.status, r1.status === 400 || r1.status === 500, '400 preferred');

  const r2 = await fetch(BASE + '/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://www.techguru-it.asia' },
    body: JSON.stringify({ name: '', email: 'bad', message: '' }),
  });
  rec('VAL-02', 'contact invalid body', 400, r2.status, r2.status === 400);
}

// SEC-A5 Unauthenticated API
{
  const r = await fetch(BASE + '/api/tickets');
  rec('AUTH-01', 'GET /api/tickets anonymous', 401, r.status, r.status === 401);
  const r2 = await fetch(BASE + '/api/tickets/stats');
  rec('AUTH-02', 'GET /api/tickets/stats anonymous', [401, 403], r2.status, r2.status === 401 || r2.status === 403);
}

// SEC-A6 revalidate secret
{
  const r = await fetch(BASE + '/api/revalidate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  rec('REVAL-01', 'revalidate without secret', 401, r.status, r.status === 401);
}

// SEC-A7 Bare i18n keys / SEO
{
  const zhTerms = await get('/zh/terms');
  rec('I18N-01', 'zh terms no bare key', false, zhTerms.text.includes('terms.section14Body'), !zhTerms.text.includes('terms.section14Body'));
  const zhPriv = await get('/zh/privacy');
  rec('I18N-02', 'zh privacy no bare key', false, zhPriv.text.includes('privacy.section12Body'), !zhPriv.text.includes('privacy.section12Body'));
  const home = await get('/en');
  rec('SEO-01', 'no tgws.vercel.app in hreflang', false, home.text.includes('tgws.vercel.app'), !home.text.includes('tgws.vercel.app'));
  rec('SEO-02', 'canonical brand domain', true, home.text.includes('https://www.techguru-it.asia/en'), home.text.includes('https://www.techguru-it.asia/en'));
}

// SEC-A8 Upload unauthorized (no file flood)
{
  const fd = new FormData();
  fd.append('file', new Blob(['x'], { type: 'text/plain' }), 'x.txt');
  const r = await fetch(BASE + '/api/upload', { method: 'POST', body: fd });
  rec('UPL-01', 'upload anonymous', 401, r.status, r.status === 401);
}

// SEC-A9 Method not allowed / info leak
{
  const r = await fetch(BASE + '/api/products', { method: 'DELETE' });
  rec('METH-01', 'DELETE /api/products', [405, 401, 403, 200], r.status, r.status !== 500, 'avoid 500 leak');
  const t = await r.text();
  rec('LEAK-01', 'no stack trace in DELETE body', false, /at Object\.|node_modules/.test(t), !/at Object\.|node_modules/.test(t));
}

// SEC-A10 robots/sitemap
{
  const robots = await get('/robots.txt');
  rec('SEO-03', 'robots.txt', 200, robots.status, robots.status === 200);
  const sm = await get('/sitemap.xml');
  rec('SEO-04', 'sitemap.xml', 200, sm.status, sm.status === 200);
}

const pass = results.filter((x) => x.pass).length;
const fail = results.filter((x) => !x.pass).length;
console.log('\n=== SUMMARY ===');
console.log(JSON.stringify({ total: results.length, pass, fail, failed: results.filter((x) => !x.pass) }, null, 2));
