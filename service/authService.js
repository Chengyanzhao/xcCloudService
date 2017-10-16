/**
 * auth service 
 */
const db = require('../bin/database/db')
const poolQuery = require('../bin/util/promise-mysql')
const cryptUtil = require('../bin/util/cryptUtil')

// 获取目录授权
function folderAuth(opts, done) {
    let result = {
        status: false
    }
    let {
        folder
    } = opts
    let authTable = db.table('auth')
    authTable.find({
        folder
    }).then(data => {
        result.status = true
        result.data = data
        done(result)
    }).catch(err => {
        result.message = '系统错误！'
        done(result)
    })
}

// 添加/更新授权人员
function addOrUpdateAuth(opts, done) {
    let result = {
        status: false
    }
    let {
        userId,
        folder,
        subinherit = 0,
        foldercreate = 0,
        folderdelete = 0,
        folderupload = 0,
        folderdownload = 0,
        folderename = 0,
        filedownload = 0,
        filedelete = 0,
        filerename = 0
    } = opts
    let authTable = db.table('auth')
    authTable.findOne({
        folder,
        userId
    }).then(data => {
        let insertData = {
            userId,
            folder,
            subinherit,
            foldercreate,
            folderdelete,
            folderupload,
            folderdownload,
            folderename,
            filedownload,
            filedelete,
            filerename
        }
        if (!data || !data.length || data.length === 0) {
            // 此目录 userId 不存在，则为新授权
            return authTable.add(insertData)
        } else {
            // 修改旧授权
            return authTable.update(data, insertData)
        }
        if (data[0].password !== passWord) {
            return Promise.reject('密码错误！')
        }
    }).then(results => {
        result.status === true
        done(result)
    }).catch(error => {
        result.message = error && typeof error === 'string' ? error : '系统错误！'
        done(result)
    })
}

// 删除授权人员
function deleteAuthUser(opts, done) {

}

module.exports = {
    folderAuth,
    addOrUpdateAuth
}