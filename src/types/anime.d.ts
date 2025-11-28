// 动漫类型定义
export interface Anime {
  id: number
  bangumiId: number
  name: string
  name_cn: string
  summary: string
  type: number
  eps: number
  airDate: string
  date: string
  platform: string
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
    rank: number
    count: {
      [key: string]: number
    }
  }
  tags?: Tag[]
  seasons?: AnimeSeason[]
  infobox?: InfoBoxItem[]
  total_episodes: number
  collection?: {
    on_hold: number
    dropped: number
    wish: number
    collect: number
    doing: number
  }
  meta_tags?: string[]
  volumes: number
  series: boolean
  locked: boolean
  nsfw: boolean
}

export interface Tag {
  name: string
  count: number
  total_cont: number
}

export interface InfoBoxItem {
  key: string
  value: string | { v: string }[]
}

export interface AnimeSeason {
  season: number
  name: string
  bangumiId: number
  episodes: number
}

export interface AnimeSearchResult {
  airDate: string;
  bangumiId: number;
  expireTime: number;
  images: Images;
  name: string;
  nameCn: string;
  summary: string;
  type: number;
  updateTime: number;
  _id: string;
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

export interface Images {
  large: string
  common: string
  medium: string
  small: string
  grid: string
}

// 剧集信息
export interface Episode {
  airdate: string
  name: string
  name_cn: string
  duration: string
  desc: string
  ep: number
  sort: number
  id: number
  subject_id: number
  comment: number
  type: number
  disc: number
  duration_seconds: number
}

// 剧集列表响应
export interface EpisodesResponse {
  data: Episode[]
  total: number
  limit: number
  offset: number
}
