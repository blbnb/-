const api = require('./utils/api.js');

App({
  // 后端 API 配置
  backendUrl: 'http://localhost:3000',
  
  onLaunch: function () {
    console.log('小程序启动');
    
    this.checkLoginStatus();
    this.cleanupAndInitStorage();
    this.cleanTempImagePaths();
  },
  
  // 全局数据 → 只保留这一次！
  globalData: {
    userInfo: null,
    isLogin: false,
    checkoutItems: [],
    baseUrl: 'http://localhost:3000/api'
  },
  
  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      console.log('用户已登录:', userInfo.nickName);
    } else {
      this.globalData.userInfo = null;
      this.globalData.isLogin = false;
      console.log('用户未登录');
    }
  },
  
  // 判断是否已登录
  isLogin: function() {
    return this.globalData.isLogin;
  },
  
  // 跳转到登录页
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 清理存储并初始化
  cleanupAndInitStorage: function() {
    console.log('开始清理和初始化存储...');
    try {
      let cart = wx.getStorageSync('cart') || [];
      if (cart.length > 0) {
        cart = cart.map(item => {
          if (item.image && (item.image.includes('__tmp__') || item.image.includes('127.0.0.1'))) {
            return { ...item, image: '' };
          }
          return item;
        });
        wx.setStorageSync('cart', cart);
      } else {
        wx.setStorageSync('cart', []);
      }
      
      let publishedBooks = wx.getStorageSync('publishedBooks') || [];
      if (publishedBooks.length > 0) {
        publishedBooks = publishedBooks.map(book => {
          if (book.image && (book.image.includes('__tmp__') || book.image.includes('127.0.0.1'))) {
            return { ...book, image: '' };
          }
          return book;
        });
        wx.setStorageSync('publishedBooks', publishedBooks);
      }
      
      let localBooks = wx.getStorageSync('localBooks') || [];
      if (localBooks.length > 0) {
        localBooks = localBooks.map(book => {
          if (book.image && (book.image.includes('__tmp__') || book.image.includes('127.0.0.1'))) {
            return { ...book, image: '' };
          }
          return book;
        });
        wx.setStorageSync('localBooks', localBooks);
      }
      
      wx.removeStorageSync('browseHistory');
      console.log('存储清理和初始化完成');
    } catch (e) {
      console.error('清理存储失败:', e);
    }
  },
  
  // 清理临时图片路径数据
  cleanTempImagePaths: function() {
    try {
      let publishedBooks = wx.getStorageSync('publishedBooks') || [];
      let needsUpdate = false;
      
      publishedBooks = publishedBooks.map(book => {
        if (book.image && (book.image.includes('__tmp__') || book.image.includes('127.0.0.1'))) {
          needsUpdate = true;
          return { ...book, image: '' };
        }
        return book;
      });
      if (needsUpdate) wx.setStorageSync('publishedBooks', publishedBooks);
      
      let feedbacks = wx.getStorageSync('feedbacks') || [];
      needsUpdate = false;
      feedbacks = feedbacks.map(feedback => {
        if (feedback.images && feedback.images.length > 0) {
          const cleanedImages = feedback.images.filter(img => 
            !img.includes('__tmp__') && !img.includes('127.0.0.1')
          );
          if (cleanedImages.length !== feedback.images.length) {
            needsUpdate = true;
            return { ...feedback, images: cleanedImages };
          }
        }
        return feedback;
      });
      if (needsUpdate) wx.setStorageSync('feedbacks', feedbacks);
      
      let cart = wx.getStorageSync('cart') || [];
      needsUpdate = false;
      cart = cart.map(item => {
        if (item.image && (item.image.includes('__tmp__') || item.image.includes('127.0.0.1'))) {
          needsUpdate = true;
          return { ...item, image: '' };
        }
        return item;
      });
      if (needsUpdate) wx.setStorageSync('cart', cart);
      
      let localBooks = wx.getStorageSync('localBooks') || [];
      needsUpdate = false;
      localBooks = localBooks.map(book => {
        if (book.image && (book.image.includes('__tmp__') || book.image.includes('127.0.0.1'))) {
          needsUpdate = true;
          return { ...book, image: '' };
        }
        return book;
      });
      if (needsUpdate) wx.setStorageSync('localBooks', localBooks);
      
      let browseHistory = wx.getStorageSync('browseHistory') || [];
      needsUpdate = false;
      browseHistory = browseHistory.map(item => {
        if (item.book && item.book.image && (item.book.image.includes('__tmp__') || item.book.image.includes('127.0.0.1'))) {
          needsUpdate = true;
          return {
            ...item,
            book: { ...item.book, image: '' }
          };
        }
        return item;
      });
      if (needsUpdate) wx.setStorageSync('browseHistory', browseHistory);
      
      let favorites = wx.getStorageSync('favorites') || [];
      needsUpdate = false;
      favorites = favorites.map(item => {
        if (item.book && item.book.image && (item.book.image.includes('__tmp__') || item.book.image.includes('127.0.0.1'))) {
          needsUpdate = true;
          return {
            ...item,
            book: { ...item.book, image: '' }
          };
        }
        return item;
      });
      if (needsUpdate) wx.setStorageSync('favorites', favorites);
      
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.avatarUrl && (userInfo.avatarUrl.includes('__tmp__') || userInfo.avatarUrl.includes('127.0.0.1'))) {
        userInfo = { ...userInfo, avatarUrl: '' };
        wx.setStorageSync('userInfo', userInfo);
      }
    } catch (e) {
      console.error('清理临时图片失败:', e);
    }
  }
})