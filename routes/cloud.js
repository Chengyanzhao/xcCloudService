var express = require('express')
var router = express.Router()
var fs = require('fs')
var path = require('path')
var config = require('../bin/util/configUtil')
var pool = require('../bin/connection/mysqlConn')
var fsUtil = require('../bin/util/fsUtil')

// 根目录
var baseDirector = config.Config.getInstance().baseFolder
// 获取目录树
router.get('/folderTree', function (req, res, next) {
    let result = {
        status: false
    }
    // 获取权限目录
    // 多个权限目录合并成一个tree
    // 如果权限目录不存在，则不显示。
    let personId = req.query.personId;
    pool.pool.query(`select * from auth where personId='${personId}'`, (error, results, fields) => {
        if (error) {
            res.json({
                status: false,
                message: '系统错误'
            })
            return;
        }
        let resuleData = {
            file: [],
            folder: []
        }
        if (results && results.length >= 0) {
            results.forEach(item => {
                let folder = item.folder
                let fullPath = baseDirector + folder
                fsUtil.walk(fullPath, undefined, (err, fsResult) => {
                    // debugger
                })
            })
        }
    })
    let folderTree = {
        name: '讯传网络',
        file: [],
        folder: [{
            name: '实景网',
            file: [],
            folder: [{
                name: '需求分析',
                file: ['详细设计1.txt', '详细设计2.txt'],
                folder: []
            }, {
                name: '详细设计',
                file: ['需求1.txt', '需求2.txt'],
                folder: []
            }]
        }],
        file: []
    }
    res.json({
        status: true,
        data: folderTree
    })
})

module.exports = router