var fs = require('fs');
var exec = require('child_process').exec;


var FILE_LIST = ["app.js"];
var DIR_LIST = ["base", "etc", "handler", "template"];
var VALID_FILE = [/^.*.js$/, /^.*.jade$/];


var printHelpMsg = function(){
    console.log("Usage: node install.js --prefix=<PATH_TO_INSTALL> --owner=<USER:GROUP>");
};

var chown = function(file, owner, callback){
    exec("chown " + owner + " " + file, callback);
};

var copyFile = function(src, dest, owner, callback){
    exec("cp " + src + " " + dest, function(){
        chown(dest, owner, callback);
    });
};

var copyAllFiles = function(srcDir, destDir, owner){
    fs.readdir(srcDir, function(err, files){
        files.forEach(function(file){
            VALID_FILE.forEach(function(pattern){
                if (pattern.test(file)){
                    copyFile(srcDir + "/" + file, destDir + "/" + file, owner);
                }
            });
        });
    });
};

var install = function(prefix, owner){
    var srcDir = __dirname;
    var destDir = prefix;
    FILE_LIST.forEach(function(file){
        copyFile(srcDir + "/" + file, destDir + "/" + file, owner);
    });
    DIR_LIST.forEach(function(dir){
        var subSrcDir = srcDir + "/" + dir;
        var subDestDir = destDir + "/" + dir;
        fs.exists(subDestDir, function(exists){
            if (!exists) {
                fs.mkdir(subDestDir, function(){
                    chown(subDestDir, owner, function(){
                        copyAllFiles(subSrcDir, subDestDir, owner);
                    });
                });
            } else {
                copyAllFiles(subSrcDir, subDestDir, owner);
            }
        });
    });
};

var main = function(){
    var argv = require('minimist')(process.argv.slice(2));
    if (argv.h || argv.help) {
        printHelpMsg();
        return;
    }
    if (!argv.prefix || !argv.owner){
        printHelpMsg();
        return;
    }
    install(argv.prefix, argv.owner);
};

main();
