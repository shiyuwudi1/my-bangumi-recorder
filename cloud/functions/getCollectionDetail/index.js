// 云函数：获取收藏详情
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { animeId } = event

  console.log('[getCollectionDetail] input', { animeId, openid })

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
    const animeIdStr = String(animeId)
    const likedSet = new Set((user.likedAnimes || []).map(id => String(id)))
    const isLiked = likedSet.has(animeIdStr)

    // 查询收藏
    const collectionRes = await db.collection('collections')
      .where({
        userId: user._id,
        animeId: animeIdStr
      })
      .get()

    if (collectionRes.data.length === 0) {
      console.log('[getCollectionDetail] collection not found, returning like status only', {
        animeId: animeIdStr,
        isLiked
      })
      return {
        success: true,
        data: null,
        isLiked
      }
    }

    const collection = collectionRes.data[0]
    const detail = {
      _id: collection._id,
      animeId: collection.animeId,
      animeName: collection.animeName,
      animeCover: collection.animeCover,
      status: collection.status,
      isLiked: isLiked || collection.isLiked,
      currentSeason: collection.currentSeason || 1,
      currentEpisode: collection.currentEpisode || 0,
      totalSeasons: collection.totalSeasons || 1,
      createTime: collection.createTime,
      updateTime: collection.updateTime
    }

    return {
      success: true,
      data: detail,
      isLiked: detail.isLiked
    }
  } catch (error) {
    console.error('Get collection detail error:', error)
    return {
      success: false,
      error: error.message || '获取失败'
    }
  }
}
