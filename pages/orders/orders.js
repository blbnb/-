// pages/orders/orders.js
const app = getApp();
Page({
  data: {
    orders: [],
    loading: false,
    currentStatus: 'all', // all, pending, paid, shipped, received
    statusOptions: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待付款' },
      { key: 'paid', label: '待发货' },
      { key: 'shipped', label: '待收货' },
      { key: 'received', label: '待评价' }
    ],
    emptyState: false
  },

  onLoad: function(options) {
    // 如果有传入状态参数，则使用传入的状态
    if (options && options.status) {
      this.setData({
        currentStatus: options.status
      });
    }
    this.loadOrders();
  },

  onShow: function() {
    // 页面显示时重新加载订单数据
    this.loadOrders();
  },

  // 切换订单状态
  switchStatus: function(e) {
    const status = e.currentTarget.dataset.status;
    if (status !== this.data.currentStatus) {
      this.setData({
        currentStatus: status,
        orders: [],
        loading: true
      });
      this.loadOrders();
    }
  },

  // 加载订单数据
  loadOrders: function() {
    this.setData({ loading: true });
    
    try {
      // 模拟从本地存储获取订单数据
      let allOrders = wx.getStorageSync('orders') || [];
      
      // 如果没有订单数据，使用模拟数据
      if (allOrders.length === 0) {
        allOrders = this.generateMockOrders();
        wx.setStorageSync('orders', allOrders);
      }
      
      // 处理未支付订单的倒计时
      allOrders = allOrders.map(order => {
        if (order.status === 'pending') {
          const createTime = new Date(order.createTime);
          const now = new Date();
          const timeDiff = now - createTime;
          const countdown = 60000 - timeDiff; // 1分钟倒计时
          
          if (countdown <= 0) {
            // 倒计时结束，订单失效
            order.status = 'cancelled';
            order.cancelReason = '超时未支付';
          } else {
            order.countdown = Math.ceil(countdown / 1000);
          }
        }
        return order;
      });
      
      // 保存更新后的订单数据
      wx.setStorageSync('orders', allOrders);
      
      // 更新订单统计数据
      this.updateOrderCounts();
      
      // 根据当前状态筛选订单
      let filteredOrders = allOrders;
      if (this.data.currentStatus !== 'all') {
        filteredOrders = allOrders.filter(order => order.status === this.data.currentStatus);
      }
      
      // 计算每个订单的商品总数（如果没有totalItems属性）
      filteredOrders = filteredOrders.map(order => {
        if (!order.totalItems && order.items && order.items.length) {
          order.totalItems = order.items.reduce((sum, product) => sum + product.quantity, 0);
        }
        return order;
      });
      
      // 按创建时间倒序排列
      filteredOrders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      
      this.setData({
        orders: filteredOrders,
        emptyState: filteredOrders.length === 0,
        loading: false
      });
      
      // 启动倒计时
      this.startCountdown();
    } catch (e) {
      console.error('加载订单失败:', e);
      this.setData({
        loading: false,
        emptyState: true
      });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  // 启动倒计时
  startCountdown: function() {
    // 清除之前的定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    // 启动新的定时器
    this.countdownTimer = setInterval(() => {
      let needsUpdateCount = false;
      const orders = this.data.orders.map(order => {
        if (order.status === 'pending' && order.countdown > 0) {
          order.countdown--;
          
          // 倒计时结束
          if (order.countdown <= 0) {
            order.status = 'cancelled';
            order.cancelReason = '超时未支付';
            needsUpdateCount = true;
            // 保存更新后的订单数据
            const allOrders = wx.getStorageSync('orders') || [];
            const updatedOrders = allOrders.map(o => o.id === order.id ? order : o);
            wx.setStorageSync('orders', updatedOrders);
          }
        }
        return order;
      });
      
      // 如果有订单被取消，更新统计
      if (needsUpdateCount) {
        this.updateOrderCounts();
      }
      
      this.setData({ orders });
    }, 1000);
  },

  // 页面卸载时清除定时器
  onUnload: function() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  // 生成模拟订单数据
  generateMockOrders: function() {
    const mockOrders = [
      {
        id: '1',
        orderNo: 'ORD' + Date.now().toString().substr(-8),
        items: [
          {
            id: '1',
            title: 'JavaScript高级程序设计',
            price: 109,
            quantity: 1,
            image: '/Default.jpg'
          }
        ],
        totalAmount: 109,
        totalItems: 1,
        status: 'pending',
        createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        address: {
          name: '张三',
          phone: '138****1234',
          address: '北京市海淀区中关村大街1号'
        }
      },
      {
        id: '2',
        orderNo: 'ORD' + (Date.now() - 1000).toString().substr(-8),
        items: [
          {
            id: '2',
            title: 'Python编程：从入门到实践',
            price: 79,
            quantity: 2,
            image: 'https://picsum.photos/seed/book2/200/280'
          }
        ],
        totalAmount: 158,
        totalItems: 2,
        status: 'paid',
        createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        address: {
          name: '张三',
          phone: '138****1234',
          address: '北京市海淀区中关村大街1号'
        }
      },
      {
        id: '3',
        orderNo: 'ORD' + (Date.now() - 2000).toString().substr(-8),
        items: [
          {
            id: '3',
            title: '算法导论',
            price: 128,
            quantity: 1,
            image: 'https://picsum.photos/seed/book3/200/280'
          }
        ],
        totalAmount: 128,
        totalItems: 1,
        status: 'shipped',
        createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        address: {
          name: '张三',
          phone: '138****1234',
          address: '北京市海淀区中关村大街1号'
        }
      },
      {
        id: '4',
        orderNo: 'ORD' + (Date.now() - 3000).toString().substr(-8),
        items: [
          {
            id: '4',
            title: '设计模式',
            price: 89,
            quantity: 1,
            image: 'https://picsum.photos/seed/book4/200/280'
          },
          {
            id: '5',
            title: '计算机网络',
            price: 98,
            quantity: 1,
            image: 'https://picsum.photos/seed/book5/200/280'
          }
        ],
        totalAmount: 187,
        totalItems: 2,
        status: 'received',
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        address: {
          name: '张三',
          phone: '138****1234',
          address: '北京市海淀区中关村大街1号'
        }
      }
    ];
    return mockOrders;
  },

  // 查看订单详情
  viewOrderDetail: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?id=${orderId}`
    });
  },

  // 取消订单
  cancelOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: res => {
        if (res.confirm) {
          let orders = wx.getStorageSync('orders') || [];
          orders = orders.map(order => {
            if (order.id === orderId) {
              return { ...order, status: 'cancelled' };
            }
            return order;
          });
          wx.setStorageSync('orders', orders);
          wx.showToast({
            title: '订单已取消',
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  // 支付订单
  payOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    // 跳转到支付页面
    wx.redirectTo({
      url: `/pages/payment/payment?orderId=${orderId}`
    });
  },

  // 确认收货
  confirmReceipt: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认收货',
      content: '请确认您已收到商品',
      success: res => {
        if (res.confirm) {
          let orders = wx.getStorageSync('orders') || [];
          orders = orders.map(order => {
            if (order.id === orderId) {
              return { ...order, status: 'completed' };
            }
            return order;
          });
          wx.setStorageSync('orders', orders);
          wx.showToast({
            title: '收货成功',
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  // 评价订单
  reviewOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    });
  },

  // 获取订单状态文本
  getStatusText: function(status) {
    const statusMap = {
      pending: '待付款',
      paid: '待发货',
      shipped: '待收货',
      received: '待评价',
      cancelled: '已取消',
      completed: '已完成'
    };
    return statusMap[status] || '未知状态';
  },

  // 去购物
  goBack: function() {
    wx.switchTab({
      url: '/pages/index/index'
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

});