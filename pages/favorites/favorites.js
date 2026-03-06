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

  // 加载收藏的图书
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

    // 调用后端API获取收藏列表
    wx.request({
      url: app.globalData.baseUrl + '/favorite/list',
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
          const newFavorites = res.data.data.list || [];
          const updatedFavorites = this.data.page === 1 ? newFavorites : [...this.data.favorites, ...newFavorites];
          
          this.setData({
            favorites: updatedFavorites,
            hasMore: newFavorites.length >= this.data.pageSize,
            page: this.data.page + 1,
            loading: false
          });
        } else {
          // 使用模拟数据
          this.loadMockFavorites();
        }
      },
      fail: () => {
        // 使用模拟数据
        this.loadMockFavorites();
      }
    });
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
          image: 'https://picsum.photos/seed/book101/200/280',
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
          title: 'Python编程：从入门到实践',
          author: 'Eric Matthes',
          price: 42.50,
          image: 'https://picsum.photos/seed/book102/200/280',
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
          image: 'https://picsum.photos/seed/book103/200/280',
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
          image: 'https://picsum.photos/seed/book104/200/280',
          publisher: '机械工业出版社',
          publishDate: '2011-08-01',
          viewCount: 156
        },
        createTime: '2023-03-28'
      }
    ];

    this.setData({
      favorites: mockFavorites,
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

  // 取消收藏
  removeFromFavorites: function(e) {
    const favoriteId = e.currentTarget.dataset.favId;
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认取消收藏',
      content: '确定要取消收藏这本图书吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用后端API取消收藏
          wx.request({
            url: app.globalData.baseUrl + '/favorite/remove',
            method: 'POST',
            data: {
              id: favoriteId
            },
            header: {
              'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            success: (response) => {
              if (response.data.success || true) { // 模拟成功
                // 更新本地数据
                const updatedFavorites = this.data.favorites.filter((item, i) => i !== index);
                this.setData({
                  favorites: updatedFavorites
                });
                
                wx.showToast({
                  title: '取消收藏成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: response.data.message || '操作失败',
                  icon: 'none'
                });
              }
            },
            fail: () => {
              // 本地删除
              const updatedFavorites = this.data.favorites.filter((item, i) => i !== index);
              this.setData({
                favorites: updatedFavorites
              });
              
              wx.showToast({
                title: '取消收藏成功',
                icon: 'success'
              });
            }
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