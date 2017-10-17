var express = require('express')
var router = express.Router()
var cryptUtil = require('../bin/util/cryptUtil')
var userService = require('../service/userService')
var logSercice = require('../service/logService')

/** 处理管理员账户 */
userService.adminAccount()

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/**
 * 添加用户/注册
 * 
 * @param {String} username 登录名
 * @param {String} password 登录密码
 * @param {String} nickname 昵称
 * @param {String} orgid {default:Null} 所属组织id
 * @param {String} sex 性别
 * @param {String} email 邮箱
 * @param {String} mobilephone 手机
 * @param {String} telephone 电话
 */
router.post('/signUp', function (req, res, next) {
  let userId = req.userId
  let opts = req.body;
  userService.signUp(userId, opts, result => {
    logSercice.log(req.userId, 'adduser', result.status === false ? result.message : result.data.userName)
    res.json(result);
  })
})

/**
 * 登录
 * 
 * @param {String} username 登录名
 * @param {String} password 登录密码
 */
router.post('/signIn', function (req, res, next) {
  let opts = req.body
  userService.signIn(opts, result => {
    if (result.status === true) {
      logSercice.log(result.userName, 'logIn', result.status === false ? result.message : '')
    }
    res.json(result);
  })
})
/**
 * 修改密码
 * 
 * @param {String} username 登录名
 * @param {String} password 登录密码
 */
router.post('/updatePassword', function (req, res, next) {
  let userId = req.userId
  let opts = req.body
  userService.updatePassword(userId, opts, result => {
    logSercice.log(userId, 'updatePassword', result.status === false ? result.message : '')
    res.json(result)
  })
})
// 个人信息
router.get('/userInfo', function (req, res, next) {
  let userId = req.userId
  userService.userInfo(userId, result => {
    res.json(result)
  })
})
// 获取用户信息
router.get('/getUserByOpts', function (req, res, next) {
  let opts = req.query
  userService.getUserByOpts(opts, result => {
    res.json(result)
  })
})
// 更新用户信息
router.post('/updateUser', function (req, res, next) {
  let opts = req.body
  userService.updateUser(opts, result => {
    logSercice.log(userId, 'updateUserInfo', result.status === false ? result.message : '')
    res.json(result)
  })
})
// 删除用户
router.post('/deleteUser', function (req, res, next) {
  let userId = req.userId
  let opts = req.body
  userService.deleteUser(userId, opts, result => {
    logSercice.log(userId, 'deleteUser', result.status === false ? result.message : result.userName)
    res.json(result)
  })
})
module.exports = router;