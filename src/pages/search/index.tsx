import { View, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtLoadMore } from 'taro-ui'
import { AnimeSearchResult } from '../../types/anime'
import { searchAnime } from '../../services/anime'
import './index.scss'

const Search = () => {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<AnimeSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useLoad((options) => {
    const { keyword: searchKeyword } = options
    if (searchKeyword) {
      setKeyword(decodeURIComponent(searchKeyword))
      handleSearch(decodeURIComponent(searchKeyword))
    }
  })

  const handleSearch = async (searchKeyword: string) => {
    setLoading(true)
    const data = await searchAnime(searchKeyword)
    console.log('搜索结果:', data)
    setResults(data)
    setLoading(false)
  }

  const handleAnimeClick = (anime: AnimeSearchResult) => {
    console.log('点击了动漫:', anime)
    Taro.navigateTo({
      url: `/pages/anime-detail/index?id=${anime.bangumiId}`
    })
  }

  // 处理图片URL，确保使用HTTPS协议
  const getSecureImageUrl = (url: string): string => {
    if (!url) return ''
    
    // 如果已经是HTTPS，直接返回
    if (url.startsWith('https://')) {
      return url
    }
    
    // 如果是HTTP，替换为HTTPS
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }
    
    // 如果是相对协议（//开头），添加HTTPS
    if (url.startsWith('//')) {
      return `https:${url}`
    }
    
    return url
  }

  return (
    <View className="search-page">
      <View className="search-header">
        搜索结果：{keyword}
      </View>

      {loading ? (
        <AtLoadMore status="loading" />
      ) : results.length > 0 ? (
        <View className="result-list">
          {results.map((anime) => (
            <View
              key={anime._id}
              className="anime-card"
              onClick={() => handleAnimeClick(anime)}
            >
              <View className="cover">
                <Image
                  src={getSecureImageUrl(anime.images.common)}
                  mode="aspectFill"
                  lazyLoad
                  onError={(e) => {
                    console.error('图片加载失败:', e.detail.errMsg)
                  }}
                />
              </View>
              <View className="content">
                <View className="title">{anime.nameCn || anime.name}</View>
                <View className="subtitle">{anime.name}</View>
                {anime.rating && anime.rating.score > 0 && (
                  <View className="rating">
                    <View className="score">{anime.rating.score.toFixed(1)}</View>
                    <View className="count">({anime.rating.total}人评分)</View>
                  </View>
                )}
                <View className="summary text-ellipsis-2">{anime.summary}</View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="empty-hint">
          没有找到相关动漫，换个关键词试试吧
        </View>
      )}
    </View>
  )
}

export default Search
