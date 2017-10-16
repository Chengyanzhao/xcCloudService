const db = require('../bin/database/db')
let logTable = db.table('log')

function log(userId, action, info) {
    return logTable.add({
        userid: userId,
        time: new Date(),
        action: action,
        info: info
    })
}

module.exports = { log }