import Taro from '@tarojs/taro'
import { STORAGE_KEYS } from '../constants'

/**
 * 存储数据
 */
export const setStorage = <T = any>(key: string, data: T): void => {
  try {
    Taro.setStorageSync(key, data)
  } catch (error) {
    console.error('存储数据失败:', error)
  }
}

/**
 * 获取数据
 */
export const getStorage = <T = any>(key: string): T | null => {
  try {
    const data = Taro.getStorageSync(key)
    return data as T
  } catch (error) {
    console.error('获取数据失败:', error)
    return null
  }
}

/**
 * 删除数据
 */
export const removeStorage = (key: string): void => {
  try {
    Taro.removeStorageSync(key)
  } catch (error) {
    console.error('删除数据失败:', error)
  }
}

/**
 * 清空所有数据
 */
export const clearStorage = (): void => {
  try {
    Taro.clearStorageSync()
  } catch (error) {
    console.error('清空数据失败:', error)
  }
}

/**
 * 保存搜索历史
 */
export const saveSearchHistory = (keyword: string): void => {
  if (!keyword.trim()) return

  const history = getStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || []

  // 去重
  const newHistory = [keyword, ...history.filter(item => item !== keyword)]

  // 最多保存10条
  setStorage(STORAGE_KEYS.SEARCH_HISTORY, newHistory.slice(0, 10))
}

/**
 * 获取搜索历史
 */
export const getSearchHistory = (): string[] => {
  return getStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || []
}

/**
 * 清空搜索历史
 */
export const clearSearchHistory = (): void => {
  removeStorage(STORAGE_KEYS.SEARCH_HISTORY)
}

/**
 * 保存默认展示的星期索引（0-6，周一至周日）
 */
export const saveDefaultWeekday = (dayIndex: number): void => {
  if (dayIndex < 0 || dayIndex > 6) return
  setStorage(STORAGE_KEYS.DEFAULT_WEEKDAY, dayIndex)
}

/**
 * 获取默认展示的星期索引
 */
export const getDefaultWeekday = (): number | null => {
  const stored = getStorage<number>(STORAGE_KEYS.DEFAULT_WEEKDAY)
  if (typeof stored === 'number' && stored >= 0 && stored <= 6) {
    return stored
  }
  return null
}
