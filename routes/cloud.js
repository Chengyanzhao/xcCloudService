var express = require('express')
var router = express.Router()
var fs = require('fs')
var path = require('path')
var config = require('../bin/util/configUtil')
var pool = require('../bin/connection/mysqlConn')
var fsUtil = require('../bin/util/fsUtil')
const cloudService = require('../service/cloudService')

// 根目录
var baseDirector = config.Config.getInstance().baseFolder
// 获取目录树
router.get('/authFolder', function (req, res, next) {
    let opts = req.query
    cloudService.authFolder(opts, result => {
        res.json(result)
    })
})
module.exports = router