var path = require("path");
var fs = require("fs");

var request = require("request");

global.projectHome = path.join(__dirname, "..");

process.on('uncaughtException', function(err) {
    fs.appendFileSync(global.projectHome + "/logs/tools.log", "[error][" + (new Date()).toString() + "] " + err.stack + "\n");
    console.log(err.stack);
    process.exit(1);
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
        var cost = card.cost;
        var rune = card.rune;
        var expire_time = utils.formatDateToMysql(new Date(Date.now() + utils.randint(1000 * 60 * 60 * 24 * 6, 1000 * 60 * 60 * 24 * 8)));
        var concurrentInsertRune = new utils.ArrayCallbackFunction(cost.concat([rune]), function(runeInfo){
            var sql = "INSERT IGNORE INTO rune (id, name, label) VALUES (?, ?, ?)";
            var params = [runeInfo.id, runeInfo.name, runeInfo.label];
            db.query(sql, params, function(err, result){
                if (err) { throw err; }
                concurrentInsertRune.callback();
            });
        }, function(){
            var sql = "UPDATE card SET status = 1, expire_time = ?, content = ?, name = ?, fx = ?, rarity = ?, rune_id = ? where id = ?";
            var params = [expire_time, body, name, fx, rarity, rune.id, cardId];
            db.query(sql, params, function(err, result){
                if (err) { throw err; }
                var sql = "DELETE FROM card_cost_rune WHERE card_id = ?";
                var params = [cardId];
                db.query(sql, params, function(err, result){
                    if (err) { throw err; }
                    var concurrentInsertCost = new utils.ArrayCallbackFunction(cost, function(costRuneInfo, index){
                        var sql = "INSERT INTO card_cost_rune (card_id, position, rune_id) VALUES (?, ?, ?)";
                        var params = [cardId, index, costRuneInfo.id];
                        db.query(sql, params, function(err, result){
                            if (err) { throw err; }
                            concurrentInsertCost.callback();
                        });
                    }, function(){
                        setTimeout(function(){
                            callback();
                        }, utils.randint(1000, 2000));
                    });
                    concurrentInsertCost.runConcurrent();
                });
            });
        });
        concurrentInsertRune.runConcurrent();
    });
};

var getCardsInfo = function(db, cardIdList, callback){
    console.dir(cardIdList);
    var serial = new utils.ArrayCallbackFunction(cardIdList, function(cardId){
        getCardInfo(db, cardId, serial.callback);
    }, callback);
    serial.runSerial();
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
                var endFromLockStr = function(){
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
