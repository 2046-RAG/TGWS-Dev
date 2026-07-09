import dns from 'dns';
import net from 'net';

dns.resolveMx('techguru-it.asia', (err, mxRecords) => {
  if (err) {
    console.log('DNS MX lookup failed:', err.message);
    return;
  }
  console.log('MX records:', JSON.stringify(mxRecords));
  const mx = mxRecords.sort((a, b) => a.priority - b.priority)[0];
  console.log('Testing:', mx.exchange);
  
  const socket = net.createConnection(25, mx.exchange);
  socket.setTimeout(8000);
  
  socket.on('connect', () => {
    console.log('SMTP connected');
    socket.write('EHLO test.local\r\n');
  });
  
  socket.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('250')) {
      socket.write('RCPT TO:<Inquiries@techguru-it.asia>\r\n');
    } else if (msg.includes('550') || msg.includes('553') || msg.includes('552')) {
      console.log('REJECTED:', msg.split('\n')[0].trim());
      socket.write('QUIT\r\n');
    } else if (msg.includes('252') || msg.includes('251')) {
      console.log('ACCEPTED (server does not verify addresses)');
      socket.write('QUIT\r\n');
    }
    if (msg.includes('221')) socket.end();
  });
  
  socket.on('error', (e) => console.log('Error:', e.message));
  socket.on('timeout', () => { socket.destroy(); console.log('Timeout'); });
});
