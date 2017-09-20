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

module.exports = {
    walk
}