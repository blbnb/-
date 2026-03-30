// pages/help/help.js
const app = getApp();
Page({
  data: {
    // 常见问题列表
    faqs: [
      {
        id: '1',
        question: '如何注册账号？',
        answer: '在首页点击顶部的登录/注册按钮，选择注册方式（手机号或微信），按照提示完成注册即可。',
        expanded: false
      },
      {
        id: '2',
        question: '如何购买书籍？',
        answer: '1. 浏览或搜索您想要的书籍\n2. 点击进入书籍详情页\n3. 点击“加入购物车”或“立即购买”\n4. 确认订单信息并选择支付方式\n5. 完成支付',
        expanded: false
      },
      {
        id: '3',
        question: '如何申请退款？',
        answer: '在“我的订单”中找到需要退款的订单，点击“申请退款”按钮，填写退款原因并提交。我们的客服会在1-3个工作日内处理您的申请。',
        expanded: false
      },
      {
        id: '4',
        question: '如何修改收货地址？',
        answer: '在“我的”页面点击“收货地址”，可以添加新地址或修改现有地址。您也可以设置默认收货地址。',
        expanded: false
      },
      {
        id: '5',
        question: '如何联系客服？',
        answer: '您可以在“帮助与反馈”页面点击“联系客服”按钮，或在工作时间（9:00-21:00）拨打客服电话：400-123-4567。',
        expanded: false
      },
      {
        id: '6',
        question: '订单什么时候发货？',
        answer: '一般情况下，我们会在您支付成功后的48小时内发货（节假日除外）。您可以在“我的订单”中查看订单状态和物流信息。',
        expanded: false
      },
      {
        id: '7',
        question: '如何使用优惠券？',
        answer: '在结算页面，系统会自动显示可用的优惠券供您选择。您也可以在“我的优惠券”页面查看所有优惠券。',
        expanded: false
      }
    ],
    // 联系方式
    contactInfo: {
      phone: '400-123-4567',
      email: 'support@bookstore.com',
      workingHours: '9:00-21:00（周一至周日）'
    },
    // 反馈表单
    feedbackForm: {
      type: 'suggestion', // suggestion, bug, question, other
      content: '',
      contact: '',
      images: []
    },
    // 反馈类型选项
    feedbackTypes: [
      { value: 'suggestion', label: '功能建议' },
      { value: 'bug', label: '问题反馈' },
      { value: 'question', label: '咨询问题' },
      { value: 'other', label: '其他' }
    ],
    // 反馈内容字数限制
    maxContentLength: 500
  },

  onLoad: function() {
    // 页面加载时的初始化操作
  },

  // 切换常见问题展开/收起状态
  toggleFaq: function(e) {
    const id = e.currentTarget.dataset.id;
    const faqs = this.data.faqs.map(faq => {
      if (faq.id === id) {
        return { ...faq, expanded: !faq.expanded };
      }
      return faq;
    });
    this.setData({ faqs });
  },

  // 拨打客服电话
  makePhoneCall: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.contactInfo.phone,
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (err) => {
        console.error('拨打电话失败:', err);
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  // 复制邮箱地址
  copyEmail: function() {
    wx.setClipboardData({
      data: this.data.contactInfo.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('复制失败:', err);
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 选择反馈类型
  selectFeedbackType: function(e) {
    const type = e.detail.value;
    this.setData({
      'feedbackForm.type': type
    });
  },

  // 输入反馈内容
  inputContent: function(e) {
    const content = e.detail.value;
    if (content.length <= this.data.maxContentLength) {
      this.setData({
        'feedbackForm.content': content
      });
    }
  },

  // 输入联系方式
  inputContact: function(e) {
    this.setData({
      'feedbackForm.contact': e.detail.value
    });
  },

  // 上传图片
  uploadImage: function() {
    if (this.data.feedbackForm.images.length >= 5) {
      wx.showToast({
        title: '最多只能上传5张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseImage({
      count: 5 - this.data.feedbackForm.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        
        // 将所有临时图片转换为 base64 格式
        const base64Images = [];
        let processedCount = 0;
        
        tempFilePaths.forEach((filePath, index) => {
          wx.getFileSystemManager().readFile({
            filePath: filePath,
            encoding: 'base64',
            success: (data) => {
              const ext = filePath.split('.').pop().toLowerCase();
              const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
              const base64Image = 'data:' + mimeType + ';base64,' + data.data;
              base64Images[index] = base64Image;
              
              processedCount++;
              if (processedCount === tempFilePaths.length) {
                // 所有图片都处理完成
                const images = this.data.feedbackForm.images.concat(base64Images.filter(img => img));
                this.setData({
                  'feedbackForm.images': images
                });
              }
            },
            fail: (err) => {
              console.error('图片转换失败:', err);
              processedCount++;
              if (processedCount === tempFilePaths.length) {
                const images = this.data.feedbackForm.images.concat(base64Images.filter(img => img));
                this.setData({
                  'feedbackForm.images': images
                });
              }
            }
          });
        });
        
        console.log('选择的图片:', tempFilePaths);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.feedbackForm.images.filter((_, i) => i !== index);
    this.setData({
      'feedbackForm.images': images
    });
  },

  // 提交反馈
  submitFeedback: function() {
    const { type, content, contact } = this.data.feedbackForm;
    
    if (!content.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...'
    });
    
    // 模拟提交反馈到服务器
    setTimeout(() => {
      // 保存反馈到本地（仅作演示）
      try {
        let feedbacks = wx.getStorageSync('feedbacks') || [];
        feedbacks.push({
          id: Date.now().toString(),
          type,
          content,
          contact,
          images: this.data.feedbackForm.images,
          submitTime: new Date().toISOString(),
          status: 'pending'
        });
        wx.setStorageSync('feedbacks', feedbacks);
      } catch (e) {
        console.error('保存反馈失败:', e);
      }
      
      wx.hideLoading();
      
      wx.showModal({
        title: '提交成功',
        content: '感谢您的反馈，我们会尽快处理！',
        showCancel: false,
        success: () => {
          // 重置表单
          this.setData({
            feedbackForm: {
              type: 'suggestion',
              content: '',
              contact: '',
              images: []
            }
          });
        }
      });
    }, 1000);
  },

    // 跳转到用户协议
  goToUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/userAgreement/userAgreement'
    });
  },

  // 跳转到隐私政策
  goToPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/privacyPolicy/privacyPolicy'
    });
  },

  // 跳转到关于我们
  goToAboutUs: function() {
    wx.navigateTo({
      url: '/pages/aboutUs/aboutUs'
    });
  }
});