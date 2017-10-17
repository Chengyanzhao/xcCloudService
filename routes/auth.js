var express = require('express');
var router = express.Router();
const db = require('../bin/database/db')
const authService = require('../service/authService')
const logSercice = require('../service/logService')

// 获取目录的授权信息
router.get('/folderAuth', checkLogin, (req, res, next) => {
  authService.folderAuth(req.body, result => {
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

/**
 * 删除授权人员
 * 
 * @param {String} userId 删除的用户
 * @param {String} folder 删除的用户授权目录
 */
router.post('/deleteUser', checkLogin, (req, res, next) => {
  let opts = req.body
  authService.deleteAuthUser(opts, result => {
    logSercice.log(req.userId, 'deleteAuthUser', result.status === false ? result.message : `username:${result.userName},folder:${result.folder}`)
  })
})

// 修改授权信息
router.post('/updateAuth', checkLogin, (req, res, next) => {
  authService.addOrUpdateAuth(userId, req.body, results => {
    logSercice.log(req.userId, 'updateAuth', result.status === false ? result.message : '')
    res.json(result);
  })
})