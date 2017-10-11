const db = require('../bin/database/db')
const authCloudUtil = require('../bin/util/authCloudUtil')

// 获取用户授权信息
function getAuthInfo(userId, baseFolder) {
    // 判断是否为管理员
    let userTable = db.table('user')
    return userTable.findOne({
        userId: userId
    }).then(userData => {
        if (userData.admin) {
            return Promise.resolve({
                admin: userData.admin
            })
        } else {
            let authTable = db.table('auth')
            return authTable.find({
                userid: userId
            })
        }
    }).then(data => {
        let resData = data.admin ? data : authCloudUtil.getAuthInfo(data, baseFolder)
        return Promise.resolve(resData)
    }).catch(error => {
        return Promise.reject(error)
    })
}

// 管理员验证
function validAdmin(userId) {
    let userTable = db.table('user')
    return userTable.findOne({
        userid: userId
    }).then(data => {
        return Promise.resolve(data.admin === '1')
    }).catch(error => {
        return Promise.reject()
    })
}

module.exports = {
    getAuthInfo,
    validAdmin
}