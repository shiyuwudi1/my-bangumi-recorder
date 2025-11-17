// 收藏类型定义
export type CollectionStatus = 'wishlist' | 'watching' | 'watched'

export interface Collection {
  _id: string
  userId: string
  uid: string
  animeId: number
  animeName: string
  animeCover: string
  status: CollectionStatus
  isLiked: boolean
  currentSeason: number
  currentEpisode: number
  totalSeasons: number
  startDate: number | null
  finishDate: number | null
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
