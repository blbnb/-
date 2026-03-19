// pages/category/category.js
Page({
  data: {
    categoryName: '',
    grades: [
      { 
        name: '大一', 
        semesters: [
          { name: '上学期', books: [] },
          { name: '下学期', books: [] }
        ]
      },
      { 
        name: '大二', 
        semesters: [
          { name: '上学期', books: [] },
          { name: '下学期', books: [] }
        ]
      },
      { 
        name: '大三', 
        semesters: [
          { name: '上学期', books: [] },
          { name: '下学期', books: [] }
        ]
      }
    ],
    selectedGrade: '大一', // 默认选中大一年级
    selectedSemester: '上学期', // 默认选中上学期
    currentGrade: {}, // 当前选中的年级数据
    currentSemester: {} // 当前选中的学期数据
  },

  onLoad: function(options) {
    // 获取从上一个页面传递的学院名称，确保正确处理中文
    let categoryName = options.category || '';
    // 如果有编码问题，尝试解码
    try {
      categoryName = decodeURIComponent(categoryName);
    } catch(e) {
      // 如果解码失败，使用原始值
    }
    
    this.setData({
      categoryName: categoryName
    });
    
    // 动态设置导航栏标题为学院名称
    wx.setNavigationBarTitle({
      title: categoryName
    });
    
    // 根据学院名称加载对应的年级课程数据
    this.loadGradeBooks(categoryName);
    
    // 初始化当前选中的年级和学期数据
    this.updateCurrentData();
  },

  // 加载年级课程数据
  loadGradeBooks: function(category) {
    const that = this;
    
    // 显示加载状态
    wx.showLoading({ title: '加载中...' });
    
    // 调用后端API获取分类图书数据
    wx.request({
      url: `${app.globalData.baseUrl}/book/category`,
      method: 'GET',
      data: {
        category: category
      },
      success: function(res) {
        console.log('获取分类图书数据成功', res.data);
        if (res.data.success && res.data.data) {
          // 后端返回的数据结构可能不同，这里需要根据实际情况调整
          const gradeSemesterBooks = res.data.data || {
            '大一': {
              '上学期': [],
              '下学期': []
            },
            '大二': {
              '上学期': [],
              '下学期': []
            },
            '大三': {
              '上学期': [],
              '下学期': []
            }
          };
          
          // 更新页面数据
          that.setData({
            grades: [
              {
                name: '大一',
                semesters: [
                  { name: '上学期', books: gradeSemesterBooks['大一']?.['上学期'] || [] },
                  { name: '下学期', books: gradeSemesterBooks['大一']?.['下学期'] || [] }
                ]
              },
              {
                name: '大二',
                semesters: [
                  { name: '上学期', books: gradeSemesterBooks['大二']?.['上学期'] || [] },
                  { name: '下学期', books: gradeSemesterBooks['大二']?.['下学期'] || [] }
                ]
              },
              {
                name: '大三',
                semesters: [
                  { name: '上学期', books: gradeSemesterBooks['大三']?.['上学期'] || [] },
                  { name: '下学期', books: gradeSemesterBooks['大三']?.['下学期'] || [] }
                ]
              }
            ]
          });
        } else {
          // 后端返回数据不符合预期，使用空数据
          that.setData({
            grades: [
              {
                name: '大一',
                semesters: [
                  { name: '上学期', books: [] },
                  { name: '下学期', books: [] }
                ]
              },
              {
                name: '大二',
                semesters: [
                  { name: '上学期', books: [] },
                  { name: '下学期', books: [] }
                ]
              },
              {
                name: '大三',
                semesters: [
                  { name: '上学期', books: [] },
                  { name: '下学期', books: [] }
                ]
              }
            ]
          });
          wx.showToast({ title: '暂无课程数据', icon: 'none' });
        }
      },
      fail: function(err) {
        console.error('获取分类图书数据失败', err);
        // 网络请求失败，使用空数据
        that.setData({
          grades: [
            {
              name: '大一',
              semesters: [
                { name: '上学期', books: [] },
                { name: '下学期', books: [] }
              ]
            },
            {
              name: '大二',
              semesters: [
                { name: '上学期', books: [] },
                { name: '下学期', books: [] }
              ]
            },
            {
              name: '大三',
              semesters: [
                { name: '上学期', books: [] },
                { name: '下学期', books: [] }
              ]
            }
          ]
        });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      },
      complete: function() {
        // 隐藏加载状态
        wx.hideLoading();
        // 数据加载完成后更新当前选中的数据
        that.updateCurrentData();
      }
    });
  },

  // 更新当前选中的年级和学期数据
  updateCurrentData: function() {
    const currentGrade = this.data.grades.find(grade => grade.name === this.data.selectedGrade) || this.data.grades[0];
    const currentSemester = currentGrade.semesters.find(semester => semester.name === this.data.selectedSemester) || currentGrade.semesters[0];
    
    this.setData({
      currentGrade: currentGrade,
      currentSemester: currentSemester
    });
  },

  // 切换年级
  switchGrade: function(e) {
    const gradeName = e.currentTarget.dataset.name;
    this.setData({
      selectedGrade: gradeName
    });
    // 更新当前数据
    this.updateCurrentData();
  },
  
  // 切换学期
  switchSemester: function(e) {
    const semesterName = e.currentTarget.dataset.name;
    this.setData({
      selectedSemester: semesterName
    });
    // 更新当前数据
    this.updateCurrentData();
  },

  // 查看图书详情
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
})