const http = require('http');
const data = JSON.stringify({ message: 'kombin oner', wardrobe: [{_id: '123', name: 'T-shirt', category: 'Üst', color: 'red'}] });
const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/outfit/generate', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});
req.on('error', console.error);
req.write(data);
req.end();
