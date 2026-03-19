// pages/orders/orders.js
const app = getApp();
Page({
  data: {
    orders: [],
    loading: false,
    currentStatus: 'all', // all, unpaid, pending, paid, shipped, received
    statusOptions: [
      { key: 'all', label: '全部' },
      { key: 'unpaid', label: '未支付' },
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
      // 从本地存储获取订单数据
      let allOrders = wx.getStorageSync('orders') || [];
      let unpaidOrders = wx.getStorageSync('unpaidOrders') || [];
      
      // 合并所有订单（包括未支付订单）
      let combinedOrders = [...allOrders];
      
      // 添加未支付订单（去重）
      unpaidOrders.forEach(unpaidOrder => {
        const exists = combinedOrders.some(order => order.id === unpaidOrder.id);
        if (!exists) {
          combinedOrders.push(unpaidOrder);
        }
      });
      
      // 如果没有订单数据，使用模拟数据
      if (combinedOrders.length === 0) {
        combinedOrders = this.generateMockOrders();
        wx.setStorageSync('orders', combinedOrders);
      }
      
      // 根据当前状态筛选订单
      let filteredOrders = combinedOrders;
      if (this.data.currentStatus !== 'all') {
        filteredOrders = combinedOrders.filter(order => order.status === this.data.currentStatus);
      }
      
      // 计算每个订单的商品总数（如果没有totalItems属性）
      filteredOrders = filteredOrders.map(order => {
        if (!order.totalItems && order.items && order.items.length) {
          order.totalItems = order.items.reduce((sum, product) => sum + product.quantity, 0);
        }
        // 统一字段名
        if (!order.totalAmount && order.totalPrice) {
          order.totalAmount = order.totalPrice;
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
            image: 'https://picsum.photos/seed/book1/200/280'
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
    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
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
      unpaid: '未支付',
      pending: '待付款',
      paid: '待发货',
      shipped: '待收货',
      received: '待评价',
      cancelled: '已取消',
      completed: '已完成'
    };
    return statusMap[status] || '未知状态';
  },

  // 继续支付未支付订单
  continuePay: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const order = this.data.orders.find(o => o.id === orderId);
    
    if (!order) {
      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      });
      return;
    }
    
    // 将订单信息设置到全局数据，跳转到支付页面
    app.globalData.checkoutItems = order.items;
    app.globalData.currentOrderId = orderId;
    
    wx.navigateTo({
      url: '/pages/checkout/checkout?orderId=' + orderId + '&fromUnpaid=true'
    });
  },

  // 取消未支付订单
  cancelUnpaidOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: res => {
        if (res.confirm) {
          // 从未支付订单中移除
          let unpaidOrders = wx.getStorageSync('unpaidOrders') || [];
          unpaidOrders = unpaidOrders.filter(order => order.id !== orderId);
          wx.setStorageSync('unpaidOrders', unpaidOrders);
          
          // 从所有订单中更新状态
          let allOrders = wx.getStorageSync('allOrders') || [];
          allOrders = allOrders.map(order => {
            if (order.id === orderId) {
              return { ...order, status: 'cancelled' };
            }
            return order;
          });
          wx.setStorageSync('allOrders', allOrders);
          
          wx.showToast({
            title: '订单已取消',
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

});