/**
 * cloud service
 */
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const fsUtil = require('../bin/util/fsUtil')
const db = require('../bin/database/db')
const cryptUtil = require('../bin/util/cryptUtil')
const authCloudUtil = require('../bin/util/authCloudUtil')
const commonService = require('./commonSevice')
const config = require('../bin/util/configUtil')
const validaUtil = require('../bin/util/validaUtil')

// 根目录
const baseDirector = config.Config.getInstance().baseFolder
if (!fs.existsSync(baseDirector)) {
  fse.ensureDirSync(baseDirector)
}

let tempDownloadDir = path.resolve(process.cwd(), 'download')
// 创建tempDownloadDir
function createTempDownloadDir() {
  if (!fs.existsSync(tempDownloadDir)) {
    fse.ensureDirSync(tempDownloadDir)
  }
}
createTempDownloadDir()

// 获取授权fs
function authFolder(opts, userId, done) {
  let result = {
    status: false
  }
  let { sortType = 1 } = opts
  if (typeof sortType === 'string') {
    sortType = +sortType
  }
  let folderTree = {
    name: path.basename(baseDirector),
    file: [],
    folder: []
  }
  let authTable = db.table('auth')
  commonService
    .validAdmin(userId)
    .then(isAdmin => {
      if (isAdmin) {
        return new Promise((resolve, reject) => {
          let fullPath = baseDirector
          fsUtil.walk(fullPath, folderTree, sortType, (err, fsResult) => {
            result.status = true
            result.data = folderTree
            resolve(result)
          })
        })
      } else {
        return authTable.find({
          userId
        })
      }
    })
    .then(data => {
      if (data !== result && data && data.length > 0) {
        let deleteAuthIds = []
        let cb = function() {
          if (deleteAuthIds && deleteAuthIds.length) {
            authTable
              .remove({
                id: deleteAuthIds
              })
              .then(() => {
                result.status = true
                result.data = folderTree
                done(result)
              })
          } else {
            result.status = true
            result.data = folderTree
            done(result)
          }
        }
        let pending = data.length
        data.forEach(item => {
          let authFolder = item.folder
          let auth = {
            subinherit: item.subinherit,
            foldercreate: item.foldercreate,
            folderdelete: item.folderdelete,
            folderupload: item.folderupload,
            folderdownload: item.folderdownload,
            folderrename: item.folderrename,
            filedownload: item.filedownload,
            filedelete: item.filedelete,
            filerename: item.filerename
          }
          let authfolderData = getFolderInfo(
            folderTree,
            baseDirector,
            authFolder,
            auth
          )
          if (!authfolderData) {
            // 授权已失效，删除数据库中此授权
            deleteAuthIds.push(item.id)
            if (!--pending) {
              cb()
            }
          } else {
            let fullPath = baseDirector + authFolder
            fsUtil.walk(fullPath, authfolderData, sortType, (err, fsResult) => {
              if (!--pending) {
                cb()
              }
            })
          }
        })
      } else {
        result.status = true
        result.data = folderTree
        done(result)
      }
    })
    .catch(error => {
      result.message = error && typeof error === 'string' ? error : '系统错误！'
      done(result)
    })
}

