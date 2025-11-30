import { View, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtButton, AtIcon } from 'taro-ui'
import { login } from '../../services/user'
import './index.scss'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [userNickname, setUserNickname] = useState<string>('')
  const [showNicknameInput, setShowNicknameInput] = useState(false)

  useEffect(() => {
    const handleBackPress = () => {
      handleBack()
      return true
    }

    Taro.eventCenter.on('__taroRouterBack', handleBackPress)

    return () => {
      Taro.eventCenter.off('__taroRouterBack', handleBackPress)
    }
  }, [])

  const handleLogin = async (profileData?: { nickname?: string; avatar?: string }) => {
    if (loading) return

    setLoading(true)
    const user = await login(profileData)
    setLoading(false)

    if (user) {
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  }

  // 处理选择头像
  const handleChooseAvatar = (e: any) => {
    console.log('[LOGIN] Choose avatar:', e.detail.avatarUrl)
    setUserAvatar(e.detail.avatarUrl)
    setShowNicknameInput(true)
  }

  // 处理昵称输入
  const handleNicknameChange = (e: any) => {
    console.log('[LOGIN] Nickname input:', e.detail.value)
    setUserNickname(e.detail.value)
  }

  // 完成授权登录
  const handleCompleteLogin = async () => {
    if (!userAvatar || !userNickname) {
      Taro.showToast({
        title: '请先选择头像和输入昵称',
        icon: 'none'
      })
      return
    }
    
    console.log('[LOGIN] Complete login with:', { nickname: userNickname, avatar: userAvatar })
    await handleLogin({
      nickname: userNickname,
      avatar: userAvatar
    })
  }

  const handleBack = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  return (
    <View className="login-page">
      {/* 返回按钮 */}
      <View className="back-button" onClick={handleBack}>
        <AtIcon value="chevron-left" size="20" color="#333" />
        <View className="back-text">返回</View>
      </View>
      
      <View className="login-container">
        <View className="logo">
        <View className="logo-icon">📺</View>
        <View className="logo-text">我的番剧录</View>
        </View>

        <View className="welcome">
        <View className="welcome-title">欢迎使用</View>
        <View className="welcome-desc">记录你的追番之旅，管理收藏与进度</View>
        </View>

        <View className="features">
          <View className="feature-item">
            <View className="feature-icon">🔍</View>
            <View className="feature-text">番剧搜索</View>
          </View>
          <View className="feature-item">
            <View className="feature-icon">📱</View>
            <View className="feature-text">追番记录</View>
          </View>
          <View className="feature-item">
            <View className="feature-icon">📊</View>
            <View className="feature-text">数据统计</View>
          </View>
        </View>

        <View className="login-actions">
          {!showNicknameInput ? (
            <>
              <Button
                className="avatar-button"
                openType="chooseAvatar"
                onChooseAvatar={handleChooseAvatar}
              >
                选择头像并登录
              </Button>
              <AtButton
                type="secondary"
                size="normal"
                loading={loading}
                onClick={() => handleLogin()}
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                匿名登录
              </AtButton>
            </>
          ) : (
            <View className="nickname-input-section">
              <View className="input-label">请输入昵称</View>
              <Input
                type="nickname"
                className="nickname-input"
                placeholder="请输入昵称"
                onBlur={handleNicknameChange}
              />
              <AtButton
                type="primary"
                size="normal"
                loading={loading}
                onClick={handleCompleteLogin}
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                完成登录
              </AtButton>
            </View>
          )}
          <View className="login-tip">
            选择头像并输入昵称后登录，或使用匿名登录（后续可在个人中心修改）
          </View>
        </View>
      </View>
    </View>
  )
}

export default Login
