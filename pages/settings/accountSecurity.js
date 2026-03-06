// pages/settings/accountSecurity.js
Page({
  data: {
    phoneNumber: '',
    email: ''
  },

  onLoad: function() {
    this.loadAccountInfo();
  },

  // 加载账号信息
  loadAccountInfo: function() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      phoneNumber: userInfo.phone || '未绑定',
      email: userInfo.email || '未绑定'
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

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});