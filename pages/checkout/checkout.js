// pages/checkout/checkout.js
const app = getApp();
Page({
  data: {
    checkoutItems: [],
    totalPrice: 0,
    finalPrice: 0,
    selectedAddress: null,
    loading: false,
    selectedPayment: 'wechat', // 默认支付方式为微信支付
    showPasswordModal: false, // 是否显示密码弹窗
    password: '', // 支付密码
    passwordError: '', // 密码错误提示
    currentOrderId: '', // 当前订单ID
    showCouponModal: false, // 是否显示优惠券弹窗
    availableCoupons: [], // 可用优惠券列表
    selectedCoupon: null // 选中的优惠券
  },

  onLoad: function(options) {
    // 如果从未支付订单页面跳转过来
    if (options && options.fromUnpaid && options.orderId) {
      this.loadUnpaidOrderData(options.orderId);
    } else if (options && options.fromPending && options.orderId) {
      // 从待付款订单跳转过来
      this.loadPendingOrderData(options.orderId);
    } else {
      this.loadCheckoutData();
    }
    this.loadDefaultAddress();
  },

  // 加载待付款订单数据
  loadPendingOrderData: function(orderId) {
    let orders = wx.getStorageSync('orders') || [];
    let allOrders = wx.getStorageSync('allOrders') || [];
    let order = orders.find(o => o.id === orderId);
    
    if (!order) {
      order = allOrders.find(o => o.id === orderId);
    }
    
    if (order) {
      // 计算总价
      let totalPrice = 0;
      order.items.forEach(item => {
        totalPrice += item.price * item.quantity;
      });
      
      this.setData({
        checkoutItems: order.items,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        finalPrice: parseFloat(totalPrice.toFixed(2)),
        selectedAddress: order.address,
        selectedPayment: order.paymentMethod || 'wechat',
        currentOrderId: orderId
      });
      
      // 设置到全局数据
      app.globalData.checkoutItems = order.items;
      
      // 加载可用优惠券
      this.loadAvailableCoupons();
    } else {
      // 如果找不到订单，使用默认加载
      this.loadCheckoutData();
    }
  },

  // 加载未支付订单数据
  loadUnpaidOrderData: function(orderId) {
    const unpaidOrders = wx.getStorageSync('unpaidOrders') || [];
    const order = unpaidOrders.find(o => o.id === orderId);
    
    if (order) {
      // 计算总价
      let totalPrice = 0;
      order.items.forEach(item => {
        totalPrice += item.price * item.quantity;
      });
      
      this.setData({
        checkoutItems: order.items,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        selectedAddress: order.address,
        selectedPayment: order.paymentMethod || 'wechat',
        currentOrderId: orderId
      });
      
      // 设置到全局数据
      app.globalData.checkoutItems = order.items;
    } else {
      // 如果找不到订单，使用默认加载
      this.loadCheckoutData();
    }
  },

  // 加载结算数据
  loadCheckoutData: function() {
    // 从全局获取结算商品
    const checkoutItems = app.globalData.checkoutItems || [];
    
    // 计算总价
    let totalPrice = 0;
    checkoutItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });
    
    this.setData({
      checkoutItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      finalPrice: parseFloat(totalPrice.toFixed(2))
    });
    
    // 加载可用优惠券
    this.loadAvailableCoupons();
  },

  // 加载可用优惠券
  loadAvailableCoupons: function() {
    const userCoupons = wx.getStorageSync('userCoupons') || [];
    const totalPrice = this.data.totalPrice;
    const now = new Date();
    
    // 筛选出可用的优惠券
    const availableCoupons = userCoupons.filter(coupon => {
      const expireDate = new Date(coupon.expireDate);
      return !coupon.used && expireDate > now && totalPrice >= coupon.minAmount;
    });
    
    this.setData({
      availableCoupons: availableCoupons
    });
  },

  // 计算最终价格
  calculateFinalPrice: function() {
    let finalPrice = this.data.totalPrice;
    
    if (this.data.selectedCoupon) {
      if (this.data.selectedCoupon.type === 'cash') {
        finalPrice -= this.data.selectedCoupon.amount;
      } else if (this.data.selectedCoupon.type === 'discount') {
        finalPrice = finalPrice * (this.data.selectedCoupon.discount / 10);
      }
    }
    
    // 确保价格不低于0
    finalPrice = Math.max(0, finalPrice);
    
    this.setData({
      finalPrice: parseFloat(finalPrice.toFixed(2))
    });
  },

  // 选择优惠券
  selectCoupon: function() {
    if (this.data.availableCoupons.length === 0) {
      wx.showToast({
        title: '暂无可用优惠券',
        icon: 'none'
      });
      return;
    }
    this.setData({
      showCouponModal: true
    });
  },

  // 关闭优惠券弹窗
  closeCouponModal: function() {
    this.setData({
      showCouponModal: false
    });
  },

  // 选择优惠券
  chooseCoupon: function(e) {
    const coupon = e.currentTarget.dataset.coupon;
    if (this.data.selectedCoupon && this.data.selectedCoupon.id === coupon.id) {
      // 取消选择
      this.setData({
        selectedCoupon: null
      });
    } else {
      this.setData({
        selectedCoupon: coupon
      });
    }
  },

  // 确认优惠券选择
  confirmCoupon: function() {
    this.calculateFinalPrice();
    this.closeCouponModal();
  },

  // 加载默认地址
  loadDefaultAddress: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) return;
    
    // 尝试从后端获取默认地址
    wx.request({
      url: app.globalData.baseUrl + '/address/default',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          this.setData({
            selectedAddress: res.data.data
          });
        } else {
          // 从本地获取地址
          this.loadLocalAddress();
        }
      },
      fail: () => {
        // 从本地获取地址
        this.loadLocalAddress();
      }
    });
  },

  // 加载本地地址
  loadLocalAddress: function() {
    const addresses = wx.getStorageSync('addresses') || [];
    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    
    if (defaultAddress) {
      this.setData({
        selectedAddress: defaultAddress
      });
    } else {
      // 使用模拟地址
      const mockAddress = {
        id: '1',
        name: '张三',
        phone: '138****1234',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        detail: '清华大学计算机系',
        isDefault: true
      };
      this.setData({
        selectedAddress: mockAddress
      });
    }
  },

  // 选择地址
  selectAddress: function() {
    wx.navigateTo({
      url: '/pages/address/address?selectMode=true'
    });
  },

  // 提交订单
  submitOrder: function() {
    if (!this.data.selectedAddress) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    const orderData = {
      items: this.data.checkoutItems.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity
      })),
      addressId: this.data.selectedAddress.id,
      totalPrice: this.data.totalPrice,
      paymentMethod: this.data.selectedPayment
    };
    
    // 调用后端创建订单接口
    wx.request({
      url: app.globalData.baseUrl + '/order/create',
      method: 'POST',
      data: orderData,
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.success) {
          // 订单创建成功，执行支付
          this.payOrder(res.data.data.orderId);
        } else {
          wx.showToast({
            title: res.data.message || '订单创建失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: () => {
        // 模拟创建订单成功
        this.payOrder(Date.now().toString());
      }
    });
  },

  // 执行支付
  payOrder: function(orderId) {
    // 如果是微信支付，显示密码输入弹窗
    if (this.data.selectedPayment === 'wechat') {
      this.setData({
        showPasswordModal: true,
        currentOrderId: orderId,
        password: '',
        passwordError: ''
      });
    } else {
      // 其他支付方式直接模拟支付
      this.simulatePayment(orderId);
    }
  },

  // 模拟支付过程
  simulatePayment: function(orderId) {
    // 显示支付中提示
    wx.showLoading({ title: '支付中...' });
    
    // 模拟支付过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 更新未支付订单状态为已支付
      this.updateUnpaidOrderStatus(orderId);
      
      // 支付成功，清空购物车中已购买的商品
      this.removeItemsFromCart();
      
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 跳转到订单列表
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/orders/orders'
            });
          }, 2000);
        }
      });
      
      this.setData({ loading: false });
    }, 2000); // 模拟2秒的支付过程
  },

  // 更新未支付订单状态为已支付
  updateUnpaidOrderStatus: function(orderId) {
    // 从未支付订单列表中移除
    let unpaidOrders = wx.getStorageSync('unpaidOrders') || [];
    unpaidOrders = unpaidOrders.filter(order => order.id !== orderId);
    wx.setStorageSync('unpaidOrders', unpaidOrders);
    
    // 更新所有订单列表中的状态
    let allOrders = wx.getStorageSync('allOrders') || [];
    allOrders = allOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'pending' }; // 更新为待发货状态
      }
      return order;
    });
    wx.setStorageSync('allOrders', allOrders);
    
    // 同时更新orders列表
    let orders = wx.getStorageSync('orders') || [];
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) {
      // 如果订单不存在于orders列表，添加它
      const order = allOrders.find(o => o.id === orderId);
      if (order) {
        orders.unshift({ ...order, status: 'pending' });
        wx.setStorageSync('orders', orders);
      }
    }
  },

  // 关闭密码弹窗
  closePasswordModal: function() {
    const orderId = this.data.currentOrderId;
    
    this.setData({
      showPasswordModal: false,
      password: '',
      passwordError: '',
      loading: false
    });
    
    // 创建未支付订单
    this.createUnpaidOrder(orderId);
    
    // 显示提示并跳转到未支付订单页面
    wx.showModal({
      title: '订单未支付',
      content: '您有一笔订单尚未支付，是否前往查看？',
      confirmText: '去查看',
      cancelText: '暂不',
      success: (res) => {
        if (res.confirm) {
          // 跳转到未支付订单页面
          wx.navigateTo({
            url: '/pages/orders/orders?status=unpaid'
          });
        } else {
          // 返回首页
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    });
  },

  // 创建未支付订单
  createUnpaidOrder: function(orderId) {
    const unpaidOrder = {
      id: orderId,
      items: this.data.checkoutItems,
      totalPrice: this.data.totalPrice,
      address: this.data.selectedAddress,
      paymentMethod: this.data.selectedPayment,
      status: 'unpaid',
      createTime: new Date().toISOString(),
      expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分钟后过期
    };
    
    // 保存到本地存储
    let unpaidOrders = wx.getStorageSync('unpaidOrders') || [];
    unpaidOrders.unshift(unpaidOrder);
    wx.setStorageSync('unpaidOrders', unpaidOrders);
    
    // 同时保存到所有订单列表
    let allOrders = wx.getStorageSync('allOrders') || [];
    allOrders.unshift(unpaidOrder);
    wx.setStorageSync('allOrders', allOrders);
  },

  // 密码输入处理
  onPasswordInput: function(e) {
    const password = e.detail.value;
    this.setData({
      password: password,
      passwordError: ''
    });
    
    // 当输入6位密码时自动验证
    if (password.length === 6) {
      this.verifyPassword(password);
    }
  },

  // 验证密码
  verifyPassword: function(password) {
    // 正确的支付密码是123456
    const correctPassword = '123456';
    
    if (password === correctPassword) {
      // 密码正确，关闭弹窗并执行支付
      this.setData({
        showPasswordModal: false,
        password: ''
      });
      
      // 执行支付
      this.simulatePayment(this.data.currentOrderId);
    } else {
      // 密码错误，显示错误提示
      this.setData({
        passwordError: '密码错误，请重新输入',
        password: ''
      });
      
      // 震动提示
      wx.vibrateShort({ type: 'medium' });
    }
  },

  // 忘记密码
  onForgetPassword: function() {
    wx.showToast({
      title: '请联系客服重置密码',
      icon: 'none'
    });
  },

  // 从购物车移除已购买的商品
  removeItemsFromCart: function() {
    let cart = wx.getStorageSync('cart') || [];
    const boughtBookIds = this.data.checkoutItems.map(item => item.bookId);
    
    // 过滤掉已购买的商品
    cart = cart.filter(item => !boughtBookIds.includes(item.bookId));
    
    wx.setStorageSync('cart', cart);
    
    // 清空全局结算数据
    app.globalData.checkoutItems = [];
  },

  // 取消订单
  cancelOrder: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  // 选择支付方式
  selectPayment: function(e) {
    const payment = e.currentTarget.dataset.payment;
    this.setData({
      selectedPayment: payment
    });
  }
});