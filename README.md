# 我的番组 - 动漫观看进度管理小程序

一款基于 **Taro + React + 微信云开发** 的动漫观看进度管理小程序，帮助你记录和管理动漫观看进度。

## ✨ 功能特性

- 🔍 **动漫搜索**：支持中文/日文搜索，数据来源 Bangumi API
- 📝 **进度记录**：精确记录观看进度（季/集级别）
- ⭐ **收藏系统**：想看/在看/看过三种状态管理
- ❤️ **喜欢功能**：独立的点赞/喜欢功能
- 👤 **用户系统**：微信一键登录，6位UID，个性化头像
- 🎨 **豆瓣风格**：参考豆瓣设计，简洁美观

## 🛠️ 技术栈

### 前端
- **框架**：Taro 4.1.8 + React 18
- **语言**：TypeScript 5.1
- **UI 库**：Taro UI 3.1
- **样式**：SCSS

### 后端
- **架构**：微信云开发 (Serverless)
- **云函数**：Node.js 16
- **数据库**：云数据库 (MongoDB)
- **存储**：云存储

### 第三方服务
- **动漫数据**：Bangumi API

## 📦 项目结构

```
my-bangumi/
├── src/                        # 源代码
│   ├── pages/                  # 页面
│   │   ├── index/             # 首页
│   │   ├── search/            # 搜索页
│   │   ├── anime-detail/      # 动漫详情页
│   │   ├── my-collection/     # 我的收藏
│   │   ├── profile/           # 个人中心
│   │   └── login/             # 登录页
│   ├── components/             # 公共组件
│   ├── services/               # 服务层 (API)
│   │   ├── user.ts            # 用户服务
│   │   ├── anime.ts           # 动漫服务
│   │   └── collection.ts      # 收藏服务
│   ├── utils/                  # 工具函数
│   ├── types/                  # TypeScript 类型
│   ├── constants/              # 常量定义
│   ├── styles/                 # 全局样式
│   ├── app.tsx                 # 应用入口
│   └── app.config.ts           # 应用配置
├── cloud/                      # 云函数
│   └── functions/
│       ├── login/             # 登录云函数
│       ├── searchAnime/       # 搜索动漫云函数
│       └── ...                # 其他云函数
├── config/                     # 项目配置
├── docs/                       # 文档
│   ├── research-report.md     # 技术调研报告
│   └── implementation-plan.md # 实施方案
├── package.json
├── tsconfig.json
└── project.config.json

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install --legacy-peer-deps
```

### 2. 配置云开发环境

#### 2.1 开通云开发
1. 打开微信开发者工具
2. 点击"云开发"按钮
3. 创建云开发环境
4. 记录环境 ID

#### 2.2 配置环境ID
在 `src/app.tsx` 中填入你的环境 ID：

```typescript
Taro.cloud.init({
  env: 'your-env-id', // 替换为你的云开发环境ID
  traceUser: true
})
```

### 3. 初始化数据库

在云开发控制台创建以下数据库集合：

- `users` - 用户表
- `anime_cache` - 动漫缓存表
- `collections` - 收藏表
- `watch_history` - 观看历史表 (可选)
- `counters` - UID计数器表

**初始化 counters 集合：**

```json
{
  "_id": "user_uid",
  "seq": 100000
}
```

### 4. 部署云函数

在微信开发者工具中：
1. 右键 `cloud/functions/login` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 对所有云函数重复此操作

### 5. 准备TabBar图标

在 `src/assets/icons/` 目录下放置图标文件：
- `home.png` / `home-active.png`
- `collection.png` / `collection-active.png`
- `profile.png` / `profile-active.png`

> 尺寸建议：81px × 81px

### 6. 运行开发环境

```bash
# 开发模式 (微信小程序)
npm run dev:weapp
```

在微信开发者工具中打开 `dist` 目录即可预览。

### 7. 构建生产版本

```bash
# 生产构建
npm run build:weapp
```

## 📱 小程序配置

在 `project.config.json` 中配置你的小程序 AppID：

```json
{
  "appid": "your-appid", // 替换为你的小程序AppID
  ...
}
```

## 🎯 开发计划

### ✅ 已完成
- [x] 项目框架搭建
- [x] TypeScript配置
- [x] 全局样式 (豆瓣风格)
- [x] 类型定义
- [x] 工具函数
- [x] 服务层 API
- [x] 所有页面创建
- [x] 云函数示例 (login, searchAnime)

### 🚧 进行中
- [ ] 完善所有云函数
- [ ] 添加TabBar图标
- [ ] 测试和调试

### 📅 待实现
- [ ] 动漫推荐算法
- [ ] 用户评论
- [ ] 好友系统
- [ ] 观看统计
- [ ] 数据导出

## 📖 文档

详细的技术调研和实施方案请查看：
- [技术调研报告](./research-report.md)
- [项目实施方案](./implementation-plan.md)

## 🎨 界面预览

采用豆瓣绿主题色 (#42BD56)，简洁美观的卡片式设计。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

## 🙏 致谢

- [Taro](https://taro.zone/) - 多端统一开发框架
- [Taro UI](https://taro-ui.jd.com/) - UI 组件库
- [Bangumi](https://bangumi.github.io/api/) - 动漫数据源
- [微信云开发](https://cloud.weixin.qq.com/) - Serverless 后端服务

---

**开发者**: Claude Code
**版本**: v1.0.0
**最后更新**: 2025年11月17日
