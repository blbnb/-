// pages/myBooks/myBooks.js
const app = getApp();
Page({
  data: {
    books: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad: function() {
    this.loadMyBooks();
  },

  onShow: function() {
    // 重新加载数据，确保页面每次显示时都是最新数据
    this.setData({
      page: 1,
      books: [],
      hasMore: true
    });
    this.loadMyBooks();
  },

  // 加载我的图书（使用本地存储）
  loadMyBooks: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({ loading: false });
      return;
    }

    // 显示加载状态
    this.setData({ loading: true });

    // 从本地存储获取发布的图书
    const publishedBooks = wx.getStorageSync('publishedBooks') || [];
    
    // 转换数据格式以匹配页面需求
    const myBooks = publishedBooks.map((book, index) => ({
      id: book.id.toString(),
      title: book.title,
      author: book.author,
      price: book.price,
      image: book.image || '',
      status: 'available',
      publishDate: book.publishTime || '2024-01-01',
      viewCount: 100 + index
    }));
    
    // 如果没有数据，使用模拟数据
    if (myBooks.length === 0) {
      this.loadMockMyBooks();
    } else {
      this.setData({
        books: myBooks,
        loading: false,
        hasMore: false
      });
    }
  },

  // 加载模拟的我的图书数据
  loadMockMyBooks: function() {
    const mockBooks = [
      {
        id: '1',
        title: 'JavaScript 高级程序设计',
        author: 'Nicholas C. Zakas',
        price: 68.00,
        image: '',
        status: 'available',
        publishDate: '2020-01-15',
        viewCount: 156
      },
      {
        id: '2',
        title: '算法导论',
        author: 'Thomas H. Cormen',
        price: 45.00,
        image: '',
        status: 'sold',
        publishDate: '2020-03-20',
        viewCount: 98
      },
      {
        id: '3',
        title: '设计模式',
        author: 'Erich Gamma',
        price: 38.50,
        image: '',
        status: 'available',
        publishDate: '2020-02-10',
        viewCount: 124
      }
    ];

    this.setData({
      books: mockBooks,
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

  // 发布新图书
  publishNewBook: function() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      books: [],
      hasMore: true
    });
    this.loadMyBooks();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMyBooks();
    }
  }
});