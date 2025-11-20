import { View, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { AtButton, AtIcon } from 'taro-ui'
import { getAnimeDetail } from '../../services/anime'
import { addCollection, toggleLike, updateWatchProgress, getCollectionDetail } from '../../services/collection'
import { COLLECTION_STATUS } from '../../constants'
import './index.scss'

const AnimeDetail = () => {
  const [anime, setAnime] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [currentSeason, setCurrentSeason] = useState(1)
  const [currentEpisode, setCurrentEpisode] = useState(0)
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([])
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [collectionStatus, setCollectionStatus] = useState<string | null>(null)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

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
      // 加载收藏详情
      loadCollectionDetail(animeId)
    }
  }

  const loadCollectionDetail = async (animeId) => {
    const collection = await getCollectionDetail(animeId)
    if (collection) {
      setCollectionId(collection._id)
      setCollectionStatus(collection.status || null)
      setIsLiked(collection.isLiked || false)
      setCurrentSeason(collection.currentSeason || 1)
      setCurrentEpisode(collection.currentEpisode || 0)
      // 根据当前集数生成已观看列表
      const watched = Array.from({ length: collection.currentEpisode || 0 }, (_, i) => i + 1)
      setWatchedEpisodes(watched)
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
      // 重新加载收藏详情
      loadCollectionDetail(anime.id)
    } else {
      Taro.showToast({
        title: '添加失败，请重试',
        icon: 'none'
      })
    }
  }

  const handleToggleLike = async () => {
    if (!anime) return

    const result = await toggleLike(anime.id)
    if (result.success && result.isLiked !== undefined) {
      setIsLiked(result.isLiked)
    } else if (result.needLogin) {
      // 需要登录，跳转到登录页
      Taro.showModal({
        title: '提示',
        content: '此操作需要登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/login/index'
            })
          }
        }
      })
    }
  }

  const handleEpisodeClick = async (episode: number) => {
    if (!anime) return

    // 检查是否已收藏
    if (!collectionId) {
      Taro.showModal({
        title: '提示',
        content: '需要先添加到收藏（想看、在看或看过）才能标记观看进度',
        confirmText: '添加收藏',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确认，可以滚动到操作按钮部分
            // 这里可以触发滚动到操作按钮
          }
        }
      })
      return
    }

    // 判断是标记还是取消标记
    const isWatched = watchedEpisodes.includes(episode)

    if (isWatched) {
      // 取消标记：只能取消最后一集
      if (episode === currentEpisode) {
        const newEpisode = episode - 1
        await updateProgress(newEpisode)
      } else {
        Taro.showToast({
          title: '只能撤销最新进度',
          icon: 'none'
        })
      }
    } else {
      // 标记为已看：更新到该集
      await updateProgress(episode)
    }
  }

  const updateProgress = async (episode: number) => {
    if (!anime) return

    const success = await updateWatchProgress(
      anime.id,
      episode,
      anime.total_episodes || anime.eps || 0
    )

    if (success) {
      setCurrentEpisode(episode)
      const watched = Array.from({ length: episode }, (_, i) => i + 1)
      setWatchedEpisodes(watched)
    }
  }

  // 计算进度百分比
  const getProgressPercent = () => {
    const total = anime?.total_episodes || anime?.eps || 0
    if (total === 0) return 0
    return Math.round((currentEpisode / total) * 100)
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

  // 渲染集数按钮
  const renderEpisodeButtons = () => {
    const total = anime?.total_episodes || anime?.eps || 0
    if (total === 0) return null

    const episodes = Array.from({ length: total }, (_, i) => i + 1)

    return (
      <View className="episode-grid">
        {episodes.map((ep) => {
          const isWatched = watchedEpisodes.includes(ep)
          const isCurrent = ep === currentEpisode
          const btnClass = `episode-btn ${isWatched ? 'watched' : ''} ${isCurrent ? 'current' : ''}`

          return (
            <View
              key={ep}
              className={btnClass}
              onClick={() => handleEpisodeClick(ep)}
            >
              {ep}
            </View>
          )
        })}
      </View>
    )
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
          src={getSecureImageUrl(anime.images?.large || anime.images?.common || '')}
          mode="aspectFill"
          lazyLoad
          onError={(e) => {
            console.error('图片加载失败:', e.detail.errMsg)
          }}
        />
        <Image
          className="cover-image"
          src={getSecureImageUrl(anime.images?.large || anime.images?.common || '')}
          mode="aspectFill"
          lazyLoad
          onError={(e) => {
            console.error('图片加载失败:', e.detail.errMsg)
          }}
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

      {/* 操作按钮 */}
      <View className="actions-section">
        <View className="action-buttons">
          <View
            className={`action-btn wishlist ${collectionStatus === 'wishlist' ? 'active' : ''}`}
            onClick={() => handleAddCollection('wishlist')}
          >
            <View className="btn-label">想看</View>
            {collectionStatus === 'wishlist' && (
              <View className="btn-status">
                <View className="status-dot"></View>
              </View>
            )}
          </View>
          <View
            className={`action-btn watching ${collectionStatus === 'watching' ? 'active' : ''}`}
            onClick={() => handleAddCollection('watching')}
          >
            <View className="btn-label">在看</View>
            {collectionStatus === 'watching' && (
              <View className="btn-status">
                <View className="status-dot"></View>
              </View>
            )}
          </View>
          <View
            className={`action-btn watched ${collectionStatus === 'watched' ? 'active' : ''}`}
            onClick={() => handleAddCollection('watched')}
          >
            <View className="btn-label">看过</View>
            {collectionStatus === 'watched' && (
              <View className="btn-status">
                <View className="status-dot"></View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 观看进度 */}
      {(anime.total_episodes || anime.eps) && (
        <View className="progress-section">
          <View className="progress-header">
            <View className="section-title">观看进度</View>
            <View className="progress-stats">
              已看 {currentEpisode}/{anime.total_episodes || anime.eps} 集  进度 {getProgressPercent()}%
            </View>
          </View>
          {renderEpisodeButtons()}
        </View>
      )}

      {/* 简介 */}
      <View className="info-section">
        <View className="section-title">简介</View>
        <View className="summary-container">
          <View className={`summary ${summaryExpanded ? 'expanded' : 'collapsed'}`}>
            {anime.summary || '暂无简介'}
          </View>
          {anime.summary && anime.summary.length > 100 && (
            <View 
              className="expand-btn"
              onClick={() => setSummaryExpanded(!summaryExpanded)}
            >
              {summaryExpanded ? '收起' : '展开'}
            </View>
          )}
        </View>
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
    </View>
  )
}

export default AnimeDetail
