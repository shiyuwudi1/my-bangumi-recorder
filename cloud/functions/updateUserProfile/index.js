// 云函数：更新用户信息
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { nickname, avatar } = event

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

    const userId = userRes.data[0]._id

    // 更新用户信息
    const updateData = {}
    if (nickname) updateData.nickname = nickname
    if (avatar) updateData.avatar = avatar

    await db.collection('users').doc(userId).update({
      data: updateData
    })

    return {
      success: true,
      message: '更新成功'
    }
  } catch (error) {
    console.error('Update user profile error:', error)
    return {
      success: false,
      error: error.message || '更新失败'
    }
  }
}
