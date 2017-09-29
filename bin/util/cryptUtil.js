const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const ObjectId = require('./objectId')
const config = require('../util/configUtil')

const secret = config.Config.getInstance().secret

function guid() {
    return new ObjectId(new Date()).toString()
}
/**
 * 解译jwt token
 * 
 * @param {String} token 
 * @param {String} privateKey 
 * @returns {Promise(Object)} token source info
 */
function verifyToken(token, privateKey) {
    return new Promise((resolve) => {
        jwt.verify(token, privateKey, {
            algorithm: 'HS256',
            clockTolerance: '200'
        }, (err, decoded) => {
            err ? resolve({
                status: 'failuar'
            }) : resolve({
                status: 'success',
                decoded
            })
        })
    })
}
/**
 * 生成token
 * 
 * @param {String} userId 
 * @returns 
 */
function encodeToken(userId) {
    return jwt.sign({
        userId
    }, secret, {
        algorithm: 'HS256',
        expiresIn: 30 * 60
    })
}

module.exports = {
    guid,
    verifyToken,
    encodeToken
}