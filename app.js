var fs = require('fs');
var http = require('http'); 

var socket_file = "/tmp/nodejs-estiah2.sock";

http.createServer(function (req, res) { 
    res.writeHead(200, {'Content-Type': 'text/html'}); 
    res.end('Hello World!'); 
}).listen(socket_file, function() {
    process.on('SIGTERM', function() {
        fs.unlinkSync(socket_file);
        process.exit();
    });
});
