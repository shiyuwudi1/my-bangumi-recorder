# 动漫观看进度微信小程序 - 项目实施方案

> 项目名称：My Bangumi（我的番组计划）
>
> 版本：v1.0
>
> 更新日期：2025年11月17日

---

## 一、项目概述

### 1.1 项目目标

开发一款动漫观看进度管理微信小程序，帮助用户记录和管理动漫观看进度，发现和收藏感兴趣的动漫作品。

### 1.2 核心特性

- 中文/日文动漫搜索
- 观看进度记录（季/集）
- 想看/在看/看过状态管理
- 作品点赞（喜欢）功能
- 微信登录 + 手机号绑定
- 用户个性化设置（头像、6位UID）
- 豆瓣风格界面

### 1.3 目标用户

- 动漫爱好者
- 需要管理观看进度的用户
- 喜欢记录和分享的用户

---

## 二、技术栈清单

### 2.1 前端技术栈

```yaml
框架: Taro 3.6+
语言: TypeScript 5.0+
UI库: Taro UI 3.1+
状态管理: React Hooks + Context API
样式: SCSS
打包工具: Webpack 5
```

### 2.2 后端技术栈

```yaml
架构: 微信云开发 (Serverless)
云函数: Node.js 16
数据库: 云数据库 (MongoDB)
存储: 云存储
认证: 微信登录
```

### 2.3 第三方服务

```yaml
动漫数据: Bangumi API (https://bangumi.github.io/api/)
可选短信: 腾讯云短信服务 (手机号验证码)
```

### 2.4 开发工具

```yaml
IDE: VS Code
小程序开发工具: 微信开发者工具
版本控制: Git
包管理: npm / yarn / pnpm
```

---

## 三、项目架构设计

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────┐
│                   微信小程序端                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 首页搜索  │  │ 我的收藏 │  │ 个人中心  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                   ↓ Taro                        │
└─────────────────────────────────────────────────┘
                    ↓ HTTP / WebSocket
