var fs = require('fs')
var path = require('path')

var walk = function (dir, authfolderData, done) {
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        // authfolderData.name = path.basename(authfolderData.name) || path.basename(dir)
        // authfolderData.child = []
        // authfolderData.file = []
        var pending = list.length;
        if (!pending) return done(null, authfolderData);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    var childItem = {
                        name: file
                    }
                    authfolderData.folder.push(childItem)
                    walk(file, childItem, function (err, res) {
                        // authfolderData = authfolderData.concat(res);
                        if (!--pending) done(null, authfolderData);
                    });
                } else {
                    authfolderData.file ? authfolderData.file.push(file) : authfolderData.file = [file]
                    // authfolderData.push(file);
                    if (!--pending) done(null, authfolderData);
                }
            });
        });
    });
};
// 创建多层文件夹
function mkdirSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function (dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            } else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}
// 删除文件夹
function deleteFolder(dirPath) {
    var files = [];
    if (fs.existsSync(dirPath)) {
        files = fs.readdirSync(dirPath);
        files.forEach(function (file, index) {
            var curPath = path.resolve(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}

// 清空文件夹内文件
function clearFolder(dirPath) {
    var files = [];
    if (fs.existsSync(dirPath)) {
        files = fs.readdirSync(dirPath);
        files.forEach(function (file, index) {
            var curPath = path.resolve(dirPath, file);
            if (!fs.lstatSync(curPath).isDirectory()) { // recurse
                fs.unlinkSync(curPath);
            }
        });
    }
}

module.exports = {
    walk,
    mkdirSync,
    deleteFolder,
    clearFolder
}