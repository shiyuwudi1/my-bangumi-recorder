import { Collection, CollectionStatus } from '../types/collection'
import { callCloudFunction, showLoading, hideLoading, showToast } from '../utils/request'
import { CLOUD_FUNCTIONS } from '../constants'

/**
 * 添加收藏
 */
export const addCollection = async (
  animeId: number,
  animeName: string,
  animeCover: string,
  status: CollectionStatus,
  totalSeasons: number = 1
): Promise<boolean> => {
  showLoading('添加中...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.ADD_COLLECTION, {
      animeId,
      animeName,
      animeCover,
      status,
      totalSeasons
    })

    hideLoading()

    if (res.success) {
      showToast('添加成功', 'success')
      return true
    } else {
      showToast(res.error || '添加失败')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('添加失败')
    return false
  }
}

/**
 * 移除收藏
 */
export const removeCollection = async (animeId: number): Promise<boolean> => {
  showLoading('移除中...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.REMOVE_COLLECTION, { animeId })

    hideLoading()

    if (res.success) {
      showToast('已移除', 'success')
      return true
    } else {
      showToast(res.error || '移除失败')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('移除失败')
    return false
  }
}

/**
 * 更新收藏状态
 */
export const updateCollectionStatus = async (
  animeId: number,
  status: CollectionStatus
): Promise<boolean> => {
  showLoading('更新中...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.UPDATE_COLLECTION_STATUS, {
      animeId,
      status
    })

    hideLoading()

    if (res.success) {
      showToast('更新成功', 'success')
      return true
    } else {
      showToast(res.error || '更新失败')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('更新失败')
    return false
  }
}

/**
 * 更新观看进度
 */
export const updateWatchProgress = async (
  animeId: number,
  season: number,
  episode: number
): Promise<boolean> => {
  showLoading('更新进度...')

  try {
    const res = await callCloudFunction(CLOUD_FUNCTIONS.UPDATE_WATCH_PROGRESS, {
      animeId,
      season,
      episode
    })

    hideLoading()

    if (res.success) {
      showToast('进度已更新', 'success')
      return true
    } else {
      showToast(res.error || '更新失败')
      return false
    }
  } catch (error) {
    hideLoading()
    showToast('更新失败')
    return false
  }
}

/**
 * 切换喜欢状态
 */
export const toggleLike = async (animeId: number): Promise<{ success: boolean; isLiked?: boolean; needLogin?: boolean }> => {
  try {
    const res = await callCloudFunction<{ isLiked: boolean }>(
      CLOUD_FUNCTIONS.TOGGLE_LIKE,
      { animeId }
    )

    if (res.success && res.data) {
      showToast(res.data.isLiked ? '已喜欢' : '已取消喜欢', 'success')
      return { success: true, isLiked: res.data.isLiked }
    } else {
      // 检查是否是用户不存在的错误
      if (res.error === '用户不存在' || res.error === '收藏不存在，请先添加收藏') {
        return { success: false, needLogin: true }
      }
      showToast(res.error || '操作失败')
      return { success: false }
    }
  } catch (error) {
    showToast('操作失败')
    return { success: false }
  }
}

/**
 * 获取我的收藏列表
 */
export const getMyCollections = async (status?: CollectionStatus): Promise<Collection[]> => {
  showLoading('加载中...')

  try {
    const res = await callCloudFunction<{ data: Collection[] }>(
      CLOUD_FUNCTIONS.GET_MY_COLLECTIONS,
      { status }
    )

    hideLoading()

    if (res.success && res.data?.data) {
      return res.data.data
    } else {
      showToast(res.error || '获取失败')
      return []
    }
  } catch (error) {
    hideLoading()
    showToast('获取失败')
    return []
  }
}

/**
 * 获取收藏详情
 */
export const getCollectionDetail = async (animeId: number): Promise<Collection | null> => {
  try {
    const res = await callCloudFunction<Collection>(
      CLOUD_FUNCTIONS.GET_COLLECTION_DETAIL,
      { animeId }
    )

    if (res.success && res.data) {
      return res.data as any
    } else {
      return null
    }
  } catch (error) {
    console.error('获取收藏详情失败:', error)
    return null
  }
}
