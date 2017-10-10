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

module.export = { getAuthInfo }