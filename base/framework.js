var url = require("url");

Environment = function(req, res){
    this.req = req;
    this.res = res;
    this.routes = [];
    this.path = url.parse(req.url).pathname;
    this.method = req.method;
}

var env;

function route(path, method, handler) {
    env.routes.push({
        "path": path,
        "method": method,
        "handler": handler
    });
}

function register(module){
    require(module);
}

function init(req, res) {
    env = new Environment(req, res);
}

function run(){
    var finished = false;
    env.routes.forEach(function(route){
        if (route.path == env.path && route.method.toLowerCase() == env.method.toLowerCase()) {
            env.res.writeHead(200, {'Content-Type': 'text/html'}); 
            env.res.end(route.handler());
            finished = true;
        }
    });
    if (!finished) {
        env.res.writeHead(404, {'Content-Type': 'text/html'}); 
        env.res.end("Not Found");
    }
}

exports.register = register;
exports.init = init;
exports.run = run;
exports.route = route;
