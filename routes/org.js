var express = require('express')
var router = express.Router()
var orgService = require('../service/orgService')

// 获取组织机构
router.get('/getOrgs', function (req, res, next) {
  let opts = req.query
  orgService.getOrgs(opts, result => {
    res.json(result)
  })
})
// 添加组织机构
router.post('/addOrg', function (req, res, next) {
  let opts = req.body
  orgService.addOrg(opts, result => {
    res.json(result)
  })
})
// 更新组织机构
router.post('/editOrg', function (req, res, next) {
  let opts = req.body
  orgService.editOrg(opts, result => {
    res.json(result)
  })
})

module.exports = router