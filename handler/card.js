var cts = require(global.projectHome + "/base/constants.js");
var framework = require(global.projectHome + "/base/framework.js");
var JsonResponse = framework.JsonResponse;
var JsonErrorResponse = framework.JsonErrorResponse;

exports.registerToApp = function(app){
    app.route("/card", "get", function(){
        app.db.use(function(db){
        });
        return "Hello World!"
    });

    app.route("/deck", "post", function(){
        return app.validateJsonBody({
            type: "object",
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

            return JsonResponse("import success", data);
        });
    });
};
