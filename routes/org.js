var express = require('express')
var router = express.Router()
var orgService = require('../service/orgService')
var logSercice = require('../service/logService')
var checkAdmin = require('../bin/middleware/checkAdmin')

// 获取组织机构
router.get('/getOrgs', checkAdmin, function (req, res, next) {
  let opts = req.query
  orgService.getOrgs(opts, result => {
    res.json(result)
  })
})
// 添加组织机构
router.post('/addOrg', checkAdmin, function (req, res, next) {
  let opts = req.body
  orgService.addOrg(opts, result => {
    logSercice.log(req.userId, 'addOrg', result.status === false ? result.message : `orgName:${opts.orgname}`)
    res.json(result)
  })
})
// 更新组织机构
router.post('/editOrg', checkAdmin, function (req, res, next) {
  let opts = req.body
  orgService.editOrg(opts, result => {
    logSercice.log(req.userId, 'editOrg', result.status === false ? result.message : `orgName:${opts.orgname}`)
    res.json(result)
  })
})

module.exports = router