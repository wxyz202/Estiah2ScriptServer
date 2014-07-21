exports.config = {
    "debug": true,

    "redis": {
        "host": "localhost",
        "port": 6379
    },
    "db": {
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
