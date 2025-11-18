// 云函数：添加收藏
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { animeId, animeTitle, animeCover, status = 'wishlist' } = event

  if (!animeId || !animeTitle) {
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

    // 检查是否已收藏
    const collectionRes = await db.collection('collections')
      .where({
        userId: user._id,
        animeId: animeId.toString()
      })
      .get()

    if (collectionRes.data.length > 0) {
      return {
        success: false,
        error: '已经收藏过了'
      }
    }

    const now = Date.now()

    // 添加收藏
    await db.collection('collections').add({
      data: {
        userId: user._id,
        animeId: animeId.toString(),
        animeTitle: animeTitle,
        animeCover: animeCover || '',
        status: status,
        currentEpisode: 0,
        totalEpisodes: 0,
        isLiked: false,
        createTime: now,
        updateTime: now
      }
    })

    // 更新用户统计
    const statsUpdate = {}
    statsUpdate[`stats.${status}`] = _.inc(1)
    statsUpdate['stats.totalAnime'] = _.inc(1)

    await db.collection('users').doc(user._id).update({
      data: statsUpdate
    })

    return {
      success: true,
      message: '添加成功'
    }
  } catch (error) {
    console.error('Add collection error:', error)
    return {
      success: false,
      error: error.message || '添加失败'
    }
  }
}
