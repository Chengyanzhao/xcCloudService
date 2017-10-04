/**
 * cloud service 
 */
const path = require('path')
const fs = require('fs')
const poolQuery = require('../bin/util/promise-mysql')
const cryptUtil = require('../bin/util/cryptUtil')
var config = require('../bin/util/configUtil')
var fsUtil = require('../bin/util/fsUtil')
// 根目录
const baseDirector = config.Config.getInstance().baseFolder

function authFolder(opts, callback) {
    let result = {
        status: false
    }
    let {
        personId
    } = opts
    poolQuery.query(`select * from auth where personId='${personId}'`).then((results, fields) => {
        let folderTree = {
            name: path.basename(baseDirector),
            file: [],
            folder: []
        }
        if (results && results.length >= 0) {
            results.forEach(item => {
                let authFolder = item.folder
                let authfolderData = getFolderInfo(folderTree, baseDirector, authFolder)
                if (!authfolderData) {
                    // 授权已失效，删除数据库中此授权
                    result.data = folderTree
                    callback(result)
                } else {
                    let fullPath = baseDirector + authFolder
                    fsUtil.walk(fullPath, authfolderData, (err, fsResult) => {
                        result.status = true
                        result.data = folderTree
                        callback(result)
                    })
                }
            })
        }
    }).catch(error => {
        result.status = false
        result.message = '系统错误'
        callback(result)
    })
}

function getFolderInfo(folderTree, root, authFolder) {
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
        authKey,
        baseFolder,
        newFolder
    } = opts
    // 参数验证
    let valida = true
    // 权限判定
    let auth = {}
    if (auth.createFolder) {
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
function propertyFolder(){}
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