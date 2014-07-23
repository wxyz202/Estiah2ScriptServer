var crypto = require("crypto");

var cts = require(global.projectHome + "/base/constants.js");
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
            var addCardToDb = function(db, cardId, cardType) {
                var sql = "INSERT IGNORE INTO card (id, type) VALUES (?, ?)";
                var params = [cardId, cardType];
                db.query(sql, params, function(err, result){
                    if(err){ throw err; }
                });
            };

            app.db.use(function(db){
                data.cards.forEach(function(card){
                    addCardToDb(db, card.id, cts.CARD_TYPE.CARD);
                });
                data.scards.forEach(function(scard){
                    addCardToDb(db, scard, cts.CARD_TYPE.SCARD);
                });
            });

            app.redis.use(function(redis){
                var md5 = crypto.createHash("md5");
                md5.update(app.body);
                var orikey = md5.digest("hex");
                var key = orikey;
                var value = app.body;
                var ex = 60 * 60 * 24;
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
                            var sql = "SELECT id, status, name, fx FROM card WHERE id IN (" + allCardIds.join(",") + ")";
                            db.query(sql, function(err, result){
                                if (err) { throw err };
                                var cardInfo = {};
                                result.forEach(function(record){
                                    cardInfo[record.id] = {
                                        "name": record.name,
                                        "fx": record.fx,
                                        "status": record.status
                                    };
                                });
                                app.respond(TemplateResponse("deck.jade", {
                                    deck: deck,
                                    cardInfo: cardInfo
                                }));
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
