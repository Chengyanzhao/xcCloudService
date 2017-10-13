/**
 * cloud service 
 */
const path = require('path')
const fs = require('fs')
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
    fsUtil.mkdirSync(baseDirector)
}

// 获取授权fs
function authFolder(opts, userId, done) {
    let result = {
        status: false
    }
    let folderTree = {
        name: path.basename(baseDirector),
        file: [],
        folder: []
    }
    commonService.validAdmin(userId).then(isAdmin => {
        if (isAdmin) {
            let fullPath = baseDirector
            fsUtil.walk(fullPath, folderTree, (err, fsResult) => {
                result.status = true
                result.data = folderTree
                done(result)
            })
        } else {
            let authTable = db.table('auth')
            return authTable.find({
                userId
            })
        }
    }).then(data => {
        if (data && data.length >= 0) {
            data.forEach(item => {
                let authFolder = item.folder
                let auth = {
                    subinherit: item.subinherit,
                    subinherit: item.foldercreate,
                    folderdelete: item.folderdelete,
                    folderupload: item.folderupload,
                    folderdownload: item.folderdownload,
                    folderename: item.folderename,
                    filedownload: item.filedownload,
                    filedelete: item.filedelete,
                    filerename: item.filerename
                }
                let authfolderData = getFolderInfo(folderTree, baseDirector, authFolder, auth)
                if (!authfolderData) {
                    // 授权已失效，删除数据库中此授权
                    result.data = folderTree
                    done(result)
                } else {
                    let fullPath = baseDirector + authFolder
                    fsUtil.walk(fullPath, authfolderData, (err, fsResult) => {
                        result.status = true
                        result.data = folderTree
                        done(result)
                    })
                }
            })
        }
    }).catch(error => {
        result.message = error && typeof error === 'string' ? error : '系统错误！'
        done(result)
    })

}

