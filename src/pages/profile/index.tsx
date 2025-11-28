import { View, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { AtIcon, AtList, AtListItem } from 'taro-ui'
import { User } from '../../types/user'
import { getUserInfo, logout, uploadAvatar } from '../../services/user'
import './index.scss'

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)

  useDidShow(() => {
    loadUserInfo()
  })

  const loadUserInfo = () => {
    const userInfo = getUserInfo()
    setUser(userInfo)

    if (!userInfo) {
      // 未登录，跳转到登录页（使用redirectTo避免返回循环）
      Taro.redirectTo({
        url: '/pages/login/index'
      })
    }
  }

  const handleAvatarClick = async () => {
    const avatar = await uploadAvatar()
    if (avatar) {
      loadUserInfo()
    }
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

  return (
    <View className="profile-page">
      {/* 用户信息 */}
      <View className="user-info">
        <View className="avatar" onClick={handleAvatarClick}>
          <Image
            src={user.avatar || 'https://via.placeholder.com/150'}
            mode="aspectFill"
          />
          <View className="avatar-tip">点击更换头像</View>
        </View>
        <View className="user-details">
          <View className="nickname">{user.nickname}</View>
          <View className="uid">UID: {user.uid}</View>
        </View>
      </View>

      {/* 统计信息 */}
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

      {/* 设置列表 */}
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
