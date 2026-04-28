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
    this.loadCartData();
  },

  // 加载购物车数据（使用本地存储）
  loadCartData: function() {
    this.setData({ loading: true });
    this.loadLocalCartData();
    this.setData({ loading: false });
    this.updateCartStatus();
  },
  
  // 加载本地购物车数据
  loadLocalCartData: function() {
    let cart = wx.getStorageSync('cart') || [];
    
    // 清理旧格式的购物车数据
    cart = cart.map(item => {
      // 如果是旧格式（有 book 对象），转换为新格式
      if (item.book && !item.title) {
        return {
          id: item.id,
          bookId: item.bookId,
          title: item.book.title,
          author: item.book.author,
          price: item.book.price,
          image: item.book.image || '',
          quantity: item.quantity,
          selected: item.selected || false
        };
      }
      // 确保新格式数据有 selected 属性
      return {
        selected: false,
        ...item
      };
    });
    
    // 不自动加载模拟数据，让购物车保持为空
    // 如果没有本地购物车数据，就为空
    // if (cart.length === 0) {
    //   cart = [...]
    // }
    
    // 保存清理后的购物车数据
    try {
      wx.setStorageSync('cart', cart);
    } catch (e) {
      console.error('保存购物车失败:', e);
      // 如果保存失败，清空购物车
      cart = [];
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
    
    // 调用后端API更新购物车（已禁用）
    // this.updateRemoteCart();
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
      
      // 调用后端API更新购物车（已禁用）
      // this.updateRemoteCart();
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
          
          // 调用后端API删除购物车项（已禁用）
          // const userInfo = wx.getStorageSync('userInfo');
          // if (userInfo && wx.getStorageSync('token')) {
          //   const bookId = cart[index].bookId;
          //   wx.request({
          //     url: app.globalData.baseUrl + '/cart/remove',
          //     method: 'POST',
          //     data: { bookId },
          //     header: {
          //       'Authorization': 'Bearer ' + wx.getStorageSync('token')
          //     }
          //   });
          // }
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
  
  // 更新远程购物车（已禁用）
  updateRemoteCart: function() {
    // const userInfo = wx.getStorageSync('userInfo');
    // if (userInfo && wx.getStorageSync('token')) {
    //   wx.request({
    //     url: app.globalData.baseUrl + '/cart/update',
    //     method: 'POST',
    //     data: { cart: this.data.cart },
    //     header: {
    //       'Authorization': 'Bearer ' + wx.getStorageSync('token')
    //     }
    //   });
    // }
  },
  
  // 前往图书详情
  goToBookDetail: function(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${bookId}`
    });
  }
})