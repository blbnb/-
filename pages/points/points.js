// pages/points/points.js
Page({
  data: {
    totalPoints: 0,
    pointsHistory: [],
    activeTab: 'history', // history, rules
    loading: true
  },

  onLoad: function() {
    this.loadPointsData();
  },

  // 加载积分数据
  loadPointsData: function() {
    this.setData({ loading: true });
    
    // 尝试从本地存储加载积分数据
    let userPoints = wx.getStorageSync('userPoints');
    let pointsHistory = wx.getStorageSync('pointsHistory');
    
    // 如果没有数据，使用模拟数据
    if (!userPoints) {
      userPoints = 1280;
      wx.setStorageSync('userPoints', userPoints);
    }
    
    if (!pointsHistory || !Array.isArray(pointsHistory)) {
      pointsHistory = this.getMockPointsHistory();
      wx.setStorageSync('pointsHistory', pointsHistory);
    }
    
    // 延迟显示，模拟网络请求
    setTimeout(() => {
      this.setData({
        totalPoints: userPoints,
        pointsHistory: pointsHistory,
        loading: false
      });
    }, 500);
  },

  // 生成模拟积分历史数据
  getMockPointsHistory: function() {
    // 生成过去30天的积分历史数据
    const history = [];
    const now = new Date();
    
    // 购买书籍获得积分（5条记录）
    for (let i = 1; i <= 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 2);
      history.push({
        id: 'buy_' + i,
        type: 'buy',
        points: Math.floor(Math.random() * 100) + 50,
        description: '购买《计算机科学导论》获得积分',
        date: date.toISOString().split('T')[0],
        time: date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
      });
    }
    
    // 签到获得积分（3条记录）
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 3 + 1));
      history.push({
        id: 'checkin_' + i,
        type: 'checkin',
        points: 5 + i,
        description: '连续签到第' + (i + 2) + '天获得积分',
        date: date.toISOString().split('T')[0],
        time: '08:' + Math.floor(Math.random() * 60).toString().padStart(2, '0')
      });
    }
    
    // 评论获得积分（2条记录）
    for (let i = 1; i <= 2; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 5 - 2));
      history.push({
        id: 'comment_' + i,
        type: 'comment',
        points: 10,
        description: '评论书籍获得积分',
        date: date.toISOString().split('T')[0],
        time: date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
      });
    }
    
    // 积分兑换（1条记录）
    const exchangeDate = new Date(now);
    exchangeDate.setDate(exchangeDate.getDate() - 15);
    history.push({
      id: 'exchange_1',
      type: 'exchange',
      points: -200,
      description: '兑换优惠券 -200积分',
      date: exchangeDate.toISOString().split('T')[0],
      time: '15:' + Math.floor(Math.random() * 60).toString().padStart(2, '0')
    });
    
    // 按日期倒序排序
    history.sort((a, b) => {
      const dateCompare = new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
      return dateCompare;
    });
    
    return history;
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 去兑换
  goToExchange: function() {
    wx.showToast({
      title: '积分商城建设中',
      icon: 'none'
    });
  }
});