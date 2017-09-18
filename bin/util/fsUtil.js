var fs = require('fs')
var path = require('path')

var walk = function (dir, results = {}, done) {
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        results.name = results.name || path.dirname(dir)
        results.child = []
        results.file = []
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    var childItem = {
                        name: file
                    }
                    results.child.push(childItem)
                    walk(file, childItem, function (err, res) {
                        // results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.file ? results.file.push(file) : results.file = [file]
                    // results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

module.exports = {
    walk
}