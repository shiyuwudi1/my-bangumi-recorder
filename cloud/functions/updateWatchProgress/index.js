// 云函数：更新观看进度
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { animeId, currentEpisode, totalEpisodes } = event

  if (!animeId || currentEpisode === undefined) {
    return {
      success: false,
      error: '参数不完整'
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

    // 更新进度
    const updateData = {
      currentEpisode: currentEpisode,
      updateTime: Date.now()
    }

    if (totalEpisodes !== undefined) {
      updateData.totalEpisodes = totalEpisodes
    }

    await db.collection('collections').doc(collection._id).update({
      data: updateData
    })

    // 记录观看历史
    await db.collection('watch_history').add({
      data: {
        userId: user._id,
        animeId: animeId.toString(),
        episode: currentEpisode,
        watchTime: Date.now()
      }
    })

    return {
      success: true,
      message: '更新成功'
    }
  } catch (error) {
    console.error('Update watch progress error:', error)
    return {
      success: false,
      error: error.message || '更新失败'
    }
  }
}
