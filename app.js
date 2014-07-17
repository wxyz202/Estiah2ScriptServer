var fs = require('fs');

var socketFile = "/tmp/nodejs-estiah2.sock";

global.projectHome = __dirname;

process.on('uncaughtException', function(err) {
    fs.appendFileSync(global.projectHome + "/logs/nodejs.log", "[error][" + (new Date()).toString() + "] " + err.stack + "\n");
});


var framework = require(global.projectHome + "/base/framework.js");

app = new framework.Application();

app.loadConfig(require(global.projectHome + "/etc/config.js").config);

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
