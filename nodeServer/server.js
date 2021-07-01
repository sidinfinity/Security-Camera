const http = require('http');
const express = require('express');
const fs = require('fs');
const app = express();

const hostname = '127.0.0.1';
const port = 3000;


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  fs.readFile('./webpage.html', function(err, html) {
    if (err) {
      throw err;
    } else {
      res.write(html);
      res.end();
    }
  });
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

