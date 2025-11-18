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
  const [currentEpisode, setCurrentEpisode] = useState(1)

  useLoad((options) => {
    const { id } = options
    if (id) {
      loadAnimeDetail(Number(id))
    }
  })

  const loadAnimeDetail = async (animeId) => {
    const data = await getAnimeDetail(animeId)
    console.log('Anime detail data:', data)
    if (data) {
      setAnime(data)
    }
  }

  const handleAddCollection = async (status) => {
    if (!anime) return

    const success = await addCollection(
      anime.id,
      anime.name_cn || anime.name,
      anime.images?.common || anime.images?.medium || '',
      status,
      anime.total_episodes || anime.eps || 0
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

    const result = await toggleLike(anime.id)
    if (result.success && result.isLiked !== undefined) {
      setIsLiked(result.isLiked)
    }
  }

  const handleUpdateProgress = async () => {
    if (!anime) return

    const success = await updateWatchProgress(
      anime.id,
      currentEpisode,
      anime.total_episodes || anime.eps || 0
    )

    if (success) {
      Taro.showToast({
        title: '进度更新成功',
        icon: 'success'
      })
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
          src={anime.images?.large || anime.images?.common || ''}
          mode="aspectFill"
        />
        <View className="header-overlay">
          <View className="title-section">
            <View className="title-cn">{anime.name_cn || anime.name}</View>
            <View className="title-jp">{anime.name}</View>
          </View>
        </View>
        {/* 喜欢按钮 */}
        <View className="like-button-float" onClick={handleToggleLike}>
          <AtIcon
            value={isLiked ? 'heart-2' : 'heart'}
            size="28"
            color={isLiked ? '#FF4757' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* 评分 */}
      {anime.rating && anime.rating.score > 0 && (
        <View className="rating-section">
          <View className="rating-score">{anime.rating.score.toFixed(1)}</View>
          <View className="rating-info">
            <View className="rating-label">Bangumi评分</View>
            <View className="rating-count">{anime.rating.total}人评分</View>
          </View>
        </View>
      )}

      {/* 简介 */}
      <View className="info-section">
        <View className="section-title">简介</View>
        <View className="summary">{anime.summary || '暂无简介'}</View>
      </View>

      {/* 标签 */}
      {anime.tags && anime.tags.length > 0 && (
        <View className="info-section">
          <View className="section-title">标签</View>
          <View className="tags-list">
            {anime.tags.slice(0, 10).map((tag, index) => (
              <View key={index} className="tag-item">
                {tag.name}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 收藏统计 */}
      {anime.collection && (
        <View className="info-section">
          <View className="section-title">收藏统计</View>
          <View className="collection-stats">
            <View className="stat-item">
              <View className="stat-value">{anime.collection.wish}</View>
              <View className="stat-label">想看</View>
            </View>
            <View className="stat-item">
              <View className="stat-value">{anime.collection.doing}</View>
              <View className="stat-label">在看</View>
            </View>
            <View className="stat-item">
              <View className="stat-value">{anime.collection.collect}</View>
              <View className="stat-label">看过</View>
            </View>
            <View className="stat-item">
              <View className="stat-value">{anime.collection.on_hold}</View>
              <View className="stat-label">搁置</View>
            </View>
            <View className="stat-item">
              <View className="stat-value">{anime.collection.dropped}</View>
              <View className="stat-label">弃坑</View>
            </View>
          </View>
        </View>
      )}

      {/* 基本信息 */}
      <View className="info-section">
        <View className="section-title">基本信息</View>
        {anime.date && (
          <View className="info-item">
            <View className="info-label">开播时间</View>
            <View className="info-value">{anime.date}</View>
          </View>
        )}
        {anime.total_episodes && (
          <View className="info-item">
            <View className="info-label">总集数</View>
            <View className="info-value">{anime.total_episodes}集</View>
          </View>
        )}
        {anime.eps && (
          <View className="info-item">
            <View className="info-label">当前集数</View>
            <View className="info-value">{anime.eps}集</View>
          </View>
        )}
        {anime.platform && (
          <View className="info-item">
            <View className="info-label">平台</View>
            <View className="info-value">{anime.platform}</View>
          </View>
        )}
        {anime.type !== undefined && (
          <View className="info-item">
            <View className="info-label">类型</View>
            <View className="info-value">
              {anime.type === 2 ? '动画' : anime.type === 1 ? '书籍' : anime.type === 3 ? '音乐' : anime.type === 4 ? '游戏' : anime.type === 6 ? '三次元' : '其他'}
            </View>
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
      </View>

      {/* 进度更新 */}
      {(anime.total_episodes || anime.eps) && (
        <View className="progress-section">
          <View className="section-title">更新观看进度</View>
          <View className="progress-selectors">
            <View className="selector">
              <View className="selector-label">看到第</View>
              <picker
                mode="selector"
                range={Array.from({ length: anime.total_episodes || anime.eps || 1 }, (_, i) => i + 1)}
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
      )}
    </View>
  )
}

export default AnimeDetail
