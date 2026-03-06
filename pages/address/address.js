// pages/address/address.js
const app = getApp();
Page({
  data: {
    addresses: [],
    loading: true,
    selectedAddressId: '',
    fromCheckout: false // 判断是否从结算页面进入
  },

  onLoad: function(options) {
    // 检查是否从结算页面进入
    if (options && options.from === 'checkout') {
      this.setData({ fromCheckout: true });
      // 获取当前选中的地址ID
      this.setData({
        selectedAddressId: wx.getStorageSync('selectedAddressId') || ''
      });
    }
    this.loadAddresses();
  },

  // 加载地址列表
  loadAddresses: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      this.setData({ loading: false });
      return;
    }

    this.setData({ loading: true });

    // 尝试从本地存储获取地址列表
    let addresses = wx.getStorageSync('addresses') || [];
    
    // 如果没有本地地址，使用模拟数据
    if (addresses.length === 0) {
      addresses = this.getMockAddresses();
      wx.setStorageSync('addresses', addresses);
    }
    
    this.setData({
      addresses: addresses,
      loading: false
    });
  },

  // 模拟地址数据
  getMockAddresses: function() {
    return [
      {
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        detail: '清华大学计算机科学与技术系',
        isDefault: true,
        createTime: '2023-06-15'
      },
      {
        id: '2',
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京SOHO T1楼',
        isDefault: false,
        createTime: '2023-07-20'
      }
    ];
  },

  // 选择地址（从结算页面进入时）
  selectAddress: function(e) {
    if (!this.data.fromCheckout) return;
    
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addresses.find(item => item.id === addressId);
    
    // 保存选中的地址
    wx.setStorageSync('selectedAddressId', addressId);
    
    // 返回上一页
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.updateSelectedAddress) {
      prevPage.updateSelectedAddress(address);
    }
    
    wx.navigateBack();
  },

  // 设置默认地址
  setDefaultAddress: function(e) {
    const addressId = e.currentTarget.dataset.id;
    
    let updatedAddresses = this.data.addresses.map(item => {
      item.isDefault = item.id === addressId;
      return item;
    });
    
    this.setData({ addresses: updatedAddresses });
    wx.setStorageSync('addresses', updatedAddresses);
    
    wx.showToast({ title: '设置成功', icon: 'success' });
  },

  // 编辑地址
  editAddress: function(e) {
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addresses.find(item => item.id === addressId);
    
    // 将地址信息存储到全局，供编辑页面使用
    app.globalData.editAddress = address;
    
    wx.navigateTo({
      url: '/pages/address/editAddress?addressId=' + addressId
    });
  },

  // 删除地址
  deleteAddress: function(e) {
    const addressId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          let updatedAddresses = this.data.addresses.filter(item => item.id !== addressId);
          this.setData({ addresses: updatedAddresses });
          wx.setStorageSync('addresses', updatedAddresses);
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  // 添加新地址
  addNewAddress: function() {
    wx.navigateTo({
      url: '/pages/address/editAddress'
    });
  },


});