// pages/user/user.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    userName: '',
    userID: '',
    // 订单数量统计
    orderCounts: {
      pending: 0,
      paid: 0,
      shipped: 0,
      received: 0
    },
    // 用户统计数据
    userStats: {
      booksCount: 0,
      favoritesCount: 0,
      historyCount: 0
    },
    // 消息通知数量
    notificationCount: 0
  },

  onShow: function() {
    this.checkLoginStatus();
  },

  // 处理用户头像区域点击事件
  handleAvatarTap: function() {
    if (this.data.isLoggedIn) {
      this.viewUserInfo();
    } else {
      this.login();
    }
  },

  // 处理图片加载错误
  handleImageError: function(e) {
    console.log('图片加载失败，使用默认图片');
    // 图片加载失败时，已经在 WXML 中设置了 fallback 到 Default.jpg
  },

  // 检查登录状态
  checkLoginStatus: function() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        console.log('已登录，用户信息：', userInfo);
        
        // 确保用户信息完整
        const completeUserInfo = {
          id: userInfo.id || Date.now().toString(),
          nickName: userInfo.nickName || userInfo.nickname || '微信用户',
          avatarUrl: userInfo.avatarUrl || '',
          ...userInfo
        };
        
        // 获取并更新统计数据
        const userStats = wx.getStorageSync('userStats') || {
          booksCount: 0,
          favoritesCount: 0,
          historyCount: 0
        };
        
        // 从实际订单同步统计数据
        this.loadOrderCounts();
        
        const notificationCount = wx.getStorageSync('notificationCount') || 0;
        
        this.setData({
          isLoggedIn: true,
          isLogin: true,
          userInfo: completeUserInfo,
          userName: completeUserInfo.nickName,
          userID: 'ID: ' + completeUserInfo.id,
          userStats: userStats,
          notificationCount: notificationCount
        });
        
        // 更新全局状态
        app.globalData.userInfo = completeUserInfo;
        app.globalData.isLogin = true;
      } else {
        console.log('未登录');
        this.setData({
          isLoggedIn: false,
          isLogin: false,
          userInfo: null,
          userName: '',
          userID: '',
          userStats: { booksCount: 0, favoritesCount: 0, historyCount: 0 },
          orderCounts: { pending: 0, paid: 0, shipped: 0, received: 0 },
          notificationCount: 0
        });
      }
    } catch (e) {
      console.error('检查登录状态失败:', e);
      // 发生错误时重置状态
      this.setData({
        isLoggedIn: false,
        isLogin: false,
        userInfo: null,
        userName: '',
        userID: '',
        userStats: { booksCount: 0, favoritesCount: 0, historyCount: 0 },
        orderCounts: { pending: 0, paid: 0, shipped: 0, received: 0 },
        notificationCount: 0
      });
    }
  },
  
  // 查看用户详情
  viewUserInfo: function() {
    wx.navigateTo({
      url: '/pages/userInfo/userInfo'
    });
  },
  
  // 加载用户统计数据
  loadUserStats: function() {
    // 模拟加载用户统计数据
    const userStats = wx.getStorageSync('userStats') || {
      booksCount: 3,
      favoritesCount: 8,
      historyCount: 24
    };
    
    this.setData({
      userStats: userStats
    });
  },
  
  // 加载订单数量统计
  loadOrderCounts: function() {
    // 从实际订单数据中统计各状态的数量
    let orders = wx.getStorageSync('orders') || [];
    
    // 统计各状态的订单数量
    const orderCounts = {
      pending: 0,
      paid: 0,
      shipped: 0,
      received: 0
    };
    
    orders.forEach(order => {
      if (orderCounts.hasOwnProperty(order.status)) {
        orderCounts[order.status]++;
      }
    });
    
    // 保存到本地存储
    wx.setStorageSync('orderCounts', orderCounts);
    
    this.setData({
      orderCounts: orderCounts
    });
  },
  
  // 加载消息通知数量
  loadNotificationCount: function() {
    // 模拟加载消息通知数量
    const notificationCount = wx.getStorageSync('notificationCount') || 2;
    
    this.setData({
      notificationCount: notificationCount
    });
  },
  
  // 前往消息通知页面
  goToNotifications: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/notifications/notifications'
    });
    // 清空消息通知数量
    this.setData({
      notificationCount: 0
    });
    wx.setStorageSync('notificationCount', 0);
  },

  // 登录 - 跳转到登录页面
  login: function() {
    console.log('跳转到登录页面');
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 完成登录流程
  completeLogin: function(loginCode, userInfo, phoneData) {
    console.log('开始完成登录流程', {loginCode, userInfo, phoneData});
    
    if (!userInfo) {
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      return;
    }
    
    // 显示加载提示
    wx.showLoading({ title: '登录中...' });
    
    // 直接使用本地登录，避免后端API调用
    this.handleLocalLogin(userInfo, phoneData);
  },
  
  // 处理本地登录（当后端接口不可用时的备用方案）
  handleLocalLogin: function(userInfo, phoneData) {
    console.log('使用本地登录模式');
    
    try {
      // 创建一个本地用户信息对象
      const localUserInfo = {
        id: Date.now().toString(),
        nickName: userInfo.nickName || '微信用户',
        avatarUrl: userInfo.avatarUrl || '',
        phone: phoneData ? '已获取' : '未绑定',
        college: '未设置',
        level: '普通会员',
        createTime: new Date().toISOString()
      };
      
      // 保存本地用户信息和模拟数据
      wx.setStorageSync('userInfo', localUserInfo);
      
      // 创建并保存模拟统计数据
      const mockStats = {
        booksCount: 3,
        favoritesCount: 8,
        historyCount: 24
      };
      wx.setStorageSync('userStats', mockStats);
      
      const mockOrders = {
        pending: 1,
        paid: 2,
        shipped: 1,
        received: 3
      };
      wx.setStorageSync('orderCounts', mockOrders);
      wx.setStorageSync('notificationCount', 2);
      
      // 更新全局状态
      app.globalData.userInfo = localUserInfo;
      app.globalData.isLogin = true;
      
      // 更新页面状态
      this.setData({
        isLoggedIn: true,
        isLogin: true,
        userInfo: localUserInfo,
        userName: localUserInfo.nickName,
        userID: 'ID: ' + localUserInfo.id,
        // 直接设置统计数据，避免再次调用加载函数
        userStats: mockStats,
        orderCounts: mockOrders,
        notificationCount: 2
      });
      
      // 显示成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
    } catch (e) {
      console.error('本地登录失败:', e);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userStats');
          wx.removeStorageSync('orderCounts');
          wx.removeStorageSync('notificationCount');
          this.setData({
            isLoggedIn: false,
            userName: '',
            userID: '',
            orderCounts: {
              pending: 0,
              paid: 0,
              shipped: 0,
              received: 0
            },
            userStats: {
              booksCount: 0,
              favoritesCount: 0,
              historyCount: 0
            },
            notificationCount: 0
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 前往全部订单
  goToOrders: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/orders/orders'
    });
  },

  // 前往特定状态订单列表
  goToOrderList: function(e) {
    if (!this.checkLogin()) return;
    const status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: `/pages/orders/orders?status=${status}`
    });
  },

  // 前往我的图书
  goToMyBooks: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/myBooks/myBooks'
    });
  },

  // 前往我的收藏
  goToFavorites: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  },

  // 前往浏览历史
  goToHistory: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 前往收货地址
  goToAddress: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/address/address'
    });
  },

  // 前往设置
  goToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 前往帮助与反馈
  goToHelp: function() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },
  
  // 联系在线客服
  contactService: function() {
    console.log('客服功能被调用');
    
    // 直接显示客服联系方式模态框
    wx.showModal({
      title: '客服联系方式',
      content: '客服电话: 400-123-4567\n工作时间: 周一至周日 9:00-22:00',
      showCancel: false,
      confirmText: '拨打电话',
      success: function(res) {
        if (res.confirm) {
          // 拨打电话
          wx.makePhoneCall({
            phoneNumber: '4001234567',
            fail: function(err) {
              console.error('拨打电话失败:', err);
              wx.showToast({
                title: '拨打电话失败',
                icon: 'none'
              });
            }
          });
        }
      },
      fail: function(err) {
        console.error('显示模态框失败:', err);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 前往优惠券页面
  goToCoupons: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/coupons/coupons'
    });
  },
  
  // 前往我的积分页面
  goToPoints: function() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/points/points'
    });
  },

  // 前往发表图书页面
  goToPublishBook: function() {
    console.log('goToPublishBook 被调用');
    console.log('当前登录状态:', this.data.isLoggedIn);
    if (!this.checkLogin()) {
      console.log('未登录，返回');
      return;
    }
    console.log('已登录，跳转到发布页面');
    wx.navigateTo({
      url: '/pages/publishBook/publishBook'
    });
  },

  // 检查是否登录的统一辅助函数 - 确保整个页面只有一个回退逻辑
  checkLogin: function() {
    console.log('checkLogin 被调用，当前状态:', this.data.isLoggedIn);
    
    // 双重检查：既检查 data.isLoggedIn，也检查本地存储
    const userInfo = wx.getStorageSync('userInfo');
    if (!this.data.isLoggedIn || !userInfo) {
      console.log('检查结果：未登录');
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return false;
    }
    console.log('检查结果：已登录');
    return true;
  }
})