┌─────────────────────────────────────────────────┐
│                  微信云开发                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  云函数   │  │  云数据库 │  │  云存储   │      │
│  │ (Node.js) │  │ (MongoDB) │  │ (头像)   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                    ↓ HTTP
┌─────────────────────────────────────────────────┐
│               Bangumi API                        │
│            (动漫元数据服务)                        │
└─────────────────────────────────────────────────┘
```

### 3.2 前端项目结构

```
my-bangumi/
├── src/
│   ├── pages/                    # 页面
│   │   ├── index/               # 首页（搜索+推荐）
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── search/              # 搜索结果页
│   │   ├── anime-detail/        # 动漫详情页
│   │   ├── my-collection/       # 我的收藏
│   │   │   ├── watching.tsx     # 在看
│   │   │   ├── watched.tsx      # 看过
│   │   │   └── wishlist.tsx     # 想看
│   │   ├── profile/             # 个人中心
│   │   └── login/               # 登录页
│   ├── components/               # 公共组件
│   │   ├── AnimeCard/           # 动漫卡片组件
│   │   ├── EpisodeSelector/     # 集数选择器
│   │   ├── SeasonSelector/      # 季数选择器
│   │   └── RatingStars/         # 评分星星
│   ├── services/                 # 服务层
│   │   ├── anime.ts             # 动漫相关API
│   │   ├── user.ts              # 用户相关API
│   │   └── collection.ts        # 收藏相关API
│   ├── utils/                    # 工具函数
│   │   ├── request.ts           # 网络请求封装
│   │   ├── storage.ts           # 本地存储
│   │   └── date.ts              # 日期处理
│   ├── constants/                # 常量定义
│   │   └── status.ts            # 观看状态常量
│   ├── types/                    # TypeScript类型定义
│   │   ├── anime.d.ts
│   │   ├── user.d.ts
│   │   └── collection.d.ts
│   ├── app.config.ts             # 应用配置
│   ├── app.tsx                   # 应用入口
│   └── app.scss                  # 全局样式
├── cloud/                        # 云函数
│   ├── functions/
│   │   ├── login/               # 登录
│   │   ├── searchAnime/         # 搜索动漫
│   │   ├── getAnimeDetail/      # 获取动漫详情
│   │   ├── updateWatchProgress/ # 更新观看进度
│   │   ├── addCollection/       # 添加收藏
│   │   ├── removeCollection/    # 移除收藏
│   │   ├── toggleLike/          # 切换喜欢状态
│   │   └── getUserProfile/      # 获取用户信息
│   └── database/                 # 数据库初始化脚本
│       └── init.json
├── project.config.json           # 小程序配置
├── package.json
└── tsconfig.json
```

### 3.3 云函数设计

#### 云函数列表

| 函数名 | 功能 | 触发方式 |
|--------|------|---------|
| `login` | 用户登录/注册 | 小程序调用 |
| `updateUserProfile` | 更新用户信息 | 小程序调用 |
| `bindPhone` | 绑定手机号 | 小程序调用 |
| `searchAnime` | 搜索动漫 | 小程序调用 |
| `getAnimeDetail` | 获取动漫详情 | 小程序调用 |
| `syncAnimeData` | 同步动漫数据（定时） | 定时触发 |
| `addCollection` | 添加收藏 | 小程序调用 |
| `removeCollection` | 移除收藏 | 小程序调用 |
| `updateCollectionStatus` | 更新收藏状态 | 小程序调用 |
| `updateWatchProgress` | 更新观看进度 | 小程序调用 |
| `toggleLike` | 切换喜欢状态 | 小程序调用 |
| `getMyCollections` | 获取我的收藏列表 | 小程序调用 |
| `getUserStats` | 获取用户统计 | 小程序调用 |

### 3.4 数据库设计

#### 3.4.1 用户表 `users`

```javascript
{
  _id: "auto_generated",           // 系统生成的唯一ID
  _openid: "user_openid",          // 微信OpenID（云开发自动生成）
  uid: "123456",                   // 6位数字UID
  nickname: "动漫爱好者",            // 昵称
  avatar: "cloud://...",           // 头像云存储路径
  phone: "13800138000",            // 手机号（可选）
  phoneVerified: false,            // 手机号是否验证
  createTime: 1700000000000,       // 注册时间（时间戳）
  lastLoginTime: 1700000000000,    // 最后登录时间
  stats: {                         // 用户统计
    totalAnime: 50,                // 收藏总数
    watching: 5,                   // 在看数量
    watched: 40,                   // 看过数量
    wishlist: 5,                   // 想看数量
    totalLikes: 20                 // 点赞总数
  }
}
```

**索引：**
- `_openid` (唯一)
- `uid` (唯一)
- `phone` (唯一, 稀疏索引)

#### 3.4.2 动漫缓存表 `anime_cache`

用于缓存Bangumi API的动漫数据，减少API调用

```javascript
{
  _id: "auto_generated",
  bangumiId: 55770,                // Bangumi动漫ID
  name: "進撃の巨人",               // 日文名
  nameCn: "进击的巨人",             // 中文名
  summary: "作品简介...",           // 简介
  type: 2,                         // 类型：2=动画
  eps: 25,                         // 总集数
  airDate: "2013-04-07",           // 开播日期
  images: {                        // 图片
    large: "https://...",
    common: "https://...",
    medium: "https://...",
    small: "https://...",
    grid: "https://..."
  },
  rating: {                        // 评分
    total: 12345,                  // 评分人数
    score: 8.5                     // 评分
  },
  tags: ["动作", "科幻"],           // 标签
  seasons: [                       // 季信息（手动维护或从API获取）
    {
      season: 1,
      name: "进击的巨人 第一季",
      bangumiId: 55770,
      episodes: 25
    },
    {
      season: 2,
      name: "进击的巨人 第二季",
      bangumiId: 183088,
      episodes: 12
    }
  ],
  updateTime: 1700000000000,       // 缓存更新时间
  expireTime: 1700086400000        // 缓存过期时间（24小时后）
}
```

**索引：**
- `bangumiId` (唯一)
- `nameCn` (文本索引)
- `name` (文本索引)
- `expireTime` (TTL索引，自动删除过期数据)

#### 3.4.3 收藏表 `collections`

```javascript
{
  _id: "auto_generated",
  userId: "user_openid",           // 用户OpenID
  uid: "123456",                   // 用户UID（冗余，便于查询）
  animeId: 55770,                  // Bangumi动漫ID
  animeName: "进击的巨人",          // 动漫名称（冗余）
  animeCover: "https://...",       // 封面图（冗余）
  status: "watching",              // 状态：wishlist/watching/watched
  isLiked: true,                   // 是否点赞/喜欢
  currentSeason: 1,                // 当前观看的季（watching时有效）
  currentEpisode: 15,              // 当前观看到第几集（watching时有效）
  totalSeasons: 4,                 // 总季数
  startDate: 1700000000000,        // 开始看的时间
  finishDate: null,                // 看完的时间（watched时有值）
  updateTime: 1700000000000,       // 最后更新时间
  createTime: 1700000000000,       // 添加到收藏的时间
  note: "超级好看！",               // 备注（可选）
  myRating: 9                      // 个人评分 1-10（可选）
}
```

**索引：**
- `userId` + `animeId` (联合唯一索引)
- `userId` + `status` (联合索引)
- `userId` + `isLiked` (联合索引)
- `updateTime` (降序)

#### 3.4.4 观看历史表 `watch_history`

可选表，用于记录更详细的观看历史

```javascript
{
  _id: "auto_generated",
  userId: "user_openid",
  animeId: 55770,
  season: 1,
  episode: 15,
  watchTime: 1700000000000,        // 观看时间
  duration: 1440000                // 观看时长（毫秒），可选
}
```

**索引：**
- `userId` + `animeId` (联合索引)
- `watchTime` (降序)

#### 3.4.5 UID计数器表 `counters`

用于生成递增的6位UID

```javascript
{
  _id: "user_uid",                 // 固定ID
  seq: 100000                      // 当前序列号（从100000开始）
}
```

---

## 四、核心功能实现方案

### 4.1 动漫搜索功能

#### 4.1.1 搜索流程

```
用户输入关键词
    ↓
