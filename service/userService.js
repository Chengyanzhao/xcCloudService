/**
 * user service 
 */
const db = require('../bin/database/db')
const poolQuery = require('../bin/util/promise-mysql')
var cryptUtil = require('../bin/util/cryptUtil')

function signUp(opts, done) {
    let result = {
        status: false
    }
    let {
        userName,
        passWord,
        nickName,
        orgId,
        sex,
        email,
        mobilePhone,
        telePhone
    } = opts
    let userId = cryptUtil.guid()
    let userTable = db.table('user')
    userTable.find({
        username: userName
    }).then(data => {
        if (data && data.length && data.length > 0) {
            return Promise.reject('此用户名已被占用！');
        }
    }).then((qwe) => {
        return userTable.add({
            userid: userId,
            username: userName,
            password: passWord,
            nickname: nickName,
            orgid: orgId,
            sex: sex,
            email: email,
            mobilephone: mobilePhone,
            telephone: telePhone
        })
    }).then(data => {
        result.status === true
        done(result)
    }).catch(error => {
        result.message = error && typeof error === 'string' ? error : '系统错误！'
        done(result)
    })
}

function signIn(opts, done) {
    let result = {
        status: false
    }
    let {
        userName,
        passWord
    } = opts
    let userTable = db.table('user')
    userTable.findOne({
        username: userName
    }).then(data => {
        if (!data || !data.length || data.length === 0) {
            return Promise.reject('用户不存在！')
        }
        if (data[0].password !== passWord) {
            return Promise.reject('密码错误！')
        }
        result.status = true
        let userId = data.userId
        let token = cryptUtil.encodeToken(userId)
        result.token = token
        done(result)
    }).catch(error => {
        result.message = error && typeof error === 'string' ? error : '系统错误！'
        done(result)
    })
}

module.exports = {
    signUp,
    signIn
}