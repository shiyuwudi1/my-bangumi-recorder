# 云函数目录

本目录包含微信云开发的云函数代码。

## 已创建的云函数

### 1. login - 用户登录
- **功能**：用户登录/注册，自动生成UID
- **依赖**：wx-server-sdk

### 2. searchAnime - 搜索动漫
- **功能**：搜索动漫，包含缓存机制
- **依赖**：wx-server-sdk, axios

### 3. initDatabase - 初始化数据库
- **功能**：初始化数据库集合和基础数据
- **依赖**：wx-server-sdk
- **用途**：仅在首次配置时使用，初始化完成后可删除

### 4. getAnimeDetail - 获取动漫详情
- **功能**：获取动漫详情，包含缓存机制
- **依赖**：wx-server-sdk, axios

### 5. updateUserProfile - 更新用户信息
- **功能**：更新用户昵称、头像
- **依赖**：wx-server-sdk

### 6. bindPhone - 绑定手机号
- **功能**：绑定手机号，支持重复校验
- **依赖**：wx-server-sdk

### 7. addCollection - 添加收藏
- **功能**：添加动漫到收藏列表
- **依赖**：wx-server-sdk

### 8. removeCollection - 移除收藏
- **功能**：从收藏列表移除动漫
- **依赖**：wx-server-sdk

### 9. updateCollectionStatus - 更新收藏状态
- **功能**：更新收藏状态（想看/在看/看过）
- **依赖**：wx-server-sdk

### 10. updateWatchProgress - 更新观看进度
- **功能**：更新观看进度，记录观看历史
- **依赖**：wx-server-sdk

### 11. toggleLike - 切换喜欢状态
- **功能**：切换动漫的喜欢状态
- **依赖**：wx-server-sdk

### 12. getMyCollections - 获取我的收藏列表
- **功能**：获取用户的收藏列表，支持分页和状态筛选
- **依赖**：wx-server-sdk

### 13. getUserStats - 获取用户统计
- **功能**：获取用户统计信息
- **依赖**：wx-server-sdk

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

## 数据库初始化

### 方式一：自动初始化（推荐）

1. **创建数据库集合**
   在云开发控制台 → 数据库中，手动创建以下集合：
   - `users` - 用户表
   - `anime_cache` - 动漫缓存表
   - `collections` - 收藏表
   - `watch_history` - 观看历史表
   - `counters` - UID计数器表

2. **部署初始化云函数**
   - 右键 `cloud/functions/initDatabase` 文件夹
   - 选择"上传并部署：云端安装依赖"

3. **运行初始化**
   在云开发控制台 → 云函数 → initDatabase → 云端测试，输入：
   ```json
   {
     "action": "initAll"
   }
   ```
   点击"测试"按钮运行

4. **验证初始化**
   再次测试，输入：
   ```json
   {
     "action": "checkStatus"
   }
   ```
   查看所有集合的状态

### 方式二：手动初始化

在云开发控制台 → 数据库 → counters 集合中，手动添加记录：
```json
{
  "_id": "user_uid",
  "seq": 100000
}
```

### 初始化云函数说明

`initDatabase` 云函数支持以下操作：

- `action: "initCounters"` - 仅初始化计数器
- `action: "initAll"` - 初始化所有基础数据
- `action: "checkStatus"` - 检查所有集合状态

## 环境配置

在 `src/app.tsx` 中配置云开发环境ID：

```typescript
Taro.cloud.init({
  env: 'your-env-id', // 替换为你的云开发环境ID
  traceUser: true
})
```
