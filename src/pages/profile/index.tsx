import { View, Image, Button, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtIcon, AtList, AtListItem, AtToast } from 'taro-ui'
import { User } from '../../types/user'
import { getUserInfo, logout, updateUserProfile } from '../../services/user'
import { DEFAULT_AVATAR_URL } from '../../constants'
import './index.scss'

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [pendingAvatar, setPendingAvatar] = useState('')
  const [pendingNickname, setPendingNickname] = useState('')
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ text: string; type?: 'success' | 'error' } | null>(null)

  useDidShow(() => {
    loadUserInfo()
  })

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const loadUserInfo = () => {
    const userInfo = getUserInfo()
    setUser(userInfo)
    if (userInfo) {
      setPendingAvatar('')
      setPendingNickname(userInfo.nickname || '')
    }

    if (!userInfo) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
    }
  }

  const handleChooseAvatar = (e: any) => {
    const avatarUrl = e.detail.avatarUrl
    console.log('[PROFILE] Avatar chosen:', avatarUrl)
    setPendingAvatar(avatarUrl)
  }

  const handleNicknameTap = () => {
    setIsEditingNickname(true)
    setPendingNickname(user?.nickname || '')
  }

  const handleNicknameInput = (e: any) => {
    setPendingNickname(e.detail.value || '')
  }

  const handleNicknameConfirm = () => {
    setIsEditingNickname(false)
  }

  const hasPendingChanges = !!pendingAvatar || pendingNickname !== (user?.nickname || '')

  const handleSaveProfile = async () => {
    if (!hasPendingChanges || saving) return

    setSaving(true)
    const updates: any = {}
    if (pendingAvatar) {
      updates.avatar = pendingAvatar
    }
    if (pendingNickname !== user?.nickname) {
      updates.nickname = pendingNickname
    }

    const success = await updateUserProfile(updates)
    setSaving(false)

    if (success) {
      setToast({ text: '资料已更新', type: 'success' })
      loadUserInfo()
    } else {
      setToast({ text: '更新失败，请重试', type: 'error' })
    }
  }

  const handleDiscardChanges = () => {
    setPendingAvatar('')
    setPendingNickname(user?.nickname || '')
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          setUser(null)
          Taro.redirectTo({
            url: '/pages/login/index'
          })
        }
      }
    })
  }

  const handleStatClick = (status: 'watching' | 'watched' | 'wishlist') => {
    Taro.navigateTo({
      url: `/pages/collection-list/index?status=${status}`
    })
  }

  const handleLikedClick = () => {
    Taro.navigateTo({
      url: '/pages/collection-list/index?type=liked'
    })
  }

  if (!user) {
    return null
  }

  const resolvedAvatar = pendingAvatar || (user.avatar && user.avatar !== 'cloud://default-avatar.png' ? user.avatar : DEFAULT_AVATAR_URL)

  return (
    <View className="profile-page">
      <View className="user-info">
        <View className="avatar-container">
          <View className="avatar-wrapper">
            <Image className="avatar" src={resolvedAvatar} mode="aspectFill" />
            <Button
              className="choose-avatar-overlay"
              openType="chooseAvatar"
              onChooseAvatar={handleChooseAvatar}
            >
              <AtIcon value="camera" size={24} color="#fff" />
            </Button>
          </View>
          {pendingAvatar && (
            <View className="avatar-pending">头像已更改</View>
          )}
        </View>
        <View className="user-details">
          <View className="nickname-container" onClick={handleNicknameTap}>
            {isEditingNickname ? (
              <Input
                className="nickname-input-edit"
                type="text"
                value={pendingNickname}
                placeholder="昵称"
                onInput={handleNicknameInput}
                onConfirm={handleNicknameConfirm}
                onBlur={handleNicknameConfirm}
                maxlength={20}
                focus
              />
            ) : (
              <View className="nickname">{pendingNickname || user.nickname}</View>
            )}
          </View>
          <View className="uid">UID: {user.uid}</View>
        </View>
      </View>

      {hasPendingChanges && (
        <View className="save-bar">
          <View className="save-actions">
            <View className="discard-btn" onClick={handleDiscardChanges}>取消</View>
            <View className="save-btn" onClick={handleSaveProfile}>
              {saving ? '保存中...' : '保存'}
            </View>
          </View>
        </View>
      )}

      <AtToast
        isOpened={!!toast}
        text={toast?.text}
        status={toast?.type}
        onClose={() => setToast(null)}
        duration={2500}
      />

      <View className="stats-section">
        <View className="stat-item" onClick={() => handleStatClick('watching')}>
          <View className="stat-value">{user.stats.watching}</View>
          <View className="stat-label">在看</View>
        </View>
        <View className="stat-item" onClick={() => handleStatClick('watched')}>
          <View className="stat-value">{user.stats.watched}</View>
          <View className="stat-label">看过</View>
        </View>
        <View className="stat-item" onClick={() => handleStatClick('wishlist')}>
          <View className="stat-value">{user.stats.wishlist}</View>
          <View className="stat-label">想看</View>
        </View>
        <View className="stat-item" onClick={handleLikedClick}>
          <View className="stat-value">{user.stats.totalLikes}</View>
          <View className="stat-label">喜欢</View>
        </View>
      </View>

      <View className="settings-section">
        <AtList>
          <AtListItem
            title="手机号绑定"
            note={user.phone || '未绑定'}
            arrow="right"
            iconInfo={{ value: 'phone', color: '#42BD56', size: 22 }}
          />
          <AtListItem
            title="关于我们"
            arrow="right"
            iconInfo={{ value: 'alert-circle', color: '#42BD56', size: 22 }}
          />
          <AtListItem
            title="退出登录"
            arrow="right"
            onClick={handleLogout}
            iconInfo={{ value: 'close-circle', color: '#FF6B6B', size: 22 }}
          />
        </AtList>
      </View>
    </View>
  )
}

export default Profile
