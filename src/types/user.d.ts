// 用户类型定义
export interface User {
  _id: string
  _openid?: string
  uid: string
  nickname: string
  avatar: string
  phone?: string
  phoneVerified: boolean
  createTime: number
  lastLoginTime: number
  stats: UserStats
}

export interface UserStats {
  totalAnime: number
  watching: number
  watched: number
  wishlist: number
  totalLikes: number
}

export interface LoginResult {
  success: boolean
  isNewUser: boolean
  user?: User
  error?: string
}