前端调用云函数 searchAnime
    ↓
云函数先查询本地缓存（anime_cache）
    ↓
如果缓存命中且未过期 → 返回缓存结果
    ↓
如果缓存未命中 → 调用 Bangumi API
    ↓
存储到 anime_cache（设置24小时过期）
    ↓
返回结果给前端
```

#### 4.1.2 云函数实现示例

```javascript
// cloud/functions/searchAnime/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { keyword, type = 2 } = event  // type=2表示动画

  try {
    // 1. 先查询本地缓存
    const cacheResult = await db.collection('anime_cache')
      .where({
        $or: [
          { nameCn: db.RegExp({ regexp: keyword, options: 'i' }) },
          { name: db.RegExp({ regexp: keyword, options: 'i' }) }
        ],
        expireTime: db.command.gt(Date.now())
      })
      .limit(20)
      .get()

    if (cacheResult.data.length > 0) {
      return { success: true, data: cacheResult.data, from: 'cache' }
    }

    // 2. 缓存未命中，调用Bangumi API
    const response = await axios.get(
      `https://api.bgm.tv/search/subject/${encodeURIComponent(keyword)}`,
      { params: { type } }
    )

    const animeList = response.data.list || []

    // 3. 存储到缓存（批量写入）
    const now = Date.now()
    const expireTime = now + 24 * 60 * 60 * 1000  // 24小时后过期

    for (const anime of animeList.slice(0, 20)) {  // 只缓存前20条
      await db.collection('anime_cache').add({
        data: {
          bangumiId: anime.id,
          name: anime.name,
          nameCn: anime.name_cn,
          summary: anime.summary,
          type: anime.type,
          eps: anime.eps,
          airDate: anime.air_date,
          images: anime.images,
          rating: anime.rating,
          updateTime: now,
          expireTime: expireTime
        }
      }).catch(err => {
        // 忽略重复插入错误
        if (err.errCode !== -502002) throw err
      })
    }

    return { success: true, data: animeList, from: 'api' }

  } catch (error) {
    console.error('Search error:', error)
    return { success: false, error: error.message }
  }
}
```

#### 4.1.3 前端调用

```typescript
// src/services/anime.ts
import Taro from '@tarojs/taro'

