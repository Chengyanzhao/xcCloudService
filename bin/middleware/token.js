const path = require('path')
const crypt = require('../util/cryptUtil')
const config = require('../util/configUtil')

const secret = config.Config.getInstance().secret

function token(req, res, next) {
    if (req.path === '/users/signIn' || req.path === '/users/signUp') {
        next()
        return
    }
    let token
    let authorization = req.headers.authorization
    if (authorization && authorization.startsWith('Bearer '))
        token = authorization.substr(7)
    if (!token) {
        res.redirect('/login')
    } else {
        crypt.verifyToken(token, secret).then(result => {
            if (result.status !== 'success' || !result.decoded) {
                res.redirect('/login')
                return
            }
            let decoded = result.decoded
            let now = new Date().getTime()
            let timeOut = now > decoded.exp * 1000
            if (timeOut) {
                res.redirect('/login')
            } else {
                req.userId = decoded.userId
                res.authorization = crypt.encodeToken(req.userId)
                next()
            }
        })
    }
}
module.exports = token