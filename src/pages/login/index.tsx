import { View, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtButton, AtIcon } from 'taro-ui'
import { login } from '../../services/user'
import './index.scss'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [canUseProfileButton, setCanUseProfileButton] = useState(true)

  useEffect(() => {
    const handleBackPress = () => {
      handleBack()
      return true
    }

    Taro.eventCenter.on('__taroRouterBack', handleBackPress)

    if (typeof Taro.canIUse === 'function') {
      const supported = Taro.canIUse('button.open-type.getUserProfile')
      if (!supported) {
        setCanUseProfileButton(false)
      }
    } else {
      setCanUseProfileButton(false)
    }

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

  const handleGetUserProfile = async (event: any) => {
    const detail = event?.detail

    if (detail?.errMsg === 'getUserProfile:ok' && detail.userInfo) {
      await handleLogin({
        nickname: detail.userInfo.nickName,
        avatar: detail.userInfo.avatarUrl
      })
    } else {
      await handleLogin()
    }
  }

  const handleBack = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  return (
    <View className="login-page">
      {/* ???? */}
      <View className="back-button" onClick={handleBack}>
        <AtIcon value="chevron-left" size="20" color="#333" />
        <View className="back-text">??</View>
      </View>
      
      <View className="login-container">
        <View className="logo">
          <View className="logo-icon">??</View>
          <View className="logo-text">????</View>
        </View>

        <View className="welcome">
          <View className="welcome-title">????</View>
          <View className="welcome-desc">??????????</View>
        </View>

        <View className="features">
          <View className="feature-item">
            <View className="feature-icon">??</View>
            <View className="feature-text">????</View>
          </View>
          <View className="feature-item">
            <View className="feature-icon">??</View>
            <View className="feature-text">????</View>
          </View>
          <View className="feature-item">
            <View className="feature-icon">??</View>
            <View className="feature-text">????</View>
          </View>
        </View>

        <View className="login-actions">
          {canUseProfileButton ? (
            <Button
              className="wx-login-button"
              openType="getUserProfile"
              lang="zh_CN"
              onGetUserProfile={handleGetUserProfile}
              loading={loading}
              disabled={loading}
            >
              ??????
            </Button>
          ) : (
            <AtButton
              type="primary"
              size="normal"
              loading={loading}
              onClick={() => handleLogin()}
            >
              ??????
            </AtButton>
          )}
          <View className="login-tip">
            ????????????????
          </View>
        </View>
      </View>
    </View>
  )
}

export default Login
