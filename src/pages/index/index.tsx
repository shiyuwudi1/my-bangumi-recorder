import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { AtSearchBar } from 'taro-ui'
import { CalendarDay, CalendarItem } from '../../types/anime'
import { getCalendar } from '../../services/anime'
import { getSearchHistory, clearSearchHistory } from '../../utils/storage'
import './index.scss'

const Index = () => {
  const [keyword, setKeyword] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([])
  const [currentDay, setCurrentDay] = useState(0) // 当前选中的星期
  const [loading, setLoading] = useState(false)

  // 星期映射
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  useEffect(() => {
    loadSearchHistory()
    loadCalendarData()

    // 设置当前星期
    const today = new Date().getDay()
    // 转换为周一=0的格式
    const dayIndex = today === 0 ? 6 : today - 1
    setCurrentDay(dayIndex)
  }, [])

  const loadSearchHistory = () => {
    const history = getSearchHistory()
    setSearchHistory(history)
  }

  const loadCalendarData = async () => {
    setLoading(true)
    const data = await getCalendar()
    setCalendarData(data)
    setLoading(false)
  }

  const handleSearch = () => {
    if (!keyword.trim()) {
      Taro.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }

    Taro.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(keyword)}`
    })
  }

  const handleSearchChange = (value: string) => {
    setKeyword(value)
  }

  const handleHistoryClick = (item: string) => {
    Taro.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(item)}`
    })
  }

  const handleClearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          clearSearchHistory()
          setSearchHistory([])
          Taro.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  }

  const handleAnimeClick = (anime: CalendarItem) => {
    Taro.navigateTo({
      url: `/pages/anime-detail/index?id=${anime.id}`
    })
  }

  const handleDayChange = (index: number) => {
    setCurrentDay(index)
  }

  const getCurrentDayItems = (): CalendarItem[] => {
    if (calendarData.length === 0) return []
    const dayData = calendarData.find(d => d.weekday.id === currentDay + 1)
    return dayData?.items || []
  }

  return (
    <View className="index-page">
      {/* 搜索框 */}
      <View className="search-bar-wrapper">
        <AtSearchBar
          value={keyword}
          onChange={handleSearchChange}
          onActionClick={handleSearch}
          onConfirm={handleSearch}
          placeholder="搜索动漫..."
          actionName="搜索"
        />
      </View>

      {/* 搜索历史 */}
      {searchHistory.length > 0 && (
        <View className="search-history">
          <View className="history-header">
            <Text className="history-title">搜索历史</Text>
            <Text className="history-clear" onClick={handleClearHistory}>
              清空
            </Text>
          </View>
          <View className="history-list">
            {searchHistory.map((item, index) => (
              <View
                key={index}
                className="history-item"
                onClick={() => handleHistoryClick(item)}
              >
                {item}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 每日放送 */}
      <View className="calendar-section">
        <View className="section-title">每日放送</View>

        {/* 星期选择器 */}
        <ScrollView scrollX className="weekday-tabs">
          {weekdays.map((day, index) => (
            <View
              key={index}
              className={`weekday-tab ${currentDay === index ? 'active' : ''}`}
              onClick={() => handleDayChange(index)}
            >
              <Text className="weekday-text">{day}</Text>
              {currentDay === index && <View className="tab-indicator" />}
            </View>
          ))}
        </ScrollView>

        {/* 动漫列表 */}
        <View className="anime-list">
          {loading ? (
            <View className="loading-hint">加载中...</View>
          ) : getCurrentDayItems().length > 0 ? (
            getCurrentDayItems().map((anime) => (
              <View
                key={anime.id}
                className="anime-card"
                onClick={() => handleAnimeClick(anime)}
              >
                <Image
                  className="anime-cover"
                  src={anime.images?.common || anime.images?.medium || ''}
                  mode="aspectFill"
                  lazyLoad
                />
                <View className="anime-info">
                  <Text className="anime-title">
                    {anime.name_cn || anime.name}
                  </Text>
                  <Text className="anime-name-jp">{anime.name}</Text>
                  {anime.rating && anime.rating.score > 0 && (
                    <View className="anime-rating">
                      <Text className="rating-score">{anime.rating.score.toFixed(1)}</Text>
                      <Text className="rating-count">({anime.rating.total}人评分)</Text>
                    </View>
                  )}
                  {anime.collection && (
                    <Text className="anime-watching">
                      {anime.collection.doing}人在看
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="empty-hint">暂无放送数据</View>
          )}
        </View>
      </View>
    </View>
  )
}

export default Index
