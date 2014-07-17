var url = require("url");
var http = require('http');

Application = function(){
    var self = this;

    self.start = function(socket, callback){
        http.createServer(function (req, res) {
            try {
                self.init(req, res);
                self.run();
            } catch (err) {
                res.writeHead(500);
                res.end();
                throw err;
            }
        }).listen(socket, callback);
    };

    self.routes = [];
    self.register = function(handler){
        var handler = require(handler);
        handler.registerToApp(self);
    };
    self.route = function(path, method, handler){
        self.routes.push({
            "path": path,
            "method": method,
            "handler": handler
        });
    };
    self.loadConfig = function(config){
        if (config.log){
            self.getLogger = function(log) {
                var logFile = global.projectHome + "/" + config.log[log];
                var logger = {
                    "log": function(s){
                        fs.appendFileSync(logFile, "[" + log + "][" + (new Date()).toString() + "] " + s + "\n");
                    }
                };
                return logger;
            };
        }
        if (config.db){
            self.db = require(global.projectHome + "/base/mysql.js").connect(config.db);
        }
        if (config.redis){
        }
    };

    self.init = function(req, res){
        self.req = req;
        self.res = res;
        self.path = url.parse(req.url).pathname;
        self.method = req.method;
        if (self.method.toLowerCase() == "get") {
            self.body = "";
        } else {
            self.body = req.read();
        }
        self.header = {};
    };
    self.setHeader = function(k, v){
        self.header[k] = v;
    };
    self.run = function(){
        var finished = false;
        var output;
        self.routes.forEach(function(route){
            if (route.path == self.path && route.method.toLowerCase() == self.method.toLowerCase()) {
                output = route.handler();
                finished = true;
            }
        });
        if (finished) {
            self.res.writeHead(200, self.header);
            self.res.end(output);
        } else {
            self.res.writeHead(404, {'Content-Type': 'text/html'}); 
            self.res.end("Not Found");
        }
    };
};

exports.Application = Application;
