// 动漫类型定义
export interface Anime {
  id: number
  bangumiId: number
  name: string
  nameCn: string
  summary: string
  type: number
  eps: number
  airDate: string
  images: {
    large: string
    common: string
    medium: string
    small: string
    grid: string
  }
  rating: {
    total: number
    score: number
  }
  tags?: string[]
  seasons?: AnimeSeason[]
}

export interface AnimeSeason {
  season: number
  name: string
  bangumiId: number
  episodes: number
}

export interface AnimeSearchResult {
  id: number
  name: string
  name_cn: string
  summary: string
  images: {
    large: string
    common: string
    medium: string
  }
  rating: {
    total: number
    score: number
  }
  eps: number
  air_date: string
  type: number
}

// 每日放送相关类型
export interface CalendarItem {
  id: number
  url: string
  type: number
  name: string
  name_cn: string
  summary: string
  air_date: string
  air_weekday: number
  images?: {
    large: string
    common: string
    medium: string
    small: string
    grid: string
  }
  rating?: {
    total: number
    count: {
      [key: string]: number
    }
    score: number
  }
  rank?: number
  collection?: {
    doing: number
  }
}

export interface CalendarWeekday {
  en: string
  cn: string
  ja: string
  id: number
}

export interface CalendarDay {
  weekday: CalendarWeekday
  items: CalendarItem[]
}
