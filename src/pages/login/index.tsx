import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtButton, AtIcon } from 'taro-ui'
import { login } from '../../services/user'
import './index.scss'

const Login = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 监听系统返回按键
    const handleBackPress = () => {
      handleBack()
      return true // 阻止默认返回行为
    }

    // 添加返回按键监听（使用 Taro 的事件监听）
    Taro.eventCenter.on('__taroRouterBack', handleBackPress)

    // 清理函数
    return () => {
      Taro.eventCenter.off('__taroRouterBack', handleBackPress)
    }
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    const user = await login()
    setLoading(false)

    if (user) {
      // 登录成功，返回上一页或跳转到首页
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  }

  const handleBack = () => {
    // 返回首页
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
          <View className="logo-text">我的番组</View>
        </View>

        <View className="welcome">
          <View className="welcome-title">欢迎使用</View>
          <View className="welcome-desc">记录你的动漫观看进度</View>
        </View>

        <View className="features">
          <View className="feature-item">
            <View className="feature-icon">🔍</View>
            <View className="feature-text">搜索动漫</View>
          </View>
          <View className="feature-item">
            <View className="feature-icon">📝</View>
            <View className="feature-text">记录进度</View>
          </View>
          <View className="feature-item">
            <View className="feature-icon">❤️</View>
            <View className="feature-text">收藏喜欢</View>
          </View>
        </View>

        <View className="login-actions">
          <AtButton
            type="primary"
            size="normal"
            loading={loading}
            onClick={handleLogin}
          >
            微信一键登录
          </AtButton>
          <View className="login-tip">
            登录即代表同意用户协议和隐私政策
          </View>
        </View>
      </View>
    </View>
  )
}

export default Login
