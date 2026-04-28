// pages/coupons/coupons.js
Page({
  data: {
    activeTab: 'available', // available, used, expired
    coupons: [],
    loading: true,
    selectMode: false
  },

  onLoad: function(options) {
    this.setData({ selectMode: options.selectMode === 'true' });
    this.loadCoupons();
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ 
      activeTab: tab,
      loading: true 
    });
    this.loadCoupons();
  },

  // 加载优惠券
  loadCoupons: function() {
    this.setData({ loading: true });
    
    // 尝试从本地存储加载优惠券数据
    let mockCoupons = wx.getStorageSync('userCoupons');
    
    // 如果没有数据，使用模拟数据
    if (!mockCoupons || !Array.isArray(mockCoupons)) {
      mockCoupons = this.getMockCoupons();
      // 保存到本地存储
      wx.setStorageSync('userCoupons', mockCoupons);
    }
    
    // 根据当前标签筛选优惠券
    let filteredCoupons = [];
    const now = new Date();
    
    switch(this.data.activeTab) {
      case 'available':
        filteredCoupons = mockCoupons.filter(coupon => {
          const expireDate = new Date(coupon.expireDate);
          return !coupon.used && expireDate > now;
        });
        break;
      case 'used':
        filteredCoupons = mockCoupons.filter(coupon => coupon.used);
        break;
      case 'expired':
        filteredCoupons = mockCoupons.filter(coupon => {
          const expireDate = new Date(coupon.expireDate);
          return !coupon.used && expireDate <= now;
        });
        break;
    }
    
    // 延迟显示，模拟网络请求
    setTimeout(() => {
      this.setData({
        coupons: filteredCoupons,
        loading: false
      });
    }, 500);
  },

  // 生成模拟优惠券数据
  getMockCoupons: function() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // 计算未来和过去的日期
    const futureDate = new Date(now.setDate(now.getDate() + 15));
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    now.setDate(now.getDate() - 20);
    const pastDateStr = now.toISOString().split('T')[0];
    
    return [
      {
        id: '1',
        type: 'discount',
        discount: 8.5,
        minAmount: 99,
        name: '全场通用85折',
        description: '全场图书满99元可用',
        expireDate: futureDateStr,
        used: false,
        usedDate: null
      },
      {
        id: '2',
        type: 'cash',
        amount: 20,
        minAmount: 100,
        name: '满100减20',
        description: '指定教材类图书可用',
        expireDate: futureDateStr,
        used: false,
        usedDate: null
      },
      {
        id: '3',
        type: 'discount',
        discount: 7,
        minAmount: 199,
        name: '限时特惠7折',
        description: '精选图书满199元可用',
        expireDate: pastDateStr,
        used: false,
        usedDate: null
      },
      {
        id: '4',
        type: 'cash',
        amount: 50,
        minAmount: 200,
        name: '新人专享50元券',
        description: '全场通用满200元可用',
        expireDate: today,
        used: true,
        usedDate: today
      },
      {
        id: '5',
        type: 'discount',
        discount: 9,
        minAmount: 0,
        name: '无门槛9折券',
        description: '全场通用无门槛',
        expireDate: futureDateStr,
        used: false,
        usedDate: null
      }
    ];
  },

  // 查看优惠券使用说明或选择优惠券
  viewCouponDetail: function(e) {
    const couponId = e.currentTarget.dataset.id;
    const coupon = this.data.coupons.find(c => c.id === couponId);
    
    if (this.data.selectMode) {
      // 选择优惠券并返回
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.onCouponSelected) {
        prevPage.onCouponSelected(coupon);
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    } else {
      // 显示优惠券说明
      wx.showModal({
        title: '优惠券说明',
        content: '1. 每个订单仅可使用一张优惠券\n2. 优惠券不可兑换现金\n3. 最终解释权归图书馆商城所有',
        showCancel: false
      });
    }
  }
});