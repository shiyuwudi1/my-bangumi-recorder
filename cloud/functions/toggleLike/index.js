// 云函数：切换喜欢状态
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { animeId } = event || {}

  console.log('[toggleLike] invoked', {
    animeId,
    openid,
    hasEvent: !!event
  })

  if (!animeId) {
    console.warn('[toggleLike] missing animeId')
    return {
      success: false,
      error: '动漫ID不能为空'
    }
  }

  try {
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()

    console.log('[toggleLike] user query result', {
      openid,
      count: userRes.data.length
    })

    if (userRes.data.length === 0) {
      console.warn('[toggleLike] user not found', { openid })
      return {
        success: false,
        error: '用户不存在',
        needLogin: true
      }
    }

    if (!openid) {
      console.warn('[toggleLike] openid missing with existing user record')
      return {
        success: false,
        needLogin: true,
        error: '用户未登录'
      }
    }

    const user = userRes.data[0]
    const likedList = user.likedAnimes || []
    const likedAnime = likedList.includes(animeId)

    console.log('[toggleLike] liked state before toggle', {
      animeId,
      likedAnime,
      likedListLength: likedList.length
    })

    const newLikedAnimes = likedAnime
      ? likedList.filter(id => id !== animeId)
      : [...likedList, animeId]

    await db.collection('users').doc(user._id).update({
      data: {
        likedAnimes: newLikedAnimes,
        updateTime: Date.now()
      }
    })

    console.log('[toggleLike] update success', {
      animeId,
      nextLiked: !likedAnime,
      likedCount: newLikedAnimes.length
    })

    return {
      success: true,
      isLiked: !likedAnime,
      message: !likedAnime ? '已喜欢' : '已取消喜欢'
    }
  } catch (error) {
    console.error('[toggleLike] error', error)
    return {
      success: false,
      error: error.message || '操作失败'
    }
  }
}
