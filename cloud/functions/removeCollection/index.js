// 云函数：移除收藏
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
        error: '收藏不存在'
      }
    }

    const collection = collectionRes.data[0]

    // 删除收藏
    await db.collection('collections').doc(collection._id).remove()

    // 更新用户统计
    const statsUpdate = {}
    statsUpdate[`stats.${collection.status}`] = _.inc(-1)
    statsUpdate['stats.totalAnime'] = _.inc(-1)
    if (collection.isLiked) {
      statsUpdate['stats.totalLikes'] = _.inc(-1)
    }

    await db.collection('users').doc(user._id).update({
      data: statsUpdate
    })

    return {
      success: true,
      message: '移除成功'
    }
  } catch (error) {
    console.error('Remove collection error:', error)
    return {
      success: false,
      error: error.message || '移除失败'
    }
  }
}
