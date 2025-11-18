// 云函数：获取用户统计
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

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

    return {
      success: true,
      data: {
        uid: user.uid,
        nickname: user.nickname,
        avatar: user.avatar,
        stats: user.stats || {
          totalAnime: 0,
          watching: 0,
          watched: 0,
          wishlist: 0,
          totalLikes: 0
        }
      }
    }
  } catch (error) {
    console.error('Get user stats error:', error)
    return {
      success: false,
      error: error.message || '获取统计失败'
    }
  }
}
