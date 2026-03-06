// pages/settings/privacySettings.js
Page({
  data: {
    isLocationEnabled: true,
    isRecommendEnabled: true,
    isAnalyticsEnabled: true,
    isShareEnabled: true
  },

  onLoad: function() {
    this.loadPrivacySettings();
  },

  // 加载隐私设置
  loadPrivacySettings: function() {
    const settings = wx.getStorageSync('privacySettings') || {};
    this.setData({
      isLocationEnabled: settings.isLocationEnabled !== undefined ? settings.isLocationEnabled : true,
      isRecommendEnabled: settings.isRecommendEnabled !== undefined ? settings.isRecommendEnabled : true,
      isAnalyticsEnabled: settings.isAnalyticsEnabled !== undefined ? settings.isAnalyticsEnabled : true,
      isShareEnabled: settings.isShareEnabled !== undefined ? settings.isShareEnabled : true
    });
  },

  // 切换位置权限
  toggleLocation: function(e) {
    const enabled = e.detail.value;
    this.setData({ isLocationEnabled: enabled });
    this.savePrivacySettings();
  },

  // 切换个性化推荐
  toggleRecommend: function(e) {
    const enabled = e.detail.value;
    this.setData({ isRecommendEnabled: enabled });
    this.savePrivacySettings();
  },

  // 切换数据分析
  toggleAnalytics: function(e) {
    const enabled = e.detail.value;
    this.setData({ isAnalyticsEnabled: enabled });
    this.savePrivacySettings();
  },

  // 切换分享权限
  toggleShare: function(e) {
    const enabled = e.detail.value;
    this.setData({ isShareEnabled: enabled });
    this.savePrivacySettings();
  },

  // 保存隐私设置
  savePrivacySettings: function() {
    const settings = {
      isLocationEnabled: this.data.isLocationEnabled,
      isRecommendEnabled: this.data.isRecommendEnabled,
      isAnalyticsEnabled: this.data.isAnalyticsEnabled,
      isShareEnabled: this.data.isShareEnabled
    };
    wx.setStorageSync('privacySettings', settings);
    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1000
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});