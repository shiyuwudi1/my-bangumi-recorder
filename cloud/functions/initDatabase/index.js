// 云函数：初始化数据库
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'initCounters':
        return await initCounters()
      case 'initAll':
        return await initAll()
      case 'checkStatus':
        return await checkStatus()
      default:
        return {
          success: false,
          message: '未知的操作类型，支持：initCounters, initAll, checkStatus'
        }
    }
  } catch (error) {
    console.error('Database init error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 初始化计数器集合
async function initCounters() {
  try {
    // 检查计数器是否已存在
    const counterRes = await db.collection('counters').doc('user_uid').get()

    if (counterRes.data) {
      return {
        success: true,
        message: '计数器已存在',
        data: counterRes.data
      }
    }
  } catch (error) {
    // 计数器不存在，创建新的
    const addRes = await db.collection('counters').add({
      data: {
        _id: 'user_uid',
        seq: 100000,
        createTime: Date.now(),
        updateTime: Date.now()
      }
    })

    return {
      success: true,
      message: '计数器初始化成功',
      id: addRes._id
    }
  }
}

// 检查数据库状态
async function checkStatus() {
  const collections = ['users', 'anime_cache', 'collections', 'watch_history', 'counters']
  const status = {}

  for (const collectionName of collections) {
    try {
      const countRes = await db.collection(collectionName).count()
      status[collectionName] = {
        exists: true,
        count: countRes.total
      }
    } catch (error) {
      status[collectionName] = {
        exists: false,
        error: error.message
      }
    }
  }

  return {
    success: true,
    status: status
  }
}

// 初始化所有必要的数据
async function initAll() {
  const results = []

  // 1. 初始化计数器
  const counterResult = await initCounters()
  results.push({ step: '初始化计数器', result: counterResult })

  // 2. 创建示例动漫缓存（可选）
  try {
    const cacheCount = await db.collection('anime_cache').count()
    if (cacheCount.total === 0) {
      await db.collection('anime_cache').add({
        data: {
          animeId: 'example_001',
          title: '示例动漫',
          description: '这是一个示例数据，可以删除',
          createTime: Date.now()
        }
      })
      results.push({ step: '创建示例缓存', result: { success: true } })
    }
  } catch (error) {
    results.push({ step: '创建示例缓存', result: { success: false, error: error.message } })
  }

  // 3. 检查所有集合状态
  const statusResult = await checkStatus()
  results.push({ step: '检查集合状态', result: statusResult })

  return {
    success: true,
    message: '数据库初始化完成',
    results: results
  }
}
