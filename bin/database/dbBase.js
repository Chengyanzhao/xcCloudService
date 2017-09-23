const DATABASE_ENV = config.Config.getInstance().dataBase // mysql/access

// const pool = DATABASE_ENV === 'mysql' ? a : b
const pool = require('../connection/mysqlConn')

function execute(sqlStr) {
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
}

module.exports = {
    execute
}