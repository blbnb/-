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
  }
})