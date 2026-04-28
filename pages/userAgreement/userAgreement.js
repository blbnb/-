// pages/userAgreement/userAgreement.js
Page({
  data: {
    isScrolledToBottom: false,
    canAgree: false,
    countdown: 5,
    userInfo: null,
    loginCode: '',
    scrollHeight: 0,
    isAgreed: false
  },

  onLoad: function(options) {
    console.log('用户协议页面加载', options);
    
    // 获取从上一页传递的登录信息
    if (options.userInfo) {
      try {
        const decodedUserInfo = decodeURIComponent(options.userInfo);
        const userInfo = JSON.parse(decodedUserInfo);
        this.setData({
          userInfo: userInfo,
          loginCode: options.loginCode || ''
        });
      } catch (e) {
        console.error('解析用户信息失败:', e);
        console.error('原始userInfo:', options.userInfo);
        // 使用默认用户信息
        this.setData({
          userInfo: {
            nickName: '微信用户',
            avatarUrl: 'https://picsum.photos/seed/user/200/200'
          },
          loginCode: options.loginCode || ''
        });
      }
    }
    
    // 设置scroll-view高度
    this.setScrollHeight();
    
    // 开始5秒倒计时
    this.startCountdown();
  },

  // 设置scroll-view高度
  setScrollHeight: function() {
    const windowInfo = wx.getWindowInfo();
    const windowHeight = windowInfo.windowHeight;
    const scrollHeight = windowHeight - 200;
    this.setData({ scrollHeight: scrollHeight });
  },

  // 开始5秒倒计时
  startCountdown: function() {
    let countdown = 5;
    this.setData({ countdown: countdown });
    
    const timer = setInterval(() => {
      countdown--;
      this.setData({ countdown: countdown });
      
      if (countdown <= 0) {
        clearInterval(timer);
        // 检查是否已经滚动到底部
        this.checkCanAgree();
      }
    }, 1000);
  },

  // 检查是否可以同意
  checkCanAgree: function() {
    const canAgree = this.data.countdown <= 0 && this.data.isAgreed;
    console.log('检查是否可以同意:', { 
      countdown: this.data.countdown, 
      isAgreed: this.data.isAgreed,
      canAgree: canAgree 
    });
    this.setData({ canAgree: canAgree });
  },

  // 滚动事件处理（保留但不做任何操作）
  onScroll: function(e) {
    // 不再需要滚动到底部检查
  },

  // 同意协议并登录
  agreeAndLogin: function() {
    if (!this.data.canAgree) return;
    
    wx.showLoading({ title: '登录中...' });
    
    // 直接跳转到获取手机号页面，不传递复杂数据
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: '/pages/getPhone/getPhone'
      });
    }, 500);
  },

  // 完成登录（带手机号）
  completeLoginWithPhone: function(phoneData) {
    // 保存用户信息到本地存储
    if (this.data.userInfo) {
      // 生成模拟手机号
      const mockPhone = phoneData ? '191' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0') : '未绑定';
      
      const localUserInfo = {
        id: Date.now().toString(),
        nickName: this.data.userInfo.nickName || '微信用户',
        avatarUrl: this.data.userInfo.avatarUrl || 'https://picsum.photos/seed/user/200/200',
        phone: mockPhone,
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
      const app = getApp();
      app.globalData.userInfo = localUserInfo;
      app.globalData.isLogin = true;
      
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
      
      // 延迟跳转到用户页面
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/user/user'
        });
      }, 1500);
    }
  },

  // 处理勾选同意协议
  handleAgreeChange: function(e) {
    const isAgreed = e.detail.value.length > 0;
    this.setData({ isAgreed: isAgreed });
    this.checkCanAgree();
  },

  // 不同意协议
  disagree: function() {
    wx.showModal({
      title: '确认退出',
      content: '您需要同意用户协议才能登录使用本应用',
      showCancel: true,
      confirmText: '重新查看',
      cancelText: '退出',
      success: (res) => {
        if (!res.confirm) {
          // 用户点击退出，返回上一页
          const pages = getCurrentPages();
          if (pages.length > 1) {
            wx.navigateBack();
          } else {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        }
      }
    });
  }
})