// pages/payment/payment.js
const app = getApp();
Page({
  data: {
    orderInfo: {
      orderNo: '',
      address: '',
      phone: '',
      items: [],
      totalPrice: 0
    },
    orderId: '',
    // 支付方式
    selectedMethod: 'balance',
    balance: '2,580.50',
    loading: false,
    // 密码弹窗
    showPasswordModal: false,
    paymentPassword: '',
    passwordLength: 0,
    // 成功弹窗
    showSuccessModal: false,
    // 错误提示
    showErrorToast: false
  },

  onLoad: function(options) {
    // 从参数中获取订单信息
    if (options.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadOrderInfo(options.orderId);
    } else if (options.orderNo) {
      this.loadOrderInfoByNo(options.orderNo);
    } else {
      // 从本地存储或全局数据中获取订单信息
      this.loadOrderFromStorage();
    }
  },

  // 从本地存储加载订单信息
  loadOrderFromStorage: function() {
    const pendingOrder = wx.getStorageSync('pendingOrder');
    if (pendingOrder) {
      this.setData({
        orderInfo: {
          orderNo: pendingOrder.orderNo || 'ORD' + Date.now(),
          address: pendingOrder.address || '清华大学计算机系',
          phone: pendingOrder.phone || '13800138000',
          items: pendingOrder.items || [],
          totalPrice: pendingOrder.totalPrice || 0
        },
        orderId: pendingOrder.id || Date.now().toString()
      });
    } else {
      // 使用默认数据
      this.setData({
        orderInfo: {
          orderNo: 'ORD' + Date.now(),
          address: '清华大学计算机系',
          phone: '13800138000',
          items: [{
            id: 1,
            title: 'JavaScript高级程序设计',
            author: 'Matt Frisbie',
            price: 59.00,
            quantity: 1,
            image: 'https://picsum.photos/seed/book1/400/560'
          }],
          totalPrice: 59.00
        },
        orderId: Date.now().toString()
      });
    }
  },

  // 加载订单信息
  loadOrderInfo: function(orderId) {
    wx.showLoading({ title: '加载中...' });
    
    // 从本地存储获取订单
    const orders = wx.getStorageSync('orders') || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      const orderInfo = {
        orderNo: order.orderNo || order.id,
        address: order.address || '清华大学计算机系',
        phone: order.phone || '13800138000',
        items: order.items || [],
        totalPrice: order.totalPrice || order.price || 0
      };
      this.setData({ orderInfo });
    } else {
      this.loadOrderFromStorage();
    }
    
    wx.hideLoading();
  },

  // 根据订单号加载订单信息
  loadOrderInfoByNo: function(orderNo) {
    const orders = wx.getStorageSync('orders') || [];
    const order = orders.find(o => o.orderNo === orderNo);
    
    if (order) {
      this.setData({
        orderInfo: {
          orderNo: order.orderNo,
          address: order.address || '清华大学计算机系',
          phone: order.phone || '13800138000',
          items: order.items || [],
          totalPrice: order.totalPrice || order.price || 0
        },
        orderId: order.id
      });
    }
  },

  // 选择支付方式
  selectMethod: function(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ selectedMethod: method });
  },

  // 确认支付
  confirmPayment: function() {
    if (!this.data.orderId) {
      wx.showToast({ title: '订单信息错误', icon: 'none' });
      return;
    }
    
    // 显示密码输入弹窗
    this.setData({ 
      showPasswordModal: true, 
      paymentPassword: '',
      passwordLength: 0
    });
  },

  // 密码输入处理
  onPasswordInput: function(e) {
    const value = e.detail.value;
    this.setData({
      paymentPassword: value,
      passwordLength: value.length
    });
    
    // 自动提交当输入6位密码
    if (value.length === 6) {
      setTimeout(() => {
        this.submitPassword();
      }, 200);
    }
  },

  // 数字键盘输入
  inputNumber: function(e) {
    const num = e.currentTarget.dataset.num;
    let password = this.data.paymentPassword;
    
    if (password.length < 6) {
      password += num;
      this.setData({
        paymentPassword: password,
        passwordLength: password.length
      });
      
      // 自动提交当输入6位密码
      if (password.length === 6) {
        setTimeout(() => {
          this.submitPassword();
        }, 200);
      }
    }
  },

  // 删除数字
  deleteNumber: function() {
    let password = this.data.paymentPassword;
    if (password.length > 0) {
      password = password.slice(0, -1);
      this.setData({
        paymentPassword: password,
        passwordLength: password.length
      });
    }
  },

  // 提交支付密码
  submitPassword: function() {
    const password = this.data.paymentPassword;
    
    if (password.length !== 6) {
      return;
    }
    
    if (password !== '123456') {
      // 显示密码错误提示
      this.setData({ showErrorToast: true });
      setTimeout(() => {
        this.setData({ 
          showErrorToast: false,
          paymentPassword: '',
          passwordLength: 0
        });
      }, 1500);
      return;
    }
    
    // 密码正确，执行支付
    this.setData({ showPasswordModal: false, loading: true });
    
    // 模拟支付过程
    setTimeout(() => {
      this.processPayment();
    }, 1000);
  },

  // 处理支付
  processPayment: function() {
    const orderId = this.data.orderId;
    
    // 从本地存储获取订单
    let orders = wx.getStorageSync('orders') || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      // 更新订单状态为已支付
      orders[orderIndex].status = 'paid';
      orders[orderIndex].paymentTime = new Date().toISOString();
      orders[orderIndex].paymentMethod = this.data.selectedMethod;
      wx.setStorageSync('orders', orders);
    }
    
    // 清除待支付订单
    wx.removeStorageSync('pendingOrder');
    
    // 更新订单统计数据
    this.updateOrderCounts();
    
    this.setData({ 
      loading: false,
      showSuccessModal: true 
    });
  },
  
  // 更新订单统计数据
  updateOrderCounts: function() {
    let orders = wx.getStorageSync('orders') || [];
    
    // 统计各状态的订单数量
    const orderCounts = {
      pending: 0,
      paid: 0,
      shipped: 0,
      received: 0
    };
    
    orders.forEach(order => {
      if (orderCounts.hasOwnProperty(order.status)) {
        orderCounts[order.status]++;
      }
    });
    
    // 保存到本地存储
    wx.setStorageSync('orderCounts', orderCounts);
  },

  // 取消支付
  cancelPayment: function() {
    this.setData({ 
      showPasswordModal: false,
      paymentPassword: '',
      passwordLength: 0
    });
  },

  // 查看订单
  goToOrders: function() {
    wx.redirectTo({
      url: '/pages/orders/orders'
    });
  },

  // 返回上一页
  goBack: function() {
    // 保留订单为待付款状态（不删除订单）
    wx.navigateBack();
  }
});
