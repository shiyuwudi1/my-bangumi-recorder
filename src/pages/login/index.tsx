import { View, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtButton, AtIcon } from 'taro-ui'
import { login, checkExistingUser } from '../../services/user'
import './index.scss'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [userNickname, setUserNickname] = useState<string>('')
  const [showNicknameInput, setShowNicknameInput] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [autoLoginError, setAutoLoginError] = useState('')

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
    if (loading) return false

    setLoading(true)
    const user = await login(profileData)
    setLoading(false)

    if (user) {
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
      return true
    }

    return false
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

  useEffect(() => {
    const autoLoginIfNeeded = async () => {
      setAutoLoginError('')
      setHasExistingProfile(false)
      setNeedsProfileSetup(false)
      setInitializing(true)

      const result = await checkExistingUser()

      if (result.user) {
        setHasExistingProfile(true)
        const loggedIn = await handleLogin()
        if (loggedIn) {
          return
        }
        setAutoLoginError('自动登录失败，请点击下方按钮重试')
        setInitializing(false)
        return
      }

      setNeedsProfileSetup(true)
      setInitializing(false)
    }

    autoLoginIfNeeded()
  }, [])

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
          {initializing ? (
            <View className="login-loading">正在读取账号信息...</View>
          ) : hasExistingProfile ? (
            <>
              <View className="existing-login-title">欢迎回来</View>
              <View className="existing-login-desc">检测到你已登录过，直接使用已保存的头像和昵称即可。</View>
              {autoLoginError && (
                <View className="login-tip error-text">{autoLoginError}</View>
              )}
              <AtButton
                type="primary"
                size="normal"
                loading={loading}
                onClick={() => handleLogin()}
                disabled={loading}
                style={{ marginTop: '20px' }}
              >
                直接登录
              </AtButton>
              <View className="login-tip">
                如需更新头像或昵称，可登录后在「我的」页面中修改
              </View>
            </>
          ) : needsProfileSetup ? (
            <>
              {!showNicknameInput ? (
                <Button
                  className="avatar-button"
                  openType="chooseAvatar"
                  onChooseAvatar={handleChooseAvatar}
                >
                  选择头像并登录
                </Button>
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
                首次登录需选择头像并填写昵称，后续可在个人中心随时修改
              </View>
            </>
          ) : null}
        </View>
      </View>
    </View>
  )
}

export default Login
