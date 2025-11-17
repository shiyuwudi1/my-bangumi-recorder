import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { AtButton } from 'taro-ui'
import { login } from '../../services/user'
import './index.scss'

const Login = () => {
  const [loading, setLoading] = useState(false)

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

  return (
    <View className="login-page">
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
