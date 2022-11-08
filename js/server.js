let http = require('http');

createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Hello Node!\n');
}).listen(8080);

console.log('My first Node test server is running on Port 8080.');

let fs = require('fs');
fs.readFile('input.txt', (err, data) => {
    if (err) {
        throw err;
    }
    
    console.log('File content: ' + data.toString());
});

let url = require('url');
