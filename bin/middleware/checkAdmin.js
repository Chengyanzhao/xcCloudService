const db = require('../database/db')

function checkAdmin(req, res, next) {
    let userId = req.userId
    let userTable = db.table('user')
    let result = {
        status: false
    }
    userTable.findOne({
        userid: userId
    }).then(data => {
        if (+data.admin === 1) {
            req.isAdmin = true
            next()
        } else {
            result.message = '您没有此操作的权限！'
            res.json(result)
        }
    }).catch(() => {
        result.message = '您没有此操作的权限！'
        res.json(result)
    })
}

module.exports = checkAdmin