// 获取某一目录fs
function refreshFolder(opts, userId, done) {
  let result = {
    status: false
  }
  let { folder, sortType = 0 } = opts
  let realFolder = path.resolve(baseDirector, folder)
  let folderTree = {
    name: path.basename(folder),
    file: [],
    folder: []
  }
  let authTable = db.table('auth')
  commonService
    .validAdmin(userId)
    .then(isAdmin => {
      if (isAdmin) {
        return new Promise((resolve, reject) => {
          let fullPath = realFolder
          fsUtil.walk(fullPath, folderTree, sortType, (err, fsResult) => {
            result.status = true
            result.data = folderTree
            resolve(result)
          })
        })
      } else {
        return authTable.find({
          userId
        })
      }
    })
    .then(data => {
      if (data !== result && data && data.length > 0) {
        let deleteAuthIds = []
        let cb = function() {
          if (deleteAuthIds && deleteAuthIds.length) {
            authTable
              .remove({
                id: deleteAuthIds
              })
              .then(() => {
                result.status = true
                result.data = folderTree
                done(result)
              })
          } else {
            result.status = true
            result.data = folderTree
            done(result)
          }
        }
        let pending = data.length
        data.forEach(item => {
          let authFolder = item.folder
          let auth = {
            subinherit: item.subinherit,
            foldercreate: item.foldercreate,
            folderdelete: item.folderdelete,
            folderupload: item.folderupload,
            folderdownload: item.folderdownload,
            folderrename: item.folderrename,
            filedownload: item.filedownload,
            filedelete: item.filedelete,
            filerename: item.filerename
          }
          let authfolderData = getFolderInfo(
            folderTree,
            baseDirector,
            authFolder,
            auth
          )
          if (!authfolderData) {
            // 授权已失效，删除数据库中此授权
            deleteAuthIds.push(item.id)
            if (!--pending) {
              cb()
            }
          } else {
            let fullPath = baseDirector + authFolder
            fsUtil.walk(fullPath, authfolderData, sortType, (err, fsResult) => {
              if (!--pending) {
                cb()
              }
            })
          }
        })
      } else {
        result.status = true
        result.data = folderTree
        done(result)
      }
    })
    .catch(error => {
      result.message = error && typeof error === 'string' ? error : '系统错误！'
      done(result)
    })
}

function getFolderInfo(folderTree, root, authFolder, auth) {
  let authFolderArr = authFolder.split('/').filter(item => {
    return !!item
  })
  // 无效授权：授权目录已被删除。
  let invalid = false
  let curOperateFolder = folderTree
  let curRealPath = root
  for (let i = 0; i < authFolderArr.length; i++) {
    let authFolderItem = authFolderArr[i]
    curRealPath = path.resolve(curRealPath, authFolderItem)
    if (!fs.existsSync(curRealPath)) {
      invalid = true
      break
    }
    let child = {
      name: authFolderItem,
      file: [],
      folder: []
    }
    if (i === authFolderArr.length - 1) {
      child.auth = auth
    }
    let existFolder = curOperateFolder.folder.find(item => {
      if (item.name === child.name) {
        item.auth = child.auth
        return true
      } else {
        return false
      }
    })
    if (existFolder) {
      curOperateFolder = existFolder
    } else {
      curOperateFolder.folder.push(child)
      curOperateFolder = child
    }
  }
  // 填充文件、文件夹 curOperateFolder
  if (invalid) return false
  else return curOperateFolder
}

