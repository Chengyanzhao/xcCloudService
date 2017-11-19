const config = require('../util/configUtil')
const DATABASE_ENV = config.Config.getInstance().dataBase // mysql/sqlite
const database = DATABASE_ENV === 'mysql' ? require('../connection/mysqlConn') : require('../connection/sqliteConn')

function execute(sqlStr) {
    if (DATABASE_ENV === 'mysql') {
        const pool = database
        return new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {
                if (err) reject(err)
                else {
                    connection.query(sqlStr, function (err, rows) {
                        err ? reject(err) : resolve(rows)
                        connection.release();
                    });
                }
            });
        })
    } else {
        return new Promise((resolve, reject) => {
            let dbPromise = database
            dbPromise.then((db) => {
                let isQuery = sqlStr.indexOf('select') === 0 || sqlStr.indexOf('SELECT') === 0
                // let fun = isQuery ? db.all : db.run
                if (isQuery) {
                    db.all(sqlStr, (err, res) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(res)
                        }
                    })
                } else {
                    db.run(sqlStr, (err, res) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(res)
                        }
                    })
                }
            })
        })

    }
}



module.exports = {
    execute
}