// pages/checkout/checkout.js
const app = getApp();
Page({
  data: {
    checkoutItems: [],
    totalPrice: 0,
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

    this.setData({
      checkoutItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
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

    const orderData = {
      items: this.data.checkoutItems.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      })),
      addressId: this.data.selectedAddress.id,
      totalPrice: this.data.totalPrice,
    };

    // 调用后端创建订单接口
    wx.request({
      url: app.globalData.baseUrl + "/order/create",
      method: "POST",
      data: orderData,
      header: {
        Authorization: "Bearer " + wx.getStorageSync("token"),
        "Content-Type": "application/json",
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          // 订单创建成功，清空购物车中已购买的商品
          this.removeItemsFromCart();

          // 跳转到支付页面
          wx.redirectTo({
            url: `/pages/payment/payment?orderId=${res.data.data.id}`,
          });
        } else {
          wx.showToast({
            title: res.data.message || "订单创建失败",
            icon: "none",
          });
        }
      },
      fail: () => {
        // 模拟创建订单成功
        this.removeItemsFromCart();

        // 模拟订单ID
        const mockOrderId = "1";

        // 跳转到支付页面
        wx.redirectTo({
          url: `/pages/payment/payment?orderId=${mockOrderId}`,
        });
      },
      complete: () => {
        this.setData({ loading: false });
      },
    });
  },

  // 从购物车移除已购买的商品
  removeItemsFromCart: function () {
    let cart = wx.getStorageSync("cart") || [];
    const boughtBookIds = this.data.checkoutItems.map((item) => item.bookId);

    // 过滤掉已购买的商品
    cart = cart.filter((item) => !boughtBookIds.includes(item.bookId));

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
});
