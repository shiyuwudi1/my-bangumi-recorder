// 云函数：用户登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const DEFAULT_AVATAR = 'https://static.bgm.tv/img/avatar/ls.jpg'

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
  console.log('[CLOUD LOGIN] Received event:', event)
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  console.log('[CLOUD LOGIN] OpenID:', openid)
  const { nickname, avatar, onlyCheck } = event || {}
  console.log('[CLOUD LOGIN] Provided profile:', { nickname, avatar, onlyCheck })

  try {
    // 查询用户是否存在
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()
    console.log('[CLOUD LOGIN] Existing user query:', userRes.data.length > 0 ? 'found' : 'not found', userRes.data[0] || 'no data')

    const now = Date.now()

    if (userRes.data.length > 0) {
      // 用户已存在，更新信息
      const user = userRes.data[0]
      const updates = { lastLoginTime: now }

      if (onlyCheck) {
        console.log('[CLOUD LOGIN] onlyCheck=true, skip updating user, return existing data')
        return {
          success: true,
          isNewUser: false,
          user
        }
      }

      if (nickname && nickname !== user.nickname) {
        updates.nickname = nickname
      }

      if (avatar && avatar !== user.avatar) {
        updates.avatar = avatar
      }

      if (!avatar && (!user.avatar || user.avatar === 'cloud://default-avatar.png') && user.avatar !== DEFAULT_AVATAR) {
        updates.avatar = DEFAULT_AVATAR
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('users').doc(user._id).update({
          data: updates
        })
        Object.assign(user, updates)
      }

      return {
        success: true,
        isNewUser: false,
        user: user
      }
    } else {
      if (onlyCheck) {
        console.log('[CLOUD LOGIN] onlyCheck=true, user not found, need profile setup')
        return {
          success: true,
          isNewUser: true,
          needProfile: true,
          user: null
        }
      }

      if (!nickname || !avatar) {
        console.warn('[CLOUD LOGIN] Missing nickname or avatar when creating user')
        return {
          success: false,
          isNewUser: true,
          needProfile: true,
          error: '请先选择头像并输入昵称后再登录'
        }
      }

      // 新用户，创建账号
      const uid = await generateUID()

      const newUser = {
        _openid: openid,
        uid: uid,
        nickname: nickname || ('用户' + uid),
        avatar: avatar || DEFAULT_AVATAR,
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
