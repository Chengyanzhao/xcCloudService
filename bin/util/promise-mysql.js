var pool = require('../connection/mysqlConn')

function query(queryStr) {
    return new Promise((resolve, reject) => {
        pool.pool.query(queryStr, (error, results, fields) => {
            if (error) reject(error)
            else resolve(results, fields)
        })
    })
}
module.exports = {
    query
}