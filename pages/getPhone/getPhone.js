// pages/getPhone/getPhone.js
Page({
  data: {
    loginCode: '',
    userInfo: null,
    loading: false,
    maskedPhone: '191****1234' // 默认显示的脱敏手机号
  },

  onLoad: function() {
    console.log('获取手机号页面加载');
    // 不再依赖 eventChannel，直接从 storage 读取
    const userInfo = wx.getStorageSync('userInfo');
    const loginCode = wx.getStorageSync('tempLoginCode') || '';
    
    this.setData({
      loginCode: loginCode,
      userInfo: userInfo || null
    });
  },



  // 点击微信绑定号码
  handlePhoneSelect: function() {
    console.log('用户选择使用微信绑定号码');
    
    // 模拟获取手机号成功
    this.setData({ loading: true });
    
    setTimeout(() => {
      try {
        // 模拟手机号信息
        const phoneData = {
          encryptedData: 'mock',
          iv: 'mock'
        };
        
        // 直接在这里完成登录，不再返回上一页
        this.completeLoginWithPhone(phoneData);
      } catch (error) {
        console.error('处理手机号信息失败:', error);
        wx.showToast({ title: '处理失败，请重试', icon: 'none' });
        this.setData({ loading: false });
      }
    }, 500);
  },

  // 使用其它号码
  useOtherPhone: function() {
    console.log('用户选择使用其它号码');
    // 可以导航到手动输入手机号的页面，或者在这里实现手动输入功能
    wx.navigateTo({
      url: '/pages/phoneLogin/phoneLogin' // 假设存在这样的页面
    })
  },

  // 显示隐私信息
  showPrivacyInfo: function() {
    console.log('显示隐私信息');
    wx.showModal({
      title: '隐私说明',
      content: '我们会严格保护您的个人信息安全，不会向第三方泄露。手机号仅用于账号验证和服务通知。',
      showCancel: false
    });
  },

  // 处理取消获取手机号（现在是"不允许"按钮）
  handleCancel: function() {
    console.log('用户点击不允许');
    
    // 显示确认对话框
    wx.showModal({
      title: '确认操作',
      content: '不允许授权手机号可能影响部分功能的使用，确定要继续吗？',
      success: (res) => {
        if (res.confirm) {
          // 直接完成登录（不绑定手机号）
          this.completeLoginWithPhone(null);
        }
      }
    });
  },
  
  // 完成登录（带手机号）
  completeLoginWithPhone: function(phoneData) {
    // 获取当前用户信息
    const userInfo = this.data.userInfo;
    
    if (!userInfo) {
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      return;
    }
    
    // 生成模拟手机号
    const mockPhone = phoneData ? '191' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0') : '未绑定';
    
    const localUserInfo = {
      id: Date.now().toString(),
      nickName: userInfo.nickName || '微信用户',
      avatarUrl: userInfo.avatarUrl || 'https://picsum.photos/seed/user/200/200',
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
})