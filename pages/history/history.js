// pages/history/history.js
const app = getApp();
Page({
  data: {
    history: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad: function() {
    this.loadHistory();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.setData({
      page: 1,
      history: [],
      hasMore: true
    });
    this.loadHistory();
  },

  // 加载浏览历史（使用本地存储）
  loadHistory: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      this.setData({ loading: false });
      return;
    }

    this.setData({ loading: true });

    // 直接使用本地存储的历史记录或模拟数据
    this.loadLocalHistory();
  },

  // 加载本地浏览历史
  loadLocalHistory: function() {
    // 尝试从本地存储获取历史记录
    let localHistory = wx.getStorageSync('browseHistory') || [];
    
    // 如果没有本地历史记录，使用模拟数据
    if (localHistory.length === 0) {
      localHistory = [
        {
          id: 'h1',
          book: {
            id: '201',
            title: '深度学习入门',
            author: '斋藤康毅',
            price: 45.00,
            image: '',
            publisher: '人民邮电出版社',
            publishDate: '2018-07-01',
            viewCount: 678
          },
          viewTime: '今天 14:30'
        },
        {
          id: 'h2',
          book: {
            id: '202',
            title: '计算机网络：自顶向下方法',
            author: 'James F. Kurose',
            price: 62.00,
            image: '',
            publisher: '机械工业出版社',
            publishDate: '2018-03-01',
            viewCount: 345
          },
          viewTime: '今天 10:15'
        },
        {
          id: 'h3',
          book: {
            id: '203',
            title: 'C++ Primer Plus',
            author: 'Stephen Prata',
            price: 78.50,
            image: '',
            publisher: '人民邮电出版社',
            publishDate: '2019-02-01',
            viewCount: 567
          },
          viewTime: '昨天 16:45'
        },
        {
          id: 'h4',
          book: {
            id: '204',
            title: 'Go 程序设计语言',
            author: 'Alan A. A. Donovan',
            price: 55.00,
            image: '',
            publisher: '机械工业出版社',
            publishDate: '2016-01-01',
            viewCount: 234
          },
          viewTime: '昨天 09:20'
        },
        {
          id: 'h5',
          book: {
            id: '205',
            title: '机器学习实战',
            author: 'Peter Harrington',
            price: 59.00,
            image: '',
            publisher: '人民邮电出版社',
            publishDate: '2013-06-01',
            viewCount: 890
          },
          viewTime: '前天 11:30'
        }
      ];
      // 保存到本地存储
      wx.setStorageSync('browseHistory', localHistory);
    }

    this.setData({
      history: localHistory,
      loading: false,
      hasMore: false
    });
  },

  // 跳转到图书详情
  goToBookDetail: function(e) {
    const app = getApp();
    const bookId = e.currentTarget.dataset.id;
    
    // 检查登录状态
    if (!app.isLogin()) {
      // 未登录，显示登录提示弹窗
      this.showLoginDialog();
      return;
    }
    
    // 已登录，跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?id=${bookId}`
    });
  },

  // 显示登录提示弹窗
  showLoginDialog: function() {
    wx.showModal({
      title: '登录提示',
      content: '请先登录后再查看书籍详情',
      confirmText: '去登录',
      cancelText: '取消',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确认，跳转到登录页
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  // 清空历史记录
  clearHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空本地数据
          wx.removeStorageSync('browseHistory');
          this.setData({
            history: [],
            hasMore: false
          });
          
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      history: [],
      hasMore: true
    });
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadHistory();
    }
  }
});