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
 * ????
 */
export const login = async (providedProfile?: ProfileData): Promise<User | null> => {
  let profileData: ProfileData = { ...(providedProfile || {}) }

  if (!profileData.nickname || !profileData.avatar) {
    try {
      const profileRes = await Taro.getUserProfile({
        desc: '??????????',
        lang: 'zh_CN'
      })

      profileData = {
        nickname: profileRes.userInfo.nickName,
        avatar: profileRes.userInfo.avatarUrl
      }
    } catch (profileError) {
      console.warn('??????????????:', profileError)
    }
  }

  showLoading('???...')

  try {
    console.log('?????????...')
    const res = await callCloudFunction<LoginResult>(CLOUD_FUNCTIONS.LOGIN, profileData)
    console.log('?????????:', res)

    hideLoading()

    const loginResult = (res.data || res) as any
    console.log('??????:', loginResult)

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
        showToast('?????', 'success')
      } else {
        showToast('????', 'success')
      }

      return resolvedUser
    }

    console.error('?????????:', res)
    showToast(res.error || '????')
    return null
  } catch (error: any) {
    hideLoading()
    console.error('????:', error)
    showToast('????: ' + (error.message || error))
    return null
  }
}

/**
 * ????????
 */
export const getUserInfo = (): User | null => {
  return getStorage<User>(STORAGE_KEYS.USER)
}

/**
 * ????
 */
export const logout = () => {
  removeStorage(STORAGE_KEYS.USER)
  showToast('?????', 'success')
}

/**
 * ??????
 */
export const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
  showLoading('???...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.UPDATE_USER_PROFILE, data)

    hideLoading()

    if (res.success) {
      const user = getUserInfo()
      if (user) {
        const updatedUser = { ...user, ...data }
        setStorage(STORAGE_KEYS.USER, updatedUser)
      }

      showToast('????', 'success')
      return true
    } else {
      showToast(res.error || '????')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('????')
    return false
  }
}

/**
 * ????
 */
export const uploadAvatar = async (): Promise<string | null> => {
  try {
    const chooseRes = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const tempFilePath = chooseRes.tempFilePaths[0]
    const user = getUserInfo()

    if (!user) {
      showToast('????')
      return null
    }

    showLoading('???...')

    const cloudPath = `avatars/${user.uid}_${Date.now()}.png`
    const uploadRes = await Taro.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: tempFilePath
    })

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
    showToast('????')
    return null
  }
}

/**
 * ?????
 */
export const bindPhone = async (phone: string): Promise<boolean> => {
  showLoading('???...')

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

      showToast('????', 'success')
      return true
    } else {
      showToast(res.error || '????')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('????')
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
      console.warn('????????:', res.error)
    }
  } catch (error) {
    console.error('????????:', error)
  }
}
