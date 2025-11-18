// 收藏类型定义
export type CollectionStatus = 'wishlist' | 'watching' | 'watched'

export interface Collection {
  _id: string
  userId: string
  uid?: string
  animeId: string | number
  animeTitle: string
  animeCover: string
  status: CollectionStatus
  isLiked: boolean
  currentEpisode: number
  totalEpisodes: number
  currentSeason?: number
  totalSeasons?: number
  startDate?: number | null
  finishDate?: number | null
  updateTime: number
  createTime: number
  note?: string
  myRating?: number
}

export interface WatchHistory {
  _id: string
  userId: string
  animeId: number
  season: number
  episode: number
  watchTime: number
  duration?: number
}
