// pages/index/index.js
const app = getApp();

Page({
  data: {
    cartCount: 0,
    categories: [
      {
        name: '计算机学院',
        icon: '💻',
        bgColor: '#e6f7ff'
      },
      {
        name: '机电学院',
        icon: '⚙️',
        bgColor: '#f6ffed'
      },
      {
        name: '电信学院',
        icon: '📡',
        bgColor: '#e6f7ff'
      },
      {
        name: '经贸学院',
        icon: '📊',
        bgColor: '#f6ffed'
      },
      {
        name: '人文学院',
        icon: '🎨',
        bgColor: '#fff0f6'
      },
      {
        name: '管理学院',
        icon: '📋',
        bgColor: '#fff7e6'
      },
      {
        name: '外国语学院',
        icon: '🌐',
        bgColor: '#f0f5ff'
      },
      {
        name: '更多学院',
        icon: '...',
        bgColor: '#f5f5f5'
      }
    ],
    recommendBooks: []
  },

  onLoad: function() {
    this.updateCartCount();
    this.fetchBooks();
  },
  
  // 从后端获取图书数据
  fetchBooks: function() {
    const that = this;
    
    // 在开发环境中，直接使用模拟数据以避免域名白名单限制
    console.log('使用开发模式：直接加载模拟图书数据');
    
    // 准备更丰富的模拟图书数据，确保至少有6本书用于展示
    const mockBooks = [
      {
        id: 1,
        title: 'JavaScript高级程序设计',
        price: 59.00,
        originalPrice: 89.00,
        author: 'Matt Frisbie',
        image: 'https://picsum.photos/seed/book1/300/400',
        tags: ['畅销', '编程']
      },
      {
        id: 2,
        title: '数据结构与算法',
        price: 45.00,
        originalPrice: 68.00,
        author: '严蔚敏',
        image: 'https://picsum.photos/seed/book2/300/400',
        tags: ['经典', '计算机']
      },
      {
        id: 3,
        title: '微观经济学',
        price: 42.00,
        originalPrice: 58.00,
        author: '高鸿业',
        image: 'https://picsum.photos/seed/book3/300/400',
        tags: ['经济', '教材']
      },
      {
        id: 4,
        title: 'Python机器学习',
        price: 79.00,
        originalPrice: 109.00,
        author: 'Sebastian Raschka',
        image: 'https://picsum.photos/seed/book4/300/400',
        tags: ['AI', 'Python']
      },
      {
        id: 5,
        title: '大学物理',
        price: 35.00,
        originalPrice: 52.00,
        author: '张三',
        image: 'https://picsum.photos/seed/book5/300/400',
        tags: ['物理', '教材']
      },
      {
        id: 6,
        title: '线性代数',
        price: 32.00,
        originalPrice: 48.00,
        author: '同济大学',
        image: 'https://picsum.photos/seed/book6/300/400',
        tags: ['数学', '教材']
      }
    ];
    
    that.setData({
      recommendBooks: mockBooks
    });
    
    // 注释掉实际的网络请求，开发环境暂时不使用
    /*
    wx.request({
      url: `${app.globalData.baseUrl}/book/list`,
      method: 'GET',
      data: {
        page: 1,
        limit: 10
      },
      success: function(res) {
        console.log('获取图书列表成功', res.data);
        if (res.data.success && res.data.data && res.data.data.books) {
          that.setData({
            recommendBooks: res.data.data.books
          });
        } else {
          // 使用模拟数据
          that.setData({
            recommendBooks: mockBooks
          });
        }
      },
      fail: function(err) {
        console.error('获取图书列表失败', err);
        // 使用模拟数据
        that.setData({
          recommendBooks: mockBooks
        });
      }
    });
    */
  },

  onShow: function() {
    this.updateCartCount();
  },

  updateCartCount: function() {
    const cart = wx.getStorageSync('cart') || [];
    this.setData({
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  },

  goToCart: function() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  goToCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    if (category === '更多学院') {
      wx.showToast({
        title: '暂无更多学院数据',
        icon: 'none'
      });
    } else {
      wx.navigateTo({
        url: `/pages/category/category?category=${category}`
      });
    }
  },

  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 跳转到搜索页面
  goToSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  }
})