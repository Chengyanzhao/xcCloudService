var express = require('express');
var router = express.Router();
var pool = require('../bin/connection/mysqlConn');

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
  var personId = '';
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
router.post('/signIn', function (rerq, res, next) {

})
// 修改密码
router.post('/changePassword', function (req, res, next) {

})
// 个人信息
router.get('/userInfo', function (req, res, next) {

})
module.exports = router;