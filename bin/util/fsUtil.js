var fs = require('fs')
var path = require('path')
var archiver = require('archiver');

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

// 压缩，生成.zip
function compression(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        let result = {
            status: 0
        }
        if (!fs.existsSync(inputPath)) {
            result.message = '压缩资源不存在！'
            reject(result)
        } else {
            fs.stat(inputPath, function (err, stat) {
                if (err || !stat) {
                    result.message = '无法获取压缩资源！'
                    reject(result)
                }
                var output = fs.createWriteStream(outputPath);
                var archive = archiver('zip', {
                    zlib: { level: 9 } // Sets the compression level.
                });
                output.on('close', function () {
                    result.status = 1
                    result.data = {
                        output: outputPath
                    }
                    resolve(result);
                });
                archive.on('error', function (err) {
                    result.message = '压缩资源失败！'
                    reject(result)
                });
                archive.pipe(output);
                if (stat && stat.isDirectory()) {
                    archive.directory(inputPath + '\\', path.basename(inputPath));
                    archive.finalize();
                } else if (stat && stat.isFile()) {
                    archive.append(fs.createReadStream(inputPath), { name: path.basename(inputPath) });
                    archive.finalize();
                } else {
                    result.message = '压缩资源失败！'
                    reject(result)
                }
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