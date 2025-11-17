# 云函数目录

本目录包含微信云开发的云函数代码。

## 已创建的云函数

### 1. login - 用户登录
- **功能**：用户登录/注册，自动生成UID
- **依赖**：wx-server-sdk

### 2. searchAnime - 搜索动漫
- **功能**：搜索动漫，包含缓存机制
- **依赖**：wx-server-sdk, axios

## 待实现的云函数

根据实施方案，还需要创建以下云函数：

- `updateUserProfile` - 更新用户信息
- `bindPhone` - 绑定手机号
- `getAnimeDetail` - 获取动漫详情
- `addCollection` - 添加收藏
- `removeCollection` - 移除收藏
- `updateCollectionStatus` - 更新收藏状态
- `updateWatchProgress` - 更新观看进度
- `toggleLike` - 切换喜欢状态
- `getMyCollections` - 获取我的收藏列表
- `getUserStats` - 获取用户统计

## 部署云函数

### 方法一：使用微信开发者工具
1. 在微信开发者工具中打开项目
2. 右键云函数文件夹
3. 选择"上传并部署：云端安装依赖"

### 方法二：使用命令行
```bash
# 安装云开发CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署所有云函数
tcb functions:deploy
```

## 数据库集合

需要在云开发控制台创建以下集合：

- `users` - 用户表
- `anime_cache` - 动漫缓存表
- `collections` - 收藏表
- `watch_history` - 观看历史表
- `counters` - UID计数器表

## 环境配置

在 `src/app.tsx` 中配置云开发环境ID：

```typescript
Taro.cloud.init({
  env: 'your-env-id', // 替换为你的云开发环境ID
  traceUser: true
})
```
