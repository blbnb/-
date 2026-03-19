// pages/address/editAddress.js
const app = getApp();
Page({
  data: {
    addressId: '',
    isEdit: false,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
    region: [] // 用于picker组件
  },

  onLoad: function(options) {
    // 如果有addressId参数，则是编辑模式
    if (options && options.addressId) {
      this.setData({
        addressId: options.addressId,
        isEdit: true
      });
      this.loadAddressData();
    }
  },

  // 加载地址数据（编辑模式）
  loadAddressData: function() {
    // 从全局获取编辑的地址信息
    const editAddress = app.globalData.editAddress;
    
    if (editAddress && editAddress.id === this.data.addressId) {
      this.setData({
        name: editAddress.name || '',
        phone: editAddress.phone || '',
        province: editAddress.province || '',
        city: editAddress.city || '',
        district: editAddress.district || '',
        detail: editAddress.detail || '',
        isDefault: editAddress.isDefault || false,
        region: [editAddress.province || '', editAddress.city || '', editAddress.district || '']
      });
    } else {
      // 从本地存储获取所有地址
      const addresses = wx.getStorageSync('addresses') || [];
      const address = addresses.find(item => item.id === this.data.addressId);
      
      if (address) {
        this.setData({
          name: address.name || '',
          phone: address.phone || '',
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          detail: address.detail || '',
          isDefault: address.isDefault || false,
          region: [address.province || '', address.city || '', address.district || '']
        });
      }
    }
  },

  // 输入框内容变化
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [field]: value
    });
  },

  // 地区选择变化
  onRegionChange: function(e) {
    const region = e.detail.value;
    this.setData({
      region: region,
      province: region[0],
      city: region[1],
      district: region[2]
    });
  },

  // 切换默认地址
  toggleDefault: function() {
    this.setData({
      isDefault: !this.data.isDefault
    });
  },

  // 保存地址
  saveAddress: function() {
    // 表单验证
    if (!this.validateForm()) {
      return;
    }

    // 构建地址对象
    const address = {
      id: this.data.isEdit ? this.data.addressId : Date.now().toString(),
      name: this.data.name,
      phone: this.data.phone,
      province: this.data.province,
      city: this.data.city,
      district: this.data.district,
      detail: this.data.detail,
      isDefault: this.data.isDefault,
      createTime: this.data.isEdit ? 
        wx.getStorageSync('addresses')?.find(item => item.id === this.data.addressId)?.createTime : 
        new Date().toISOString().split('T')[0]
    };

    // 获取现有地址列表
    let addresses = wx.getStorageSync('addresses') || [];

    if (this.data.isEdit) {
      // 更新地址
      addresses = addresses.map(item => 
        item.id === this.data.addressId ? address : item
      );
    } else {
      // 如果是设为默认地址，先将其他地址设为非默认
      if (address.isDefault) {
        addresses = addresses.map(item => ({
          ...item,
          isDefault: false
        }));
      }
      // 新增地址
      addresses.push(address);
    }

    // 保存到本地存储
    wx.setStorageSync('addresses', addresses);

    // 清空全局编辑地址信息
    app.globalData.editAddress = null;

    // 显示成功提示
    wx.showToast({
      title: this.data.isEdit ? '更新成功' : '添加成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  },

  // 表单验证
  validateForm: function() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入收件人姓名', icon: 'none' });
      return false;
    }
    
    if (!this.data.phone.trim()) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return false;
    }
    
    // 简单的手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(this.data.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    
    if (!this.data.province || !this.data.city || !this.data.district) {
      wx.showToast({ title: '请选择省市区', icon: 'none' });
      return false;
    }
    
    if (!this.data.detail.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return false;
    }
    
    return true;
  },

  // 获取当前位置
  getLocation: function() {
    wx.showLoading({ title: '正在获取位置...' });
    
    // 调用微信定位API
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        this.reverseGeocoder(latitude, longitude);
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ 
          title: '获取位置失败，请检查权限', 
          icon: 'none' 
        });
        console.error('获取位置失败:', err);
      }
    });
  },

  // 逆地理编码，将经纬度转换为具体地址
  reverseGeocoder: function(latitude, longitude) {
    // 使用腾讯地图API进行逆地理编码
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77`;
    
    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.data.status === 0) {
          const address = res.data.result;
          const province = address.address_component.province;
          const city = address.address_component.city;
          const district = address.address_component.district;
          const detail = address.address_component.street + address.address_component.street_number;
          
          // 更新页面数据
          this.setData({
            province: province,
            city: city,
            district: district,
            detail: detail || '',
            region: [province, city, district]
          });
          
          wx.showToast({ 
            title: '定位成功', 
            icon: 'success' 
          });
        } else {
          wx.showToast({ 
            title: '解析地址失败', 
            icon: 'none' 
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ 
          title: '网络请求失败', 
          icon: 'none' 
        });
        console.error('逆地理编码失败:', err);
      }
    });
  }

});