//app.js
App({
  onLaunch: function () {
    // 初始化小程序
    console.log('小程序启动');
    
    // 清理存储并初始化
    this.cleanupAndInitStorage();
    
    // 清理旧的临时图片数据
    this.cleanTempImagePaths();
  },
  
  // 清理存储并初始化
  cleanupAndInitStorage: function() {
    console.log('开始清理和初始化存储...');
    try {
      // 清理购物车，确保只使用默认图片
      let cart = wx.getStorageSync('cart') || [];
      if (cart.length > 0) {
        cart = cart.map(item => ({
          ...item,
          image: '/Default.jpg'
        }));
        wx.setStorageSync('cart', cart);
        console.log('已清理购物车中的大图片');
      } else {
        // 初始化空购物车
        wx.setStorageSync('cart', []);
      }
      
      // 清理发布图书
      let publishedBooks = wx.getStorageSync('publishedBooks') || [];
      if (publishedBooks.length > 0) {
        publishedBooks = publishedBooks.map(book => ({
          ...book,
          image: '/Default.jpg'
        }));
        wx.setStorageSync('publishedBooks', publishedBooks);
        console.log('已清理发布图书中的大图片');
      }
      
      // 清理本地图书
      let localBooks = wx.getStorageSync('localBooks') || [];
      if (localBooks.length > 0) {
        localBooks = localBooks.map(book => ({
          ...book,
          image: '/Default.jpg'
        }));
        wx.setStorageSync('localBooks', localBooks);
        console.log('已清理本地图书中的大图片');
      }
      
      // 清理浏览历史
      wx.removeStorageSync('browseHistory');
      console.log('已清理浏览历史');
      
      console.log('存储清理和初始化完成');
    } catch (e) {
      console.error('清理存储失败:', e);
    }
  },
  
  // 清理临时图片路径数据
  cleanTempImagePaths: function() {
    try {
      // 清理发布的图书中的临时图片
      let publishedBooks = wx.getStorageSync('publishedBooks') || [];
      let needsUpdate = false;
      
      publishedBooks = publishedBooks.map(book => {
        if (book.image && (book.image.includes('__tmp__') || book.image.includes('127.0.0.1') || book.image.includes('picsum.photos'))) {
          needsUpdate = true;
          return {
            ...book,
            image: '/Default.jpg'
          };
        }
        return book;
      });
      
      if (needsUpdate) {
        wx.setStorageSync('publishedBooks', publishedBooks);
        console.log('已清理发布图书中的临时图片');
      }
      
      // 清理反馈中的临时图片
      let feedbacks = wx.getStorageSync('feedbacks') || [];
      needsUpdate = false;
      
      feedbacks = feedbacks.map(feedback => {
        if (feedback.images && feedback.images.length > 0) {
          const cleanedImages = feedback.images.filter(img => 
            !img.includes('__tmp__') && !img.includes('127.0.0.1')
          );
          if (cleanedImages.length !== feedback.images.length) {
            needsUpdate = true;
            return {
              ...feedback,
              images: cleanedImages
            };
          }
        }
        return feedback;
      });
      
      if (needsUpdate) {
        wx.setStorageSync('feedbacks', feedbacks);
        console.log('已清理反馈中的临时图片');
      }
      
      // 清理购物车中的临时图片
      let cart = wx.getStorageSync('cart') || [];
      needsUpdate = false;
      
      cart = cart.map(item => {
        if (item.image && (item.image.includes('__tmp__') || item.image.includes('127.0.0.1') || item.image.includes('picsum.photos'))) {
          needsUpdate = true;
          return {
            ...item,
            image: '/Default.jpg'
          };
        }
        return item;
      });
      
      if (needsUpdate) {
        wx.setStorageSync('cart', cart);
        console.log('已清理购物车中的临时图片');
      }
      
      // 清理本地图书中的临时图片
      let localBooks = wx.getStorageSync('localBooks') || [];
      needsUpdate = false;
      
      localBooks = localBooks.map(book => {
        if (book.image && (book.image.includes('__tmp__') || book.image.includes('127.0.0.1') || book.image.includes('picsum.photos'))) {
          needsUpdate = true;
          return {
            ...book,
            image: '/Default.jpg'
          };
        }
        return book;
      });
      
      if (needsUpdate) {
        wx.setStorageSync('localBooks', localBooks);
        console.log('已清理本地图书中的临时图片');
      }
      
      // 清理浏览历史中的临时图片
      let browseHistory = wx.getStorageSync('browseHistory') || [];
      needsUpdate = false;
      
      browseHistory = browseHistory.map(item => {
        if (item.book && item.book.image && (item.book.image.includes('__tmp__') || item.book.image.includes('127.0.0.1') || item.book.image.includes('picsum.photos'))) {
          needsUpdate = true;
          return {
            ...item,
            book: {
              ...item.book,
              image: '/Default.jpg'
            }
          };
        }
        return item;
      });
      
      if (needsUpdate) {
        wx.setStorageSync('browseHistory', browseHistory);
        console.log('已清理浏览历史中的临时图片');
      }
      
      // 清理收藏中的临时图片
      let favorites = wx.getStorageSync('favorites') || [];
      needsUpdate = false;
      
      favorites = favorites.map(item => {
        if (item.book && item.book.image && (item.book.image.includes('__tmp__') || item.book.image.includes('127.0.0.1') || item.book.image.includes('picsum.photos'))) {
          needsUpdate = true;
          return {
            ...item,
            book: {
              ...item.book,
              image: '/Default.jpg'
            }
          };
        }
        return item;
      });
      
      if (needsUpdate) {
        wx.setStorageSync('favorites', favorites);
        console.log('已清理收藏中的临时图片');
      }
      
      // 清理用户头像中的临时图片（确保用户头像不被替换）
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.avatarUrl && (userInfo.avatarUrl.includes('__tmp__') || userInfo.avatarUrl.includes('127.0.0.1'))) {
        userInfo = {
          ...userInfo,
          avatarUrl: '/Default.jpg'
        };
        wx.setStorageSync('userInfo', userInfo);
        console.log('已清理用户头像中的临时图片');
      }
    } catch (e) {
      console.error('清理临时图片失败:', e);
    }
  },
  
  globalData: {
    userInfo: null,
    isLogin: false,
    checkoutItems: [] // 结算商品列表
  }
})