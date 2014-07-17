exports.registerToApp = function(app){
    app.route("/card", "get", function(){
        app.db.use(function(db){
        });
        return "Hello World!"
    });

    app.route("/deck", "post", function(){
        var data = JSON.parse(app.data);
        app.db.use(function(db){
            data.cards.forEach(function(card){
                card = parseInt(card);
                var sql = "\
                    SELECT * FROM card WHERE id = ?
                ";
                var params = [card];
                db.query(sql, params, function(err, result) {
                });
            });
        });
    });
};
