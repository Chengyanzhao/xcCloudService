var crypto = require('crypto');
var jwt = require('jsonwebtoken')
var ObjectId = require('./objectId');

function guid() {
    return new ObjectId(new Date()).toString();
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
 * @param {any} data 
 * @param {any} privateKey 
 * @returns 
 */
function encodeToken(userId, privateKey) {
    return jwt.sign({
        userId
    }, privateKey, {
        algorithm: 'HS256',
        expiresIn: 30 * 60
    });
}

module.exports = {
    guid,
    verifyToken
};