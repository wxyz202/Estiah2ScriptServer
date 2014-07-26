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
        var rarity = card.rarity.id;
        var expire_time = utils.formatDateToMysql(new Date(Date.now() + utils.randint(1000 * 60 * 60 * 24 * 6, 1000 * 60 * 60 * 24 * 8)));
        var sql = "UPDATE card SET status = 1, expire_time = ?, content = ?, name = ?, fx = ?, rarity = ? where id = ?";
        var params = [expire_time, body, name, fx, rarity, cardId];
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
    var serial = new utils.ArrayCallbackFunction(cardIdList, function(cardId){
        getCardInfo(db, cardId, this.callback);
    }, function(){
        callback();
    });
    serial.run();
};

var main = function(callback){
    app.db.use(function(db){
        var endFromdb = function(){
            db.release();
            callback();
        };
        db.lockStr("tools/getcard.js", function(locked, releaseCallback){
            if (!locked){
                endFromdb();
            } else {
                var endFromLockStr= function(){
                    releaseCallback();
                    endFromdb();
                };

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
                        getCardsInfo(db, cardIdList, endFromLockStr);
                    } else {
                        endFromLockStr();
                    }
                });
            }
        });
    });
};

main(function(){
    process.exit(0);
});
