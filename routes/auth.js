var express = require('express');
var router = express.Router();
const db = require('../bin/database/db')


function checkLogin(req, res, next) {
  // return req.session.adminlogined;
  next();
}

// 获取目录的授权信息
router.get('/folderAuth', (req, res, next) => {
  let result = {
    status: false
  }
  let folder = req.body.folder
  let authTable = db.table('auth')
  // 目录授权信息
  authTable.findOne({
    folder: folder
  }).then(results => {
    if (results && results.length) {
      result.data = results
      result.status = true
      res.json(result)
    }
  }).catch(error => {
    result.message = '系统错误！'
    res.json(result)
  })
})
// 新增授权人员
router.post('/addUser', checkLogin, (req, res, next) => {
  let personId = req.body.persionId
  let authFolder = req.body.authFolder
  let result = {
    status: false
  }
  let folder = req.body.folder
  let authTable = db.table('auth')
  authTable.findOne({
    folder: authFolder,
    personId: personId
  }).then(results => {
    if (results && results.length && results.length > 0) {
      resule.message = '此用户已被添加至当前文件夹的授权列表！'
      res.json(result)
      return;
    }
  }).then(() => {
    authTable.add({
      folder: authFolder,
      personId: personId  // 还有其他授权信息。
    })
  })


  // select personid from user where persionid not in
})
// 删除授权人员
router.post('/deleteUser', checkLogin, function (req, res, next) {
  let folder = req.body.folder
  let delUserListStr = req.body.delUserList
  let sqlStr = ''
  db.query(sqlStr).then(result => {

  }).catch(error => {

  })
})