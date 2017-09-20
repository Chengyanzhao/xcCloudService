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
module.exports = {
    authFolder
}