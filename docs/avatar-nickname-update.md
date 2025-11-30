# 头像昵称获取方式更新说明

## 更新背景

根据微信官方文档 [小程序登录、用户信息相关接口调整说明](https://developers.weixin.qq.com/community/develop/doc/000cacfa20ce88df04cb468bc52801)，微信小程序已废弃以下获取用户信息的方式：

1. ~~`wx.getUserInfo`~~ - 2021年4月28日后只返回匿名信息
2. ~~`wx.getUserProfile`~~ - 已废弃（2021年推出，后续废弃）
3. ~~`<button open-type="getUserInfo">`~~ - 已废弃

## 新的实现方式

### 1. 获取头像

使用 `<button open-type="chooseAvatar">` 组件：

```tsx
<Button
  openType="chooseAvatar"
  onChooseAvatar={(e) => {
    const avatarUrl = e.detail.avatarUrl
    // 处理头像URL
  }}
>
  选择头像
</Button>
```

### 2. 获取昵称

使用 `<input type="nickname">` 组件：

```tsx
<Input
  type="nickname"
  placeholder="请输入昵称"
  onBlur={(e) => {
    const nickname = e.detail.value
    // 处理昵称
  }}
/>
```

## 更新内容

### 登录页面 (`src/pages/login/index.tsx`)

**原实现：**
- 使用 `wx.getUserProfile` 弹窗获取用户信息
- 一次性获取头像和昵称

**新实现：**
- 使用 `<Button open-type="chooseAvatar">` 选择头像
- 选择头像后，显示昵称输入框 `<Input type="nickname">`
- 用户填写昵称后完成登录
- 保留匿名登录选项

### 个人中心页面 (`src/pages/profile/index.tsx`)

**原实现：**
- 点击头像调用 `uploadAvatar()` 上传到云存储
- 使用 `Taro.chooseImage` 选择图片

**新实现：**
- 点击头像打开编辑模态框
- 模态框中使用 `<Button open-type="chooseAvatar">` 选择头像
- 同时可以修改昵称 `<Input type="nickname">`
- 保存后更新用户资料

### 服务层 (`src/services/user.ts`)

**更新：**
- `uploadAvatar()` 函数标记为废弃，保留用于向后兼容
- 头像URL直接从 `chooseAvatar` 事件获取，不再需要上传到云存储

## 优势

1. **更符合规范**：使用微信官方推荐的最新API
2. **更好的用户体验**：
   - 头像选择更直观
   - 昵称可以手动输入，不强制使用微信昵称
3. **减少云存储开销**：头像URL直接使用微信临时路径，不需要上传到云存储

## 注意事项

1. **头像URL的有效期**：
   - `chooseAvatar` 返回的是临时路径，有效期未明确说明
   - 如需长期保存，建议仍然上传到云存储（可作为可选功能）

2. **向后兼容**：
   - 保留了 `uploadAvatar` 函数接口，避免破坏现有代码
   - 旧版本已保存的云存储头像仍然可以正常使用

3. **匿名登录**：
   - 保留匿名登录功能，用户可以跳过头像昵称设置
   - 后续可在个人中心补充完善

## 测试建议

1. 测试新用户注册流程
2. 测试头像选择和昵称输入
3. 测试个人中心修改头像昵称
4. 测试匿名登录流程
5. 测试旧用户数据兼容性

## 参考文档

- [小程序登录、用户信息相关接口调整说明](https://developers.weixin.qq.com/community/develop/doc/000cacfa20ce88df04cb468bc52801)
- [button - 微信开放文档](https://developers.weixin.qq.com/miniprogram/dev/component/button.html)
- [input - 微信开放文档](https://developers.weixin.qq.com/miniprogram/dev/component/input.html)
