const app = getApp();
Page({
  data: {
    title: '',
    author: '',
    originalPrice: '',
    price: '',
    description: '',
    category: '',
    condition: '',
    image: '',
    categories: ['计算机', '文学', '历史', '经济', '艺术', '其他'],
    conditions: ['9成新', '8成新', '7成新'],
    conditionDiscounts: {
      '9成新': 0.9,
      '8成新': 0.8,
      '7成新': 0.7
    },
    loading: false
  },

  onLoad: function() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 选择图片
  chooseImage: function() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 将临时图片转换为 base64 格式
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success: function(data) {
            // 获取图片文件扩展名
            const ext = tempFilePath.split('.').pop().toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
            const base64Image = 'data:' + mimeType + ';base64,' + data.data;
            
            that.setData({
              image: base64Image
            });
          },
          fail: function(err) {
            console.error('图片转换失败:', err);
            // 如果转换失败，使用默认图片
            that.setData({
              image: '/Default.jpg'
            });
            wx.showToast({
              title: '图片加载失败，已使用默认图片',
              icon: 'none'
            });
          }
        });
      },
      fail: function(err) {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 选择分类
  chooseCategory: function() {
    console.log('点击了分类选择');
    const that = this;
    wx.showActionSheet({
      itemList: this.data.categories,
      success: function(res) {
        console.log('选择了分类:', res.tapIndex);
        that.setData({
          category: that.data.categories[res.tapIndex]
        });
      },
      fail: function(err) {
        console.error('选择分类失败:', err);
      }
    });
  },

  // 选择书籍新旧程度
  chooseCondition: function() {
    const that = this;
    wx.showActionSheet({
      itemList: this.data.conditions,
      success: function(res) {
        const condition = that.data.conditions[res.tapIndex];
        that.setData({
          condition: condition
        });
        // 自动计算价格
        that.calculatePrice();
      }
    });
  },

  // 计算价格
  calculatePrice: function() {
    const originalPrice = parseFloat(this.data.originalPrice);
    const condition = this.data.condition;
    if (originalPrice && condition) {
      const discount = this.data.conditionDiscounts[condition];
      const price = originalPrice * discount;
      this.setData({ price: price.toFixed(2) });
    }
  },

  // 输入标题
  onTitleInput: function(e) {
    this.setData({
      title: e.detail.value
    });
  },

  // 输入作者
  onAuthorInput: function(e) {
    this.setData({
      author: e.detail.value
    });
  },

  // 输入原价
  onOriginalPriceInput: function(e) {
    this.setData({
      originalPrice: e.detail.value
    });
    // 自动计算价格
    this.calculatePrice();
  },

  // 输入描述
  onDescriptionInput: function(e) {
    this.setData({
      description: e.detail.value
    });
  },

  // 发布图书
  publishBook: function() {
    console.log('发布图书按钮被点击');
    if (!this.validateForm()) {
      return;
    }

    this.setData({ loading: true });

    const bookData = {
      id: Date.now().toString(),
      title: this.data.title,
      author: this.data.author,
      originalPrice: parseFloat(this.data.originalPrice),
      price: parseFloat(this.data.price),
      description: this.data.description,
      category: this.data.category,
      condition: this.data.condition,
      image: '/Default.jpg',
      status: 'available',
      publishDate: new Date().toISOString(),
      viewCount: 0,
      sellerId: wx.getStorageSync('userInfo')?.id || '1',
      sellerName: wx.getStorageSync('userInfo')?.name || '用户'
    };

    // 保存到本地存储
    this.saveBookToLocal(bookData);
  },

  // 表单验证
  validateForm: function() {
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入图书标题',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.author.trim()) {
      wx.showToast({
        title: '请输入作者',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.originalPrice.trim()) {
      wx.showToast({
        title: '请输入原价',
        icon: 'none'
      });
      return false;
    }

    const originalPrice = parseFloat(this.data.originalPrice);
    if (isNaN(originalPrice) || originalPrice <= 0) {
      wx.showToast({
        title: '请输入有效的原价',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.description.trim()) {
      wx.showToast({
        title: '请输入图书描述',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.category) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.condition) {
      wx.showToast({
        title: '请选择书籍新旧程度',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 保存图书到本地存储
  saveBookToLocal: function(bookData) {
    try {
      let publishedBooks = wx.getStorageSync('publishedBooks') || [];
      publishedBooks.unshift(bookData);
      wx.setStorageSync('publishedBooks', publishedBooks);

      this.setData({ loading: false });

      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    } catch (e) {
      console.error('保存图书失败:', e);
      this.setData({ loading: false });
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      });
    }
  },

  // 取消发布
  cancelPublish: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消发布吗？已填写的信息将不会保存',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
