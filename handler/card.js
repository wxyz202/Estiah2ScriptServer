exports.registerToApp = function(app){
    app.route("/card", "get", function(){
        return "Hello World!"
    });
};
