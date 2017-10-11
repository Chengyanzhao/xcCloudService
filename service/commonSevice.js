const db = require('../bin/database/db')
const authCloudUtil = require('../bin/util/authCloudUtil')

function getAuthInfo(userId, baseFolder) {
    return new Promise((resolve, reject) => {
        let authTable = db.table('auth')
        authTable.find({
            userid: userId
        }).then(data => {
            resolve(authCloudUtil.getAuthInfo(data, baseFolder))
        }).catch(error => {
            reject(error)
        })
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

module.export = {
    getAuthInfo,
    validAdmin
}