export interface AnimeSearchResult {
  id: number
  name: string
  name_cn: string
  summary: string
  images: {
    large: string
    common: string
    medium: string
  }
  rating: {
    total: number
    score: number
  }
  eps: number
}

export const searchAnime = async (keyword: string): Promise<AnimeSearchResult[]> => {
  Taro.showLoading({ title: '搜索中...' })

  try {
    const res = await Taro.cloud.callFunction({
      name: 'searchAnime',
      data: { keyword }
    })

    Taro.hideLoading()

    if (res.result.success) {
      return res.result.data
    } else {
      Taro.showToast({ title: '搜索失败', icon: 'none' })
      return []
    }
  } catch (error) {
    Taro.hideLoading()
    Taro.showToast({ title: '网络错误', icon: 'none' })
    return []
  }
}
```

### 4.2 用户登录与注册

#### 4.2.1 登录流程

```
小程序启动
    ↓
调用 wx.cloud.callFunction('login')
    ↓
云函数获取 openid（自动）
    ↓
查询 users 表是否存在该用户
    ↓
如果存在 → 更新lastLoginTime，返回用户信息
    ↓
如果不存在 → 创建新用户（生成UID），返回用户信息
    ↓
前端存储用户信息到本地
```

#### 4.2.2 云函数实现

```javascript
// cloud/functions/login/index.js
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 生成6位UID
async function generateUID() {
  const counterRes = await db.collection('counters')
    .doc('user_uid')
    .update({
      data: {
        seq: _.inc(1)
      }
    })

  // 如果计数器不存在，先创建
  if (counterRes.stats.updated === 0) {
    await db.collection('counters').add({
      data: {
        _id: 'user_uid',
        seq: 100000
      }
    })
    return '100000'
  }

  // 获取最新的序列号
  const counter = await db.collection('counters').doc('user_uid').get()
  return counter.data.seq.toString()
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查询用户是否存在
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()

    const now = Date.now()

    if (userRes.data.length > 0) {
      // 用户已存在，更新最后登录时间
      const user = userRes.data[0]
      await db.collection('users').doc(user._id).update({
        data: { lastLoginTime: now }
      })

      return { success: true, isNewUser: false, user }
    } else {
      // 新用户，创建账号
      const uid = await generateUID()

      const newUser = {
        _openid: openid,
        uid: uid,
        nickname: '用户' + uid,
        avatar: 'cloud://default-avatar.png',  // 默认头像
        phone: null,
        phoneVerified: false,
        createTime: now,
        lastLoginTime: now,
        stats: {
          totalAnime: 0,
          watching: 0,
          watched: 0,
          wishlist: 0,
          totalLikes: 0
        }
      }

      const addRes = await db.collection('users').add({
        data: newUser
      })

      newUser._id = addRes._id

      return { success: true, isNewUser: true, user: newUser }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: error.message }
  }
}
```

#### 4.2.3 前端调用

```typescript
// src/services/user.ts
import Taro from '@tarojs/taro'

export interface User {
  _id: string
  uid: string
  nickname: string
  avatar: string
  phone?: string
  stats: {
    totalAnime: number
    watching: number
    watched: number
    wishlist: number
    totalLikes: number
  }
}

