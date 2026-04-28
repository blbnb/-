// pages/favorites/favorites.js
const app = getApp();
Page({
  data: {
    favorites: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad: function() {
    this.loadFavorites();
  },

  onShow: function() {
    // 每次显示页面时重新加载数据
    this.setData({
      page: 1,
      favorites: [],
      hasMore: true
    });
    this.loadFavorites();
  },

  // 加载收藏的图书（使用本地存储）
  loadFavorites: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({ loading: false });
      return;
    }

    this.setData({ loading: true });

    // 从本地存储获取收藏数据
    let favorites = wx.getStorageSync('favorites') || [];
    
    // 如果没有本地数据，使用模拟数据
    if (favorites.length === 0) {
      this.loadMockFavorites();
    } else {
      this.setData({
        favorites: favorites,
        loading: false,
        hasMore: false
      });
    }
  },

  // 加载模拟收藏数据
  loadMockFavorites: function() {
    const mockFavorites = [
      {
        id: 'fav1',
        book: {
          id: '101',
          title: '深入理解计算机系统',
          author: 'Randal E. Bryant',
          price: 58.00,
          image: '',
          publisher: '机械工业出版社',
          publishDate: '2016-03-01',
          viewCount: 234
        },
        createTime: '2023-04-15'
      },
      {
        id: 'fav2',
        book: {
          id: '102',
          title: 'Python 编程：从入门到实践',
          author: 'Eric Matthes',
          price: 42.50,
          image: '',
          publisher: '人民邮电出版社',
          publishDate: '2016-07-01',
          viewCount: 456
        },
        createTime: '2023-04-10'
      },
      {
        id: 'fav3',
        book: {
          id: '103',
          title: '数据结构与算法分析',
          author: 'Mark Allen Weiss',
          price: 48.00,
          image: '',
          publisher: '电子工业出版社',
          publishDate: '2014-08-01',
          viewCount: 189
        },
        createTime: '2023-04-05'
      },
      {
        id: 'fav4',
        book: {
          id: '104',
          title: '编译原理',
          author: 'Alfred V. Aho',
          price: 55.00,
          image: '',
          publisher: '机械工业出版社',
          publishDate: '2011-08-01',
          viewCount: 156
        },
        createTime: '2023-03-28'
      }
    ];

    // 保存到本地存储
    wx.setStorageSync('favorites', mockFavorites);
    
    this.setData({
      favorites: mockFavorites,
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

  // 取消收藏
  removeFromFavorites: function(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认取消收藏',
      content: '确定要取消收藏这本图书吗？',
      success: (res) => {
        if (res.confirm) {
          // 本地删除
          const updatedFavorites = this.data.favorites.filter((item, i) => i !== index);
          this.setData({
            favorites: updatedFavorites
          });
          
          // 更新本地存储
          wx.setStorageSync('favorites', updatedFavorites);
          
          wx.showToast({
            title: '取消收藏成功',
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
      favorites: [],
      hasMore: true
    });
    this.loadFavorites();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadFavorites();
    }
  }
});