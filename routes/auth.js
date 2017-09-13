var express = require('express');
var router = express.Router();

function checkLogin(req, res, next) {
    // return req.session.adminlogined;
    next();
}
// 新增授权人员
router.post('/addUser', checkLogin, function (req, res, next) {
    var addUserId = req.body.userId;
    var folder = req.body.folder;

    // select personid from user where persionid not in
})
// 删除授权人员
router.post('/deleteUser', checkLogin, function (req, res, next) {

})