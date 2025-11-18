// 云函数：切换喜欢状态
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { animeId } = event

  if (!animeId) {
    return {
      success: false,
      error: '动漫ID不能为空'
    }
  }

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

    // 查询收藏
    const collectionRes = await db.collection('collections')
      .where({
        userId: user._id,
        animeId: animeId.toString()
      })
      .get()

    if (collectionRes.data.length === 0) {
      return {
        success: false,
        error: '收藏不存在，请先添加收藏'
      }
    }

    const collection = collectionRes.data[0]
    const newLikedStatus = !collection.isLiked

    // 更新喜欢状态
    await db.collection('collections').doc(collection._id).update({
      data: {
        isLiked: newLikedStatus,
        updateTime: Date.now()
      }
    })

    // 更新用户统计
    const statsUpdate = {
      'stats.totalLikes': _.inc(newLikedStatus ? 1 : -1)
    }

    await db.collection('users').doc(user._id).update({
      data: statsUpdate
    })

    return {
      success: true,
      isLiked: newLikedStatus,
      message: newLikedStatus ? '已喜欢' : '已取消喜欢'
    }
  } catch (error) {
    console.error('Toggle like error:', error)
    return {
      success: false,
      error: error.message || '操作失败'
    }
  }
}
