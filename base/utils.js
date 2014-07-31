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

var ArrayCallbackFunction = function(array, func, callback){
    self = this;
    self.array = array;
    self.func = func;
    self.finalCallback = callback;

    self.runSerial = function(){
        self.currentIndex = 0;
        self.callback = function(){
            self.currentIndex++;
            self.run();
        };
        self.run = function(){
            if (self.currentIndex < self.array.length){
                var currentItem = self.array[self.currentIndex];
                self.func(currentItem, self.currentIndex);
            } else {
                self.finalCallback();
            }
        };

        self.run();
    };

    self.runConcurrent = function(){
        self.remainCount = self.array.length;
        if (self.remainCount == 0) {
            self.finalCallback();
        }
        self.callback = function(){
            self.remainCount--;
            if (self.remainCount == 0) {
                self.finalCallback();
            }
        };
        self.run = function(){
            self.array.forEach(self.func);
        };

        self.run();
    };
};


exports.formatDateToMysql = formatDateToMysql;
exports.randint = randint;
exports.ArrayCallbackFunction = ArrayCallbackFunction;
