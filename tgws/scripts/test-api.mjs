import https from 'https';

function testPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(`https://www.techguru-it.asia${path}`, {
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

function testGet(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.techguru-it.asia${path}`, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: buf.substring(0, 200) }));
    }).on('error', reject);
  });
}

console.log('=== Phase 1 Live Verification ===\n');

// Test 1: Site accessible
const t1 = await testGet('/en');
console.log(`[T1] Site accessible: ${t1.status === 200 ? 'PASS' : 'FAIL'} (status: ${t1.status})`);

// Test 2: Oversized name (500 chars > 100 limit)
const t2 = await testPost('/api/contact', { name: 'A'.repeat(500), email: 'test@test.com', message: 'hello' });
console.log(`[T2] Oversized name (500>100): ${t2.status === 400 ? 'PASS' : 'FAIL'} (status: ${t2.status}, body: ${t2.body})`);

// Test 3: Oversized message (5001 chars > 5000 limit)
const t3 = await testPost('/api/contact', { name: 'Test User', email: 'test@test.com', message: 'A'.repeat(5001) });
console.log(`[T3] Oversized message (5001>5000): ${t3.status === 400 ? 'PASS' : 'FAIL'} (status: ${t3.status}, body: ${t3.body})`);

// Test 4: Invalid email
const t4 = await testPost('/api/contact', { name: 'Test', email: 'not-an-email', message: 'hello' });
console.log(`[T4] Invalid email: ${t4.status === 400 ? 'PASS' : 'FAIL'} (status: ${t4.status}, body: ${t4.body})`);

// Test 5: Products API
const t5 = await testGet('/api/products');
console.log(`[T5] Products API: ${t5.status === 200 ? 'PASS' : 'FAIL'} (status: ${t5.status})`);

// Test 6: Valid contact (should succeed)
const t6 = await testPost('/api/contact', { name: 'Test', email: 'test@test.com', message: 'Phase1 verification test' });
console.log(`[T6] Valid contact: ${t6.status === 200 ? 'PASS' : 'FAIL'} (status: ${t6.status}, body: ${t6.body})`);

const passed = [t1,t2,t3,t4,t5,t6].filter((t,i) => [t1.status===200, t2.status===400, t3.status===400, t4.status===400, t5.status===200, t6.status===200][i]).length;
console.log(`\n=== Result: ${passed}/6 passed ===`);
