var crypto = require("crypto");
var child_process = require("child_process");

var cts = require(global.projectHome + "/base/constants.js");
var utils = require(global.projectHome + "/base/utils.js");
var framework = require(global.projectHome + "/base/framework.js");
var TemplateResponse = framework.TemplateResponse;
var JsonResponse = framework.JsonResponse;
var JsonErrorResponse = framework.JsonErrorResponse;

exports.registerToApp = function(app){
    app.route("/card", "get", function(){
        app.respond("Hello World!");
    });

    app.route("/deck", "post", function(){
        app.validateJsonBody({
            type: "object",
            additionalProperties: false,
            properties: {
                cards: {
                    required: true,
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: {
                                required: true,
                                type: "integer"
                            },
                            num: {
                                required: true,
                                type: "integer",
                                maximum: 4
                            }
                        }
                    }
                },
                scards: {
                    required: true,
                    type: "array",
                    items: {
                        type: "integer"
                    }
                }
            }
        }, function(data) {
            var hasInserted = false;

            var addCardToDb = function(db, cardId, cardType, callback) {
                var sql = "INSERT IGNORE INTO card (id, type) VALUES (?, ?)";
                var params = [cardId, cardType];
                db.query(sql, params, function(err, result){
                    if(err){ throw err; }
                    if (result.affectedRows > 0) {
                        hasInserted = true;
                    }
                    callback();
                });
            };

            app.db.use(function(db){
                var cards = [];
                data.cards.forEach(function(card){
                    cards.push({
                        "id": card.id,
                        "type": cts.CARD_TYPE.CARD
                    });
                });
                data.scards.forEach(function(scard){
                    cards.push({
                        "id": scard,
                        "type": cts.CARD_TYPE.SCARD
                    });
                });
                var f = function(currentIndex){
                    if (currentIndex > 0){
                        currentIndex--;
                        addCardToDb(db, cards[currentIndex].id, cards[currentIndex].type, function(){
                            f(currentIndex);
                        });
                    } else {
                        db.release();
                        if (hasInserted){
                            child_process.exec("/usr/local/bin/node /home/estiah/ScriptServer/tools/getcard.js");
                        }
                    }
                };
                f(cards.length);
            });

            app.redis.use(function(redis){
                var md5 = crypto.createHash("md5");
                md5.update(app.body);
                var orikey = md5.digest("hex");
                var key = orikey;
                var value = app.body;
                var ex = 60 * 60 * 24 * 2;
                var responseFunc = function(token){
                    return JsonResponse("import success", {
                        "token":token,
                        "expireTimestamp": Date.now() + ex * 1000
                    });
                };
                var insertFunc = function(i){
                    redis.get(key, function(err, resp){
                        if (resp) {
                            if (resp == value) {
                                redis.expire(key, ex);
                                app.respond(responseFunc(key));
                                redis.quit();
                            } else {
                                key = orikey + i;
                                insertFunc(i+1);
                            }
                        } else {
                            redis.setex(key, ex, value);
                            app.respond(responseFunc(key));
                            redis.quit();
                        }
                    });
                };
                insertFunc(0);
            });
        });
    });

    app.route("/deck", "get", function(){
        app.validateQuery({
            type: "object",
            properties: {
                token: {
                    required: true,
                    type: "string"
                }
            }
        }, function(data){
            app.redis.use(function(redis){
                redis.get(data.token, function(err, resp){
                    if (resp) {
                        var deck = JSON.parse(resp);
                        var allCardIds = deck.scards.slice(0);
                        deck.cards.forEach(function(card){
                            allCardIds.push(card.id);
                        });
                        app.db.use(function(db){
                            var sql = "SELECT a.id, a.status, a.name, a.fx, a.rarity, b.name as rune_name FROM card a JOIN rune b ON a.rune_id = b.id WHERE a.id IN (" + allCardIds.join(",") + ")";
                            db.query(sql, function(err, result){
                                if (err) { throw err };
                                var sql = "SELECT a.card_id, a.position, b.name AS rune_name FROM card_cost_rune a JOIN rune b ON a.rune_id = b.id WHERE a.card_id IN (" + allCardIds.join(",") + ")";
                                db.query(sql, function(err, costResult){
                                    if (err) { throw err };
                                    db.release();

                                    var costDict = {};
                                    costResult.forEach(function(record){
                                        if (costDict[record.card_id] === undefined) {
                                            costDict[record.card_id] = [];
                                        }
                                        costDict[record.card_id][record.position] = record.rune_name;
                                    });

                                    var cardInfos = {};
                                    result.forEach(function(record){
                                        cardInfos[record.id] = {
                                            "id": record.id,
                                            "name": record.name,
                                            "fx": record.fx,
                                            "rarity": record.rarity,
                                            "rune_name": record.rune_name,
                                            "cost": costDict[record.id],
                                            "status": record.status
                                        };
                                    });
                                    app.respond(TemplateResponse("deck.jade", {
                                        deck: deck,
                                        cardInfos: cardInfos
                                    }));
                                });
                            });
                        });
                    } else {
                        app.respond("not found", 404);
                    }
                });
            });
        }, function(err){
            app.respond("not found", 404);
        });
    });
};
