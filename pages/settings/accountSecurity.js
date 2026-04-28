// pages/settings/accountSecurity.js
Page({
  data: {
    phoneNumber: '',
    email: '',
    wechatId: ''
  },

  onLoad: function() {
    this.loadAccountInfo();
  },

  // 加载账号信息
  loadAccountInfo: function() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      phoneNumber: userInfo.phone || '未绑定',
      email: userInfo.email || '未绑定',
      wechatId: userInfo.wechatId || '未绑定'
    });
  },

  // 修改密码
  changePassword: function() {
    wx.navigateTo({
      url: '/pages/settings/changePassword'
    });
  },

  // 绑定手机号
  bindPhone: function() {
    wx.showModal({
      title: '绑定手机号',
      content: '将跳转到手机号绑定页面',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/getPhone/getPhone?from=settings'
          });
        }
      }
    });
  },

  // 绑定邮箱
  bindEmail: function() {
    wx.navigateTo({
      url: '/pages/settings/bindEmail'
    });
  },

  // 绑定微信号
  bindWechat: function() {
    wx.showModal({
      title: '绑定微信号',
      content: '将使用当前登录的微信账号进行绑定',
      success: (res) => {
        if (res.confirm) {
          // 模拟绑定微信号
          const userInfo = wx.getStorageSync('userInfo') || {};
          const wechatId = 'wx_' + Date.now().toString().substr(-8);
          userInfo.wechatId = wechatId;
          wx.setStorageSync('userInfo', userInfo);
          this.setData({ wechatId: wechatId });
          wx.showToast({ title: '绑定成功', icon: 'success' });
        }
      }
    });
  },

  // 返回上一页
  goBack: function() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  }
});