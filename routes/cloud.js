var express = require('express');
var router = express.Router();

// 获取目录树
router.get('/folderTree', function (req, res, next) {
    // 获取权限目录
    // 多个权限目录合并成一个tree
    // 如果权限目录不存在，则不显示。
    var personId = req.body.persionId;
    pool.pool.query(`select * from auth where persionId='${persionId}'`, function (error, results, fields) {
        if (error) {
            res.json({
                status: false,
                message: '系统错误'
            })
        } else {
            
        }
    })
    var folderTree = {
        folderName: '讯传网络',
        folderId: 'root',
        child: [{
            folderName: '实景网',
            folderId: 'aa',
            child: [{
                folderName: '需求分析',
                folderId: 'bb',
            }, {
                folderName: '详细设计',
                folderId: 'cc'
            }]
        }]
    }
    res.json({
        status: true,
        data: folderTree
    })
})