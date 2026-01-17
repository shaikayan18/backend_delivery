// test-upload.js - Run this to test your upload endpoint
// Usage: node test-upload.js

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();