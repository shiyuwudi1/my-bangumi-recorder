import { CollectionStatus } from '../types/collection'

// 收藏状态常量
export const COLLECTION_STATUS: Record<CollectionStatus, { label: string; color: string }> = {
  wishlist: {
    label: '想看',
    color: '#FF6B6B'
  },
  watching: {
    label: '在看',
    color: '#42BD56'
  },
  watched: {
    label: '看过',
    color: '#999'
  }
}

// 动漫类型
export const ANIME_TYPE = {
  1: '书籍',
  2: '动画',
  3: '音乐',
  4: '游戏',
  6: '三次元'
}

// Bangumi API 基础URL
export const BANGUMI_API_BASE = 'https://api.bgm.tv'
export const BANGUMI_USER_AGENT = 'shiyuwudi1/my-bangumi-recorder/1.0.0 (WeChat Mini Program Bangumi) (https://github.com/shiyuwudi1/my-bangumi-recorder)'
export const DEFAULT_AVATAR_URL = 'https://static.bgm.tv/img/avatar/ls.jpg'

// 云函数名称
export const CLOUD_FUNCTIONS = {
  LOGIN: 'login',
  UPDATE_USER_PROFILE: 'updateUserProfile',
  BIND_PHONE: 'bindPhone',
  SEARCH_ANIME: 'searchAnime',
  GET_ANIME_DETAIL: 'getAnimeDetail',
  ADD_COLLECTION: 'addCollection',
  REMOVE_COLLECTION: 'removeCollection',
  UPDATE_COLLECTION_STATUS: 'updateCollectionStatus',
  UPDATE_WATCH_PROGRESS: 'updateWatchProgress',
  TOGGLE_LIKE: 'toggleLike',
  GET_MY_COLLECTIONS: 'getMyCollections',
  GET_USER_STATS: 'getUserStats',
  GET_COLLECTION_DETAIL: 'getCollectionDetail'
}

// 本地存储 key
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  SEARCH_HISTORY: 'search_history',
  DEFAULT_WEEKDAY: 'default_weekday'
}
