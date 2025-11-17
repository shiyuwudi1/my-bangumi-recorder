import { Anime, AnimeSearchResult, CalendarDay } from '../types/anime'
import { callCloudFunction, showLoading, hideLoading, showToast } from '../utils/request'
import { CLOUD_FUNCTIONS, BANGUMI_API_BASE } from '../constants'
import { saveSearchHistory } from '../utils/storage'
import Taro from '@tarojs/taro'

/**
 * 搜索动漫
 */
export const searchAnime = async (keyword: string): Promise<AnimeSearchResult[]> => {
  if (!keyword.trim()) {
    showToast('请输入搜索关键词')
    return []
  }

  showLoading('搜索中...')

  try {
    const res = await callCloudFunction<{ data: AnimeSearchResult[]; from: string }>(
      CLOUD_FUNCTIONS.SEARCH_ANIME,
      { keyword: keyword.trim() }
    )

    hideLoading()

    if (res.success && res.data?.data) {
      // 保存搜索历史
      saveSearchHistory(keyword.trim())

      return res.data.data
    } else {
      showToast(res.error || '搜索失败')
      return []
    }
  } catch (error) {
    hideLoading()
    showToast('搜索失败')
    return []
  }
}

/**
 * 获取动漫详情
 */
export const getAnimeDetail = async (animeId: number): Promise<Anime | null> => {
  showLoading('加载中...')

  try {
    const res = await callCloudFunction<{ data: Anime }>(
      CLOUD_FUNCTIONS.GET_ANIME_DETAIL,
      { animeId }
    )

    hideLoading()

    if (res.success && res.data?.data) {
      return res.data.data
    } else {
      showToast(res.error || '获取详情失败')
      return null
    }
  } catch (error) {
    hideLoading()
    showToast('获取详情失败')
    return null
  }
}

/**
 * 获取每日放送表
 */
export const getCalendar = async (): Promise<CalendarDay[]> => {
  try {
    const res = await Taro.request({
      url: `${BANGUMI_API_BASE}/calendar`,
      method: 'GET',
      header: {
        'User-Agent': 'MyBangumi/1.0 (https://github.com/my-bangumi)'
      }
    })

    if (res.statusCode === 200 && Array.isArray(res.data)) {
      return res.data as CalendarDay[]
    } else {
      console.error('获取每日放送失败:', res)
      return []
    }
  } catch (error) {
    console.error('获取每日放送出错:', error)
    return []
  }
}

/**
 * 获取推荐动漫（热门）
 */
export const getHotAnime = async (): Promise<AnimeSearchResult[]> => {
  // 这里可以调用云函数获取热门动漫
  // 暂时返回空数组，后续实现
  return []
}
