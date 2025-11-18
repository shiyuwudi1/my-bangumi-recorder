// 云函数：绑定手机号
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { phone } = event

  if (!phone) {
    return {
      success: false,
      error: '手机号不能为空'
    }
  }

  // 简单的手机号验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return {
      success: false,
      error: '手机号格式不正确'
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

    const userId = userRes.data[0]._id

    // 检查手机号是否已被其他用户绑定
    const phoneRes = await db.collection('users')
      .where({ phone: phone, _openid: db.command.neq(openid) })
      .get()

    if (phoneRes.data.length > 0) {
      return {
        success: false,
        error: '该手机号已被绑定'
      }
    }

    // 绑定手机号
    await db.collection('users').doc(userId).update({
      data: {
        phone: phone,
        phoneVerified: true
      }
    })

    return {
      success: true,
      message: '绑定成功'
    }
  } catch (error) {
    console.error('Bind phone error:', error)
    return {
      success: false,
      error: error.message || '绑定失败'
    }
  }
}
