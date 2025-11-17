import { View, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { AtButton, AtIcon } from 'taro-ui'
import { getAnimeDetail } from '../../services/anime'
import { addCollection, toggleLike, updateWatchProgress } from '../../services/collection'
import { COLLECTION_STATUS } from '../../constants'
import './index.scss'

const AnimeDetail = () => {
  const [anime, setAnime] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [currentSeason, setCurrentSeason] = useState(1)
  const [currentEpisode, setCurrentEpisode] = useState(1)

  useLoad((options) => {
    const { id } = options
    if (id) {
      loadAnimeDetail(Number(id))
    }
  })

  const loadAnimeDetail = async (animeId) => {
    const data = await getAnimeDetail(animeId)
    if (data) {
      setAnime(data)
    }
  }

  const handleAddCollection = async (status) => {
    if (!anime) return

    const success = await addCollection(
      anime.bangumiId,
      anime.nameCn || anime.name,
      anime.images.common,
      status,
      anime.seasons?.length || 1
    )

    if (success) {
      Taro.showToast({
        title: `已添加到${COLLECTION_STATUS[status].label}`,
        icon: 'success'
      })
    }
  }

  const handleToggleLike = async () => {
    if (!anime) return

    const result = await toggleLike(anime.bangumiId)
    if (result.success && result.isLiked !== undefined) {
      setIsLiked(result.isLiked)
    }
  }

  const handleUpdateProgress = async () => {
    if (!anime) return

    const success = await updateWatchProgress(
      anime.bangumiId,
      currentSeason,
      currentEpisode
    )

    if (success) {
      // 可以在这里更新UI
    }
  }

  if (!anime) {
    return (
      <View className="anime-detail-page">
        <View className="loading">加载中...</View>
      </View>
    )
  }

  return (
    <View className="anime-detail-page">
      {/* 封面和基本信息 */}
      <View className="header">
        <Image
          className="cover"
          src={anime.images.large || anime.images.common}
          mode="aspectFill"
        />
        <View className="header-overlay">
          <View className="title-section">
            <View className="title-cn">{anime.nameCn}</View>
            <View className="title-jp">{anime.name}</View>
          </View>
        </View>
      </View>

      {/* 评分 */}
      {anime.rating && anime.rating.score > 0 && (
        <View className="rating-section">
          <View className="rating-score">{anime.rating.score.toFixed(1)}</View>
          <View className="rating-info">
            <View className="rating-label">豆瓣评分</View>
            <View className="rating-count">{anime.rating.total}人评分</View>
          </View>
        </View>
      )}

      {/* 简介 */}
      <View className="info-section">
        <View className="section-title">简介</View>
        <View className="summary">{anime.summary || '暂无简介'}</View>
      </View>

      {/* 基本信息 */}
      <View className="info-section">
        <View className="section-title">基本信息</View>
        <View className="info-item">
          <View className="info-label">开播时间</View>
          <View className="info-value">{anime.airDate}</View>
        </View>
        <View className="info-item">
          <View className="info-label">集数</View>
          <View className="info-value">{anime.eps}集</View>
        </View>
        {anime.seasons && anime.seasons.length > 0 && (
          <View className="info-item">
            <View className="info-label">季数</View>
            <View className="info-value">{anime.seasons.length}季</View>
          </View>
        )}
      </View>

      {/* 操作按钮 */}
      <View className="actions-section">
        <View className="action-buttons">
          <AtButton
            type="secondary"
            size="small"
            onClick={() => handleAddCollection('wishlist')}
          >
            想看
          </AtButton>
          <AtButton
            type="primary"
            size="small"
            onClick={() => handleAddCollection('watching')}
          >
            在看
          </AtButton>
          <AtButton
            type="secondary"
            size="small"
            onClick={() => handleAddCollection('watched')}
          >
            看过
          </AtButton>
        </View>

        <View className="like-button" onClick={handleToggleLike}>
          <AtIcon
            value={isLiked ? 'heart-2' : 'heart'}
            size="24"
            color={isLiked ? '#FF6B6B' : '#999'}
          />
          <View className="like-text">{isLiked ? '已喜欢' : '喜欢'}</View>
        </View>
      </View>

      {/* 进度更新 */}
      <View className="progress-section">
        <View className="section-title">更新观看进度</View>
        <View className="progress-selectors">
          <View className="selector">
            <View className="selector-label">第</View>
            <picker
              mode="selector"
              range={Array.from({ length: anime.seasons?.length || 1 }, (_, i) => i + 1)}
              onChange={(e) => setCurrentSeason(e.detail.value + 1)}
            >
              <View className="selector-value">{currentSeason}</View>
            </picker>
            <View className="selector-label">季</View>
          </View>
          <View className="selector">
            <View className="selector-label">第</View>
            <picker
              mode="selector"
              range={Array.from({ length: anime.eps }, (_, i) => i + 1)}
              onChange={(e) => setCurrentEpisode(e.detail.value + 1)}
            >
              <View className="selector-value">{currentEpisode}</View>
            </picker>
            <View className="selector-label">集</View>
          </View>
        </View>
        <AtButton type="primary" onClick={handleUpdateProgress}>
          更新进度
        </AtButton>
      </View>
    </View>
  )
}

export default AnimeDetail
