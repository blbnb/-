// pages/category/category.js
const app = getApp();
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

  // 加载年级课程数据（使用本地数据）
  loadGradeBooks: function(category) {
    const that = this;
    
    // 显示加载状态
    wx.showLoading({ title: '加载中...' });
    
    // 从本地存储获取图书数据
    let allBooks = [];
    const localBooks = wx.getStorageSync('localBooks') || [];
    const publishedBooks = wx.getStorageSync('publishedBooks') || [];
    allBooks = [...localBooks, ...publishedBooks];
    
    // 如果没有本地数据，使用模拟数据
    if (allBooks.length === 0) {
      allBooks = this.getMockBooks();
    }
    
    // 根据分类筛选图书
    const categoryBooks = allBooks.filter(book => book.category === category || book.college === category);
    
    // 将图书分配到各年级学期
    const gradeSemesterBooks = {
      '大一': { '上学期': [], '下学期': [] },
      '大二': { '上学期': [], '下学期': [] },
      '大三': { '上学期': [], '下学期': [] }
    };
    
    // 简单分配：根据图书ID的哈希值分配到不同年级学期
    categoryBooks.forEach((book, index) => {
      const grades = ['大一', '大二', '大三'];
      const semesters = ['上学期', '下学期'];
      const gradeIndex = index % 3;
      const semesterIndex = Math.floor(index / 3) % 2;
      const grade = grades[gradeIndex];
      const semester = semesters[semesterIndex];
      gradeSemesterBooks[grade][semester].push(book);
    });
    
    // 更新页面数据
    that.setData({
      grades: [
        {
          name: '大一',
          semesters: [
            { name: '上学期', books: gradeSemesterBooks['大一']['上学期'] },
            { name: '下学期', books: gradeSemesterBooks['大一']['下学期'] }
          ]
        },
        {
          name: '大二',
          semesters: [
            { name: '上学期', books: gradeSemesterBooks['大二']['上学期'] },
            { name: '下学期', books: gradeSemesterBooks['大二']['下学期'] }
          ]
        },
        {
          name: '大三',
          semesters: [
            { name: '上学期', books: gradeSemesterBooks['大三']['上学期'] },
            { name: '下学期', books: gradeSemesterBooks['大三']['下学期'] }
          ]
        }
      ]
    });
    
    // 隐藏加载状态
    wx.hideLoading();
    // 数据加载完成后更新当前选中的数据
    that.updateCurrentData();
    
    // 如果没有数据，显示提示
    if (categoryBooks.length === 0) {
      wx.showToast({ title: '暂无课程数据', icon: 'none' });
    }
  },
  
  // 获取模拟图书数据
  getMockBooks: function() {
    return [
      { id: 1, title: '高等数学（上）', author: '同济大学数学系', price: 45.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book1/400/560' },
      { id: 2, title: '高等数学（下）', author: '同济大学数学系', price: 45.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book2/400/560' },
      { id: 3, title: '线性代数', author: '同济大学数学系', price: 35.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book3/400/560' },
      { id: 4, title: '概率论与数理统计', author: '浙江大学数学系', price: 38.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book4/400/560' },
      { id: 5, title: 'C程序设计', author: '谭浩强', price: 42.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book5/400/560' },
      { id: 6, title: '数据结构', author: '严蔚敏', price: 48.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book6/400/560' },
      { id: 7, title: '计算机网络', author: '谢希仁', price: 52.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book7/400/560' },
      { id: 8, title: '操作系统', author: '汤小丹', price: 55.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book8/400/560' },
      { id: 9, title: '数据库系统概论', author: '王珊', price: 46.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book9/400/560' },
      { id: 10, title: 'Java程序设计', author: '耿祥义', price: 49.00, category: '计算机学院', college: '计算机学院', image: 'https://picsum.photos/seed/book10/400/560' }
    ];
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
    const app = getApp();
    const id = e.currentTarget.dataset.id;
    
    // 检查登录状态
    if (!app.isLogin()) {
      // 未登录，显示登录提示弹窗
      this.showLoginDialog();
      return;
    }
    
    // 已登录，跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 显示登录提示弹窗
  showLoginDialog: function() {
    wx.showModal({
      title: '登录提示',
      content: '请先登录后再查看书籍详情',
      confirmText: '去登录',
      cancelText: '取消',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确认，跳转到登录页
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
})