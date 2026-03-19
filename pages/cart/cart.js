// pages/cart/cart.js
const app = getApp();
Page({
  data: {
    cart: [],
    selectAll: false,
    totalPrice: 0,
    selectedCount: 0,
    hasSelected: false,
    loading: false
  },

  onShow: function() {
    // 检查登录状态
    if (!app.checkLogin()) {
      this.setData({ cart: [], loading: false });
      return;
    }
    this.loadCartData();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadCartData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 500);
  },

  // 加载购物车数据
  loadCartData: function() {
    this.setData({ loading: true });
    
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && wx.getStorageSync('token')) {
      // 从后端加载购物车数据
      wx.request({
        url: app.globalData.baseUrl + '/cart/list',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.data.success && res.data.data) {
            const cart = res.data.data.map(item => ({
              ...item,
              selected: false
            }));
            wx.setStorageSync('cart', cart);
            this.setData({ cart });
          } else {
            // 使用本地存储的购物车数据
            this.loadLocalCartData();
          }
        },
        fail: () => {
          // 使用本地存储的购物车数据
          this.loadLocalCartData();
        },
        complete: () => {
          this.setData({ loading: false });
          this.updateCartStatus();
        }
      });
    } else {
      // 使用本地存储的购物车数据
      this.loadLocalCartData();
      this.setData({ loading: false });
    }
  },
  
  // 加载本地购物车数据
  loadLocalCartData: function() {
    let cart = wx.getStorageSync('cart') || [];
    
    // 如果没有本地购物车数据，使用模拟数据
    if (cart.length === 0) {
      cart = [
        {
          id: 'cart1',
          bookId: '1',
          title: 'JavaScript高级程序设计',
          author: 'Matt Frisbie',
          price: 109.00,
          image: 'https://picsum.photos/seed/book1/200/280',
          quantity: 1,
          selected: false
        },
        {
          id: 'cart2',
          bookId: '2',
          title: 'Python编程：从入门到实践',
          author: 'Eric Matthes',
          price: 79.00,
          image: 'https://picsum.photos/seed/book2/200/280',
          quantity: 2,
          selected: false
        },
        {
          id: 'cart3',
          bookId: '3',
          title: '算法导论',
          author: 'Thomas H. Cormen',
          price: 128.00,
          image: 'https://picsum.photos/seed/book3/200/280',
          quantity: 1,
          selected: false
        }
      ];
      wx.setStorageSync('cart', cart);
    }
    
    this.setData({ cart });
  },

  // 更新购物车选中状态和总价
  updateCartStatus: function() {
    const cart = this.data.cart;
    
    // 检查是否全选
    const selectAll = cart.length > 0 && cart.every(item => item.selected);
    
    // 计算选中的商品数量和总价
    let selectedCount = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
      if (item.selected) {
        selectedCount += item.quantity;
        totalPrice += item.price * item.quantity;
      }
    });
    
    this.setData({
      selectAll: selectAll,
      selectedCount: selectedCount,
      totalPrice: totalPrice.toFixed(2),
      hasSelected: selectedCount > 0
    });
  },

  // 切换商品选中状态
  toggleSelect: function(e) {
    const index = e.currentTarget.dataset.index;
    const cart = this.data.cart;
    
    cart[index].selected = !cart[index].selected;
    
    this.setData({
      cart: cart
    });
    
    wx.setStorageSync('cart', cart);
    this.updateCartStatus();
    
    // 调用后端API更新购物车
    this.updateRemoteCart();
  },

  // 全选/取消全选
  toggleSelectAll: function() {
    const selectAll = !this.data.selectAll;
    const cart = this.data.cart;
    
    cart.forEach(item => {
      item.selected = selectAll;
    });
    
    this.setData({
      cart: cart,
      selectAll: selectAll
    });
    
    wx.setStorageSync('cart', cart);
    this.updateCartStatus();
  },

  // 增加商品数量
  increaseQuantity: function(e) {
    const index = e.currentTarget.dataset.index;
    const cart = this.data.cart;
    
    cart[index].quantity += 1;
    
    this.setData({
      cart: cart
    });
    
    wx.setStorageSync('cart', cart);
    this.updateCartStatus();
  },

  // 减少商品数量
  decreaseQuantity: function(e) {
    const index = e.currentTarget.dataset.index;
    const cart = this.data.cart;
    
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
      
      this.setData({
        cart: cart
      });
      
      wx.setStorageSync('cart', cart);
      this.updateCartStatus();
      
      // 调用后端API更新购物车
      this.updateRemoteCart();
    }
  },

  // 删除商品
  deleteItem: function(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要从购物车中删除该商品吗？',
      success: res => {
        if (res.confirm) {
          const cart = this.data.cart;
          cart.splice(index, 1);
          
          this.setData({
            cart: cart
          });
          
          wx.setStorageSync('cart', cart);
          this.updateCartStatus();
          
          // 调用后端API删除购物车项
          const userInfo = wx.getStorageSync('userInfo');
          if (userInfo && wx.getStorageSync('token')) {
            const bookId = cart[index].bookId;
            wx.request({
              url: app.globalData.baseUrl + '/cart/remove',
              method: 'POST',
              data: { bookId },
              header: {
                'Authorization': 'Bearer ' + wx.getStorageSync('token')
              }
            });
          }
        }
      }
    });
  },

  // 前往首页
  goToHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 前往结算
  goToCheckout: function() {
    // 检查登录状态
    if (!app.requireLogin()) {
      return;
    }
    
    const selectedItems = this.data.cart.filter(item => item.selected);
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择要结算的商品',
        icon: 'none'
      });
      return;
    }
    
    // 保存选中的商品到全局，供结算页面使用
    app.globalData.checkoutItems = selectedItems;
    
    // 跳转到订单确认页面
    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },
  
  // 更新远程购物车
  updateRemoteCart: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && wx.getStorageSync('token')) {
      wx.request({
        url: app.globalData.baseUrl + '/cart/update',
        method: 'POST',
        data: { cart: this.data.cart },
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        }
      });
    }
  },
  
  // 前往图书详情
  goToBookDetail: function(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${bookId}`
    });
  }
})