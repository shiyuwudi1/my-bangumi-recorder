// 云函数：搜索动漫
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { keyword, type = 2 } = event  // type=2表示动画

  try {
    // 1. 先查询本地缓存
    const cacheResult = await db.collection('anime_cache')
      .where({
        $or: [
          { nameCn: db.RegExp({ regexp: keyword, options: 'i' }) },
          { name: db.RegExp({ regexp: keyword, options: 'i' }) }
        ],
        expireTime: db.command.gt(Date.now())
      })
      .limit(20)
      .get()

    if (cacheResult.data.length > 0) {
      return { success: true, data: cacheResult.data, from: 'cache' }
    }

    // 2. 缓存未命中，调用Bangumi API
    const response = await axios.get(
      `https://api.bgm.tv/search/subject/${encodeURIComponent(keyword)}`,
      { params: { type } }
    )

    const animeList = response.data.list || []

    // 3. 存储到缓存（批量写入）
    const now = Date.now()
    const expireTime = now + 24 * 60 * 60 * 1000  // 24小时后过期

    for (const anime of animeList.slice(0, 20)) {  // 只缓存前20条
      try {
        await db.collection('anime_cache').add({
          data: {
            bangumiId: anime.id,
            name: anime.name,
            nameCn: anime.name_cn,
            summary: anime.summary,
            type: anime.type,
            eps: anime.eps,
            airDate: anime.air_date,
            images: anime.images,
            rating: anime.rating,
            updateTime: now,
            expireTime: expireTime
          }
        })
      } catch (err) {
        // 忽略重复插入错误
        if (err.errCode !== -502002) {
          console.error('Cache anime error:', err)
        }
      }
    }

    return { success: true, data: animeList, from: 'api' }

  } catch (error) {
    console.error('Search error:', error)
    return { success: false, error: error.message }
  }
}
