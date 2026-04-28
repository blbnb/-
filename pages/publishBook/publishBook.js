const app = getApp();
const api = require('../../utils/api.js').api;

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
    images: [],
    imageList: [],
    categories: ['计算机', '文学', '历史', '经济', '教育', '其他'],
    conditions: ['全新', '9 成新', '8 成新', '7 成新'],
    conditionDiscounts: {
      '全新': 1.0,
      '9 成新': 0.9,
      '8 成新': 0.8,
      '7 成新': 0.7
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
      // 延迟跳转到登录页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }
  },

  // 选择图片 (支持多张)
  chooseImage: function() {
    const that = this;
    wx.chooseImage({
      count: 9 - this.data.imageList.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const tempFilePaths = res.tempFilePaths;
        const newImages = [];
        const newImageList = [];
        
        // 上传每张图片
        const uploadPromises = tempFilePaths.map(tempFilePath => {
          return new Promise((resolve, reject) => {
            wx.uploadFile({
              url: 'http://localhost:8000/api/upload',
              filePath: tempFilePath,
              name: 'file',
              success: function(uploadRes) {
                const data = JSON.parse(uploadRes.data);
                if (data.success) {
                  newImages.push(data.url);
                  newImageList.push({
                    url: data.url,
                    path: tempFilePath
                  });
                  resolve(data.url);
                } else {
                  reject(new Error('上传失败'));
                }
              },
              fail: function(err) {
                console.error('上传图片失败:', err);
                reject(err);
              }
            });
          });
        });
        
        Promise.all(uploadPromises)
          .then(() => {
            // 设置第一张为封面
            if (!that.data.image && newImages.length > 0) {
              that.setData({
                image: newImages[0]
              });
            }
            
            that.setData({
              imageList: [...that.data.imageList, ...newImageList],
              images: [...that.data.images, ...newImages]
            });
            
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
          })
          .catch(() => {
            wx.showToast({
              title: '部分图片上传失败',
              icon: 'none'
            });
          });
      },
      fail: function(err) {
        console.error('选择图片失败:', err);
      }
    });
  },
  
  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: function(res) {
        if (res.confirm) {
          const newImageList = that.data.imageList.filter((_, i) => i !== index);
          const newImages = newImageList.map(img => img.url);
          
          that.setData({
            imageList: newImageList,
            images: newImages,
            // 如果删除的是封面，设置新的封面
            image: index === 0 ? (newImages[0] || '') : that.data.image
          });
        }
      }
    });
  },
  
  // 预览图片
  previewImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.imageList.map(img => img.url);
    
    wx.previewImage({
      current: urls[index],
      urls: urls
    });
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

    return true;
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
      let discountText = '';
      if (discount === 1.0) {
        discountText = '原价';
      } else {
        discountText = Math.round(discount * 10) + '折';
      }
      this.setData({
        price: price.toFixed(2),
        conditionDiscountText: discountText
      });
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

    const userInfo = wx.getStorageSync('userInfo');
    const bookData = {
      title: this.data.title,
      author: this.data.author,
      price: parseFloat(this.data.price) || parseFloat(this.data.originalPrice),
      stock: 1,  // 默认库存为 1
      category: this.data.category,
      isbn: '',  // 可选
      description: this.data.description,
      cover_image: this.data.image || '',
      images: this.data.images
    };

    // 调用后端 API 创建图书
    api.book.create(bookData)
      .then((res) => {
        this.setData({ loading: false });
        
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        });
        
        setTimeout(() => {
          // 返回上一页或跳转到首页
          const pages = getCurrentPages();
          if (pages.length > 1) {
            wx.navigateBack();
          } else {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        }, 2000);
      })
      .catch((err) => {
        console.error('发布失败:', err);
        this.setData({ loading: false });
        
        // 网络失败时提供本地模式选项
        if (err.errMsg && err.errMsg.includes('request:fail')) {
          wx.showModal({
            title: '网络不可用',
            content: '是否切换到本地模式发布？书籍将保存到本地存储',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.publishToLocal(bookData);
              }
            }
          });
        } else {
          wx.showToast({
            title: err.message || '发布失败，请重试',
            icon: 'none'
          });
        }
      });
  },

  // 本地发布方法（网络不可用时使用）
  publishToLocal: function(bookData) {
    const that = this;
    this.setData({ loading: true });
    
    try {
      // 创建新书籍对象
      const newBook = {
        id: Date.now(),
        title: bookData.title,
        author: bookData.author,
        price: bookData.price,
        stock: bookData.stock || 1,
        category: bookData.category || '',
        description: bookData.description || '',
        cover_image: bookData.cover_image || '',
        images: bookData.images || [],
        created_at: new Date().toISOString()
      };
      
      // 获取现有书籍
      let books = wx.getStorageSync('books') || [];
      if (!books || !Array.isArray(books)) {
        books = [];
      }
      
      // 添加到数组
      books.push(newBook);
      
      // 保存到本地存储
      wx.setStorageSync('books', books);
      
      // 同步到文件（如果可能）
      try {
        const fs = wx.getFileSystemManager();
        const booksFile = wx.env.USER_DATA_PATH + '/books.json';
        fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
      } catch (fileErr) {
        console.log('文件写入失败，但已保存到本地存储', fileErr);
      }
      
      this.setData({ loading: false });
      
      wx.showToast({
        title: '发布成功（本地模式）',
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }, 2000);
      
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({
        title: '本地发布失败：' + error.message,
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
          wx.navigateBack({
            fail: () => {
              wx.switchTab({
                url: '/pages/index/index'
              });
            }
          });
        }
      }
    });
  }
});
