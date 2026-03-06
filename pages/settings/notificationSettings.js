// pages/settings/notificationSettings.js
Page({
  data: {
    isOrderNotificationEnabled: true,
    isPromotionNotificationEnabled: true,
    isSystemNotificationEnabled: true,
    isSoundEnabled: true,
    isVibrationEnabled: true
  },

  onLoad: function() {
    this.loadNotificationSettings();
  },

  // 加载通知设置
  loadNotificationSettings: function() {
    const settings = wx.getStorageSync('notificationSettings') || {};
    this.setData({
      isOrderNotificationEnabled: settings.isOrderNotificationEnabled !== undefined ? settings.isOrderNotificationEnabled : true,
      isPromotionNotificationEnabled: settings.isPromotionNotificationEnabled !== undefined ? settings.isPromotionNotificationEnabled : true,
      isSystemNotificationEnabled: settings.isSystemNotificationEnabled !== undefined ? settings.isSystemNotificationEnabled : true,
      isSoundEnabled: settings.isSoundEnabled !== undefined ? settings.isSoundEnabled : true,
      isVibrationEnabled: settings.isVibrationEnabled !== undefined ? settings.isVibrationEnabled : true
    });
  },

  // 切换订单通知
  toggleOrderNotification: function(e) {
    const enabled = e.detail.value;
    this.setData({ isOrderNotificationEnabled: enabled });
    this.saveNotificationSettings();
  },

  // 切换促销通知
  togglePromotionNotification: function(e) {
    const enabled = e.detail.value;
    this.setData({ isPromotionNotificationEnabled: enabled });
    this.saveNotificationSettings();
  },

  // 切换系统通知
  toggleSystemNotification: function(e) {
    const enabled = e.detail.value;
    this.setData({ isSystemNotificationEnabled: enabled });
    this.saveNotificationSettings();
  },

  // 切换声音提醒
  toggleSound: function(e) {
    const enabled = e.detail.value;
    this.setData({ isSoundEnabled: enabled });
    this.saveNotificationSettings();
  },

  // 切换震动提醒
  toggleVibration: function(e) {
    const enabled = e.detail.value;
    this.setData({ isVibrationEnabled: enabled });
    this.saveNotificationSettings();
  },

  // 保存通知设置
  saveNotificationSettings: function() {
    const settings = {
      isOrderNotificationEnabled: this.data.isOrderNotificationEnabled,
      isPromotionNotificationEnabled: this.data.isPromotionNotificationEnabled,
      isSystemNotificationEnabled: this.data.isSystemNotificationEnabled,
      isSoundEnabled: this.data.isSoundEnabled,
      isVibrationEnabled: this.data.isVibrationEnabled
    };
    wx.setStorageSync('notificationSettings', settings);
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