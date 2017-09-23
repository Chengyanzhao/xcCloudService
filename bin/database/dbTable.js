const pool = require('../connection/mysqlConn')
const dbBase = require('./dbBase')

function Table(tableName) {
    if (!tableName || typeof tableName !== 'string' || !tableName.trim())
        throw new Error('error table name.')
    else this.tableName = tableName
}
const proto = table.prototype

proto.add = function (data) {
    let where = query ? 'WHERE' : ''
    if (query) {
        for (let key in query) {
            let value = query[key]
            let condition = ` ${key}='${value}'`
            where += condition
        }
    }

    let sqlStr = `SELECT * FROM ${this.tableName} ${where}`;
    return dbBase.execute(sqlStr);
}

proto.find = function (query) {
    let where = query ? 'WHERE' : ''
    if (query) {
        for (let key in query) {
            let value = query[key]
            let condition = ` ${key}='${value}'`
            where += condition
        }
    }

    let sqlStr = `SELECT * FROM ${this.tableName} ${where}`;
    return dbBase.execute(sqlStr);
}

proto.findOne = function (query) {
    let where = query ? 'WHERE' : ''
    if (query) {
        for (let key in query) {
            let value = query[key]
            let condition = ` ${key}='${value}'`
            where += condition
        }
    }

    let sqlStr = `SELECT * FROM ${this.tableName} ${where} LIMIT 1`;
    return dbBase.execute(sqlStr);
}

proto.update = function (query, updateData) {
    let where = query ? 'WHERE' : ''
    if (query) {
        for (let key in query) {
            let value = query[key]
            let condition = ` ${key}='${value}'`
            where += condition
        }
    }
    let updateStr = ''
    if (updateData) {
        for (let key in updateData) {
            let value = query[key]
            let condition = ` ${key}='${value}'`
            updateStr += condition
        }
    }
    let sqlStr = `UPDATE ${this.tableName} SET ${updateStr}`;
    return dbBase.execute(sqlStr);
    /**
     * UPDATE [LOW_PRIORITY] [IGNORE] tbl_name  
     * SET col_name1=expr1 [, col_name2=expr2 ...]  
     * [WHERE where_definition]  
     * [ORDER BY ...]  
     * [LIMIT row_count] 
     */
}

proto.remove = function () {
    let sqlStr = '';
    return dbBase.execute(sqlStr);
}

proto.save = function () {
    let sqlStr = '';
    return dbBase.execute(sqlStr);
}

proto.query = function () {
    let sqlStr = '';
    return dbBase.execute(sqlStr);
}