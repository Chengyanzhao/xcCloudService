const pool = require('../connection/mysqlConn')
const dbBase = require('./dbBase')

function Table(tableName) {
    if (!tableName || typeof tableName !== 'string' || !tableName.trim())
        throw new Error('error table name.')
    else this.tableName = tableName
}
const proto = Table.prototype

proto.add = function (data) {
    let insert = data ? 'SET' : ''
    if (data) {
        for (let key in data) {
            let value = data[key]
            if (value) {
                let set = ` ${key}='${value}',`
                insert += set
            }
        }
        if (insert.lastIndexOf(',') === insert.length - 1) insert = insert.substr(0, insert.length - 1)
    }

    let sqlStr = `INSERT INTO ${this.tableName} ${insert}`
    return dbBase.execute(sqlStr)
}

proto.find = function (query) {
    let where = query ? 'WHERE' : ''
    let whereArr = []
    if (query) {
        for (let key in query) {
            let value = query[key]
            if (!value.length) {
                let condition = ` ${key}='${value}'`
                whereArr.push(condition)
            } else {
                let condition = ` ${key} in ('${value.join("','")}')`
                whereArr.push(condition)
            }
        }
    }
    where += whereArr.join(' and ')
    let sqlStr = `SELECT * FROM ${this.tableName} ${where}`;
    return dbBase.execute(sqlStr);
}
proto.like = function (query) {
    let where = query ? 'WHERE' : ''
    let whereArr = []
    if (query) {
        for (let key in query) {
            let value = query[key]
            let condition = ` ${key} like '%${value}%%'`
            whereArr.push(condition)
        }
    }
    where += whereArr.join(' and ')
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
    return dbBase.execute(sqlStr).then(data => {
        return new Promise(resolve => {
            resolve(data[0])
        })
    }).catch(error => {
        return new Promise((resolve, reject) => {
            reject(error)
        })
    });
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
    let updateStrArr = []
    if (updateData) {
        for (let key in updateData) {
            let value = updateData[key]
            let condition = ` ${key}='${value}'`
            updateStrArr.push(condition)
        }
    }
    let updateStr = updateStrArr.join(',')
    let sqlStr = `UPDATE ${this.tableName} SET ${updateStr} ${where}`;
    return dbBase.execute(sqlStr);
    /**
     * UPDATE [LOW_PRIORITY] [IGNORE] tbl_name  
     * SET col_name1=expr1 [, col_name2=expr2 ...]  
     * [WHERE where_definition]  
     * [ORDER BY ...]  
     * [LIMIT row_count] 
     */
}

proto.remove = function (query) {
    let where = query ? 'WHERE' : ''
    let whereArr = []
    if (query) {
        for (let key in query) {
            let value = query[key]
            if (!value.length) {
                let condition = ` ${key}='${value}'`
                whereArr.push(condition)
            } else {
                let condition = ` ${key} in ('${value.join("','")}')`
                whereArr.push(condition)
            }
        }
    }
    where += whereArr.join(' and ')
    let sqlStr = `DELETE FROM ${this.tableName} ${where}`;
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

module.exports = Table