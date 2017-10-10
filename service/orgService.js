const db = require('../bin/database/db')
/**
 * 获取组织机构
 * 
 * @param {any} opts 
 * @param {any} done 
 */
function getOrgs(opts, done) {
  db.query(`select * from organization ORDER BY level`).then((res) => {
    let data = initOrgTree(res)
    let result = {
      status: true,
      data: data
    }
    done(result)
  })
}
/**
 * 添加组织机构
 * 
 * @param {any} opts 
 * @param {any} done 
 */
function addOrg(opts, done) {
  let orgTable = db.table('organization')
  orgTable.add(opts).then((res) => {
    getOrgs(opts, done)
  }).catch((res) => {
    let result = {
      status: false,
      data: '添加失败'
    }
    done(result)
  })
}
/**
 * 更新组织机构
 * 
 * @param {any} opts 
 * @param {any} done 
 */
function editOrg(opts, done) {
  let orgTable = db.table('organization')
  let queryWhere = { id: opts.id }
  let updateDate = {
    orgname: opts.orgname,
    description: opts.description
  }
  orgTable.update(queryWhere, updateDate).then((res) => {
    getOrgs(opts, done)
  }).catch((res) => {
    let result = {
      status: false,
      data: '更新失败'
    }
    done(result)
  })
}
/**
 * 构建组织机构的属性结构
 * @param {any} data 
 */
function initOrgTree(data) {
  let tree = {}
  // 第一个是根节点
  tree.rootNode = data[0]
  tree.rootNode.children = []
  // 遍历第一个以后的节点
  for (let i = 1, len = data.length; i < len; i++) {
    let item = data[i]
    if (tree[item.id]) {
      tree[item.id].children.push(item)
    } else {
      tree[item.id] = item
    }
    if (tree[item.orgpid]) {
      if (tree[item.orgpid].children) {
        tree[item.orgpid].children.push(item)
      } else {
        tree[item.orgpid].children = [item]
      }
    }
    if (item.level === 1 || item.level === '1') {
      tree.rootNode.children.push(item)
    }
  }
  return tree
}
/**
 * 根据条件获取用户
 * 
 * @param {any} opts 
 * @param {any} done 
 */
function getUserByOpts(opts, done) {
  let { nickname, orgId } = opts
  let query
  if (nickname) {
    query = {
      nickname
    }
  }
  if (orgId) {
    if (query) {
      query.orgId = orgId
    } else {
      query = {
        orgId
      }
    }
  }
}
module.exports = {
  getOrgs,
  addOrg,
  editOrg
}
