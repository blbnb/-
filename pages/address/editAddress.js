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
      duration: 1500
    });
    
    setTimeout(() => {
      // 尝试返回上一页，如果失败则跳转到首页
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    }, 1500);
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

  // 高德地图定位功能
  chooseLocation: function() {
    const that = this;
    
    // 获取用户当前位置
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        
        // 调用高德地图逆地理编码API
        that.reverseGeocoding(latitude, longitude);
      },
      fail: function(err) {
        wx.showToast({
          title: '定位失败，请检查定位权限',
          icon: 'none'
        });
        console.error('定位失败:', err);
      }
    });
  },

  // 高德地图逆地理编码
  reverseGeocoding: function(latitude, longitude) {
    const that = this;
    const amapKey = '61c572ad898963693bda9f57404a683d'; // 请替换为您的高德地图Key
    
    wx.request({
      url: `https://restapi.amap.com/v3/geocode/regeo`,
      data: {
        key: amapKey,
        location: `${longitude},${latitude}`,
        extensions: 'all',
        radius: 1000
      },
      success: function(res) {
        if (res.data.status === '1' && res.data.regeocode) {
          const addressComponent = res.data.regeocode.addressComponent;
          const formattedAddress = res.data.regeocode.formatted_address;
          
          // 提取省市区信息
          const province = addressComponent.province || '';
          const city = addressComponent.city || addressComponent.province || '';
          const district = addressComponent.district || '';
          
          // 提取详细地址（去除省市区部分）
          let detail = formattedAddress;
          if (province) detail = detail.replace(province, '');
          if (city && city !== province) detail = detail.replace(city, '');
          if (district) detail = detail.replace(district, '');
          detail = detail.replace(/^\s*/, '');
          
          // 更新页面数据
          that.setData({
            province: province,
            city: city,
            district: district,
            detail: detail,
            region: [province, city, district]
          });
          
          wx.showToast({
            title: '定位成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '地址解析失败',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        console.error('逆地理编码失败:', err);
      }
    });
  },

  // 使用地图选点功能
  openMapSelect: function() {
    const that = this;
    
    wx.chooseLocation({
      success: function(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        const name = res.name || '';
        const address = res.address || '';
        
        // 调用高德地图逆地理编码获取详细地址信息
        that.reverseGeocodingWithAddress(latitude, longitude, name, address);
      },
      fail: function(err) {
        if (err.errMsg !== 'chooseLocation:fail cancel') {
          wx.showToast({
            title: '选择位置失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 根据地图选点结果解析地址
  reverseGeocodingWithAddress: function(latitude, longitude, name, address) {
    const that = this;
    const amapKey = 'YOUR_AMAP_KEY'; // 请替换为您的高德地图Key
    
    wx.request({
      url: `https://restapi.amap.com/v3/geocode/regeo`,
      data: {
        key: amapKey,
        location: `${longitude},${latitude}`,
        extensions: 'all',
        radius: 1000
      },
      success: function(res) {
        if (res.data.status === '1' && res.data.regeocode) {
          const addressComponent = res.data.regeocode.addressComponent;
          
          // 提取省市区信息
          const province = addressComponent.province || '';
          const city = addressComponent.city || addressComponent.province || '';
          const district = addressComponent.district || '';
          
          // 使用地图返回的详细地址
          const detail = name ? `${name}(${address})` : address;
          
          // 更新页面数据
          that.setData({
            province: province,
            city: city,
            district: district,
            detail: detail,
            region: [province, city, district]
          });
          
          wx.showToast({
            title: '位置选择成功',
            icon: 'success'
          });
        } else {
          // 如果解析失败，直接使用地图返回的地址
          that.setData({
            detail: name ? `${name}(${address})` : address
          });
        }
      },
      fail: function() {
        // 如果请求失败，直接使用地图返回的地址
        that.setData({
          detail: name ? `${name}(${address})` : address
        });
      }
    });
  }

});