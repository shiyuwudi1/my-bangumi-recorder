import Taro from '@tarojs/taro'
import { User, LoginResult } from '../types/user'
import { callCloudFunction, showLoading, hideLoading, showToast } from '../utils/request'
import { setStorage, getStorage, removeStorage } from '../utils/storage'
import { CLOUD_FUNCTIONS, DEFAULT_AVATAR_URL, STORAGE_KEYS } from '../constants'

const LEGACY_DEFAULT_CLOUD_AVATAR = 'cloud://default-avatar.png'

type ProfileData = {
  nickname?: string
  avatar?: string
}

/**
 * 微信登录
 */
export const login = async (providedProfile?: ProfileData): Promise<User | null> => {
  let profileData: ProfileData = { ...(providedProfile || {}) }
  console.log('[LOGIN] Initial providedProfile:', providedProfile)
  console.log('[LOGIN] Current profileData:', profileData)

  // Ensure login session for cloud OPENID
  console.log('[LOGIN] Calling wx.login() for session...')
  try {
    const loginRes = await Taro.login()
    console.log('[LOGIN] wx.login res:', loginRes)
  } catch (loginError) {
    console.warn('[LOGIN] wx.login failed:', loginError)
  }

  showLoading('登录中...')

  try {
    console.log('[LOGIN] Sending to cloud:', profileData)
    const res = await callCloudFunction<LoginResult>(CLOUD_FUNCTIONS.LOGIN, profileData)
    console.log('[LOGIN] Cloud response:', res)

    hideLoading()

    const loginResult = (res.data || res) as any
    console.log('[LOGIN] Final loginResult:', loginResult)
    console.log('[LOGIN] Returned user:', loginResult?.user)

    if (res.success && loginResult.user) {
      const user = loginResult.user
      const profileAvatar = profileData.avatar
      const needsAvatarSync = shouldSyncWeChatAvatar(user.avatar, profileAvatar)
      const resolvedUser = needsAvatarSync && profileAvatar
        ? { ...user, avatar: profileAvatar }
        : user

      setStorage(STORAGE_KEYS.USER, resolvedUser)

      if (needsAvatarSync && profileAvatar) {
        await syncAvatarAfterLogin(profileAvatar)
      }

      if (loginResult.isNewUser) {
        showToast('注册成功', 'success')
      } else {
        showToast('登录成功', 'success')
      }

      return resolvedUser
    }

    console.error('登录失败:', res)
    showToast(res.error || '登录失败')
    return null
  } catch (error: any) {
    hideLoading()
    console.error('登录错误:', error)
    showToast('登录失败: ' + (error.message || error))
    return null
  }
}

export const checkExistingUser = async (): Promise<{ user: User | null; needProfile: boolean }> => {
  try {
    try {
      await Taro.login()
    } catch (loginError) {
      console.warn('[CHECK USER] wx.login failed:', loginError)
    }

    const res = await callCloudFunction<LoginResult>(CLOUD_FUNCTIONS.LOGIN, { onlyCheck: true })
    const loginResult = (res.data || res) as LoginResult

    if (loginResult.success && loginResult.user) {
      return { user: loginResult.user, needProfile: false }
    }

    return {
      user: null,
      needProfile: loginResult.needProfile !== false
    }
  } catch (error) {
    console.error('[CHECK USER] error:', error)
    return { user: null, needProfile: true }
  }
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): User | null => {
  return getStorage<User>(STORAGE_KEYS.USER)
}

/**
 * 用户登出
 */
export const logout = () => {
  removeStorage(STORAGE_KEYS.USER)
  showToast('退出成功', 'success')
}

/**
 * 更新用户资料
 */
export const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
  showLoading('保存中...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.UPDATE_USER_PROFILE, data)

    hideLoading()

    if (res.success) {
      const user = getUserInfo()
      if (user) {
        const updatedUser = { ...user, ...data }
        setStorage(STORAGE_KEYS.USER, updatedUser)
      }

      showToast('修改成功', 'success')
      return true
    } else {
      showToast(res.error || '修改失败')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('修改失败')
    return false
  }
}

/**
 * 上传头像 (已废弃,使用chooseAvatar代替)
 * 保留用于向后兼容
 */
export const uploadAvatar = async (): Promise<string | null> => {
  showToast('请使用新版头像选择功能', 'none')
  return null
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

const shouldSyncWeChatAvatar = (currentAvatar?: string, wechatAvatar?: string): wechatAvatar is string => {
  if (!wechatAvatar) return false
  if (!currentAvatar) return true

  const isCustomUpload = currentAvatar.startsWith('cloud://') && currentAvatar !== LEGACY_DEFAULT_CLOUD_AVATAR

  if (isCustomUpload) return false
  if (currentAvatar === LEGACY_DEFAULT_CLOUD_AVATAR || currentAvatar === DEFAULT_AVATAR_URL) return true

  return currentAvatar !== wechatAvatar
}

const syncAvatarAfterLogin = async (avatarUrl: string) => {
  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.UPDATE_USER_PROFILE, { avatar: avatarUrl })
    if (!res.success) {
      console.warn('头像同步失败:', res.error)
    }
  } catch (error) {
    console.error('头像同步错误:', error)
  }
}
