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

  // 加载我的图书
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

    // 调用后端API获取用户图书列表
    wx.request({
      url: app.globalData.baseUrl + '/book/my',
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          const newBooks = res.data.data.list || [];
          const updatedBooks = this.data.page === 1 ? newBooks : [...this.data.books, ...newBooks];
          
          this.setData({
            books: updatedBooks,
            hasMore: newBooks.length >= this.data.pageSize,
            page: this.data.page + 1,
            loading: false
          });
        } else {
          // 如果API调用失败，使用模拟数据
          this.loadMockMyBooks();
        }
      },
      fail: () => {
        // 使用模拟数据
        this.loadMockMyBooks();
      }
    });
  },

  // 加载模拟的我的图书数据
  loadMockMyBooks: function() {
    const mockBooks = [
      {
        id: '1',
        title: 'JavaScript高级程序设计',
        author: 'Nicholas C. Zakas',
        price: 68.00,
        image: 'https://picsum.photos/seed/book1/200/280',
        status: 'available',
        publishDate: '2020-01-15',
        viewCount: 156
      },
      {
        id: '2',
        title: '算法导论',
        author: 'Thomas H. Cormen',
        price: 45.00,
        image: 'https://picsum.photos/seed/book2/200/280',
        status: 'sold',
        publishDate: '2020-03-20',
        viewCount: 98
      },
      {
        id: '3',
        title: '设计模式',
        author: 'Erich Gamma',
        price: 38.50,
        image: 'https://picsum.photos/seed/book3/200/280',
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
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${bookId}`
    });
  },

  // 前往首页
  goToHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
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