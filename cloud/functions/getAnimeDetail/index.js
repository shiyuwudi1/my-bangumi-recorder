// 云函数：获取动漫详情
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const BANGUMI_API_BASE = 'https://api.bgm.tv'
const BANGUMI_USER_AGENT = 'shiyuwudi1/my-bangumi-recorder/1.0.0 (WeChat Mini Program Bangumi) (https://github.com/shiyuwudi1/my-bangumi-recorder)'

exports.main = async (event, context) => {
  console.log('getAnimeDetail 接收到的 event:', JSON.stringify(event))
  console.log('getAnimeDetail 接收到的 event.animeId:', event.animeId)
  console.log('getAnimeDetail 接收到的 event 类型:', typeof event)
  console.log('getAnimeDetail 接收到的 event keys:', Object.keys(event))
  
  const { animeId } = event

  if (!animeId) {
    console.log('animeId 为空，返回错误')
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
        // 确保缓存数据中也有 id 字段
        const cachedData = cache.data
        const normalizedCacheData = {
          ...cachedData,
          id: cachedData.id || animeId,
          bangumiId: cachedData.id || animeId
        }
        return {
          success: true,
          data: normalizedCacheData,
          from: 'cache'
        }
      }
    }

    // 从 Bangumi API 获取详情
    const response = await axios.get(`${BANGUMI_API_BASE}/v0/subjects/${animeId}`, {
      headers: {
        'User-Agent': BANGUMI_USER_AGENT
      }
    })

    const animeData = response.data
    // 确保 id 字段存在，用于前端识别
    const normalizedData = {
      ...animeData,
      id: animeData.id || animeId,
      bangumiId: animeData.id || animeId
    }

    // 更新或插入缓存
    if (cacheRes.data.length > 0) {
      await db.collection('anime_cache').doc(cacheRes.data[0]._id).update({
        data: {
          data: normalizedData,
          updateTime: now
        }
      })
    } else {
      await db.collection('anime_cache').add({
        data: {
          animeId: animeId.toString(),
          data: normalizedData,
          createTime: now,
          updateTime: now
        }
      })
    }

    return {
      success: true,
      data: normalizedData,
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
