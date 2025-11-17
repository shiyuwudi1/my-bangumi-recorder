// 云函数：用户登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 生成6位UID
async function generateUID() {
  try {
    const counterRes = await db.collection('counters')
      .doc('user_uid')
      .update({
        data: {
          seq: _.inc(1)
        }
      })

    // 如果计数器不存在，先创建
    if (counterRes.stats.updated === 0) {
      await db.collection('counters').add({
        data: {
          _id: 'user_uid',
          seq: 100000
        }
      })
      return '100000'
    }

    // 获取最新的序列号
    const counter = await db.collection('counters').doc('user_uid').get()
    return counter.data.seq.toString()
  } catch (error) {
    console.error('Generate UID error:', error)
    throw error
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查询用户是否存在
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()

    const now = Date.now()

    if (userRes.data.length > 0) {
      // 用户已存在，更新最后登录时间
      const user = userRes.data[0]
      await db.collection('users').doc(user._id).update({
        data: { lastLoginTime: now }
      })

      return {
        success: true,
        isNewUser: false,
        user: user
      }
    } else {
      // 新用户，创建账号
      const uid = await generateUID()

      const newUser = {
        _openid: openid,
        uid: uid,
        nickname: '用户' + uid,
        avatar: 'cloud://default-avatar.png',
        phone: null,
        phoneVerified: false,
        createTime: now,
        lastLoginTime: now,
        stats: {
          totalAnime: 0,
          watching: 0,
          watched: 0,
          wishlist: 0,
          totalLikes: 0
        }
      }

      const addRes = await db.collection('users').add({
        data: newUser
      })

      newUser._id = addRes._id

      return {
        success: true,
        isNewUser: true,
        user: newUser
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
