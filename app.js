var fs = require('fs');

var socketFile = "/tmp/nodejs-estiah2.sock";

global.projectHome = __dirname;
var logger = {
    "format": function(f, s, t){
        fs.writeFileSync(f, "[" + t + "][" + (new Date()).toString() + "] " + s + "\n", {flag:"a"});
    },
    "log": function(s){
        this.format(global.projectHome + "/logs/debug.log", s, "log");
    },
    "debug": function(s){
        this.format(global.projectHome + "/logs/debug.log", s, "debug");
    },
    "error": function(s){
        this.format(global.projectHome + "/logs/nodejs.log", s, "error");
    }
};

process.on('uncaughtException', function(err) {
    logger.error(err.stack);
});

var framework = require(global.projectHome + "/base/framework.js");

app = new framework.Application();

app.logger = logger;

fs.readdirSync(global.projectHome + "/handler").forEach(function(handler){
    if (/.*\.js$/.test(handler)){
        app.register(global.projectHome + "/handler/" + handler);
    }
});

app.start(socketFile, function(){
    process.on('SIGTERM', function() {
        fs.unlinkSync(socketFile);
        process.exit();
    });
});
