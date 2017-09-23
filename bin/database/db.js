const pool = require('../connection/mysqlConn')
const dbBase = require('./dbBase')
const Table = require('./dbTable')

const db = {}
db.table = function (tableName) {
    return new Table(tableName)
}
db.query = function (sqlStr) {
    return dbBase.execute(sqlStr);
}
module.exports = db