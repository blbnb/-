// pages/notifications/notifications.js
const app = getApp();
Page({
  data: {
    notifications: [],
    loading: false,
    emptyState: false,
    currentTab: 'all', // all, system, order, promotion
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'system', label: '系统通知' },
      { key: 'order', label: '订单消息' },
      { key: 'promotion', label: '活动消息' }
    ]
  },

  onLoad: function() {
    this.loadNotifications();
  },

  onShow: function() {
    // 页面显示时标记所有通知为已读
    this.markAllAsRead();
    // 重新加载通知数据
    this.loadNotifications();
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.currentTab) {
      this.setData({
        currentTab: tab,
        notifications: [],
        loading: true
      });
      this.loadNotifications();
    }
  },

  // 加载通知数据
  loadNotifications: function() {
    this.setData({ loading: true });
    
    try {
      // 模拟从本地存储获取通知数据
      let allNotifications = wx.getStorageSync('notifications') || [];
      
      // 如果没有通知数据，使用模拟数据
      if (allNotifications.length === 0) {
        allNotifications = this.generateMockNotifications();
        wx.setStorageSync('notifications', allNotifications);
      }
      
      // 根据当前标签筛选通知
      let filteredNotifications = allNotifications;
      if (this.data.currentTab !== 'all') {
        filteredNotifications = allNotifications.filter(notification => notification.type === this.data.currentTab);
      }
      
      // 按创建时间倒序排列
      filteredNotifications.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      
      this.setData({
        notifications: filteredNotifications,
        emptyState: filteredNotifications.length === 0,
        loading: false
      });
    } catch (e) {
      console.error('加载通知失败:', e);
      this.setData({
        loading: false,
        emptyState: true
      });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  // 生成模拟通知数据
  generateMockNotifications: function() {
    const mockNotifications = [
      {
        id: '1',
        title: '新订单已支付',
        content: '您的订单ORD12345678已支付成功，我们将尽快为您发货。',
        type: 'order',
        isRead: false,
        createTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
        orderId: '1'
      },
      {
        id: '2',
        title: '系统维护通知',
        content: '尊敬的用户，我们将于本周日凌晨2点-4点进行系统维护，期间可能影响部分功能使用，敬请谅解。',
        type: 'system',
        isRead: false,
        createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
        link: ''
      },
      {
        id: '3',
        title: '新书上架',
        content: '《前端工程化实践》新书上架，限时8折优惠，点击查看详情。',
        type: 'promotion',
        isRead: true,
        createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1天前
        link: '/pages/detail/detail?id=100'
      },
      {
        id: '4',
        title: '订单已发货',
        content: '您的订单ORD12345678已发货，物流单号：SF1234567890，请及时关注物流信息。',
        type: 'order',
        isRead: true,
        createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天前
        orderId: '1'
      },
      {
        id: '5',
        title: '会员积分到账',
        content: '您的账户已到账50积分，当前积分：550。',
        type: 'system',
        isRead: true,
        createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天前
        link: '/pages/points/points'
      },
      {
        id: '6',
        title: '限时优惠活动',
        content: '双11特惠活动开始啦，全场图书5折起，还有满减优惠等您来拿！',
        type: 'promotion',
        isRead: true,
        createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天前
        link: '/pages/index/index'
      }
    ];
    return mockNotifications;
  },

  // 标记通知为已读
  markAsRead: function(e) {
    const id = e.currentTarget.dataset.id;
    try {
      let notifications = wx.getStorageSync('notifications') || [];
      notifications = notifications.map(item => {
        if (item.id === id) {
          return { ...item, isRead: true };
        }
        return item;
      });
      wx.setStorageSync('notifications', notifications);
      
      // 更新页面数据
      const updatedNotifications = this.data.notifications.map(item => {
        if (item.id === id) {
          return { ...item, isRead: true };
        }
        return item;
      });
      this.setData({ notifications: updatedNotifications });
      
      // 更新用户页面的未读消息数
      this.updateUnreadCount();
    } catch (e) {
      console.error('标记已读失败:', e);
    }
  },

  // 标记所有通知为已读
  markAllAsRead: function() {
    try {
      let notifications = wx.getStorageSync('notifications') || [];
      const hasUnread = notifications.some(item => !item.isRead);
      
      if (hasUnread) {
        notifications = notifications.map(item => ({ ...item, isRead: true }));
        wx.setStorageSync('notifications', notifications);
        this.updateUnreadCount();
      }
    } catch (e) {
      console.error('标记全部已读失败:', e);
    }
  },

  // 更新未读消息数
  updateUnreadCount: function() {
    try {
      let notifications = wx.getStorageSync('notifications') || [];
      const unreadCount = notifications.filter(item => !item.isRead).length;
      // 可以通过全局状态或事件通知其他页面更新未读计数
      if (app.globalData) {
        app.globalData.unreadNotificationCount = unreadCount;
      }
    } catch (e) {
      console.error('更新未读计数失败:', e);
    }
  },

  // 点击通知项
  onNotificationClick: function(e) {
    const notification = e.currentTarget.dataset.notification;
    
    // 先标记为已读
    this.markAsRead(e);
    
    // 根据通知类型进行不同的跳转
    if (notification.type === 'order' && notification.orderId) {
      wx.navigateTo({
        url: `/pages/orders/orders?orderId=${notification.orderId}`
      });
    } else if (notification.link) {
      wx.navigateTo({
        url: notification.link
      });
    }
  },

  // 删除通知
  deleteNotification: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条通知吗？',
      success: res => {
        if (res.confirm) {
          try {
            let notifications = wx.getStorageSync('notifications') || [];
            notifications = notifications.filter(item => item.id !== id);
            wx.setStorageSync('notifications', notifications);
            
            // 更新页面数据
            const updatedNotifications = this.data.notifications.filter(item => item.id !== id);
            this.setData({
              notifications: updatedNotifications,
              emptyState: updatedNotifications.length === 0
            });
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (e) {
            console.error('删除通知失败:', e);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 清空所有通知
  clearAllNotifications: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有通知吗？此操作不可恢复。',
      success: res => {
        if (res.confirm) {
          try {
            wx.setStorageSync('notifications', []);
            this.setData({
              notifications: [],
              emptyState: true
            });
            wx.showToast({
              title: '已清空所有通知',
              icon: 'success'
            });
          } catch (e) {
            console.error('清空通知失败:', e);
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 格式化时间显示
  formatTime: function(timeStr) {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return '刚刚';
    } else if (minutes < 60) {
      return minutes + '分钟前';
    } else if (hours < 24) {
      return hours + '小时前';
    } else if (days < 7) {
      return days + '天前';
    } else {
      return time.toLocaleDateString();
    }
  }
});