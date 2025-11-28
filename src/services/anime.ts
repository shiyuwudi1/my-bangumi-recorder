import { Anime, AnimeSearchResult, CalendarDay, Episode } from '../types/anime'
import { callCloudFunction, showLoading, hideLoading, showToast } from '../utils/request'
import { CLOUD_FUNCTIONS, BANGUMI_API_BASE, BANGUMI_USER_AGENT } from '../constants'
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
    const res = await callCloudFunction<AnimeSearchResult[] | { data: AnimeSearchResult[] }>(
      CLOUD_FUNCTIONS.SEARCH_ANIME,
      { keyword: keyword.trim() }
    )

    hideLoading()

    if (res.success && res.data) {
      // 云函数返回 data 是数组，或者 data.data 是数组
      const resultList = Array.isArray(res.data) ? res.data : (res.data as any).data
      
      if (resultList && resultList.length > 0) {
        // 保存搜索历史
        saveSearchHistory(keyword.trim())
        return resultList
      } else {
        showToast('未搜索到相关内容')
        return []
      }
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
  console.log('获取动漫详情，ID:', animeId)
  try {
    const res = await callCloudFunction<Anime>(
      CLOUD_FUNCTIONS.GET_ANIME_DETAIL,
      { animeId }
    )

    hideLoading()
    console.log('动漫详情返回:', res)

    if (res.success && res.data) {
      return res.data
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
        'User-Agent': BANGUMI_USER_AGENT
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

/**
 * 获取动漫剧集列表
 */
export const getAnimeEpisodes = async (subjectId: number): Promise<{ episodes: any[], currentEpisode: number }> => {
  try {
    const res = await Taro.request({
      url: `${BANGUMI_API_BASE}/v0/episodes`,
      method: 'GET',
      data: {
        subject_id: subjectId,
        limit: 100,
        offset: 0
      },
      header: {
        'accept': 'application/json',
        'User-Agent': BANGUMI_USER_AGENT
      }
    })

    if (res.statusCode === 200 && res.data) {
      const episodesData = res.data as any
      const episodes = episodesData.data || []
      
      // 计算当前更新到第几集（根据airdate和今天日期对比）
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let currentEpisode = 0
      for (const ep of episodes) {
        if (ep.airdate) {
          const airDate = new Date(ep.airdate)
          airDate.setHours(0, 0, 0, 0)
          
          // 如果播出日期小于等于今天，说明已经播出了
          if (airDate <= today) {
            currentEpisode = ep.ep
          } else {
            break
          }
        }
      }
      
      return {
        episodes,
        currentEpisode
      }
    } else {
      console.error('获取剧集列表失败:', res)
      return { episodes: [], currentEpisode: 0 }
    }
  } catch (error) {
    console.error('获取剧集列表出错:', error)
    return { episodes: [], currentEpisode: 0 }
  }
}