// 创建文件夹
function createFolder(userId, opts, done) {
  let result = {
    status: false
  }
  let { baseFolder, newFolder } = opts
  // 参数验证
  if (!validaUtil.vString(baseFolder) || !validaUtil.vString(newFolder)) {
    result.message = '缺少参数！'
    done(result)
  } else if (!validaUtil.vFolderName(newFolder)) {
    result.message = '文件夹名不能包含下列任何字符:/:*?"<>|'
    done(result)
  }
  // 获取用户权限
  commonService.getAuthInfo(userId, baseFolder).then(auth => {
    // 权限判定
    if (auth.admin || auth.createfolder) {
      let baseFolderPath = path.resolve(baseDirector, baseFolder)
      if (!fs.existsSync(baseFolderPath)) {
        result.message = '当前操作目录不存在，请刷新后重试！'
        done(result)
        return
      }
      let name = newFolder
      let folderPath = path.resolve(baseFolderPath, newFolder)
      let index = 1
      while (fs.existsSync(folderPath)) {
        name = `${newFolder}(${index})`
        folderPath = path.resolve(baseFolderPath, name)
        index++
      }
      fse.ensureDirSync(folderPath)
      result.status = true
      result.newName = name
      done(result)
    } else {
      result.message = '您没有此目录下的创建目录权限！'
      done(result)
    }
  })
}
// 删除文件夹
function deleteFolder(userId, opts, done) {
  let result = {
    status: false
  }
  let { baseFolder, delFolder } = opts
  // 参数验证 TODO  yangchanlgu 去掉!validaUtil.vString(baseFolder) 不需要判断根目录是否为空
  if (!validaUtil.vString(delFolder)) {
    result.message = '缺少参数！'
    done(result)
  } else {
    // 获取用户权限
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
      // 权限判定
      if (auth.admin || auth.deletefolder) {
        let folderPath = path.resolve(baseDirector, baseFolder, delFolder)
        if (fs.existsSync(folderPath)) {
          fsUtil.deleteFolder(folderPath)
        }
        result.status = true
        done(result)
      } else {
        result.message = '您没有此目录下的删除目录权限！'
        done(result)
      }
    })
  }
}
// 重命名文件夹
function renameFolder(userId, opts, done) {
  let result = {
    status: false
  }
  let { baseFolder, oldName, newName } = opts
  let authTable = db.table('auth')
  // 参数验证
  if (!validaUtil.vString(oldName) || !validaUtil.vString(newName)) {
    result.message = '缺少参数！'
    done(result)
  } else {
    // 权限判定
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
      if (auth.admin || auth.renamefolder) {
        let baseFolderPath = path.resolve(baseDirector, baseFolder)
        let oldPath = path.resolve(baseFolderPath, oldName)
        let newPath = path.resolve(baseFolderPath, newName)
        if (!fs.existsSync(oldPath)) {
          result.message = '此文件夹不存在，请刷新后重试！'
          done(result)
        } else if (fs.existsSync(newPath)) {
          result.message = '此名称已存在，请更换！'
          done(result)
        } else {
          fse.moveSync(oldPath, newPath)
          let query = { folder: `/${baseFolder}/${oldName}` }
          let update = { folder: `/${baseFolder}/${newName}` }
          authTable
            .update(query, update)
            .then(() => {
              result.status = true
              done(result)
            })
            .catch(error => {
              result.message = '系统错误，请刷新后重试！'
              done(result)
            })
        }
      } else {
        result.message = '您没有此文件夹的重命名权限！'
        done(result)
      }
    })
  }
}
// 下载文件夹
function downloadFolder(userId, opts, done) {
  let result = {
    status: false
  }
  let { folder } = opts
  // // 参数验证
  // if (!validaUtil.vString(folder)) {
  //   result.message = '缺少参数！'
  //   done(result)
  // }
  // 获取用户权限
  let baseFolder = folder
  commonService
    .getAuthInfo(userId, baseFolder)
    .then(auth => {
      // 权限判定
      if (auth.admin || auth.downloadfolder) {
        let folderPath = path.resolve(baseDirector, folder)
        if (!folder) {
          let pathArr = baseDirector.split('/')
          folder = pathArr[pathArr.length - 1]
        }
        let tempName = cryptUtil.guid()
        let output = path.resolve(tempDownloadDir, tempName + '.zip')
        // 压缩zip
        return fsUtil.compression(folderPath, output)
      } else {
        result.message = '您没有下载此目录的权限！'
        done(result)
      }
    })
    .then(compressRes => {
      if (compressRes.status) {
        let outputPath = compressRes.data.output
        result.status = true
        result.data = {
          filePath: fs.existsSync(outputPath) ? outputPath : '',
          fileRealName: path.basename(folder)
        }
        done(result)
      } else {
        result.message =
          compressRes.message || compressRes || '系统错误，请刷新后重试！'
        done(result)
      }
    })
}
/**
 * 文件夹属性
 * atime "访问时间" - 文件数据最近被访问的时间。 会被 mknod(2)、 utimes(2) 和 read(2) 系统调用改变。
 * mtime "修改时间" - 文件数据最近被修改的时间。 会被 mknod(2)、 utimes(2) 和 write(2) 系统调用改变。
 * ctime "变化时间" - 文件状态最近更改的时间（修改索引节点数据） 会被 chmod(2)、 chown(2)、 link(2)、 mknod(2)、 rename(2)、 unlink(2)、 utimes(2)、 read(2) 和 write(2) 系统调用改变。
 * birthtime "创建时间" - 文件创建的时间。 当文件被创建时设定一次。 在创建时间不可用的文件系统中，该字段可能被替代为 ctime 或 1970-01-01T00:00Z（如 Unix 的纪元时间戳 0）。 注意，该值在此情况下可能会大于 atime 或 mtime。 在 Darwin 和其它的 FreeBSD 衍生系统中，如果 atime 被使用 utimes(2) 系统调用显式地设置为一个比当前 birthtime 更早的值，也会有这种情况。
 * */
