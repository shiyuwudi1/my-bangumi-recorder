import Taro from '@tarojs/taro'
import { User, LoginResult } from '../types/user'
import { callCloudFunction, showLoading, hideLoading, showToast } from '../utils/request'
import { setStorage, getStorage, removeStorage } from '../utils/storage'
import { CLOUD_FUNCTIONS, STORAGE_KEYS } from '../constants'

/**
 * 用户登录
 */
export const login = async (): Promise<User | null> => {
  showLoading('登录中...')

  try {
    console.log('开始调用登录云函数...')
    const res = await callCloudFunction<LoginResult>(CLOUD_FUNCTIONS.LOGIN, {})
    console.log('登录云函数返回结果:', res)

    hideLoading()

    // res 的结构是: { success: true, isNewUser: false, user: {...} }
    // 或者是: { success: true, data: { success: true, isNewUser: false, user: {...} } }
    // 需要判断具体是哪种
    const loginResult = (res.data || res) as any
    console.log('登录结果解析:', loginResult)

    if (res.success && loginResult.user) {
      const user = loginResult.user
      // 存储到本地
      setStorage(STORAGE_KEYS.USER, user)

      if (loginResult.isNewUser) {
        showToast('欢迎加入！', 'success')
      } else {
        showToast('登录成功', 'success')
      }

      return user
    }

    console.error('登录失败，返回数据:', res)
    showToast(res.error || '登录失败')
    return null
  } catch (error) {
    hideLoading()
    console.error('登录异常:', error)
    showToast('登录失败: ' + (error.message || error))
    return null
  }
}

/**
 * 获取本地用户信息
 */
export const getUserInfo = (): User | null => {
  return getStorage<User>(STORAGE_KEYS.USER)
}

/**
 * 退出登录
 */
export const logout = () => {
  removeStorage(STORAGE_KEYS.USER)
  showToast('已退出登录', 'success')
}

/**
 * 更新用户信息
 */
export const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
  showLoading('更新中...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.UPDATE_USER_PROFILE, data)

    hideLoading()

    if (res.success) {
      // 更新本地存储
      const user = getUserInfo()
      if (user) {
        const updatedUser = { ...user, ...data }
        setStorage(STORAGE_KEYS.USER, updatedUser)
      }

      showToast('更新成功', 'success')
      return true
    } else {
      showToast(res.error || '更新失败')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('更新失败')
    return false
  }
}

/**
 * 上传头像
 */
export const uploadAvatar = async (): Promise<string | null> => {
  try {
    // 选择图片
    const chooseRes = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const tempFilePath = chooseRes.tempFilePaths[0]
    const user = getUserInfo()

    if (!user) {
      showToast('请先登录')
      return null
    }

    showLoading('上传中...')

    // 上传到云存储
    const cloudPath = `avatars/${user.uid}_${Date.now()}.png`
    const uploadRes = await Taro.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: tempFilePath
    })

    // 更新用户信息
    const updateSuccess = await updateUserProfile({
      avatar: uploadRes.fileID
    })

    hideLoading()

    if (updateSuccess) {
      return uploadRes.fileID
    } else {
      return null
    }

  } catch (error) {
    hideLoading()
    console.error('Upload avatar error:', error)
    showToast('上传失败')
    return null
  }
}

/**
 * 绑定手机号
 */
export const bindPhone = async (phone: string): Promise<boolean> => {
  showLoading('绑定中...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.BIND_PHONE, { phone })

    hideLoading()

    if (res.success) {
      // 更新本地用户信息
      const user = getUserInfo()
      if (user) {
        user.phone = phone
        user.phoneVerified = true
        setStorage(STORAGE_KEYS.USER, user)
      }

      showToast('绑定成功', 'success')
      return true
    } else {
      showToast(res.error || '绑定失败')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('绑定失败')
    return false
  }
}
