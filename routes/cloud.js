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
    let userId = req.userId
    let opts = req.query
    cloudService.authFolder(opts, userId, result => {
        res.json(result)
    })
})

/**
 * 创建文件夹
 * 
 * @param {String} baseFolder 当前操作目录，/讯传网络/a/b/c
 * @param {String} newFolder 创建的文件夹名称
 */
router.post('/createFolder', (req, res, next) => {
    let userId = req.userId
    cloudService.createFolder(userId, req.body, result => {
        res.json(result)
    })
})
/**
 * 删除文件夹
 * @param {String} baseFolder 当前操作的基目录
 * @param {String} delFolder 要删除的目录
 */
router.post('/deleteFolder', (req, res, next) => {
    let userId = req.userId
    cloudService.deleteFolder(userId, req.body, result => {
        res.json(result)
    })
})
/**
 * 重命名文件夹
 * @param {String} baseFolder 当前操作的基目录
 * @param {String} oldName 原文件夹名
 * @param {String} newName 新文件夹名
 */
router.post('/renameFolder', (req, res, next) => {
    let userId = req.userId
    cloudService.renameFolder(userId, req.body, result => {
        res.json(result)
    })
})
// 文件夹属性
router.post('/propertyFolder', (req, res, next) => {
    let userId = req.userId
    cloudService.propertyFolder(userId, opts, result => {
        res.json(result)
    })
})
/** --------------- 文件接口 ---------------- */
// 上传文件
router.post('/uploadFile', (req, res, next) => {
    let userId = req.userId
})
// 下载文件
router.get('/downloadFile', (req, res, next) => {
    let userId = req.userId
    let opts = req.query
    cloudService.downloadFile(userId, opts, res)
})
// 重命名文件
router.post('/renameFile', (req, res, next) => {
    let userId = req.userId
    cloudService.renameFile(userId, req.body, result => {
        res.json(result)
    })
})
// 删除文件
router.post('/deleteFile', (req, res, next) => {
    let userId = req.userId
    cloudService.deleteFile(userId, req.body, result => {
        res.json(result)
    })
})


module.exports = router