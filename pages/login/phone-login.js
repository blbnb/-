// pages/login/phone-login.js - 手机号登录页面
const app = getApp();

Page({
  data: {
    // 手机号和验证码
    phoneNumber: '',
    verifyCode: '',
    canSendCode: true,
    countdown: 0,
    sendingCode: false,
    
    // 加载状态
    loading: false,
    
    // 验证码（统一为 123456）
    mockVerifyCode: '123456'
  },

  onLoad: function(options) {
    console.log('手机号登录页面加载');
  },

  // 返回
  goBack: function() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 手机号输入
  onPhoneInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 验证码输入
  onCodeInput: function(e) {
    this.setData({
      verifyCode: e.detail.value
    });
  },

  // 发送验证码
  sendVerifyCode: function() {
    if (!this.data.phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    if (this.data.phoneNumber.length !== 11) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    }

    if (!this.data.canSendCode || this.data.countdown > 0) {
      return;
    }

    this.setData({
      sendingCode: true
    });

    console.log('发送验证码到:', this.data.phoneNumber);
    
    // 模拟发送验证码
    setTimeout(() => {
      this.setData({
        sendingCode: false,
        canSendCode: false,
        countdown: 60
      });

      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      });

      // 提示验证码
      wx.showModal({
        title: '验证码',
        content: '您的验证码是：123456',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#1890ff'
      });

      // 开始倒计时
      this.startCountdown();
    }, 1000);
  },

  // 倒计时
  startCountdown: function() {
    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer);
        this.setData({
          countdown: 0,
          canSendCode: true
        });
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        });
      }
    }, 1000);
  },

  // 手机号登录
  handlePhoneLogin: function() {
    if (!this.data.phoneNumber || !this.data.verifyCode) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (this.data.verifyCode !== this.data.mockVerifyCode) {
      wx.showToast({
        title: '验证码错误',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    console.log('开始手机号登录:', this.data.phoneNumber);

    // 模拟登录
    setTimeout(() => {
      // 生成用户信息
      const maskedPhone = this.data.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      const nicknames = ['阳光学子', '快乐读者', '书香青年', '追梦少年', '奋斗青年', '青春年华'];
      const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
      
      const userInfo = {
        id: 'phone_' + Date.now().toString(),
        nickName: randomNickname,
        avatarUrl: '',
        phone: maskedPhone,
        college: '未设置',
        level: '普通会员',
        createTime: new Date().toISOString(),
        loginType: 'phone',
        loginTime: new Date().toISOString()
      };

      // 保存用户信息
      wx.setStorageSync('userInfo', userInfo);
      
      // 记录登录日志
      this.logLogin('phone', userInfo.id);
      
      // 初始化用户数据
      this.initUserData();

      this.setData({ loading: false });

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 延迟跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }, 1500);
  },

  // 初始化用户数据
  initUserData: function() {
    // 初始化购物车
    const cart = wx.getStorageSync('cart') || [];
    if (!cart) {
      wx.setStorageSync('cart', []);
    }

    // 初始化收藏
    const favorites = wx.getStorageSync('favorites') || [];
    if (!favorites) {
      wx.setStorageSync('favorites', []);
    }

    // 初始化浏览历史
    const browseHistory = wx.getStorageSync('browseHistory') || [];
    if (!browseHistory) {
      wx.setStorageSync('browseHistory', []);
    }

    // 初始化订单
    const orders = wx.getStorageSync('orders') || [];
    if (!orders) {
      wx.setStorageSync('orders', []);
    }

    // 初始化统计数据
    const userStats = {
      booksCount: 0,
      favoritesCount: 0,
      historyCount: 0
    };
    wx.setStorageSync('userStats', userStats);

    // 初始化订单统计
    const orderCounts = {
      pending: 0,
      paid: 0,
      shipped: 0,
      received: 0
    };
    wx.setStorageSync('orderCounts', orderCounts);

    // 更新全局数据
    app.globalData.userInfo = wx.getStorageSync('userInfo');
    app.globalData.isLogin = true;
  },

  // 记录登录日志
  logLogin: function(loginType, userId) {
    const loginLogs = wx.getStorageSync('loginLogs') || [];
    const newLog = {
      id: Date.now().toString(),
      userId: userId,
      loginType: loginType,
      loginTime: new Date().toISOString(),
      device: '微信小程序'
    };
    loginLogs.unshift(newLog);
    // 只保留最近 10 条记录
    if (loginLogs.length > 10) {
      loginLogs.splice(10);
    }
    wx.setStorageSync('loginLogs', loginLogs);
    console.log('登录日志已记录:', newLog);
  }
});
