// pages/checkout/checkout.js
const app = getApp();
Page({
  data: {
    checkoutItems: [],
    totalPrice: 0,
    selectedCoupon: null,
    discountPrice: 0,
    finalPrice: 0,
    selectedAddress: null,
    loading: false,
  },

  onLoad: function () {
    this.loadCheckoutData();
    this.loadDefaultAddress();
  },

  // 加载结算数据
  loadCheckoutData: function () {
    // 从全局获取结算商品
    const checkoutItems = app.globalData.checkoutItems || [];

    // 计算总价
    let totalPrice = 0;
    checkoutItems.forEach((item) => {
      totalPrice += item.price * item.quantity;
    });

    // 计算最终价格
    const finalPrice = this.calculateFinalPrice(totalPrice, this.data.selectedCoupon);

    this.setData({
      checkoutItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
    });
  },

  // 计算最终价格
  calculateFinalPrice: function(totalPrice, coupon) {
    if (!coupon) {
      this.setData({ discountPrice: 0 });
      return totalPrice;
    }

    let discountPrice = 0;
    if (coupon.type === 'discount') {
      // 折扣券
      if (totalPrice >= coupon.minAmount) {
        discountPrice = totalPrice * (1 - coupon.discount / 10);
      }
    } else if (coupon.type === 'cash') {
      // 现金券
      if (totalPrice >= coupon.minAmount) {
        discountPrice = coupon.amount;
      }
    }

    this.setData({ discountPrice: parseFloat(discountPrice.toFixed(2)) });
    return totalPrice - discountPrice;
  },

  // 加载默认地址
  loadDefaultAddress: function () {
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo) return;

    // 尝试从后端获取默认地址
    wx.request({
      url: app.globalData.baseUrl + "/address/default",
      method: "GET",
      header: {
        Authorization: "Bearer " + wx.getStorageSync("token"),
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          this.setData({
            selectedAddress: res.data.data,
          });
        } else {
          // 从本地获取地址
          this.loadLocalAddress();
        }
      },
      fail: () => {
        // 从本地获取地址
        this.loadLocalAddress();
      },
    });
  },

  // 加载本地地址
  loadLocalAddress: function () {
    const addresses = wx.getStorageSync("addresses") || [];
    const defaultAddress =
      addresses.find((addr) => addr.isDefault) || addresses[0];

    if (defaultAddress) {
      this.setData({
        selectedAddress: defaultAddress,
      });
    } else {
      // 使用模拟地址
      const mockAddress = {
        id: "1",
        name: "张三",
        phone: "138****1234",
        province: "北京市",
        city: "北京市",
        district: "海淀区",
        detail: "清华大学计算机系",
        isDefault: true,
      };
      this.setData({
        selectedAddress: mockAddress,
      });
    }
  },

  // 选择地址
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/address/address?selectMode=true",
    });
  },

  // 选择优惠券
  selectCoupon: function () {
    wx.navigateTo({
      url: "/pages/coupons/coupons?selectMode=true",
    });
  },

  // 处理优惠券选择结果
  onCouponSelected: function(coupon) {
    this.setData({ selectedCoupon: coupon });
    // 重新计算价格
    const finalPrice = this.calculateFinalPrice(this.data.totalPrice, coupon);
    this.setData({ finalPrice: parseFloat(finalPrice.toFixed(2)) });
  },

  // 取消选择优惠券
  cancelCoupon: function() {
    this.setData({ selectedCoupon: null });
    // 重新计算价格
    const finalPrice = this.calculateFinalPrice(this.data.totalPrice, null);
    this.setData({ finalPrice: parseFloat(finalPrice.toFixed(2)) });
  },

  // 提交订单
  submitOrder: function () {
    if (!this.data.selectedAddress) {
      wx.showToast({
        title: "请选择收货地址",
        icon: "none",
      });
      return;
    }

    this.setData({ loading: true });

    // 创建完整的订单对象
    const orderId = Date.now().toString();
    const newOrder = {
      id: orderId,
      orderNo: 'ORD' + Date.now().toString().substr(-8),
      items: this.data.checkoutItems.map((item) => ({
        id: item.id || item.bookId,
        bookId: item.bookId,
        title: item.title,
        author: item.author,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '/Default.jpg'
      })),
      totalAmount: this.data.finalPrice,
      totalPrice: this.data.finalPrice,
      totalItems: this.data.checkoutItems.reduce((sum, item) => sum + item.quantity, 0),
      status: 'pending',
      createTime: new Date().toISOString(),
      address: {
        name: this.data.selectedAddress.name,
        phone: this.data.selectedAddress.phone,
        address: (this.data.selectedAddress.province || '') + 
                 (this.data.selectedAddress.city || '') + 
                 (this.data.selectedAddress.district || '') + 
                 (this.data.selectedAddress.detail || '')
      },
      couponId: this.data.selectedCoupon ? this.data.selectedCoupon.id : null,
      coupon: this.data.selectedCoupon
    };

    // 保存订单到本地存储
    let orders = wx.getStorageSync('orders') || [];
    orders.unshift(newOrder);
    wx.setStorageSync('orders', orders);

    // 保存待支付订单到临时存储
    wx.setStorageSync('pendingOrder', newOrder);

    // 更新订单统计数据
    this.updateOrderCounts();

    // 标记优惠券为已使用（提交订单后立即标记，未支付1分钟后返还）
    if (this.data.selectedCoupon) {
      this.markCouponAsUsed(this.data.selectedCoupon.id);
    }
    
    // 立即删除购物车商品（提交订单后就删除）
    this.removeItemsFromCart();

    // 跳转到支付页面
    wx.redirectTo({
      url: `/pages/payment/payment?orderId=${orderId}`,
    });
  },

  // 标记优惠券为已使用
  markCouponAsUsed: function(couponId) {
    let coupons = wx.getStorageSync('userCoupons') || [];
    coupons = coupons.map(coupon => {
      if (coupon.id === couponId) {
        return { ...coupon, used: true, usedDate: new Date().toISOString().split('T')[0] };
      }
      return coupon;
    });
    wx.setStorageSync('userCoupons', coupons);
  },

  // 从购物车移除已购买的商品
  removeItemsFromCart: function () {
    console.log('开始删除购物车商品');
    console.log('当前购物车:', wx.getStorageSync("cart"));
    console.log('结算商品:', this.data.checkoutItems);
    
    let cart = wx.getStorageSync("cart") || [];
    const boughtBookIds = this.data.checkoutItems.map((item) => String(item.bookId));
    
    console.log('待删除的bookId:', boughtBookIds);
    console.log('购物车中的bookId:', cart.map(item => String(item.bookId)));

    // 过滤掉已购买的商品（转换为字符串比较）
    cart = cart.filter((item) => !boughtBookIds.includes(String(item.bookId)));
    
    console.log('过滤后的购物车:', cart);

    wx.setStorageSync("cart", cart);

    // 清空全局结算数据
    app.globalData.checkoutItems = [];
  },

  // 取消订单
  cancelOrder: function () {
    wx.showModal({
      title: "确认取消",
      content: "确定要取消订单吗？",
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      },
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
