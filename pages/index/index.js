// pages/index/index.js
const app = getApp();
const api = require('../../utils/api.js').api;

Page({
  data: {
    cartCount: 0,
    categories: [
      {
        name: "计算机学院",
        icon: "💻",
        bgColor: "#e6f7ff",
      },
      {
        name: "机电学院",
        icon: "⚙️",
        bgColor: "#f6ffed",
      },
      {
        name: "电信学院",
        icon: "📡",
        bgColor: "#e6f7ff",
      },
      {
        name: "经贸学院",
        icon: "📊",
        bgColor: "#f6ffed",
      },
      {
        name: "人文学院",
        icon: "🎨",
        bgColor: "#fff0f6",
      },
      {
        name: "管理学院",
        icon: "📋",
        bgColor: "#fff7e6",
      },
      {
        name: "外国语学院",
        icon: "🌐",
        bgColor: "#f0f5ff",
      },
      {
        name: "更多学院",
        icon: "...",
        bgColor: "#f5f5f5",
      },
    ],
    recommendBooks: [],
  },

  onLoad: function () {
    this.updateCartCount();
    this.fetchBooks();
  },

  // 获取图书数据 (从后端 API)
  fetchBooks: function () {
    const that = this;

    // 显示加载状态
    wx.showLoading({ title: "加载中..." });

    // 从后端 API 获取图书数据
    api.book.getList({ page: 1, per_page: 50 })
      .then((res) => {
        console.log('获取图书成功:', res);
        
        let books = [];
        if (res && res.data) {
          // 转换数据格式
          books = res.data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            originalPrice: book.price * 1.5, // 模拟原价
            image: book.cover_image || '/Default.jpg',
            description: book.description || '',
            category: book.category,
            stock: book.stock,
            viewCount: 0,
            favoriteCount: 0
          }));
        }
        
        // 如果没有数据，使用模拟数据
        if (books.length === 0) {
          books = that.getMockBooks();
        }
        
        // 更新页面数据
        that.setData({
          recommendBooks: books.slice(0, 10), // 只显示前 10 本
        });
        
        // 保存到本地存储 (可选)
        wx.setStorageSync('localBooks', books);
        
        // 隐藏加载状态
        wx.hideLoading();
      })
      .catch((err) => {
        console.error('获取图书失败:', err);
        wx.hideLoading();
        
        // API 失败时使用本地数据
        let books = wx.getStorageSync('localBooks') || [];
        if (books.length === 0) {
          books = that.getMockBooks();
        }
        
        that.setData({
          recommendBooks: books.slice(0, 10),
        });
        
        wx.showToast({
          title: '加载本地数据',
          icon: 'none'
        });
      });
  },

  // 获取模拟图书数据
  getMockBooks: function() {
    return [
      {
        id: 1,
        title: "JavaScript 高级程序设计",
        author: "Matt Frisbie",
        price: 59.0,
        originalPrice: 89.0,
        image: "",
        description: '本书是 JavaScript 领域最有影响力和口碑的著作之一',
        publisher: "人民邮电出版社",
        viewCount: 3456,
        favoriteCount: 892,
      },
      {
        id: 2,
        title: "数据结构与算法",
        author: "严蔚敏",
        price: 45.0,
        originalPrice: 68.0,
        image: "",
        description: "本书是数据结构领域的经典教材",
        publisher: "清华大学出版社",
        viewCount: 2890,
        favoriteCount: 750,
      },
      {
        id: 101,
        title: "C 语言程序设计",
        author: "谭浩强",
        price: 35.0,
        originalPrice: 45.0,
        image: "",
        description: "本书是 C 语言领域的经典教材",
        publisher: "清华大学出版社",
        viewCount: 5680,
        favoriteCount: 1280,
      },
      {
        id: 102,
        title: "高等数学 A(上)",
        author: "同济大学数学系",
        price: 42.0,
        originalPrice: 50.0,
        image: "",
        description: "本书是高等数学课程的经典教材",
        publisher: "高等教育出版社",
        viewCount: 8920,
        favoriteCount: 2150,
      },
      {
        id: 201,
        title: "数据结构",
        author: "严蔚敏",
        price: 48.0,
        originalPrice: 60.0,
        image: "",
        description: "本书系统地介绍了各种数据结构",
        publisher: "清华大学出版社",
        viewCount: 4560,
        favoriteCount: 1080,
      },
      {
        id: 301,
        title: "计算机网络",
        author: "谢希仁",
        price: 48.0,
        originalPrice: 65.0,
        image: "",
        description: "本书系统地介绍了计算机网络",
        publisher: "电子工业出版社",
        viewCount: 4450,
        favoriteCount: 1120,
      },
    ];
  },

  onShow: function () {
    this.updateCartCount();
  },

  updateCartCount: function () {
    const cart = wx.getStorageSync("cart") || [];
    this.setData({
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    });
  },

  goToCart: function () {
    wx.switchTab({
      url: "/pages/cart/cart",
    });
  },

  goToCategory: function (e) {
    const category = e.currentTarget.dataset.category;
    if (category === "更多学院") {
      wx.showToast({
        title: "暂无更多学院数据",
        icon: "none",
      });
    } else {
      wx.navigateTo({
        url: `/pages/category/category?category=${category}`,
      });
    }
  },

// 跳转到书籍详情页
  goToDetail: function (e) {
    const app = getApp();
    const id = e.currentTarget.dataset.id;
    
    // 检查登录状态
    if (!app.isLogin()) {
      // 未登录，显示登录提示弹窗
      this.showLoginDialog();
      return;
    }
    
    // 已登录，跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
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

  // 跳转到搜索页面
  goToSearch: function () {
    wx.navigateTo({
      url: "/pages/search/search",
    });
  },
});
