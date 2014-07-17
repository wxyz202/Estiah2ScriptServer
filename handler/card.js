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
        var addCardToDb = function(db, cardId, cardType) {
            var sql = "INSERT IGNORE INTO card (id, type) VALUES (?, ?)";
            var params = [cardId, cardType];
            db.query(sql, params, function(err, result){
                if(err){ throw err; }
            });
        };

        try {
            var data = JSON.parse(app.body);
        } catch(err) {
            return JsonErrorResponse("format wrong");
        }
        app.db.use(function(db){
            data.cards.forEach(function(card){
                addCardToDb(db, parseInt(card), cts.CARD_TYPE.CARD);
            });
            data.scards.forEach(function(card){
                addCardToDb(db, parseInt(card), cts.CARD_TYPE.SCARD);
            });
        });
    });
};
