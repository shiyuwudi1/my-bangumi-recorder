import { View, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { AtButton, AtIcon, AtFloatLayout } from 'taro-ui'
import { getAnimeDetail, getAnimeEpisodes } from '../../services/anime'
import { addCollection, toggleLike, updateWatchProgress, getCollectionDetail } from '../../services/collection'
import { COLLECTION_STATUS } from '../../constants'
import { Anime, Episode } from '../../types/anime'
import { CollectionStatus } from '../../types/collection'
import './index.scss'

const AnimeDetail = () => {
  const [anime, setAnime] = useState<Anime | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [currentSeason, setCurrentSeason] = useState(1)
  const [currentEpisode, setCurrentEpisode] = useState(0)
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([])
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [collectionStatus, setCollectionStatus] = useState<string | null>(null)
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [airedEpisodes, setAiredEpisodes] = useState(0) // 当前已更新集数
  const [episodesLoading, setEpisodesLoading] = useState(true) // 集数加载状态
  const [episodesList, setEpisodesList] = useState<Episode[]>([]) // 剧集列表
  const [showEpisodeDetail, setShowEpisodeDetail] = useState(false) // 显示剧集详情弹窗
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null) // 当前选中的剧集

  useLoad((options) => {
    const { id } = options
    if (id) {
      loadAnimeDetail(Number(id))
    }
  })

  const loadAnimeDetail = async (animeId: number) => {
    const data = await getAnimeDetail(animeId)
    console.log('Anime detail data:', data)
    if (data) {
      setAnime(data)
      // 加载收藏详情
      loadCollectionDetail(animeId)
      // 加载剧集信息，获取当前更新集数
      loadEpisodes(animeId)
    }
  }

  const loadEpisodes = async (animeId: number) => {
    setEpisodesLoading(true)
    const { episodes, currentEpisode } = await getAnimeEpisodes(animeId)
    console.log('剧集信息:', episodes)
    console.log('当前更新到第', currentEpisode, '集')
    setAiredEpisodes(currentEpisode)
    setEpisodesList(episodes) // 保存完整剧集列表
    setEpisodesLoading(false)
  }

  const loadCollectionDetail = async (animeId: number) => {
    const { collection, isLiked: likedFromServer } = await getCollectionDetail(animeId)
    setIsLiked(likedFromServer)

    if (collection) {
      setCollectionId(collection._id)
      setCollectionStatus(collection.status || null)
      setCurrentSeason(collection.currentSeason || 1)
      setCurrentEpisode(collection.currentEpisode || 0)
      // 根据当前集数生成已观看列表
      const watched = Array.from({ length: collection.currentEpisode || 0 }, (_, i) => i + 1)
      setWatchedEpisodes(watched)
    } else {
      setCollectionId(null)
      setCollectionStatus(null)
      setCurrentSeason(1)
      setCurrentEpisode(0)
      setWatchedEpisodes([])
    }
  }

  const handleAddCollection = async (status: CollectionStatus) => {
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
        title: `已添加到${COLLECTION_STATUS[status as keyof typeof COLLECTION_STATUS].label}`,
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

  const handleEpisodeClick = (episode: number) => {
    if (!anime) return

    // 弹出操作菜单
    Taro.showActionSheet({
      itemList: [
        `标记看到第${episode}集`,
        `查看第${episode}集详情`
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 标记进度
          handleMarkProgress(episode)
        } else if (res.tapIndex === 1) {
          // 查看详情
          handleShowEpisodeDetail(episode)
        }
      }
    })
  }

  // 标记观看进度
  const handleMarkProgress = async (episode: number) => {
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

  // 显示剧集详情
  const handleShowEpisodeDetail = (episode: number) => {
    const episodeData = episodesList.find(ep => ep.ep === episode)
    
    if (!episodeData) {
      Taro.showToast({
        title: '暂无该集详情',
        icon: 'none'
      })
      return
    }

    setSelectedEpisode(episodeData)
    setShowEpisodeDetail(true)
  }

  // 判断剧集是否已播出
  const isEpisodeAired = (airdate: string): boolean => {
    if (!airdate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const airDate = new Date(airdate)
    airDate.setHours(0, 0, 0, 0)
    return airDate <= today
  }

  // 格式化时长
  const formatDuration = (duration: string): string => {
    if (!duration) return '未知'
    // "00:12:55" -> "12分55秒"
    const parts = duration.split(':')
    if (parts.length === 3) {
      const hours = parseInt(parts[0])
      const minutes = parseInt(parts[1])
      const seconds = parseInt(parts[2])
      if (hours > 0) {
        return `${hours}小时${minutes}分${seconds}秒`
      }
      return `${minutes}分${seconds}秒`
    }
    return duration
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
        <View className="info-item">
          <View className="info-label">已更新</View>
          <View className="info-value">
            {episodesLoading ? (
              <AtIcon value='loading-3' size='16' className='loading-icon' />
            ) : (
              airedEpisodes > 0 ? `${airedEpisodes}集` : '暂无数据'
            )}
          </View>
        </View>
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

      {/* 剧集详情弹窗 */}
      <AtFloatLayout
        isOpened={showEpisodeDetail}
        title={selectedEpisode ? `第${selectedEpisode.ep}集` : ''}
        onClose={() => setShowEpisodeDetail(false)}
      >
        {selectedEpisode && (
          <View className="episode-detail-content">
            {/* 标题 */}
            <View className="detail-section">
              <View className="detail-icon">📺</View>
              <View className="detail-text">
                <View className="detail-title-cn">
                  {selectedEpisode.name_cn || selectedEpisode.name || '未命名'}
                </View>
                {selectedEpisode.name && selectedEpisode.name !== selectedEpisode.name_cn && (
                  <View className="detail-title-jp">{selectedEpisode.name}</View>
                )}
              </View>
            </View>

            {/* 播出时间 */}
            {selectedEpisode.airdate && (
              <View className="detail-section">
                <View className="detail-icon">📅</View>
                <View className="detail-text">
                  <View className="detail-label">播出时间</View>
                  <View className="detail-value">
                    {selectedEpisode.airdate}
                    <View className={`aired-status ${isEpisodeAired(selectedEpisode.airdate) ? 'aired' : 'not-aired'}`}>
                      {isEpisodeAired(selectedEpisode.airdate) ? '已播出' : '未播出'}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 时长 */}
            {selectedEpisode.duration && (
              <View className="detail-section">
                <View className="detail-icon">⏱️</View>
                <View className="detail-text">
                  <View className="detail-label">时长</View>
                  <View className="detail-value">{formatDuration(selectedEpisode.duration)}</View>
                </View>
              </View>
            )}

            {/* 评论数 */}
            <View className="detail-section">
              <View className="detail-icon">💬</View>
              <View className="detail-text">
                <View className="detail-label">评论数</View>
                <View className="detail-value">{selectedEpisode.comment || 0}条</View>
              </View>
            </View>

            {/* 剧集简介 */}
            {selectedEpisode.desc && (
              <View className="detail-section desc-section">
                <View className="detail-icon">📝</View>
                <View className="detail-text">
                  <View className="detail-label">剧集简介</View>
                  <View className="detail-desc">{selectedEpisode.desc}</View>
                </View>
              </View>
            )}

            {/* 操作按钮 */}
            {collectionId && (
              <View className="detail-actions">
                <AtButton
                  type="primary"
                  onClick={() => {
                    setShowEpisodeDetail(false)
                    handleMarkProgress(selectedEpisode.ep)
                  }}
                >
                  标记看到第{selectedEpisode.ep}集
                </AtButton>
              </View>
            )}
          </View>
        )}
      </AtFloatLayout>
    </View>
  )
}

export default AnimeDetail
