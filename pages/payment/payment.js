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
    paymentQRCode: '',
    showSuccessModal: false,
    orderId: ''
  },

  onLoad: function(options) {
    // 从参数中获取订单信息
    if (options.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadOrderInfo(options.orderId);
    } else if (options.orderNo) {
      this.loadOrderInfoByNo(options.orderNo);
    } else {
      // 从全局数据中获取订单信息
      const orderInfo = app.globalData.orderInfo || {};
      if (orderInfo) {
        this.setData({ orderInfo });
        this.generatePaymentQRCode();
      } else {
        wx.showToast({
          title: '订单信息错误',
          icon: 'none',
          success: () => {
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        });
      }
    }
  },

  // 加载订单信息
  loadOrderInfo: function(orderId) {
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: app.globalData.baseUrl + '/order/detail/' + orderId,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          const order = res.data.data;
          const orderInfo = {
            orderNo: order.orderNo,
            address: order.shippingAddress,
            phone: order.contactPhone,
            items: [{
              id: order.bookId,
              title: order.Book?.title || '图书',
              author: order.Book?.author || '',
              price: order.price,
              quantity: 1,
              image: order.Book?.image || 'https://picsum.photos/seed/book/200/300'
            }],
            totalPrice: order.price
          };
          this.setData({ orderInfo });
          this.generatePaymentQRCode();
        } else {
          wx.showToast({ title: '获取订单信息失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 根据订单号加载订单信息
  loadOrderInfoByNo: function(orderNo) {
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: app.globalData.baseUrl + '/order/detail-by-no',
      method: 'GET',
      data: { orderNo },
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          const order = res.data.data;
          const orderInfo = {
            orderNo: order.orderNo,
            address: order.shippingAddress,
            phone: order.contactPhone,
            items: [{
              id: order.bookId,
              title: order.Book?.title || '图书',
              author: order.Book?.author || '',
              price: order.price,
              quantity: 1,
              image: order.Book?.image || 'https://picsum.photos/seed/book/200/300'
            }],
            totalPrice: order.price
          };
          this.setData({ orderInfo, orderId: order.id });
          this.generatePaymentQRCode();
        } else {
          wx.showToast({ title: '获取订单信息失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 生成支付二维码
  generatePaymentQRCode: function() {
    const totalPrice = this.data.orderInfo.totalPrice;
    const orderNo = this.data.orderInfo.orderNo;
    
    // 生成包含支付信息的二维码
    // 实际项目中，这里应该调用后端API生成真实的支付二维码
    // 这里使用模拟数据
    const qrCodeData = `wechat://pay?orderNo=${orderNo}&amount=${totalPrice * 100}&merchantId=123456`;
    
    // 使用wx.createQRCode生成二维码
    // 注意：wx.createQRCode是小程序的API，需要在真机上测试
    // 这里使用模拟图片
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;
    
    this.setData({ paymentQRCode: qrCodeUrl });
  },

  // 确认支付
  confirmPayment: function() {
    if (!this.data.orderId) {
      wx.showToast({ title: '订单信息错误', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '处理中...' });
    
    // 模拟支付过程
    setTimeout(() => {
      // 调用后端API更新订单状态为已支付
      wx.request({
        url: app.globalData.baseUrl + '/order/update-status/' + this.data.orderId,
        method: 'PUT',
        data: {
          status: 'paid',
          paymentTime: new Date().toISOString()
        },
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token'),
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.data.success) {
            this.setData({ showSuccessModal: true });
          } else {
            wx.showToast({ title: '支付失败，请重试', icon: 'none' });
          }
        },
        fail: () => {
          // 模拟支付成功
          this.setData({ showSuccessModal: true });
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    }, 1500);
  },

  // 查看订单
  goToOrders: function() {
    wx.redirectTo({
      url: '/pages/orders/orders'
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});