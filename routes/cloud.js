var express = require('express')
var router = express.Router()
var fs = require('fs')
const fse = require('fs-extra')
var path = require('path')
var config = require('../bin/util/configUtil')
var fsUtil = require('../bin/util/fsUtil')
const cloudService = require('../service/cloudService')
const token = require('../bin/middleware/token')
router.use(token)

var multer = require('multer')
var upload = multer({
    dest: 'upload/'
})

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
 * 刷新目录(获取某一目录数据)
 * @param {String} folder 操作目录，如'讯传网络/需求分析/新建文件夹'，参数为'需求分析/新建文件夹'
 */
router.post('/refreshFolder', function (req, res, next) {
    let userId = req.userId
    let opts = req.body
    cloudService.refreshFolder(opts, userId, result => {
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
/**
 * 下载文件夹
 * @param {String} folder 下载的文件夹
 */
router.get('/downloadFolder', (req, res, next) => {
    let userId = req.userId
    cloudService.downloadFolder(userId, req.query, result => {
        if (result.status === true) {
            let filePath = result.data.filePath
            let fileRealName = result.data.fileRealName
            if (filePath && fs.existsSync(filePath)) {
                res.download(filePath, fileRealName + path.extname(filePath), err => {
                    fs.unlink(filePath)
                })
            } else {
                res.send('folder not exist!')
                res.end()
            }
        } else {
            res.send(result.message)
            res.end()
        }
    })
})
// 文件夹属性
router.post('/attrFolder', (req, res, next) => {
    cloudService.attrFolder(req.body, result => {
        res.json(result)
    })
})
/** --------------- 文件接口 ---------------- */
// 上传文件
var uploadDir = path.join(path.resolve(__dirname, '../'), 'upload')
router.post('/uploadFile', upload.array('upfile'), (req, res, next) => {
    let result = {
        status: true
    }
    try {
        let userId = req.userId
        if (req.files) {
            var file = req.files[0]
            let filePath = req.body.folderPath
            let rootPath = `${baseDirector}/${filePath}`
            let sourPath = path.join(uploadDir, file.filename)
            let tarPath = path.join(rootPath, file.originalname)
            let isExist = fs.existsSync(tarPath)
            if (isExist) {
                result.status = false
                result.message = '此文件已存在！'
                if (fs.existsSync(sourPath)) {
                    fs.unlinkSync(sourPath)
                }
            } else {
                fse.moveSync(sourPath, tarPath)
            }
        } else {
            result.status = false
            result.message = '上传出错，请刷新后重试！'
        }
    } catch (e) {
        result.status = false
        result.message = '上传出错，请刷新后重试！'
    }
    if (result.status) {
        res.json(result)
    } else {
        res.sendStatus(500)
    }
})
// 下载文件
router.get('/downloadFile', (req, res, next) => {
    let userId = req.userId
    let opts = req.query
    let filePath = cloudService.downloadFile(userId, opts, result => {
        if (result.status === true) {
            let filePath = result.data
            if (filePath) {
                res.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition':
                        'attachment;filename=' + encodeURI(path.basename(filePath))
                })
                res.download(filePath)
            } else {
                res.send('file not exist!')
                res.end()
            }
        } else {
            res.send(result.message)
            res.end()
        }
    })
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
// 文件属性
router.post('/attrFile', (req, res, next) => {
    cloudService.attrFile(req.body, result => {
        res.json(result)
    })
})

module.exports = router
