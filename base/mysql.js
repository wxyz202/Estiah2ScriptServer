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
            connection.lockStr = function(s, func){
                var sql = "SELECT GET_LOCK(?, 0) AS success";
                var params = [s];
                connection.query(sql, params, function(err, result){
                    if (err) { throw err; };
                    var locked = (result[0].success == 1);
                    func(locked, function(){
                        if (locked){
                            var sql = "SELECT RELEASE_LOCK(?)";
                            var params = [s];
                            connection.query(sql, params);
                        }
                    });
                });
            };
            func(connection);
        });
    };
}

var connect = function(config){
    return new MysqlConnection(config);
};

exports.connect = connect;
