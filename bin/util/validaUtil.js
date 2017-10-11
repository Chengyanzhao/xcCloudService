// 字符串非空验证
function vString(val) {
    return (val && typeof val === 'string' && val.trim())
}

// 文件夹名合法性验证
function vFolderName(folderName) {
    var reg = new RegExp('^[^\\\\\\/:*?\\"<>|]+$');
    return reg.test(folderName);
}
// 文件名合法性验证
function vFileName(fileName) {
    var reg = new RegExp('^[^\\\\\\/:*?\\"<>|]+$');
    return reg.test(fileName);
}

module.exports = {
    vString,
    vFolderName,
    vFileName
}