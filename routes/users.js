var express = require('express')
var router = express.Router()
var pool = require('../bin/connection/mysqlConn')
var cryptUtil = require('../bin/util/cryptUtil')
var userService = require('../service/userService')

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
  var opts = req.body;
  userService.signUp(opts, result => {
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

})
// 个人信息
router.get('/userInfo', function (req, res, next) {
  let userName = req.query.userName;
  pool.pool.query(`select * from user where username='${userName}'`, function (error, results, fields) {
    if (error) {
      res.json({
        status: false,
        message: '系统错误'
      })
    } else {
      res.json({
        status: true,
        data: results[0]
      })
    }
  });
})
module.exports = router;