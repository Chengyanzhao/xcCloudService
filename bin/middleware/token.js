var path = require('path')
var crypt = require('../utils/cryptUtil')
var config = require('../util/configUtil')

const secret = config.Config.getInstance().secret

function tokenVerify(req, res, next) {
    let token
    let authorization = req.headers.authorization
    if (authorization && authorization.startsWith('token'))
        token = authorization.substr(5)
    if (!token) {
        res.redirect('/login');
        return
    }
    crypt.verifyToken(token, secret)
        .then(result => {
            if (result.status !== 'success' || !result.decoded) {
                res.redirect('/login');
                return
            }
            let decoded = result.decoded
            let now = new Date().getTime()
            if (now < decoded.exp * 1000) {
                // 查库对比token是否匹配
                dbModel.userModel.findOne({
                    username: decoded.data.username
                }, (err, data) => {
                    if (err || !data || !data.token) {
                        res.sendFile(mobilIndex);
                        return
                    } else {
                        if (data.token === token) {
                            next()
                        } else {
                            res.sendFile(mobilIndex);
                            return
                        }
                    }
                })
            } else {
                res.sendFile(mobilIndex);
                return
            }
        })
}

module.exports = {
    tokenVerify
}