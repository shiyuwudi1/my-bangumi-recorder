// 云函数：获取动漫详情
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const BANGUMI_API_BASE = 'https://api.bgm.tv'

exports.main = async (event, context) => {
  const { animeId } = event

  if (!animeId) {
    return {
      success: false,
      error: '动漫ID不能为空'
    }
  }

  try {
    // 先查询缓存
    const cacheRes = await db.collection('anime_cache')
      .where({ animeId: animeId.toString() })
      .get()

    const now = Date.now()
    const cacheExpireTime = 24 * 60 * 60 * 1000 // 24小时

    // 如果缓存存在且未过期
    if (cacheRes.data.length > 0) {
      const cache = cacheRes.data[0]
      if (now - cache.updateTime < cacheExpireTime) {
        return {
          success: true,
          data: cache.data,
          from: 'cache'
        }
      }
    }

    // 从 Bangumi API 获取详情
    const response = await axios.get(`${BANGUMI_API_BASE}/v0/subjects/${animeId}`, {
      headers: {
        'User-Agent': 'MyBangumi/1.0 (https://github.com/my-bangumi)'
      }
    })

    const animeData = response.data

    // 更新或插入缓存
    if (cacheRes.data.length > 0) {
      await db.collection('anime_cache').doc(cacheRes.data[0]._id).update({
        data: {
          data: animeData,
          updateTime: now
        }
      })
    } else {
      await db.collection('anime_cache').add({
        data: {
          animeId: animeId.toString(),
          data: animeData,
          createTime: now,
          updateTime: now
        }
      })
    }

    return {
      success: true,
      data: animeData,
      from: 'api'
    }
  } catch (error) {
    console.error('Get anime detail error:', error)
    return {
      success: false,
      error: error.message || '获取动漫详情失败'
    }
  }
}
