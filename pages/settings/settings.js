// pages/settings/settings.js
const app = getApp();
Page({
  data: {
    userInfo: null,
    appVersion: '1.0.0',
    cacheSize: '0KB'
  },

  onLoad: function() {
    this.loadUserInfo();
    this.calculateCacheSize();
  },

  // 加载用户信息
  loadUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo: userInfo });
  },

  // 计算缓存大小
  calculateCacheSize: function() {
    // 模拟计算缓存大小
    const cacheSize = '2.3MB';
    this.setData({ cacheSize: cacheSize });
  },

  // 清除缓存
  clearCache: function() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地缓存
          wx.removeStorageSync('browseHistory');
          // 这里可以添加更多的缓存清理逻辑
          
          this.setData({ cacheSize: '0KB' });
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      }
    });
  },

  // 账号与安全
  goToAccountSecurity: function() {
    wx.navigateTo({
      url: '/pages/settings/accountSecurity'
    });
  },

  // 隐私设置
  goToPrivacySettings: function() {
    wx.navigateTo({
      url: '/pages/settings/privacySettings'
    });
  },

  // 消息通知设置
  goToNotificationSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/notificationSettings'
    });
  },

  // 关于我们
  goToAbout: function() {
    wx.navigateTo({
      url: '/pages/settings/about'
    });
  },

  // 用户协议
  goToUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/settings/userAgreement'
    });
  },

  // 隐私政策
  goToPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/settings/privacyPolicy'
    });
  },

  // 检查更新
  checkUpdate: function() {
    wx.showLoading({ title: '检查更新中...' });
    
    // 模拟检查更新
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '检查更新',
        content: '已是最新版本 v' + this.data.appVersion,
        showCancel: false
      });
    }, 1000);
  },


});