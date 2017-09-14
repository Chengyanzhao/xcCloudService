var crypto = require('crypto');
var ObjectId = require('./objectId');

function guid() {
    return new ObjectId(new Date()).toString();
}


module.exports = { guid };