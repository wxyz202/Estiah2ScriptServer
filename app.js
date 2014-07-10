var fs = require('fs');
var http = require('http');

var socketFile = "/tmp/nodejs-estiah2.sock";

global.projectHome = __dirname;
global.logger = {
    "format": function(f, s){
        fs.writeFileSync(f, "[" + (new Date()).toString() + "] " + s + "\n", {flag:"a"});
    },
    "log": function(s){
        this.format(global.projectHome + "/logs/debug.log", s);
    },
    "error": function(s){
        this.format(global.projectHome + "/logs/nodejs.log", s);
    }
};

var logger = global.logger;


process.on('uncaughtException', function(err) {
    logger.error(err.stack);
});

http.createServer(function (req, res) {
    try {
        var framework = require(global.projectHome + "/base/framework.js");
        global.framework = framework;
        framework.init(req, res);
        fs.readdirSync(global.projectHome + "/handler").forEach(function(module){
            framework.register(module);
        }
        framework.run();
    } catch (err) {
        logger.error(err.stack);
        res.writeHead(500);
        res.end();
    }
}).listen(socketFile, function() {
    process.on('SIGTERM', function() {
        fs.unlinkSync(socketFile);
        process.exit();
    });
});
