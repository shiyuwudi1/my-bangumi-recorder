import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import 'taro-ui/dist/style/index.scss'
import './app.scss'

function App(props) {

  useEffect(() => {
    // 初始化云开发环境
    if (Taro.cloud) {
      Taro.cloud.init({
        // env: 'your-env-id', // 请在开通云开发后，将环境ID填入此处
        traceUser: true
      })
    }

    // 检查登录状态
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const user = Taro.getStorageSync('user')
      if (!user) {
        // 如果未登录，自动登录
        console.log('用户未登录，需要登录')
        // 可以在这里调用登录逻辑，或者跳转到登录页
      } else {
        console.log('用户已登录:', user.nickname)
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  }

  return props.children
}

export default App
