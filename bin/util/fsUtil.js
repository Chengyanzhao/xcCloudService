var fs = require('fs')
var path = require('path')
var fstream = require('fstream')
var tar = require('tar');
let zlib = require('zlib');

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
                        name: path.basename(file)
                    }
                    authfolderData.folder ? authfolderData.folder.push(childItem) : authfolderData.folder = [childItem]
                    walk(file, childItem, function (err, res) {
                        // authfolderData = authfolderData.concat(res);
                        if (!--pending) done(null, authfolderData);
                    });
                } else {
                    let fileName = path.basename(file)
                    authfolderData.file ? authfolderData.file.push(fileName) : authfolderData.file = [fileName]
                    authfolderData.file.sort()
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

// 压缩，生成tar.gz
function compression(input, output) {
    return new Promise((resolve, reject) => {
        let result = {
            status: 0
        }
        if (!fs.existsSync(input)) {
            result.message = '压缩资源不存在！'
            reject(result)
        } else {
            fs.stat(input, function (err, stat) {
                if (err || !stat) {
                    result.message = '无法获取压缩资源！'
                    reject(result)
                }
                var r, w = fstream.Writer(output)
                if (stat && stat.isDirectory()) {
                    // 文件夹
                    r = fstream.Reader({
                        'path': input,
                        'type': 'Directory'
                    });
                } else if (stat && stat.isFile()) {
                    // 文件
                    r = fstream.Reader({
                        'path': input,
                        'type': 'File'
                    });
                } else {
                    result.message = '压缩资源失败！'
                    reject(result)
                }
                r.pipe(tar.Pack({
                    noRepository: true,
                    fromBase: true
                }))
                    .pipe(zlib.Gzip())
                    .pipe(w);
                r.on('end', () => {
                    result.status = 1
                    result.data = {
                        output: output
                    }
                    resolve(result);
                })
                r.on('error', (err) => {
                    result.message = '压缩资源失败！'
                    reject(result)
                })
            })
        }
    })
}

module.exports = {
    walk,
    mkdirSync,
    deleteFolder,
    clearFolder,
    compression
}