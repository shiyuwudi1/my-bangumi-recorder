export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/search/index',
    'pages/anime-detail/index',
    'pages/my-collection/index',
    'pages/profile/index',
    'pages/login/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#42BD56',
    navigationBarTitleText: '我的番组',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#42BD56',
    backgroundColor: '#fff',
    borderStyle: 'white',
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
  },
  cloud: true
})
