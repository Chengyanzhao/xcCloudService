var mysql = require('mysql');
var config = require('../util/configUtil');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.Config.getInstance().mysqlHost,
    user: config.Config.getInstance().mysqlUser,
    password: config.Config.getInstance().mysqlPassword,
    database: config.Config.getInstance().mysqlDataBase,
    insecureAuth: true
});
pool.getConnection(function (err, connection) {
    if (err || !connection)
        throw err;
})
module.exports = {
    pool
}