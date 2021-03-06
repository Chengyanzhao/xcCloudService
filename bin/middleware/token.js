const path = require('path')
const crypt = require('../util/cryptUtil')
const config = require('../util/configUtil')

const secret = config.Config.getInstance().secret

function token(req, res, next) {
    if (req.path === '/signIn') {
        next()
        return
    }
    let token
    let authorization = req.headers.authorization || req.query.authorization
    if (authorization && authorization.startsWith('Bearer '))
        token = authorization.substr(7)
    if (!token) {
        res.json({
            status: false,
            data: 'login'
        })
    } else {
        crypt.verifyToken(token, secret).then(result => {
            if (result.status !== 'success' || !result.decoded) {
                res.json({
                    status: false,
                    data: 'login'
                })
                return
            }
            let decoded = result.decoded
            let now = new Date().getTime()
            let timeOut = now > decoded.exp * 1000
            if (timeOut) {
                res.json({
                    status: false,
                    data: 'login'
                })
            } else {
                req.userId = decoded.userId
                res.setHeader('authorization', 'Bearer ' + crypt.encodeToken(req.userId))
                next()
            }
        })
    }
}
module.exports = token