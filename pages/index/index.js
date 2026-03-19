// pages/index/index.js
const app = getApp();

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

  // 从后端获取图书数据
  fetchBooks: function () {
    const that = this;

    // 显示加载状态
    wx.showLoading({ title: "加载中..." });

    // 调用后端API获取图书数据
    wx.request({
      url: `${app.globalData.baseUrl}/book/list`,
      method: "GET",
      data: {
        page: 1,
        limit: 10,
      },
      success: function (res) {
        console.log("获取图书列表成功", res.data);
        if (res.data.success && res.data.data && res.data.data.list) {
          that.setData({
            recommendBooks: res.data.data.list,
          });
        } else {
          // 如果后端返回数据不符合预期，使用空数组
          that.setData({
            recommendBooks: [],
          });
          wx.showToast({ title: "暂无图书数据", icon: "none" });
        }
      },
      fail: function (err) {
        console.error("获取图书列表失败", err);
        // 网络请求失败时使用空数组
        that.setData({
          recommendBooks: [],
        });
        wx.showToast({ title: "加载失败，请重试", icon: "none" });
      },
      complete: function () {
        // 隐藏加载状态
        wx.hideLoading();
      },
    });
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

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
    });
  },

  // 跳转到搜索页面
  goToSearch: function () {
    wx.navigateTo({
      url: "/pages/search/search",
    });
  },
});
