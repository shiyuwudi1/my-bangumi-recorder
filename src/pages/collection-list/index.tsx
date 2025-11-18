import { View, Image } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Collection } from '../../types/collection'
import { getMyCollections } from '../../services/collection'
import './index.scss'

const CollectionList = () => {
  const [status, setStatus] = useState<'watching' | 'watched' | 'wishlist'>('watching')
  const [list, setList] = useState<Collection[]>([])
  const [title, setTitle] = useState('在看')

  useLoad((options) => {
    const { status: queryStatus } = options as any
    if (queryStatus) {
      setStatus(queryStatus)
      // 设置页面标题
      const titles: Record<string, string> = {
        watching: '在看',
        watched: '看过',
        wishlist: '想看'
      }
      setTitle(titles[queryStatus] || '我的收藏')
      Taro.setNavigationBarTitle({
        title: titles[queryStatus] || '我的收藏'
      })
    }
  })

  useDidShow(() => {
    loadCollections()
  })

  const loadCollections = async () => {
    const data = await getMyCollections(status)
    setList(data)
  }

  const handleItemClick = (item: Collection) => {
    Taro.navigateTo({
      url: `/pages/anime-detail/index?id=${item.animeId}`
    })
  }

  return (
    <View className="collection-list-page">
      <View className="list-header">
        <View className="count">共 {list.length} 部</View>
      </View>

      {list.length === 0 ? (
        <View className="empty-hint">
          暂无内容
        </View>
      ) : (
        <View className="collection-list">
          {list.map((item) => (
            <View
              key={item._id}
              className="collection-item"
              onClick={() => handleItemClick(item)}
            >
              <View className="cover">
                <Image src={item.animeCover} mode="aspectFill" />
                {item.isLiked && (
                  <View className="like-badge">❤️</View>
                )}
              </View>
              <View className="content">
                <View className="title">{item.animeTitle}</View>
                {item.status === 'watching' && (
                  <View className="progress">
                    第{item.currentEpisode}集 / 共{item.totalEpisodes}集
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
      )}
    </View>
  )
}

export default CollectionList
