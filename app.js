//app.js
App({
  onLaunch: function () {
    // 初始化小程序
    console.log('小程序启动');
    
    // 初始化购物车数据
    if (!wx.getStorageSync('cart')) {
      wx.setStorageSync('cart', []);
    }
  },
  
  globalData: {
    userInfo: null,
    isLogin: false,
    baseUrl: 'http://localhost:3000', // 本地后端API基础URL
    checkoutItems: [] // 结算商品列表
  },

  // 检查登录状态
  checkLogin: function() {
    const userInfo = wx.getStorageSync('userInfo');
    return !!userInfo;
  },

  // 要求登录
  requireLogin: function(callback) {
    if (this.checkLogin()) {
      if (callback) callback();
      return true;
    } else {
      wx.showModal({
        title: '提示',
        content: '请先登录后再使用此功能',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/user/user'
            });
          }
        }
      });
      return false;
    }
  }
})