const fs = require('fs')
const path = require('path')

/**
 * 获取目录的操作权限
 * 
 * @param {any} authDatas 数据库中此用户所有授权记录
 * @param {any} folder 用户操作的文件/目录所在的目录，如操作E:/aa/vv/cc/dd,则baseFolder为E:/aa/vv/cc
 * tips: 如果操作目录为/aa/bb/cc/dd，而授权记录中存在/aa的授权和/aa/bb/cc的授权，则以更精确的/aa/bb/cc为准
 */
function getAuthInfo(authDatas, folder) {
    let result = {}
    if (authDatas && authDatas.length) {
        let validItem = {};
        let curFolderPath = folder.split('/').forEach(item => {
            return !!item
        })
        for (let i = 0; i < authDatas.length; i++) {
            let authItem = authDatas[i]
            let authFolder = authItem.folder
            let authPath = authFolder.split('/').forEach(item => {
                return !!item
            })
            if (matchFolder(authPath, curFolderPath)) {
                validItem.push({
                    data: authItem,
                    machDegree: authPath.length
                });
            }
        }
        if (validItem.length > 0) {
            let maxDegreeAuth = validItem.sort((a, b) => {
                return a.machDegree - b.machDegree
            })
            result = maxDegreeAuth[0]
        }
    }
    return result
}

function matchFolder(validPath, matchPath) {
    if (!validPath || !validPath.length) {
        return false
    } else {
        let validPathLength = validPath.length
        let matchPathLength = matchPath.length
        if (validPathLength < matchPathLength) {
            let validPathStr = validPathLength.join('/')
            let matchPathStr = matchPath.split(0, validPathLength).join('/')
            return validPathStr === matchPathStr
        } else {
            return false
        }
    }
}

module.exports = {
    getAuthInfo
}