function getFolderInfo(folderTree, root, authFolder, auth) {
    let authFolderArr = authFolder.split('/').filter(item => {
        return !!item
    });
    // 无效授权：授权目录已被删除。
    let invalid = false
    let curOperateFolder = folderTree
    let curRealPath = root
    for (let i = 0; i < authFolderArr.length; i++) {
        let authFolderItem = authFolderArr[i]
        curRealPath = path.resolve(curRealPath, authFolderItem);
        if (!fs.existsSync(curRealPath)) {
            invalid = true;
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
        curOperateFolder.folder.push(child)
        curOperateFolder = child
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
    let {
        baseFolder,
        newFolder
    } = opts
    // 参数验证
    if (!validaUtil.vString(baseFolder) || !validaUtil.vString(newFolder)) {
        result.message = '缺少参数！'
        done(result)
    } else if (!validaUtil.vFolderName(newFolder)) {
        result.message = '文件夹名不能包含下列任何字符:\/:*?"<>|'
        done(result)
    }
    // 获取用户权限
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
        // 权限判定
        if (auth.admin || auth.createfolder) {
            let baseFolderPath = path.resolve(path.dirname(baseDirector), baseFolder)
            if (!fs.existsSync(baseFolderPath)) {
                result.message = '当前操作目录不存在，请刷新后重试！'
                done(result)
                return
            }
            let folderPath = path.resolve(baseFolderPath, newFolder)
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
                // 实体目录创建文件夹
                result.status = true
            } else {
                result.message = '此文件夹已存在！'
            }
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
    let {
        baseFolder,
        delFolder
    } = opts
    // 参数验证
    if (!validaUtil.vString(baseFolder) || !validaUtil.vString(delFolder)) {
        result.message = '缺少参数！'
        done(result)
    }
    // 获取用户权限
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
        // 权限判定
        if (auth.admin || auth.deletefolder) {
            let folderPath = path.resolve(path.dirname(baseDirector), baseFolder, delFolder)
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
// 重命名文件夹
function renameFolder(userId, opts, done) {
    let result = {
        status: false
    }
    let {
        baseFolder,
        oldName,
        newName
    } = opts
    // 参数验证
    if (!validaUtil.vString(baseFolder) || !validaUtil.vString(oldName) || !validaUtil.vString(newName)) {
        result.message = '缺少参数！'
        done(result)
    }
    // 权限判定
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
        if (auth.admin || auth.renamefolder) {
            let baseFolderPath = path.resolve(path.dirname(baseDirector), baseFolder)
            let oldPath = path.resolve(baseFolderPath, oldName)
            let newPath = path.resolve(baseFolderPath, newName)
            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath)
                result.status = true
            } else {
                result.message = '此文件夹不存在，请刷新后重试！'
            }

            done(result)
        } else {
            result.message = '您没有此文件夹的重命名权限！'
            done(result)
        }
    })
}
// 下载文件夹
function downloadFolder(userId, opts, done) {
    let result = {
        status: false
    }
    let {
        folder,
    } = opts
    // 参数验证
    if (!validaUtil.vString(folder)) {
        result.message = '缺少参数！'
        done(result)
    }
    // 获取用户权限
    let baseFolder = path.dirname(folder)
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
        // 权限判定
        if (auth.admin || auth.downloadfolder) {
            let folderPath = path.resolve(baseFolder, delFolder)
            // 压缩zip
            // 返回前端
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

function propertyFolder() {}
/** --------------- 文件接口 ---------------- */
// 上传文件
function uploadFile(userId, opts, done) {

}
// 下载文件
function downloadFile(userId, opts) {
    let filePath = opts.filePath
    if (!validaUtil.vString(filePath)) {
        return ''
    }
    let rootPath = path.resolve(path.dirname(baseDirector), filePath)
    return fs.existsSync(rootPath) ? rootPath : ''

    fs.exists(rootPath, function (exist) {
        if (exist) {
            let paths = filePath.split('/')
            let name = paths[paths.length - 1]
            res.set({
                'Content-Type': 'application/octet-stream',
                "Content-Disposition": "attachment;filename=" + encodeURI(name)
            });
            fReadStream = fs.createReadStream(rootPath);
            fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
            fReadStream.on("end", function () {
                res.end();
            });
        } else {
            res.send("file not exist!");
            res.end();
        }
    })
}
// 文件重命名
function renameFile(userId, opts, done) {
    let result = {
        status: false
    }
    let {
        baseFolder,
        oldName,
        newName
    } = opts
    // 参数验证
    if (!validaUtil.vString(baseFolder) || !validaUtil.vString(oldName) || !validaUtil.vString(newName)) {
        result.message = '缺少参数！'
        done(result)
    }
    // 权限判定
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
        if (auth.admin || auth.renamefile) {
            let baseFolderPath = path.resolve(path.dirname(baseDirector), baseFolder)
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
// 删除文件
function deleteFile(userId, opts, done) {
    let result = {
        status: false
    }
    let {
        baseFolder,
        delFileName
    } = opts
    // 参数验证
    if (!validaUtil.vString(baseFolder) || !validaUtil.vString(delFileName)) {
        result.message = '缺少参数！'
        done(result)
    }
    // 获取用户权限
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
        // 权限判定
        if (auth.admin || auth.deletefolder) {
            let filePath = path.resolve(path.dirname(baseDirector), baseFolder, delFileName)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
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
    let {
        filePath
    } = opts
    // 参数验证
    if (!validaUtil.vString(filePath)) {
        result.message = '缺少参数！'
        done(result)
    }
    let realPath = path.resolve(path.dirname(baseDirector), filePath)
    if (fs.existsSync(realPath)) {
        let stat = fs.statSync(realPath)
        result.status = true
        result.data = {
            fileName: path.basename(realPath),
            filePath: filePath,
            fileSize: stat.size,
            cTime: stat.ctime,
            mTime: stat.mtime,
            aTime: stat.atime
        }
    } else {
        result.message = '此文件不存在！'
    }
    done(result)
}
module.exports = {
    authFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    propertyFolder,
    uploadFile,
    downloadFile,
    renameFile,
    deleteFile,
    attrFile
}