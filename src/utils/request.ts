import Taro from '@tarojs/taro'

/**
 * 网络请求封装
 */
export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

export interface RequestResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

export const request = async <T = any>(options: RequestOptions): Promise<RequestResult<T>> => {
  try {
    const { url, method = 'GET', data, header = {} } = options

    const res = await Taro.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      }
    })

    if (res.statusCode === 200) {
      return {
        success: true,
        data: res.data as T
      }
    } else {
      return {
        success: false,
        error: `请求失败: ${res.statusCode}`
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '网络请求失败'
    }
  }
}

/**
 * 云函数调用封装
 */
export const callCloudFunction = async <T = any>(
  name: string,
  data: any = {}
): Promise<RequestResult<T>> => {
  try {
    const res = await Taro.cloud.callFunction({
      name,
      data
    })

    if (res.result) {
      return res.result as RequestResult<T>
    } else {
      return {
        success: false,
        error: '云函数调用失败'
      }
    }
  } catch (error: any) {
    console.error(`云函数 ${name} 调用失败:`, error)
    return {
      success: false,
      error: error.message || '云函数调用失败'
    }
  }
}

/**
 * 显示Loading
 */
export const showLoading = (title: string = '加载中...') => {
  Taro.showLoading({ title, mask: true })
}

/**
 * 隐藏Loading
 */
export const hideLoading = () => {
  Taro.hideLoading()
}

/**
 * 显示Toast
 */
export const showToast = (title: string, icon: 'success' | 'error' | 'none' = 'none') => {
  Taro.showToast({
    title,
    icon: icon === 'error' ? 'none' : icon,
    duration: 2000
  })
}

/**
 * 确认对话框
 */
export const showConfirm = async (content: string, title: string = '提示'): Promise<boolean> => {
  try {
    const res = await Taro.showModal({
      title,
      content
    })
    return res.confirm
  } catch {
    return false
  }
}
