var express = require('express')
var router = express.Router()
var pool = require('../bin/connection/mysqlConn')
var cryptUtil = require('../bin/util/cryptUtil')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 注册
router.post('/signUp', function (req, res, next) {
  var userName = req.body.userName;
  var passWord = req.body.passWord;
  var personName = req.body.personName;
  var sex = req.body.sex;
  var email = req.body.email;
  var mobilephone = req.body.mobilephone;
  var telephone = req.body.telephone;
  // 参数验证
  var personId = cryptUtil.guid();
  var orgId = '';
  pool.pool.query(`insert into user (personId,personName,orgId,userName,passWord,sex,email,mobilephone,telephone) 
  values("${personId}","${personName}","${orgId}","${userName}","${passWord}","${sex}","${email}","${mobilephone}","${telephone}");`, function (error, results, fields) {
    debugger;
    res.json({
      result: true
    })
  });
})
// 登陆
router.post('/signIn', function (req, res, next) {
  var userName = req.body.userName;
  var passWord = req.body.passWord;
  pool.pool.query(`select * from user where username='${userName}' and password='${passWord}'`, function (error, results, fields) {
    if (error || !results || results.length === 0) {
      res.json({
        status: false,
        message: '用户名或密码错误！'
      })
    } else {
      res.json({
        status: true
      })
    }
  })
})
// 修改密码
router.post('/changePassword', function (req, res, next) {

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