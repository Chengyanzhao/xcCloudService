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
    let authTable = db.table('auth')
    authTable.find({
        userId
    }).then(data => {
        let folderTree = {
            name: path.basename(baseDirector),
            file: [],
            folder: []
        }
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
    let valida = true
    // 获取用户权限
    commonService.getAuthInfo(userId, baseFolder).then(auth => {
        // 权限判定
        if (auth.createfolder) {
            let folderPath = path.resolve(baseFolder, newFolder)
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
    let valida = true
    // 权限判定
    let auth = {}
    if (auth.deleteFolder) {
        let folderPath = path.resolve(baseFolder, newFolder)
        if (!fs.existsSync(folderPath)) {
            result.status = true
        } else {
            fsUtil.deleteFolder(folderPath)
            result.status = true
        }
        done(result)
    } else {
        result.message = '您没有此目录下的删除目录权限！'
        done(result)
    }
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
    let valida = true
    // 权限判定
    let auth = {}
    if (auth.renameFolder) {
        let oldPath = path.resolve(baseFolder, oldName)
        if (!fs.existsSync(oldPath)) {
            result.message = '此文件夹不存在，请刷新后重试！'
        } else {
            let newPath = path.resolve(baseFolder, newName)
            fs.renameSync(oldPath, newPath)
            result.status = true
        }
        done(result)
    } else {
        result.message = '您没有此文件夹的重命名权限！'
        done(result)
    }
}

function propertyFolder() { }
/** --------------- 文件接口 ---------------- */
// 上传文件
function uploadFile(userId, opts, done) {

}
// 下载文件
function downloadFile(userId, opts, done) {

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
    let valida = true
    // 权限判定
    let auth = {}
    if (auth.renameFile) {
        let oldPath = path.resolve(baseFolder, oldName)
        if (!fs.existsSync(oldPath)) {
            result.message = '此文件不存在，请刷新后重试！'
        } else {
            let newPath = path.resolve(baseFolder, newName)
            fs.renameSync(oldPath, newPath)
            result.status = true
        }
        done(result)
    } else {
        result.message = '您没有此文件的重命名权限！'
        done(result)
    }
}
// 删除文件
function deleteFile(userId, opts, done) {
    let result = {
        status: false
    }
    let {
        baseFolder,
        delFile
    } = opts
    // 参数验证
    let valida = true
    // 权限判定
    let auth = {}
    if (auth.deleteFile) {
        let filePath = path.resolve(baseFolder, delFile)
        if (!fs.existsSync(filePath)) {
            result.status = true
        } else {
            fs.unlinkSync(filePath)
            result.status = true
        }
        done(result)
    } else {
        result.message = '您没有删除此文件的权限！'
        done(result)
    }
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
    deleteFile
}