var mysql = require("mysql");

var MysqlConnection = function(config){
    var self = this;

    self.pool = mysql.createPool({
        connectionLimit: config.connectionLimit || 10,
        host: config.host || "localhost",
        port: config.port || 3306,
        database: config.db,
        user: config.user,
        password: config.password
    });

    self.use = function(func) {
        self.pool.getConnection(function(err, connection){
            if (err){
                throw err;
            }
            func(connection);
            connection.release();
        });
    };
}

var connect = function(config){
    return new MysqlConnection(config);
};

exports.connect = connect;
