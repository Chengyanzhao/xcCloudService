
const sqlite3 = require('sqlite3')
const config = require('../util/configUtil')
const sqlitePath = config.Config.getInstance().sqlitePath
const dbPromise = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqlitePath, () => {
        resolve(db)
    })
})
module.exports = dbPromise