function attrFolder(opts, done) {
  /**
   *  文件夹占用空间、文件夹个数、文件个数
   */
  let result = {
    status: false
  }
  let { folderPath } = opts
  // 参数验证
  if (!validaUtil.vString(folderPath)) {
    result.message = '缺少参数！'
    done(result)
  }
  let realPath = path.resolve(baseDirector, folderPath)
  if (fs.existsSync(realPath)) {
    let stat = fs.statSync(realPath)
    fsUtil.getFolderProperty(realPath, data => {
      result.status = true
      result.data = Object.assign({}, data, {
        filePath: folderPath,
        fileSize: data.size,
        birthtime: stat.birthtime,
        cTime: stat.ctime,
        mTime: stat.mtime,
        aTime: stat.atime
      })

      done(result)
    })
  } else {
    result.message = '此文件不存在！'
    done(result)
  }
}
/** --------------- 文件接口 ---------------- */
// 上传文件
function uploadFile(userId, opts, done) {}
// 下载文件
function downloadFile(userId, opts, done) {
  let result = {
    status: false
  }
  let filePath = opts.filePath
  if (!validaUtil.vString(filePath)) {
    result.message = '缺少参数！'
    done(result)
  }
  let baseFolder = path.dirname(filePath)
  // 权限判定
  commonService.getAuthInfo(userId, baseFolder).then(auth => {
    if (auth.admin || auth.downloadfile) {
      let rootPath = path.resolve(baseDirector, filePath)
      result.status = true
      result.data = fs.existsSync(rootPath) ? rootPath : ''
    } else {
      result.message = '您没有下载此文件的权限！'
    }
    done(result)
  })
}
// 文件重命名
function renameFile(userId, opts, done) {
  let result = {
    status: false
  }
  let { baseFolder, oldName, newName } = opts
  // 参数验证
  if (!validaUtil.vString(oldName) || !validaUtil.vString(newName)) {
    result.message = '缺少参数！'
    done(result)
  } else {
    // 权限判定
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
      if (auth.admin || auth.renamefile) {
        let baseFolderPath = path.resolve(baseDirector, baseFolder)
        let oldPath = path.resolve(baseFolderPath, oldName)
        let newPath = path.resolve(baseFolderPath, newName)
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath)
          result.status = true
        } else {
          result.message = '此文件不存在，请刷新后重试！'
        }
        done(result)
      } else {
        result.message = '您没有此文件的重命名权限！'
        done(result)
      }
    })
  }
}
// 删除文件
function deleteFile(userId, opts, done) {
  let result = {
    status: false
  }
  let { baseFolder, delFileNames } = opts
  // // 参数验证
  // if (!validaUtil.vString(baseFolder)) {
  //   result.message = '缺少参数！'
  //   done(result)
  // }
  delFileNames = delFileNames.split('*')
  // 获取用户权限
  commonService.getAuthInfo(userId, baseFolder).then(auth => {
    // 权限判定
    if (auth.admin || auth.deletefolder) {
      delFileNames.forEach(delFileName => {
        let filePath = path.resolve(baseDirector, baseFolder, delFileName)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
      result.status = true
      done(result)
    } else {
      result.message = '您没有删除此文件的权限！'
      done(result)
    }
  })
}
// 文件属性
function attrFile(opts, done) {
  let result = {
    status: false
  }
  let { filePath } = opts
  // 参数验证
  if (!validaUtil.vString(filePath)) {
    result.message = '缺少参数！'
    done(result)
  }
  let realPath = path.resolve(baseDirector, filePath)
  if (fs.existsSync(realPath)) {
    let stat = fs.statSync(realPath)
    result.status = true
    result.data = {
      fileName: path.basename(realPath),
      filePath: filePath,
      fileSize: stat.size,
      cTime: stat.ctime,
      mTime: stat.mtime,
      aTime: stat.atime,
      birthtime: stat.birthtime
    }
  } else {
    result.message = '此文件不存在！'
  }
  done(result)
}
module.exports = {
  authFolder,
  refreshFolder,
  createFolder,
  deleteFolder,
  renameFolder,
  downloadFolder,
  attrFolder,
  uploadFile,
  downloadFile,
  renameFile,
  deleteFile,
  attrFile
}
