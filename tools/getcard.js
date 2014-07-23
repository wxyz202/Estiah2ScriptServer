var path = require("path");
var fs = require("fs");

var request = require("request");

global.projectHome = path.join(__dirname, "..");

process.on('uncaughtException', function(err) {
    fs.appendFileSync(global.projectHome + "/logs/tools.log", "[error][" + (new Date()).toString() + "] " + err.stack + "\n");
});

var framework = require(global.projectHome + "/base/framework.js");
app = new framework.Application();
app.loadConfig(require(global.projectHome + "/etc/config.js").config);


var utils = require(global.projectHome + "/base/utils.js");

var getCardUrl = function(cardId){
    return "http://cn.estiah2.com/zh/json/world/info/card/id/" + cardId;
};


var getCardInfo = function(db, cardId, callback){
    console.log(cardId);
    request.get(getCardUrl(cardId), function(err, response, body){
        if (err) { throw err; }
        var card = JSON.parse(body).data.card;
        var name = card.name;
        var fx = card.fx;
        var expire_time = utils.formatDateToMysql(new Date(Date.now() + utils.randint(1000 * 60 * 60 * 24 * 6, 1000 * 60 * 60 * 24 * 8)));
        var sql = "UPDATE card SET status = 1, expire_time = ?, content = ?, name = ?, fx = ? where id = ?";
        var params = [expire_time, body, name, fx, cardId];
        db.query(sql, params, function(err, result){
            if (err) { throw err; }
            setTimeout(function(){
                callback();
            }, utils.randint(1000, 2000));
        });
    });
};

var getCardsInfo = function(db, cardIdList, callback){
    console.dir(cardIdList);
    var currentIndex = cardIdList.length - 1;
    var f = function(){
        getCardInfo(db, cardIdList[currentIndex], function(){
            if (currentIndex > 0){
                currentIndex--;
                f();
            } else {
                callback();
            }
        });
    };
    f();
};

var main = function(callback){
    app.db.use(function(db){
        var now = utils.formatDateToMysql(new Date());
        var sql = "SELECT id FROM card WHERE status = 0 OR (expire_time IS NOT NULL AND expire_time <= ?)";
        var params = [now];
        db.query(sql, params, function(err, result){
            if(err){ throw err; }
            if (result.length > 0){
                var cardIdList = [];
                result.forEach(function(record){
                    cardIdList.push(record.id);
                });
                getCardsInfo(db, cardIdList, callback);
            } else {
                callback();
            }
        });
    });
};

main(function(){
    process.exit(0);
});
