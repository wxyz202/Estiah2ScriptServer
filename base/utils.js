var formatDateToMysql = function(date){
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var ret = year + "-";
    if (month < 10){
        ret = ret + "0";
    }
    ret = ret + month + "-";
    if (day < 10){
        ret = ret + "0";
    }
    ret = ret + day + " ";
    ret = ret + date.toLocaleTimeString();
    return ret;
};

var randint = function(a, b){
    if (a > b) {
        var c = a;
        a = b;
        b = a;
    }
    return Math.round(Math.random() * (b - a + 1)) + a;
};

exports.formatDateToMysql = formatDateToMysql;
exports.randint = randint;
