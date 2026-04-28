// pages/login/login.js - 仿微信小程序登录页面
const app = getApp();

Page({
  data: {
    // 用户协议和隐私政策
    agreementAccepted: false,
    showAgreementModal: false,
    showPrivacyModal: false,
    
    // 手机号登录
    phoneNumber: '',
    verifyCode: '',
    canSendCode: true,
    countdown: 0,
    sendingCode: false,
    
    // 加载状态
    loading: false,
    
    // 验证码（模拟）
    mockVerifyCode: '123456'
  },

  onLoad: function(options) {
    console.log('登录页面加载');
    // 检查是否已经登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      // 已经登录，返回上一页
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({
            url: '/pages/user/user'
          });
        }
      });
    }
    
    // 检查是否有之前同意的协议
    const acceptedAgreement = wx.getStorageSync('acceptedAgreement');
    if (acceptedAgreement) {
      this.setData({
        agreementAccepted: true
      });
    }
  },

  // 选择微信登录
  selectWechatLogin: function() {
    if (!this.data.agreementAccepted) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      });
      return;
    }
    
    console.log('选择微信一键登录');
    // 直接执行微信登录
    this.handleWechatLogin();
  },

  // 选择手机号登录
  selectPhoneLogin: function() {
    if (!this.data.agreementAccepted) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      });
      return;
    }
    
    console.log('选择手机号登录');
    // 跳转到手机号登录页面
    wx.navigateTo({
      url: '/pages/login/phone-login'
    });
  },

  // 微信一键登录处理（独立函数）
  handleWechatLogin: function() {
    this.setData({ loading: true });
    
    console.log('开始微信一键授权登录');
    
    // 显示授权加载提示
    wx.showLoading({
      title: '微信授权中...',
      mask: true
    });
    
    // 模拟微信授权流程（仿一键登录）
    setTimeout(() => {
      // 生成仿真的微信用户信息
      const nicknames = ['阳光少年', '快乐学子', '书香门第', '知行合一', '学海无涯', '书山有路', '春风十里', '夏日清风'];
      const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
      
      // 生成随机的微信头像（使用默认图片）
      const avatarUrls = ['', '', '', '']; // 大部分使用默认头像
      
      const userInfo = {
        id: 'wx_' + Date.now().toString(),
        nickName: randomNickname,
        avatarUrl: avatarUrls[Math.floor(Math.random() * avatarUrls.length)],
        phone: '未绑定',
        college: '未设置',
        level: '普通会员',
        createTime: new Date().toISOString(),
        loginType: 'wechat',
        loginTime: new Date().toISOString(),
        wechatUnionId: 'wx_union_' + Math.random().toString(36).substr(2, 16),
        wechatOpenId: 'wx_open_' + Math.random().toString(36).substr(2, 16)
      };
      
      console.log('微信授权成功，用户信息:', userInfo);
      
      // 保存用户信息
      wx.setStorageSync('userInfo', userInfo);
      
      // 记录登录日志
      this.logLogin('wechat', userInfo.id);
      
      // 初始化用户数据
      this.initUserData();
      
      // 隐藏加载提示
      wx.hideLoading();
      this.setData({ loading: false });
      
      // 显示成功提示
      wx.showToast({
        title: '授权成功',
        icon: 'success',
        duration: 1500
      });
      
      // 延迟跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }, 2000);
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

      // 模拟验证码（实际项目中应该从后端获取）
      console.log('模拟验证码:', this.data.mockVerifyCode);

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
    if (!this.data.agreementAccepted) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      });
      return;
    }

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
      const nicknames = ['阳光学子', '快乐读者', '书香青年', '追梦少年', '奋斗青年'];
      const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
      
      const userInfo = {
        id: Date.now().toString(),
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

  // 切换协议勾选
  toggleAgreement: function() {
    this.setData({
      agreementAccepted: !this.data.agreementAccepted
    });
  },

  // 显示用户协议
  showUserAgreement: function() {
    this.setData({
      showAgreementModal: true
    });
  },

  // 关闭用户协议
  closeAgreementModal: function() {
    this.setData({
      showAgreementModal: false
    });
  },

  // 接受用户协议
  acceptAgreement: function() {
    this.setData({
      agreementAccepted: true,
      showAgreementModal: false
    });
    wx.setStorageSync('acceptedAgreement', true);
  },

  // 显示隐私政策
  showPrivacyPolicy: function() {
    this.setData({
      showPrivacyModal: true
    });
  },

  // 关闭隐私政策
  closePrivacyModal: function() {
    this.setData({
      showPrivacyModal: false
    });
  },

  // 接受隐私政策
  acceptPrivacy: function() {
    this.setData({
      agreementAccepted: true,
      showPrivacyModal: false
    });
    wx.setStorageSync('acceptedAgreement', true);
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 空函数，用于阻止事件冒泡
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
