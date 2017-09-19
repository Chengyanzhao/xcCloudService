/**
 * cloud service 
 */
const poolQuery = require('../bin/util/promise-mysql')
const cryptUtil = require('../bin/util/cryptUtil')
var config = require('../bin/util/configUtil')
// 根目录
const baseDirector = config.Config.getInstance().baseFolder

function authFolder(opts, callback) {
    let result = {
        status: false
    }
    let {
        personId
    } = opts
    w
}

module.exports = {
    authFolder
}