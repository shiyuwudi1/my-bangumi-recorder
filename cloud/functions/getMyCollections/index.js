// 云函数：获取我的收藏列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { status, page = 1, pageSize = 20 } = event

  try {
    // 查询用户
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      }
    }

    const user = userRes.data[0]

    // 构建查询条件
    const whereCondition = { userId: user._id }
    if (status) {
      whereCondition.status = status
    }

    // 查询收藏列表
    const skip = (page - 1) * pageSize
    const collectionRes = await db.collection('collections')
      .where(whereCondition)
      .orderBy('updateTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 查询总数
    const countRes = await db.collection('collections')
      .where(whereCondition)
      .count()

    return {
      success: true,
      data: collectionRes.data,
      total: countRes.total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(countRes.total / pageSize)
    }
  } catch (error) {
    console.error('Get my collections error:', error)
    return {
      success: false,
      error: error.message || '获取收藏列表失败'
    }
  }
}
