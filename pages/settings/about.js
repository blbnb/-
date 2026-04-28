// pages/settings/about.js
Page({
  data: {
    appName: '书店商城',
    appVersion: '1.0.0',
    companyName: '书香科技有限公司',
    copyright: '© 2024 版权所有',
    website: 'www.bookstore.com',
    email: 'support@bookstore.com'
  },

  onLoad: function() {
    // 可以从配置文件或API获取关于信息
  },

  // 打开官网
  openWebsite: function() {
    wx.showModal({
      title: '打开官网',
      content: '将跳转到我们的官方网站',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/help/aboutUs'
          });
        }
      }
    });
  },

  // 联系我们
  contactUs: function() {
    wx.showModal({
      title: '联系我们',
      content: '客服电话: 400-123-4567\n邮箱: support@bookstore.com',
      showCancel: false
    });
  },

  // 返回上一页
  goBack: function() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  }
});