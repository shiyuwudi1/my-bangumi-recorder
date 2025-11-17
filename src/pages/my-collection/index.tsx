import { View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { AtTabs, AtTabsPane } from 'taro-ui'
import { Collection } from '../../types/collection'
import { getMyCollections } from '../../services/collection'
import './index.scss'

const MyCollection = () => {
  const [current, setCurrent] = useState(0)
  const [watchingList, setWatchingList] = useState<Collection[]>([])
  const [watchedList, setWatchedList] = useState<Collection[]>([])
  const [wishlist, setWishlist] = useState<Collection[]>([])

  const tabs = [
    { title: '在看' },
    { title: '看过' },
    { title: '想看' }
  ]

  useDidShow(() => {
    loadCollections()
  })

  const loadCollections = async () => {
    const watching = await getMyCollections('watching')
    const watched = await getMyCollections('watched')
    const wish = await getMyCollections('wishlist')

    setWatchingList(watching)
    setWatchedList(watched)
    setWishlist(wish)
  }

  const renderCollectionList = (list: Collection[]) => {
    if (list.length === 0) {
      return (
        <View className="empty-hint">
          暂无收藏，快去添加吧！
        </View>
      )
    }

    return (
      <View className="collection-list">
        {list.map((item) => (
          <View key={item._id} className="collection-item">
            <View className="cover">
              <image src={item.animeCover} mode="aspectFill" />
              {item.isLiked && (
                <View className="like-badge">❤️</View>
              )}
            </View>
            <View className="content">
              <View className="title">{item.animeName}</View>
              {item.status === 'watching' && (
                <View className="progress">
                  第{item.currentSeason}季 · 第{item.currentEpisode}集
                </View>
              )}
              {item.myRating && (
                <View className="my-rating">我的评分：{item.myRating}</View>
              )}
              {item.note && (
                <View className="note">{item.note}</View>
              )}
            </View>
          </View>
        ))}
      </View>
    )
  }

  return (
    <View className="my-collection-page">
      <AtTabs current={current} tabList={tabs} onClick={setCurrent}>
        <AtTabsPane current={current} index={0}>
          <View className="tab-content">
            {renderCollectionList(watchingList)}
          </View>
        </AtTabsPane>
        <AtTabsPane current={current} index={1}>
          <View className="tab-content">
            {renderCollectionList(watchedList)}
          </View>
        </AtTabsPane>
        <AtTabsPane current={current} index={2}>
          <View className="tab-content">
            {renderCollectionList(wishlist)}
          </View>
        </AtTabsPane>
      </AtTabs>
    </View>
  )
}

export default MyCollection
