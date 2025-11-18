import { View } from '@tarojs/components'
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
    setResults(data)
    setLoading(false)
  }

  const handleAnimeClick = (anime: AnimeSearchResult) => {
    console.log('点击了动漫:', anime)
    Taro.navigateTo({
      url: `/pages/anime-detail/index?id=${anime.bangumiId}`
    })
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
              key={anime.id}
              className="anime-card"
              onClick={() => handleAnimeClick(anime)}
            >
              <View className="cover">
                <image src={anime.images.common} mode="aspectFill" />
              </View>
              <View className="content">
                <View className="title">{anime.name_cn || anime.name}</View>
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
