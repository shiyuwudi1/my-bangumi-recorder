// 云函数：更新收藏状态
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { animeId, status } = event

  if (!animeId || !status) {
    return {
      success: false,
      error: '参数不完整'
    }
  }

  // 验证状态值
  const validStatuses = ['wishlist', 'watching', 'watched']
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      error: '无效的状态值'
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
    const oldStatus = collection.status

    // 如果状态未改变
    if (oldStatus === status) {
      return {
        success: true,
        message: '状态未改变'
      }
    }

    // 更新收藏状态
    await db.collection('collections').doc(collection._id).update({
      data: {
        status: status,
        updateTime: Date.now()
      }
    })

    // 更新用户统计
    const statsUpdate = {}
    statsUpdate[`stats.${oldStatus}`] = _.inc(-1)
    statsUpdate[`stats.${status}`] = _.inc(1)

    await db.collection('users').doc(user._id).update({
      data: statsUpdate
    })

    return {
      success: true,
      message: '更新成功'
    }
  } catch (error) {
    console.error('Update collection status error:', error)
    return {
      success: false,
      error: error.message || '更新失败'
    }
  }
}
