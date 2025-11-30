import { View, Image, Button, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtIcon, AtList, AtListItem, AtModal, AtModalAction, AtModalContent, AtToast } from 'taro-ui'
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
  const [aboutVisible, setAboutVisible] = useState(false)

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

  const handleOpenAbout = () => {
    setAboutVisible(true)
  }

  const handleCloseAbout = () => {
    setAboutVisible(false)
  }

  const handleExploreApp = () => {
    setAboutVisible(false)
    Taro.switchTab({
      url: '/pages/index/index'
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

      <View className={`settings-section ${hasPendingChanges ? 'with-save-bar' : ''}`}>
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
            onClick={handleOpenAbout}
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

      <AtModal
        isOpened={aboutVisible}
        onClose={handleCloseAbout}
        closeOnClickOverlay
        className="about-modal"
      >
        <AtModalContent>
          <View className="about-modal__container">
            <View className="about-modal__header">
              <View className="about-modal__tag">My Bangumi Recorder</View>
              <View className="about-modal__title">关于我们</View>
              <View className="about-modal__subtitle">
                我们是一款专注番剧记录的轻量应用，帮你用最顺手的方式管理「在看 / 想看 / 看过」，同步热榜、提醒更新，让追番不再错过任何亮点。
              </View>
            </View>

            <View className="about-modal__features">
              <View className="about-feature-card">
                <View className="about-feature-card__title">智能追番</View>
                <View className="about-feature-card__desc">按状态分类整理清单，实时同步热度与详情，记录你的每一次心动。</View>
              </View>
              <View className="about-feature-card">
                <View className="about-feature-card__title">更新提醒</View>
                <View className="about-feature-card__desc">一键查看最新话数，系统会在番剧更新时提示，不再错过每一集。</View>
              </View>
              <View className="about-feature-card">
                <View className="about-feature-card__title">社交互动</View>
                <View className="about-feature-card__desc">点赞喜欢、展示个人收藏，和同好一起分享追番灵感。</View>
              </View>
            </View>

            <View className="about-modal__steps">
              <View className="about-step">
                <View className="about-step__index">01</View>
                <View className="about-step__text">搜索你想看的番剧，加入想看或收藏，打造专属片单。</View>
              </View>
              <View className="about-step">
                <View className="about-step__index">02</View>
                <View className="about-step__text">更新到新集时勾选进度，系统自动同步统计，记录成长轨迹。</View>
              </View>
              <View className="about-step">
                <View className="about-step__index">03</View>
                <View className="about-step__text">用喜欢功能表达态度，让更多人发现好番，找到同频伙伴。</View>
              </View>
            </View>

            <View className="about-modal__quote">「记录每一次追番的怦然心动，让热爱被看见」</View>
          </View>
        </AtModalContent>
        <AtModalAction>
          <Button className="about-modal__action" onClick={handleCloseAbout}>知道了</Button>
          <Button className="about-modal__action about-modal__action--primary" onClick={handleExploreApp}>立即体验</Button>
        </AtModalAction>
      </AtModal>
    </View>
  )
}

export default Profile
