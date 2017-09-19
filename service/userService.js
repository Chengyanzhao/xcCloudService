/**
 * user service 
 */
const poolQuery = require('../bin/util/promise-mysql')
var cryptUtil = require('../bin/util/cryptUtil')

function signUp(opts, callback) {
    let result = {
        status: false
    }
    let {
        userName,
        passWord,
        personName,
        sex,
        email,
        mobilephone,
        telephone
    } = opts;
    // 参数验证
    // 判断用户是否存在
    poolQuery.query(`select * from user where userName='${userName}'`).then((results, fields) => {
            if (results && results.length > 0) {
                // 用户名已存在
                result.message = '此用户名已被占用！'
                callback(result);
            } else {
                var personId = cryptUtil.guid();
                var orgId = '';
                var promise = poolQuery.query(`insert into user (personId,personName,orgId,userName,passWord,sex,email,mobilephone,telephone) 
                values("${personId}","${personName}","${orgId}","${userName}","${passWord}","${sex}","${email}","${mobilephone}","${telephone}");`)
                promise.then((results, fields) => {
                    result.status = true
                    callback(result);
                }).catch(insertError => {
                    result.message = '系统错误！'
                    callback(result);
                })
            }
        })
        .catch(error => {
            result.message = '系统错误！'
            callback(result);
        })
}

function signIn(opts, callback) {
    let result = {
        status: false
    }
    let {
        userName,
        passWord
    } = opts

    let priomise = poolQuery.query(`select * from user where username='${userName}' and password='${passWord}'`)
    priomise.then((results, fields) => {
        if (!results || results.length === 0) result.message = '用户名或密码错误！'
        else result.status = true
        callback(result)
    }).catch(error => {
        result.message = '系统错误！'
        callback(result)
    })
}

module.exports = {
    signUp,
    signIn
}