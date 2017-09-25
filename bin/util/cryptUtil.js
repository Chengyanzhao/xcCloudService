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

module.exports = {
    guid,
    verifyToken
};