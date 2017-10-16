var express = require('express');
var router = express.Router();
const db = require('../bin/database/db')
const authService = require('../service/authService')
const logSercice = require('../service/logService')
// 获取目录的授权信息
router.get('/folderAuth', checkLogin, (req, res, next) => {
  authService.folderAuth(req.body, result => {
    logSercice.log(req.userId, 'folderAuth', result.status === false ? result.message : '')
    res.json(result)
  })
})
// 新增授权人员
router.post('/addUser', checkLogin, (req, res, next) => {
  authService.addOrUpdateAuth(userId, req.body, results => {
    logSercice.log(req.userId, 'addUser', result.status === false ? result.message : '')
    res.json(result);
  })
})
// 删除授权人员
router.post('/deleteUser', checkLogin, (req, res, next) => {
  // logSercice.log(req.userId, 'addUser', result.status === false ? result.message : '')
})

// 修改授权信息
router.post('/updateAuth', checkLogin, (req, res, next) => {
  authService.addOrUpdateAuth(userId, req.body, results => {
    logSercice.log(req.userId, 'updateAuth', result.status === false ? result.message : '')
    res.json(result);
  })
})