/**
 * user service 
 */
const db = require('../bin/database/db')
const cryptUtil = require('../bin/util/cryptUtil')
const commonService = require('./commonSevice')

/**
 * 后端启动时，判断数据库user表中是否存在管理员账户。
 */
function adminAccount() {
    let userTable = db.table('user')
    userTable.findOne({
        admin: 1
    }).then(data => {
        if (!data) {
            let userName = 'admin',
                passWord = 'admin',
                nickName = '超级管理员',
                userId = cryptUtil.guid()
            userTable.add({
                userid: userId,
                admin: 1,
                username: userName,
                password: passWord,
                nickname: nickName,
            })
        }
    }).catch(error => {

    })
}
// 添加用户
function signUp(userId, opts, done) {
    let result = {
        status: false
    }
    let userTable = db.table('user')
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
    let newUserId = cryptUtil.guid()
    // 验证是否为管理员
    commonService.validAdmin(userId).then(isAdmin => {
        if (!isAdmin) {
            return Promise.reject('您没有管理员权限！')
        } else {
            return userTable.find({
                username: userName
            })
        }
    }).then(data => {
        if (data && data.length && data.length > 0) {
            return Promise.reject('此用户名已被占用！');
        }
    }).then(() => {
        console.log('add user')
        return userTable.add({
            userid: newUserId,
            username: userName,
            password: passWord,
            nickname: nickName,
            orgid: orgId,
            sex: sex,
            email: email,
            mobilephone: mobilePhone,
            telephone: telePhone,
            admin: 0
        })
    }).then(data => {
        result.status = true
        result.data = {
            userName: userName
        }
        done(result)
    }).catch(error => {
        result.message = error && typeof error === 'string' ? error : '系统错误！'
        done(result)
    })
}
// 登录
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
        if (!data) {
            return Promise.reject('用户不存在！')
        }
        if (data.password !== passWord) {
            return Promise.reject('密码错误！')
        }
        result.status = true
        let userId = data.userid
        let token = 'Bearer ' + cryptUtil.encodeToken(userId)
        result.token = token
        result.userId = userId
        done(result)
    }).catch(error => {
        result.message = error && typeof error === 'string' ? error : '系统错误！'
        done(result)
    })
}
// 更新用户信息
function updateUser(opts, done) {
    let result = {
        status: false
    }
    let {
        userId,
        userName,
        passWord,
        nickName,
        orgId,
        sex,
        email,
        mobilePhone,
        telePhone
    } = opts
    let userTable = db.table('user')
    userTable.update({
        userId
    }, {
            username: userName,
            password: passWord,
            nickname: nickName,
            orgid: orgId,
            sex: sex,
            email: email,
            mobilephone: mobilePhone,
            telephone: telePhone
        }).then((res) => {
            result.status = true
            done(result)
        }).catch((res) => {
            done(result)
        })
}

// 删除用户
function deleteUser(userId, opts, done) {
    let result = {
        status: false
    }
    let {
        deleteUserId
    } = opts
    let userName
    let userTable = db.table('user')
    userTable.findOne({
        userid: deleteUserId
    }).then(data => {
        userName = data.username
        return userTable.remove({
            userid: deleteUserId
        })
    }).then(() => {
        result.status = true
        result.userName = userName
        done(result)
    }).catch((res) => {
        done(result)
    })
}
// 个人信息
function userInfo(userId, done) {
    let result = {
        status: false
    }
    let userTable = db.table('user')
    userTable.findOne({
        userId
    }).then(data => {
        result.status = true
        result.data = data
        done(result)
    }).catch(err => {
        result.message = '系统错误！'
        done(result)
    })
}
// 修改密码
function updatePassword(userId, opts, done) {
    let result = {
        status: false
    }
    let {
        newPwd
    } = opts
    let userTable = db.table('user')
    userTable.update({
        userId
    }, {
            password: newPwd
        }).then(result => {
            result.status = true
            done(result)
        }).catch(err => {
            result.message = '系统错误！'
            done(result)
        })
}
/**
 * 根据条件获取用户
 * 
 * @param {any} opts 
 * @param {any} done 
 */
function getUserByOpts(opts, done) {
    let {
        nickname,
        orgid
    } = opts
    // 这里排除管理员
    let query = {
        admin: 0
    }
    if (nickname) {
        query = {
            nickname
        }
    }
    if (orgid) {
        if (query) {
            query.orgid = orgid
        } else {
            query = {
                orgid
            }
        }
    }

    let userTable = db.table('user')
    let result = {
        status: false
    }
    userTable.like(query).then((res) => {
        result.status = true
        result.data = res
        done(result)
    }).catch(() => {
        result.message = '获取失败'
        done(result)
    })
}
module.exports = {
    adminAccount,
    signUp,
    signIn,
    userInfo,
    updatePassword,
    getUserByOpts,
    updateUser,
    deleteUser
}