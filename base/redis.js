var redis = require("redis");

var RedisConnection = function(config) {
    var self = this;

    self.use = function(func) {
        var client = redis.createClient(config.port, config.host);
        func(client);
    };
};

var connect = function(config){
    return new RedisConnection(config);
};

exports.connect = connect;
