const http = require('http');
const express = require('express')
const fs = require('fs')

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  fs.readFile('./webpage.html', function(err, html) {
    if (err) {
      throw err;
    } else {
      response.write(html);
      response.end();
    }
  })
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
