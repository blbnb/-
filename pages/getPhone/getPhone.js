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
    // 获取事件通道
    this.eventChannel = this.getOpenerEventChannel();
    
    // 监听来自上一页面的数据
    this.eventChannel.on('passLoginInfo', (data) => {
      console.log('接收登录信息:', data);
      this.setData({
        loginCode: data.loginCode || '',
        userInfo: data.userInfo || null,
        maskedPhone: data.maskedPhone || '191****1234' // 从上个页面获取脱敏手机号
      });
    });
  },

  // 获取手机号
  getPhoneNumber: function(e) {
    console.log('手机号授权结果:', e.detail);
    
    // 防止重复点击
    if (this.data.loading) return;
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      this.setData({ loading: true });
      
      // 模拟处理延迟，提升用户体验
      setTimeout(() => {
        try {
          // 用户同意授权，将手机号信息传回上一页面
          this.eventChannel.emit('onPhoneReceived', e.detail);
          
          // 返回上一页面
          wx.navigateBack();
        } catch (error) {
          console.error('处理手机号信息失败:', error);
          wx.showToast({ title: '处理失败，请重试', icon: 'none' });
          this.setData({ loading: false });
        }
      }, 500);
    } else {
      console.log('用户拒绝手机号授权');
      // 用户拒绝授权，返回上一页面并通知
      this.eventChannel.emit('onPhoneCancel');
      wx.navigateBack();
    }
  },

  // 点击微信绑定号码
  handlePhoneSelect: function() {
    console.log('用户选择使用微信绑定号码');
    // 触发获取手机号的逻辑
    this.selectComponent('#phoneButton').click();
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
          this.eventChannel.emit('onPhoneCancel');
          wx.navigateBack();
        }
      }
    });
  }
})