export const login = async (): Promise<User | null> => {
  try {
    const res = await Taro.cloud.callFunction({
      name: 'login',
      data: {}
    })

    if (res.result.success) {
      const user = res.result.user
      // 存储到本地
      Taro.setStorageSync('user', user)
      return user
    }
    return null
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export const getUserInfo = (): User | null => {
  return Taro.getStorageSync('user') || null
}
```

### 4.3 观看进度记录

#### 4.3.1 更新进度云函数

```javascript
// cloud/functions/updateWatchProgress/index.js
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { animeId, season, episode } = event

  try {
    const now = Date.now()

    // 更新收藏表中的进度
    const updateRes = await db.collection('collections')
      .where({
        userId: openid,
        animeId: animeId
      })
      .update({
        data: {
          currentSeason: season,
          currentEpisode: episode,
          status: 'watching',  // 自动设为"在看"
          updateTime: now
        }
      })

    // 如果收藏不存在，需要先添加收藏
    if (updateRes.stats.updated === 0) {
      return {
        success: false,
        error: 'Please add to collection first'
      }
    }

    // 可选：记录到观看历史表
    await db.collection('watch_history').add({
      data: {
        userId: openid,
        animeId: animeId,
        season: season,
        episode: episode,
        watchTime: now
      }
    })

    return { success: true }

  } catch (error) {
    console.error('Update progress error:', error)
    return { success: false, error: error.message }
  }
}
```

### 4.4 收藏系统（想看/在看/看过）

#### 4.4.1 添加收藏云函数

```javascript
// cloud/functions/addCollection/index.js
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const {
    animeId,
    animeName,
    animeCover,
    status,        // wishlist/watching/watched
    totalSeasons = 1
  } = event

  try {
    // 获取用户UID
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()

    if (userRes.data.length === 0) {
      return { success: false, error: 'User not found' }
    }

    const user = userRes.data[0]
    const now = Date.now()

    // 检查是否已收藏
    const existRes = await db.collection('collections')
      .where({
        userId: openid,
        animeId: animeId
      })
      .get()

    if (existRes.data.length > 0) {
      // 已存在，更新状态
      await db.collection('collections')
        .doc(existRes.data[0]._id)
        .update({
          data: {
            status: status,
            updateTime: now
          }
        })
    } else {
      // 新增收藏
      await db.collection('collections').add({
        data: {
          userId: openid,
          uid: user.uid,
          animeId: animeId,
          animeName: animeName,
          animeCover: animeCover,
          status: status,
          isLiked: false,
          currentSeason: status === 'watching' ? 1 : 0,
          currentEpisode: status === 'watching' ? 1 : 0,
          totalSeasons: totalSeasons,
          startDate: status === 'watching' ? now : null,
          finishDate: status === 'watched' ? now : null,
          updateTime: now,
          createTime: now,
          note: '',
          myRating: null
        }
      })

      // 更新用户统计
      const statsUpdate = {}
      statsUpdate[`stats.${status}`] = _.inc(1)
      statsUpdate['stats.totalAnime'] = _.inc(1)

      await db.collection('users')
        .doc(user._id)
        .update({ data: statsUpdate })
    }

    return { success: true }

  } catch (error) {
    console.error('Add collection error:', error)
    return { success: false, error: error.message }
  }
}
```

### 4.5 喜欢功能

#### 4.5.1 切换喜欢状态云函数

```javascript
// cloud/functions/toggleLike/index.js
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { animeId } = event

  try {
    // 查询收藏记录
    const collectionRes = await db.collection('collections')
      .where({
        userId: openid,
        animeId: animeId
      })
      .get()

    if (collectionRes.data.length === 0) {
      return { success: false, error: 'Not in collection' }
    }

    const collection = collectionRes.data[0]
    const newLikeStatus = !collection.isLiked

    // 更新喜欢状态
    await db.collection('collections')
      .doc(collection._id)
      .update({
        data: {
          isLiked: newLikeStatus,
          updateTime: Date.now()
        }
      })

    // 更新用户统计
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()

    if (userRes.data.length > 0) {
      await db.collection('users')
        .doc(userRes.data[0]._id)
        .update({
          data: {
            'stats.totalLikes': _.inc(newLikeStatus ? 1 : -1)
          }
        })
    }

    return { success: true, isLiked: newLikeStatus }

  } catch (error) {
    console.error('Toggle like error:', error)
    return { success: false, error: error.message }
  }
}
```

### 4.6 头像上传

#### 4.6.1 前端实现

```typescript
// src/services/user.ts
export const uploadAvatar = async (): Promise<string | null> => {
  try {
    // 选择图片
    const chooseRes = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const tempFilePath = chooseRes.tempFilePaths[0]
    const user = getUserInfo()

    if (!user) return null

    Taro.showLoading({ title: '上传中...' })

    // 上传到云存储
    const cloudPath = `avatars/${user.uid}_${Date.now()}.png`
    const uploadRes = await Taro.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: tempFilePath
    })

    // 更新用户信息
    const updateRes = await Taro.cloud.callFunction({
      name: 'updateUserProfile',
      data: {
        avatar: uploadRes.fileID
      }
    })

    Taro.hideLoading()

    if (updateRes.result.success) {
      // 更新本地存储
      user.avatar = uploadRes.fileID
      Taro.setStorageSync('user', user)

      Taro.showToast({ title: '上传成功', icon: 'success' })
      return uploadRes.fileID
    } else {
      Taro.showToast({ title: '上传失败', icon: 'none' })
      return null
    }

  } catch (error) {
    Taro.hideLoading()
    console.error('Upload avatar error:', error)
    Taro.showToast({ title: '上传失败', icon: 'none' })
    return null
  }
}
```

---

## 五、页面结构设计

### 5.1 页面路由配置

```typescript
// src/app.config.ts
export default {
  pages: [
    'pages/index/index',              // 首页
    'pages/search/index',             // 搜索页
    'pages/anime-detail/index',       // 动漫详情页
    'pages/my-collection/index',      // 我的收藏
    'pages/profile/index',            // 个人中心
    'pages/login/index'               // 登录页
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#42BD56',  // 豆瓣绿
    navigationBarTitleTextStyle: 'white',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#42BD56',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/my-collection/index',
        text: '收藏',
        iconPath: 'assets/icons/collection.png',
        selectedIconPath: 'assets/icons/collection-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  }
}
```

### 5.2 首页设计

**页面元素：**
- 搜索框（固定顶部）
- 推荐动漫列表（热门/最新）
- 动漫卡片（横向布局）

**UI示例：**
```jsx
// src/pages/index/index.tsx
import { View, Input } from '@tarojs/components'
import { AtSearchBar, AtCard, AtButton } from 'taro-ui'
import AnimeCard from '../../components/AnimeCard'

const Index = () => {
  const [keyword, setKeyword] = useState('')
  const [hotAnime, setHotAnime] = useState([])

  const handleSearch = () => {
    Taro.navigateTo({
      url: `/pages/search/index?keyword=${keyword}`
    })
  }

  return (
    <View className="index-page">
      <AtSearchBar
        value={keyword}
        onChange={setKeyword}
        onActionClick={handleSearch}
        placeholder="搜索动漫..."
      />

      <View className="section">
        <View className="section-title">热门动漫</View>
        {hotAnime.map(anime => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </View>
    </View>
  )
}
```

### 5.3 动漫详情页设计

**页面元素：**
- 封面图（大图）
- 标题（中文/日文）
- 评分
- 简介
- 季/集信息
- 操作按钮：想看/在看/看过、喜欢

**进度选择器：**
```jsx
// src/components/EpisodeSelector/index.tsx
import { Picker } from '@tarojs/components'
import { AtButton } from 'taro-ui'

const EpisodeSelector = ({ totalSeasons, onUpdate }) => {
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)

  return (
    <View className="episode-selector">
      <Picker
        mode="selector"
        range={Array.from({ length: totalSeasons }, (_, i) => `第${i+1}季`)}
        onChange={e => setSeason(e.detail.value + 1)}
      >
        <AtButton>第{season}季</AtButton>
      </Picker>

      <Picker
        mode="selector"
        range={Array.from({ length: 50 }, (_, i) => `第${i+1}集`)}
        onChange={e => setEpisode(e.detail.value + 1)}
      >
        <AtButton>第{episode}集</AtButton>
      </Picker>

      <AtButton
        type="primary"
        onClick={() => onUpdate(season, episode)}
      >
        更新进度
      </AtButton>
    </View>
  )
}
```

### 5.4 我的收藏页设计

**Tab切换：**
- 在看
- 看过
- 想看

```jsx
// src/pages/my-collection/index.tsx
import { AtTabs, AtTabsPane } from 'taro-ui'

const MyCollection = () => {
  const [current, setCurrent] = useState(0)
  const tabs = [
    { title: '在看' },
    { title: '看过' },
    { title: '想看' }
  ]

  return (
    <View>
      <AtTabs current={current} tabList={tabs} onClick={setCurrent}>
        <AtTabsPane current={current} index={0}>
          {/* 在看列表 */}
        </AtTabsPane>
        <AtTabsPane current={current} index={1}>
          {/* 看过列表 */}
        </AtTabsPane>
        <AtTabsPane current={current} index={2}>
          {/* 想看列表 */}
        </AtTabsPane>
      </AtTabs>
    </View>
  )
}
```

### 5.5 个人中心页设计

**页面元素：**
- 用户头像（可点击上传）
- 昵称
- UID
- 统计信息（收藏数、在看数、看过数、喜欢数）
- 设置项
  - 绑定手机号
  - 退出登录

---

## 六、豆瓣风格样式实现

### 6.1 全局样式

```scss
// src/app.scss
$primary-color: #42BD56;    // 豆瓣绿
$orange-color: #F99600;     // 评分橙
$text-primary: #111;        // 主文字
$text-secondary: #666;      // 次要文字
$text-light: #999;          // 浅色文字
$bg-color: #F5F5F5;         // 背景色
$border-color: #E5E5E5;     // 边框色

* {
  box-sizing: border-box;
}

page {
  background-color: $bg-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
               'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.container {
  padding: 20px;
}
```

### 6.2 动漫卡片样式

```scss
// src/components/AnimeCard/index.scss
.anime-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .cover {
    width: 100px;
    height: 140px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    margin-right: 16px;

    image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .subtitle {
      font-size: 13px;
      color: $text-secondary;
      margin-bottom: 8px;
    }

    .rating {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .score {
        font-size: 18px;
        font-weight: bold;
        color: $orange-color;
        margin-right: 8px;
      }

      .stars {
        color: $orange-color;
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;

      .tag {
        padding: 2px 8px;
        background: #F0F0F0;
        border-radius: 4px;
        font-size: 12px;
        color: $text-secondary;
      }
    }

    .actions {
      margin-top: auto;
      display: flex;
      gap: 8px;

      .btn {
        flex: 1;
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
        font-size: 13px;

        &.primary {
          background: $primary-color;
          color: #fff;
        }

        &.secondary {
          border: 1px solid $primary-color;
          color: $primary-color;
          background: #fff;
        }
      }
    }
  }
}
```

---

## 七、开发计划

### 7.1 第一阶段：基础框架（1周）

**目标：** 搭建项目框架，完成基本配置

- [ ] 初始化Taro项目
- [ ] 配置TypeScript
- [ ] 集成Taro UI
- [ ] 创建页面结构
- [ ] 配置微信云开发环境
- [ ] 初始化数据库集合
- [ ] 创建基础云函数

### 7.2 第二阶段：核心功能（1.5周）

**目标：** 实现核心业务功能

**Week 1:**
- [ ] 用户登录/注册（云函数 + 前端）
- [ ] UID生成逻辑
- [ ] 动漫搜索功能（Bangumi API集成）
- [ ] 搜索结果页面
- [ ] 动漫详情页

**Week 2:**
- [ ] 收藏系统（想看/在看/看过）
- [ ] 观看进度记录
- [ ] 喜欢功能
- [ ] 我的收藏页（Tab切换）
- [ ] 个人中心页

### 7.3 第三阶段：优化完善（0.5周）

**目标：** UI优化、性能优化、测试

- [ ] 豆瓣风格界面调整
- [ ] 头像上传功能
- [ ] 手机号绑定（可选）
- [ ] 加载状态优化
- [ ] 错误处理
- [ ] 数据缓存优化
- [ ] 全面测试

### 7.4 第四阶段：上线准备（0.5周）

- [ ] 性能测试
- [ ] 真机调试
- [ ] 提交审核
- [ ] 发布上线

**预计总开发时间：** 3-4周

---

## 八、部署方案

### 8.1 微信云开发部署步骤

#### 8.1.1 前期准备

1. **注册微信小程序**
   - 访问 https://mp.weixin.qq.com/
   - 注册小程序账号
   - 完成认证（可选，个人版即可开发）

2. **开通云开发**
   - 在微信开发者工具中打开项目
   - 点击"云开发"按钮
   - 创建云开发环境（选择按量付费或包年包月）
   - 记录环境ID

#### 8.1.2 配置云开发环境

```javascript
// src/app.tsx
import Taro from '@tarojs/taro'

Taro.cloud.init({
  env: 'your-env-id',  // 云开发环境ID
  traceUser: true
})
```

#### 8.1.3 部署云函数

```bash
# 在微信开发者工具中
# 右键云函数文件夹 → 上传并部署：云端安装依赖
```

或使用命令行：

```bash
# 安装云开发CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署所有云函数
tcb functions:deploy
```

#### 8.1.4 初始化数据库

```javascript
// 在云开发控制台 → 数据库 → 创建集合

集合列表：
- users
- anime_cache
- collections
- watch_history
- counters

// 设置索引（在控制台操作）
```

#### 8.1.5 配置数据库权限

```json
// 在云开发控制台 → 数据库 → 权限设置

// users 集合
{
  "read": "auth",
  "write": "auth"
}

// collections 集合
{
  "read": "auth",
  "write": "auth"
}

// anime_cache 集合
{
  "read": true,
  "write": false  // 只允许云函数写
}
```

### 8.2 前端部署

```bash
# 开发环境
npm run dev:weapp

# 生产构建
npm run build:weapp

# 在微信开发者工具中
# 点击"上传" → 填写版本号和备注 → 上传代码
```

### 8.3 提交审核

1. 登录小程序管理后台
2. 版本管理 → 开发版本 → 提交审核
3. 填写审核信息
4. 等待审核（通常1-7天）
5. 审核通过后发布

### 8.4 监控与维护

**云开发控制台监控：**
- 云函数调用量
- 数据库读写次数
- 存储使用量
- 流量使用情况

**设置用量告警：**
```
云开发控制台 → 设置 → 用量告警
设置阈值，超出时邮件/短信通知
```

---

## 九、成本估算

### 9.1 云开发免费额度

| 资源 | 免费额度/月 | 预计支撑用户数 |
|------|------------|--------------|
| 云函数调用 | 40万次 | ~2000人 |
| 云数据库 | 2GB | ~5000人 |
| 云存储 | 5GB | ~1000张头像 |
| CDN流量 | 5GB | ~5000人 |

### 9.2 超出后费用

- 云函数：0.0133元/万次
- 数据库读：0.015元/万次
- 数据库写：0.05元/万次
- 存储：0.004元/GB/天

**预计月成本（1000活跃用户）：** 0-50元

---

## 十、后续迭代规划

### 10.1 第二版功能（v2.0）

- [ ] 动漫推荐算法（基于收藏历史）
- [ ] 用户评论与讨论
- [ ] 好友系统，查看好友在看什么
- [ ] 每日打卡签到
- [ ] 动漫榜单（热门榜、新番榜）
- [ ] 分享到朋友圈功能

### 10.2 第三版功能（v3.0）

- [ ] AI智能推荐
- [ ] 观看统计报告
- [ ] 勋章成就系统
- [ ] 多平台支持（H5版本）
- [ ] 数据导出（导出观看记录）

---

## 十一、常见问题与解决方案

### Q1: Bangumi API请求失败怎么办？

**方案：**
1. 增加重试机制（最多3次）
2. 使用本地缓存数据
3. 接入备用数据源（AniList）

### Q2: 云开发免费额度用完了？

**方案：**
1. 优化云函数调用（减少不必要的调用）
2. 增加本地缓存时长
3. 升级到付费套餐（成本较低）

### Q3: 个人小程序无法获取手机号？

**方案：**
1. 使用短信验证码方式
2. 手机号绑定设为可选功能
3. 升级为企业小程序

### Q4: 如何处理大量并发请求？

**方案：**
1. 云函数支持自动扩容
2. 数据库添加合适的索引
3. 使用Redis缓存（云开发暂不支持，可用数据库缓存代替）

---

## 十二、总结

本实施方案基于 **Taro + 微信云开发** 技术栈，充分利用Serverless架构的优势，实现快速开发、低成本运维。通过集成 **Bangumi API** 提供丰富的动漫数据，参考 **豆瓣设计风格** 打造美观易用的界面。

**核心优势：**
- 开发周期短（3-4周）
- 运营成本低（初期几乎免费）
- 技术栈统一（全栈JavaScript）
- 易于维护和迭代

**关键成功因素：**
1. 合理的缓存策略（减少API调用）
2. 良好的用户体验（流畅的交互）
3. 稳定的数据源（Bangumi API）
4. 持续的功能迭代（根据用户反馈）

预祝项目开发顺利！ 🎉

---

**文档版本：** v1.0
**最后更新：** 2025年11月17日
