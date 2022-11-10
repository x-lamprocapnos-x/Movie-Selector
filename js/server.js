let http = require('http');
const url = require('url');
const fs = require('fs');
// create server function
http.createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Hello Node!\n');
}).listen(8080);
console.log('My first Node test server is running on Port 8080.');
// url request function
let addr = request.url;
let q = url.parse(addr, true);
//log q data parts
console.log(q.host);
console.log(q.pathname);
console.log(q.search);
// qData
let qData = q.query;
console.log(qData.month);
// file system functions
fs.readFile('log.txt')