exports.config = {
    "debug": true,

    "redis": {
        "host": "localhost",
        "port": 6379
    },
    "db": {
        "connectionLimit": 100,
        "host": "localhost",
        "db": "estiah",
        "user": "estiah",
        "password": "estiah"
    },
    "log": {
        "error": "logs/nodejs.log",
        "debug": "logs/debug.log"
    }
};
