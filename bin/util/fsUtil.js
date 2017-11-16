var fs = require('fs')
var path = require('path')
var archiver = require('archiver')

var _sortType = {
  name_order: 1,
  name_reverseOrder: 2,
  size_order: 3,
  size_reverseOrder: 4,
  type_order: 5,
  type_reverseOrder: 6,
  time_order: 7,
  time_reverseOrder: 8
}
var walk = function(dir, authfolderData, sortType, done) {
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    // authfolderData.name = path.basename(authfolderData.name) || path.basename(dir)
    // authfolderData.child = []
    // authfolderData.file = []
    var pending = list.length
    if (!pending) return done(null, authfolderData)
    list.forEach(function(file) {
      file = path.resolve(dir, file)
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          var childItem = {
            name: path.basename(file),
            _sortProperty: {
              time: stat.mtimeMs
            }
          }
          if (authfolderData.folder) {
            let exist = authfolderData.folder.find(item => {
              return item.name === childItem.name
            })
            if (!exist) {
              authfolderData.folder.push(childItem)
            }
          } else {
            authfolderData.folder = [childItem]
          }
          walk(file, childItem, sortType, function(err, res) {
            // authfolderData = authfolderData.concat(res);
            if (!--pending) {
              fsSort(authfolderData, sortType)
              done(null, authfolderData)
            }
          })
        } else {
          let fileName = path.basename(file)
          let extName = path.extname(file)
          let fileObj = {
            fileName,
            _sortProperty: {
              size: stat.size,
              time: stat.mtimeMs,
              type: extName ? extName.charCodeAt(0) : '0'
            }
          }
          // authfolderData.file ? authfolderData.file.push(fileName) : authfolderData.file = [fileName]
          authfolderData.file
            ? authfolderData.file.push(fileObj)
            : (authfolderData.file = [fileObj])
          authfolderData.file.sort()
          // authfolderData.push(file);
          if (!--pending) {
            fsSort(authfolderData, sortType)
            done(null, authfolderData)
          }
        }
      })
    })
  })
}
function fsSort(authfolderData, sortType) {
  // 文件夹
  if (authfolderData.folder && authfolderData.folder.length) {
    authfolderData.folder.sort((a, b) => {
      if (
        sortType === _sortType.name_order ||
        sortType === _sortType.size_order ||
        _sortType.type_order
      ) {
        return a.name.charCodeAt(0) - b.name.charCodeAt(0)
      } else if (
        sortType === _sortType.name_reverseOrder ||
        sortType === _sortType.size_reverseOrder ||
        _sortType.type_reverseOrder
      ) {
        return b.name.charCodeAt(0) - a.name.charCodeAt(0)
      } else if (sortType === _sortType.time_order) {
        return a._sortProperty.time - b._sortProperty.time
      } else if (sortType === _sortType.time_reverseOrder) {
        return b._sortProperty.time - a._sortProperty.time
      } else {
        return 0
      }
    })
    // 拆解_sortProperty
    authfolderData.folder.forEach(item => {
      delete item._sortProperty
    })
  }
  // 文件
  if (authfolderData.file && authfolderData.file.length) {
    authfolderData.file.sort((a, b) => {
      if (sortType === _sortType.name_order) {
        return a.fileName.charCodeAt(0) - b.fileName.charCodeAt(0)
      } else if (sortType === _sortType.name_reverseOrder) {
        return b.fileName.charCodeAt(0) - a.fileName.charCodeAt(0)
      } else if (sortType === _sortType.size_order) {
        return a._sortProperty.size - b._sortProperty.size
      } else if (sortType === _sortType.size_reverseOrder) {
        return b._sortProperty.size - a._sortProperty.size
      } else if (sortType === _sortType.time_order) {
        return a._sortProperty.time - b._sortProperty.time
      } else if (sortType === _sortType.time_reverseOrder) {
        return b._sortProperty.time - a._sortProperty.time
      } else if (sortType === _sortType.type_order) {
        return a._sortProperty.type - b._sortProperty.type
      } else if (sortType === _sortType.type_reverseOrder) {
        return b._sortProperty.type - a._sortProperty.type
      } else {
        return 0
      }
    })
    // 拆解_sortProperty
    authfolderData.file = authfolderData.file.map(item => {
      return item.fileName
    })
  }
}
// 删除文件夹
function deleteFolder(dirPath) {
  var files = []
  if (fs.existsSync(dirPath)) {
    files = fs.readdirSync(dirPath)
    files.forEach(function(file, index) {
      var curPath = path.resolve(dirPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolder(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dirPath)
  }
}

// 清空文件夹内文件
function clearFolder(dirPath) {
  var files = []
  if (fs.existsSync(dirPath)) {
    files = fs.readdirSync(dirPath)
    files.forEach(function(file, index) {
      var curPath = path.resolve(dirPath, file)
      if (!fs.lstatSync(curPath).isDirectory()) {
        // recurse
        fs.unlinkSync(curPath)
      }
    })
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
      fs.stat(inputPath, function(err, stat) {
        if (err || !stat) {
          result.message = '无法获取压缩资源！'
          reject(result)
        }
        var output = fs.createWriteStream(outputPath)
        var archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
        })
        output.on('close', function() {
          result.status = 1
          result.data = {
            output: outputPath
          }
          resolve(result)
        })
        archive.on('error', function(err) {
          result.message = '压缩资源失败！'
          reject(result)
        })
        archive.pipe(output)
        if (stat && stat.isDirectory()) {
          archive.directory(inputPath + '\\', path.basename(inputPath))
          archive.finalize()
        } else if (stat && stat.isFile()) {
          archive.append(fs.createReadStream(inputPath), {
            name: path.basename(inputPath)
          })
          archive.finalize()
        } else {
          result.message = '压缩资源失败！'
          reject(result)
        }
      })
    }
  })
}

// 获取文件夹信息
function getFolderProperty(folderPath, done) {
  let result = {
    folderCount: 0,
    fileCount: 0,
    size: 0
  }
  if (folderPath && fs.existsSync(folderPath)) {
    fs.readdir(folderPath, function(err, list) {
      if (list && list.length) {
        let pending = list.length
        list.forEach(function(file) {
          file = path.resolve(folderPath, file)
          let stat = fs.statSync(file)
          if (stat && stat.isDirectory()) {
            result.folderCount++
            getFolderProperty(file, childResult => {
              result.folderCount += childResult.folderCount
              result.fileCount += childResult.fileCount
              result.size += childResult.size
              if (!--pending) {
                done(result)
              }
            })
          } else if (stat && stat.isFile()) {
            result.fileCount++
            result.size += stat.size
            if (!--pending) {
              done(result)
            }
          } else {
            if (!--pending) {
              done(result)
            }
          }
        })
      } else {
        done(result)
      }
    })
  } else {
    done(result)
  }
}

module.exports = {
  walk,
  deleteFolder,
  clearFolder,
  compression,
  getFolderProperty
}
