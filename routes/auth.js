var express = require('express');
var router = express.Router();
const db = require('../bin/database/db')
const authService = require('../service/authService')


function checkLogin(req, res, next) {
  // return req.session.adminlogined;
  next();
}

// 获取目录的授权信息
router.get('/folderAuth', (req, res, next) => {
  let result = {
    status: false
  }
  authService.folderAuth(req.body, result => {
    res.json(result)
  })
})
// 新增授权人员
router.post('/addUser', checkLogin, (req, res, next) => {
  authService.addOrUpdateAuth(userId, req.body, results => {
    res.json(result);
  })
})
// 删除授权人员
router.post('/deleteUser', checkLogin, (req, res, next) => {

})

// 修改授权信息
router.post('/updateAuth', checkLogin, (req, res, next) => {
  authService.addOrUpdateAuth(userId, req.body, results => {
    res.json(result);
  })
})