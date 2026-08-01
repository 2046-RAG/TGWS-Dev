import https from 'https';

const DEPLOY_URL = 'https://tgws-mh49794oq-glaywang2046-1050s-projects.vercel.app';
const PROD_URL = 'https://www.techguru-it.asia';

function testPost(baseUrl, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(path, baseUrl);
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

console.log('=== Testing New Deployment vs Production ===\n');

// Test oversized message on new deployment
const t1 = await testPost(DEPLOY_URL, '/api/contact', { name: 'Test', email: 'test@test.com', message: 'A'.repeat(5001) });
console.log(`[NEW] Oversized message: ${t1.status === 400 ? 'PASS ✅' : 'FAIL ❌'} (status: ${t1.status}, body: ${t1.body})`);

// Test oversized message on production
const t2 = await testPost(PROD_URL, '/api/contact', { name: 'Test', email: 'test@test.com', message: 'A'.repeat(5001) });
console.log(`[PROD] Oversized message: ${t2.status === 400 ? 'PASS ✅' : 'FAIL ❌'} (status: ${t2.status}, body: ${t2.body})`);

// Test oversized name on new deployment
const t3 = await testPost(DEPLOY_URL, '/api/contact', { name: 'A'.repeat(500), email: 'test@test.com', message: 'hello' });
console.log(`[NEW] Oversized name: ${t3.status === 400 ? 'PASS ✅' : 'FAIL ❌'} (status: ${t3.status}, body: ${t3.body})`);

// Test oversized name on production
const t4 = await testPost(PROD_URL, '/api/contact', { name: 'A'.repeat(500), email: 'test@test.com', message: 'hello' });
console.log(`[PROD] Oversized name: ${t4.status === 400 ? 'PASS ✅' : 'FAIL ❌'} (status: ${t4.status}, body: ${t4.body})`);
