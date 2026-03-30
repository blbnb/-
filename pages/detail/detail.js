// pages/detail/detail.js
const app = getApp();

Page({
  data: {
    bookId: "",
    bookDetail: null,
    loading: true,
    isFavorited: false,
    quantity: 1,
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        bookId: options.id,
      });
      this.fetchBookDetail();
      this.checkFavoriteStatus();
    }
  },

  // 获取图书详情
  fetchBookDetail: function () {
    const that = this;

    // 显示加载状态
    wx.showLoading({ title: "加载中..." });

    // 先从本地存储获取图书数据
    let bookDetail = null;
    
    // 1. 尝试从本地存储的图书列表中获取
    const localBooks = wx.getStorageSync('localBooks') || [];
    bookDetail = localBooks.find(book => book.id == this.data.bookId);
    
    // 2. 如果没有找到，尝试从发布的图书中获取
    if (!bookDetail) {
      const publishedBooks = wx.getStorageSync('publishedBooks') || [];
      bookDetail = publishedBooks.find(book => book.id == this.data.bookId);
    }
    
    // 3. 如果还是没有找到，使用模拟数据
    if (!bookDetail) {
      const mockBooks = this.getMockBooksData();
      bookDetail = mockBooks.find(book => book.id == this.data.bookId);
    }
    
    if (bookDetail) {
      that.setData({
        bookDetail: bookDetail,
        loading: false
      });
      // 记录浏览历史
      that.recordBrowseHistory(bookDetail);
      wx.hideLoading();
    } else {
      // 如果都没找到，显示错误信息
      that.setData({
        loading: false
      });
      wx.hideLoading();
      wx.showToast({ title: "图书不存在", icon: "none" });
    }
  },

  // 获取模拟图书数据
  getMockBooksData: function() {
    return this.useMockData();
  },

  // 使用模拟数据
  useMockData: function () {
    // 模拟图书数据库，包含首页推荐图书和学院课程图书的完整详情信息
    const mockBooksDatabase = [
      // 首页推荐图书
      {
        id: 1,
        title: "JavaScript高级程序设计",
        author: "Matt Frisbie",
        price: 59.0,
        originalPrice: 89.0,
        image: "https://picsum.photos/seed/book1/400/560",
        description:
          '本书是JavaScript领域最有影响力和口碑的著作之一，被誉为JavaScript开发者的"圣经"。第4版全面、深入地介绍了JavaScript语言的核心概念、语法特性、设计模式以及最佳实践。',
        publisher: "人民邮电出版社",
        publishDate: "2019-03-01",
        isbn: "9787115505797",
        pageCount: 800,
        viewCount: 3456,
        favoriteCount: 892,
        tags: ["畅销", "编程"],
      },
      {
        id: 2,
        title: "数据结构与算法",
        author: "严蔚敏",
        price: 45.0,
        originalPrice: 68.0,
        image: "https://picsum.photos/seed/book2/400/560",
        description:
          "本书是数据结构领域的经典教材，系统地介绍了各种数据结构的基本概念、实现方法及其应用。作者严蔚敏教授结合多年教学经验，深入浅出地讲解了算法设计与分析的核心思想。",
        publisher: "清华大学出版社",
        publishDate: "2017-05-01",
        isbn: "9787302481198",
        pageCount: 380,
        viewCount: 2890,
        favoriteCount: 750,
        tags: ["经典", "计算机"],
      },
      // 计算机学院课程
      {
        id: 101,
        title: "C语言程序设计",
        author: "谭浩强",
        price: 35.0,
        originalPrice: 45.0,
        image: "https://picsum.photos/seed/cbook101/400/560",
        description:
          "本书是C语言领域的经典教材，系统地介绍了C语言的基本概念、语法规则和程序设计方法。内容包括数据类型、控制结构、函数、数组、指针、结构体、文件操作等。",
        publisher: "清华大学出版社",
        publishDate: "2020-08-01",
        isbn: "9787302556867",
        pageCount: 390,
        viewCount: 5680,
        favoriteCount: 1280,
        tags: ["计算机", "基础"],
      },
      {
        id: 102,
        title: "高等数学A(上)",
        author: "同济大学数学系",
        price: 42.0,
        originalPrice: 50.0,
        image: "https://picsum.photos/seed/math102/400/560",
        description:
          "本书是高等数学课程的经典教材，内容包括函数与极限、导数与微分、微分中值定理与导数的应用、不定积分、定积分及其应用等。",
        publisher: "高等教育出版社",
        publishDate: "2019-06-01",
        isbn: "9787040517206",
        pageCount: 450,
        viewCount: 8920,
        favoriteCount: 2150,
        tags: ["数学", "必修"],
      },
      {
        id: 103,
        title: "线性代数",
        author: "同济大学数学系",
        price: 38.0,
        originalPrice: 46.0,
        image: "https://picsum.photos/seed/linear103/400/560",
        description:
          "本书介绍了线性代数的基本理论和方法，包括行列式、矩阵、向量空间、线性方程组、相似矩阵及二次型等内容，注重理论与应用的结合。",
        publisher: "高等教育出版社",
        publishDate: "2019-05-01",
        isbn: "9787040517213",
        pageCount: 320,
        viewCount: 6750,
        favoriteCount: 1520,
        tags: ["数学", "基础"],
      },
      {
        id: 201,
        title: "数据结构",
        author: "严蔚敏",
        price: 48.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/ds201/400/560",
        description:
          "本书系统地介绍了各种数据结构的基本概念、实现方法及其应用。内容包括线性表、栈、队列、串、树、图等基本数据结构，以及排序、查找等算法。",
        publisher: "清华大学出版社",
        publishDate: "2018-08-01",
        isbn: "9787302481198",
        pageCount: 420,
        viewCount: 4560,
        favoriteCount: 1080,
        tags: ["计算机", "专业"],
      },
      {
        id: 202,
        title: "Java程序设计",
        author: "刘宝林",
        price: 45.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/java202/400/560",
        description:
          "本书全面介绍Java语言的核心概念和编程技巧，包括Java基础语法、面向对象编程、异常处理、集合框架、输入输出、多线程、网络编程等内容。",
        publisher: "电子工业出版社",
        publishDate: "2021-03-01",
        isbn: "9787121407712",
        pageCount: 510,
        viewCount: 5230,
        favoriteCount: 1350,
        tags: ["编程", "Java"],
      },
      {
        id: 203,
        title: "计算机组成原理",
        author: "白中英",
        price: 52.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/cpu203/400/560",
        description:
          "本书系统地介绍了计算机组成的基本原理，包括计算机系统概述、数据表示和运算、存储系统、指令系统、中央处理器、总线系统、输入输出系统等内容。",
        publisher: "科学出版社",
        publishDate: "2020-01-01",
        isbn: "9787030634558",
        pageCount: 480,
        viewCount: 3890,
        favoriteCount: 920,
        tags: ["计算机", "硬件"],
      },
      {
        id: 301,
        title: "计算机网络",
        author: "谢希仁",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/net301/400/560",
        description:
          "本书系统地介绍了计算机网络的基本概念、原理和技术，内容包括计算机网络概述、物理层、数据链路层、网络层、传输层、应用层等。",
        publisher: "电子工业出版社",
        publishDate: "2021-01-01",
        isbn: "9787121405589",
        pageCount: 500,
        viewCount: 4450,
        favoriteCount: 1120,
        tags: ["计算机", "网络"],
      },
      {
        id: 302,
        title: "软件工程",
        author: "张海藩",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/se302/400/560",
        description:
          "本书系统地介绍了软件工程的基本概念、原理和方法，内容包括软件工程概述、软件过程、需求工程、软件设计、软件测试、软件维护等。",
        publisher: "清华大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787302536827",
        pageCount: 430,
        viewCount: 3980,
        favoriteCount: 1050,
        tags: ["计算机", "工程"],
      },
      {
        id: 303,
        title: "算法设计与分析",
        author: "王晓东",
        price: 52.0,
        originalPrice: 72.0,
        image: "https://picsum.photos/seed/algo303/400/560",
        description:
          "本书系统地介绍了算法设计与分析的基本概念、原理和方法，内容包括算法复杂性分析、分治法、动态规划、贪心算法、回溯法、分支限界法等。",
        publisher: "电子工业出版社",
        publishDate: "2020-03-01",
        isbn: "9787121387577",
        pageCount: 480,
        viewCount: 4670,
        favoriteCount: 1230,
        tags: ["计算机", "算法"],
      },
      // 机电学院课程
      {
        id: 401,
        title: "工程图学",
        author: "左宗义",
        price: 45.0,
        originalPrice: 55.0,
        image: "https://picsum.photos/seed/draw401/400/560",
        description:
          "本书系统地介绍了工程图学的基本理论和方法，包括制图基本知识、正投影法基础、立体的投影、组合体、轴测图、机件的表达方法、标准件与常用件等。",
        publisher: "机械工业出版社",
        publishDate: "2020-04-01",
        isbn: "9787111644932",
        pageCount: 380,
        viewCount: 3210,
        favoriteCount: 850,
        tags: ["机械", "设计"],
      },
      {
        id: 402,
        title: "机械工程基础",
        author: "黄纯颖",
        price: 42.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/mech402/400/560",
        description:
          "本书介绍了机械工程的基础知识，内容包括机械原理基础、机械设计基础、工程材料、机械制造基础等，为机械类专业学生提供必要的专业基础知识。",
        publisher: "高等教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787040519927",
        pageCount: 410,
        viewCount: 2890,
        favoriteCount: 780,
        tags: ["机械", "基础"],
      },
      {
        id: 501,
        title: "理论力学",
        author: "哈尔滨工业大学理论力学教研室",
        price: 48.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/mechanics501/400/560",
        description:
          "本书系统地介绍了理论力学的基本概念和原理，内容包括静力学、运动学和动力学三大部分，注重理论联系实际，培养学生分析和解决工程力学问题的能力。",
        publisher: "高等教育出版社",
        publishDate: "2019-07-01",
        isbn: "9787040512331",
        pageCount: 450,
        viewCount: 3450,
        favoriteCount: 920,
        tags: ["力学", "专业"],
      },
      // 电信学院课程
      {
        id: 701,
        title: "电路分析基础",
        author: "邱关源",
        price: 45.0,
        originalPrice: 55.0,
        image: "https://picsum.photos/seed/circuit701/400/560",
        description:
          "本书系统地介绍了电路分析的基本理论和方法，内容包括电路模型和基本定律、电阻电路的等效变换、电阻电路的一般分析、电路定理、正弦稳态分析等。",
        publisher: "高等教育出版社",
        publishDate: "2019-05-01",
        isbn: "9787040503617",
        pageCount: 520,
        viewCount: 4120,
        favoriteCount: 1080,
        tags: ["电子", "电路"],
      },
      // 经贸学院课程
      {
        id: 1101,
        title: "西方经济学(微观)",
        author: "高鸿业",
        price: 42.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/microeco1101/400/560",
        description:
          "本书系统地介绍了微观经济学的基本理论和方法，内容包括需求、供给和均衡价格、消费者选择、生产技术、成本、完全竞争市场、不完全竞争市场等。",
        publisher: "中国人民大学出版社",
        publishDate: "2018-09-01",
        isbn: "9787300260107",
        pageCount: 430,
        viewCount: 5680,
        favoriteCount: 1450,
        tags: ["经济", "基础"],
      },
      // 人文学院课程
      {
        id: 1401,
        title: "中国文学史(古代)",
        author: "袁行霈",
        price: 45.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/chinese1401/400/560",
        description:
          "本书系统地介绍了中国古代文学的发展历程，内容包括先秦文学、秦汉文学、魏晋南北朝文学、隋唐五代文学、宋元文学、明清文学等。",
        publisher: "高等教育出版社",
        publishDate: "2019-03-01",
        isbn: "9787040510792",
        pageCount: 580,
        viewCount: 3890,
        favoriteCount: 1120,
        tags: ["文学", "中国"],
      },
      // 管理学院课程
      {
        id: 1701,
        title: "管理学原理",
        author: "周三多",
        price: 40.0,
        originalPrice: 50.0,
        image: "https://picsum.photos/seed/mgmt1701/400/560",
        description:
          "本书系统地介绍了管理学的基本原理和方法，内容包括管理与管理学、管理思想的发展、计划、组织、领导、控制等，为管理类专业学生提供必要的专业基础知识。",
        publisher: "复旦大学出版社",
        publishDate: "2021-01-01",
        isbn: "9787309156888",
        pageCount: 450,
        viewCount: 6750,
        favoriteCount: 1820,
        tags: ["管理", "基础"],
      },
      // 外国语学院课程
      {
        id: 2001,
        title: "大学英语(1)",
        author: "董亚芬",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/english2001/400/560",
        description:
          "本书是大学英语基础阶段的综合英语教材，内容包括英语阅读、语法、词汇、写作等方面的训练，旨在提高学生的英语综合应用能力。",
        publisher: "上海外语教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787544658749",
        pageCount: 380,
        viewCount: 4560,
        favoriteCount: 1280,
        tags: ["英语", "大一", "公共"],
      },
      {
        id: 2002,
        title: "英语听力教程(1)",
        author: "张民伦",
        price: 35.0,
        originalPrice: 48.0,
        image: "https://picsum.photos/seed/listening2002/400/560",
        description:
          "本书是大学英语听力教材，内容包括各种英语听力材料和练习，旨在提高学生的英语听力理解能力。",
        publisher: "高等教育出版社",
        publishDate: "2018-12-01",
        isbn: "9787040506704",
        pageCount: 280,
        viewCount: 3890,
        favoriteCount: 950,
        tags: ["英语", "听力", "大一"],
      },
      {
        id: 2003,
        title: "英语口语教程(1)",
        author: "王守仁",
        price: 32.0,
        originalPrice: 45.0,
        image: "https://picsum.photos/seed/speaking2003/400/560",
        description:
          "本书是大学英语口语教材，内容包括各种英语会话场景和练习，旨在提高学生的英语口语表达能力。",
        publisher: "高等教育出版社",
        publishDate: "2019-01-01",
        isbn: "9787040507831",
        pageCount: 250,
        viewCount: 3450,
        favoriteCount: 880,
        tags: ["英语", "口语", "大一"],
      },
      {
        id: 2004,
        title: "大学英语(2)",
        author: "董亚芬",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/english2004/400/560",
        description:
          "本书是大学英语基础阶段第二册教材，内容包括英语阅读、语法、词汇、写作等方面的训练，进一步提高学生的英语综合应用能力。",
        publisher: "上海外语教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787544658756",
        pageCount: 380,
        viewCount: 4230,
        favoriteCount: 1150,
        tags: ["英语", "大二", "公共"],
      },
      {
        id: 2005,
        title: "英语听力教程(2)",
        author: "张民伦",
        price: 35.0,
        originalPrice: 48.0,
        image: "https://picsum.photos/seed/listening2005/400/560",
        description:
          "本书是大学英语听力第二册教材，内容包括各种英语听力材料和练习，进一步提高学生的英语听力理解能力。",
        publisher: "高等教育出版社",
        publishDate: "2018-12-01",
        isbn: "9787040506711",
        pageCount: 280,
        viewCount: 3670,
        favoriteCount: 920,
        tags: ["英语", "听力", "大二"],
      },
      {
        id: 2006,
        title: "英语口语教程(2)",
        author: "王守仁",
        price: 32.0,
        originalPrice: 45.0,
        image: "https://picsum.photos/seed/speaking2006/400/560",
        description:
          "本书是大学英语口语第二册教材，内容包括各种英语会话场景和练习，进一步提高学生的英语口语表达能力。",
        publisher: "高等教育出版社",
        publishDate: "2019-01-01",
        isbn: "9787040507848",
        pageCount: 250,
        viewCount: 3210,
        favoriteCount: 850,
        tags: ["英语", "口语", "大二"],
      },
      {
        id: 2101,
        title: "大学英语(3)",
        author: "董亚芬",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/english2101/400/560",
        description:
          "本书是大学英语提高阶段第一册教材，内容包括英语阅读、语法、词汇、写作等方面的训练，提高学生的英语综合应用能力。",
        publisher: "上海外语教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787544658763",
        pageCount: 380,
        viewCount: 3980,
        favoriteCount: 1080,
        tags: ["英语", "大三", "公共"],
      },
      {
        id: 2102,
        title: "英语写作教程(1)",
        author: "丁往道",
        price: 35.0,
        originalPrice: 48.0,
        image: "https://picsum.photos/seed/writing2102/400/560",
        description:
          "本书是大学英语写作教材，内容包括各种英语写作技巧和练习，旨在提高学生的英语写作能力。",
        publisher: "外语教学与研究出版社",
        publishDate: "2020-03-01",
        isbn: "9787521313575",
        pageCount: 320,
        viewCount: 3450,
        favoriteCount: 950,
        tags: ["英语", "写作", "大二"],
      },
      {
        id: 2103,
        title: "英语阅读教程(1)",
        author: "王守仁",
        price: 36.0,
        originalPrice: 49.0,
        image: "https://picsum.photos/seed/reading2103/400/560",
        description:
          "本书是大学英语阅读教材，内容包括各种英语阅读材料和练习，旨在提高学生的英语阅读理解能力。",
        publisher: "高等教育出版社",
        publishDate: "2019-02-01",
        isbn: "9787040508913",
        pageCount: 350,
        viewCount: 3780,
        favoriteCount: 1020,
        tags: ["英语", "阅读", "大二"],
      },
      {
        id: 2104,
        title: "大学英语(4)",
        author: "董亚芬",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/english2104/400/560",
        description:
          "本书是大学英语提高阶段第二册教材，内容包括英语阅读、语法、词汇、写作等方面的训练，进一步提高学生的英语综合应用能力。",
        publisher: "上海外语教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787544658770",
        pageCount: 380,
        viewCount: 3760,
        favoriteCount: 1050,
        tags: ["英语", "大四", "公共"],
      },
      {
        id: 2105,
        title: "英语写作教程(2)",
        author: "丁往道",
        price: 35.0,
        originalPrice: 48.0,
        image: "https://picsum.photos/seed/writing2105/400/560",
        description:
          "本书是大学英语写作第二册教材，内容包括各种英语写作技巧和练习，进一步提高学生的英语写作能力。",
        publisher: "外语教学与研究出版社",
        publishDate: "2020-03-01",
        isbn: "9787521313582",
        pageCount: 320,
        viewCount: 3210,
        favoriteCount: 920,
        tags: ["英语", "写作", "大二"],
      },
      {
        id: 2106,
        title: "英语阅读教程(2)",
        author: "王守仁",
        price: 36.0,
        originalPrice: 49.0,
        image: "https://picsum.photos/seed/reading2106/400/560",
        description:
          "本书是大学英语阅读第二册教材，内容包括各种英语阅读材料和练习，进一步提高学生的英语阅读理解能力。",
        publisher: "高等教育出版社",
        publishDate: "2019-02-01",
        isbn: "9787040508920",
        pageCount: 350,
        viewCount: 3560,
        favoriteCount: 980,
        tags: ["英语", "阅读", "大二"],
      },
      {
        id: 2201,
        title: "英语语言学",
        author: "胡壮麟",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/linguistics2201/400/560",
        description:
          "本书系统地介绍了英语语言学的基本概念、原理和方法，内容包括语音学、音系学、形态学、句法学、语义学、语用学等。",
        publisher: "北京大学出版社",
        publishDate: "2020-05-01",
        isbn: "9787301312033",
        pageCount: 480,
        viewCount: 2890,
        favoriteCount: 850,
        tags: ["英语", "语言学", "大三"],
      },
      {
        id: 2202,
        title: "英美文学选读",
        author: "张伯香",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/literature2202/400/560",
        description:
          "本书精选了英美文学史上的经典作品，包括诗歌、小说、戏剧等，旨在提高学生的文学素养和英语阅读理解能力。",
        publisher: "外语教学与研究出版社",
        publishDate: "2019-10-01",
        isbn: "9787521310213",
        pageCount: 520,
        viewCount: 3120,
        favoriteCount: 920,
        tags: ["英语", "文学", "大三"],
      },
      {
        id: 2203,
        title: "英汉翻译教程",
        author: "张培基",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/translation2203/400/560",
        description:
          "本书系统地介绍了英汉翻译的基本理论、技巧和方法，内容包括翻译的基本原则、常用翻译技巧、不同文体的翻译等。",
        publisher: "上海外语教育出版社",
        publishDate: "2020-01-01",
        isbn: "9787544659715",
        pageCount: 430,
        viewCount: 2980,
        favoriteCount: 880,
        tags: ["英语", "翻译", "大三"],
      },
      {
        id: 2204,
        title: "英语词汇学",
        author: "陆国强",
        price: 36.0,
        originalPrice: 49.0,
        image: "https://picsum.photos/seed/vocabulary2204/400/560",
        description:
          "本书系统地介绍了英语词汇学的基本概念、原理和方法，内容包括词汇的来源、构词法、词义变化、词汇的搭配等。",
        publisher: "上海外语教育出版社",
        publishDate: "2019-06-01",
        isbn: "9787544657018",
        pageCount: 380,
        viewCount: 2760,
        favoriteCount: 820,
        tags: ["英语", "词汇", "大三"],
      },
      {
        id: 2205,
        title: "英语语法教程",
        author: "章振邦",
        price: 35.0,
        originalPrice: 48.0,
        image: "https://picsum.photos/seed/grammar2205/400/560",
        description:
          "本书系统地介绍了英语语法的基本规则和用法，内容包括词类、句子结构、时态、语态、从句等。",
        publisher: "上海外语教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787544658121",
        pageCount: 420,
        viewCount: 2650,
        favoriteCount: 780,
        tags: ["英语", "语法", "大三"],
      },
      {
        id: 2206,
        title: "汉英翻译教程",
        author: "吕瑞昌",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/translation2206/400/560",
        description:
          "本书系统地介绍了汉英翻译的基本理论、技巧和方法，内容包括翻译的基本原则、常用翻译技巧、不同文体的翻译等。",
        publisher: "陕西人民出版社",
        publishDate: "2019-12-01",
        isbn: "9787224133037",
        pageCount: 410,
        viewCount: 2870,
        favoriteCount: 850,
        tags: ["英语", "翻译", "大三"],
      },
      // 默认通用课程
      {
        id: 3001,
        title: "大学英语(1)",
        author: "李观仪",
        price: 35.0,
        originalPrice: 45.0,
        image: "https://picsum.photos/seed/genenglish3001/400/560",
        description:
          "本书是面向非英语专业学生的大学英语教材，内容包括英语听说读写译等方面的训练，旨在提高学生的英语综合应用能力和跨文化交际能力。",
        publisher: "上海外语教育出版社",
        publishDate: "2020-06-01",
        isbn: "9787544661436",
        pageCount: 350,
        viewCount: 9870,
        favoriteCount: 2650,
        tags: ["英语", "公共"],
      },
      // 机电学院补充课程
      {
        id: 403,
        title: "机械制图",
        author: "孙根正",
        price: 42.0,
        originalPrice: 55.0,
        image: "https://picsum.photos/seed/draw403/400/560",
        description:
          "本书系统地介绍了机械制图的基本理论和方法，包括制图基本知识、正投影法基础、立体的投影、组合体、轴测图、机件的表达方法等。",
        publisher: "高等教育出版社",
        publishDate: "2019-04-01",
        isbn: "9787040513246",
        pageCount: 380,
        viewCount: 3210,
        favoriteCount: 850,
        tags: ["机械", "制图"],
      },
      {
        id: 502,
        title: "材料力学",
        author: "刘鸿文",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/material502/400/560",
        description:
          "本书系统地介绍了材料力学的基本概念和原理，内容包括轴向拉伸与压缩、剪切与挤压、扭转、弯曲内力、弯曲应力、弯曲变形、应力状态与强度理论等。",
        publisher: "高等教育出版社",
        publishDate: "2019-06-01",
        isbn: "9787040510808",
        pageCount: 420,
        viewCount: 3670,
        favoriteCount: 980,
        tags: ["力学", "专业"],
      },
      {
        id: 503,
        title: "机械原理",
        author: "孙桓",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/mechanics503/400/560",
        description:
          "本书系统地介绍了机械原理的基本理论和方法，内容包括平面机构的结构分析、平面机构的运动分析、平面连杆机构及其设计、凸轮机构及其设计等。",
        publisher: "高等教育出版社",
        publishDate: "2019-05-01",
        isbn: "9787040510815",
        pageCount: 450,
        viewCount: 3450,
        favoriteCount: 920,
        tags: ["机械", "原理"],
      },
      {
        id: 504,
        title: "机械设计",
        author: "濮良贵",
        price: 55.0,
        originalPrice: 75.0,
        image: "https://picsum.photos/seed/design504/400/560",
        description:
          "本书系统地介绍了机械设计的基本理论和方法，内容包括机械设计概论、机械零件的强度、摩擦、磨损及润滑、螺纹连接、键连接等。",
        publisher: "高等教育出版社",
        publishDate: "2019-04-01",
        isbn: "9787040510822",
        pageCount: 520,
        viewCount: 3890,
        favoriteCount: 1050,
        tags: ["机械", "设计"],
      },
      {
        id: 505,
        title: "互换性与测量技术",
        author: "廖念钊",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/tolerance505/400/560",
        description:
          "本书系统地介绍了互换性与测量技术的基本理论和方法，内容包括互换性概述、尺寸公差与配合、几何公差与配合、表面粗糙度等。",
        publisher: "中国计量出版社",
        publishDate: "2020-01-01",
        isbn: "9787502647308",
        pageCount: 350,
        viewCount: 3120,
        favoriteCount: 820,
        tags: ["机械", "测量"],
      },
      {
        id: 506,
        title: "电工学",
        author: "秦曾煌",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/electrical506/400/560",
        description:
          "本书系统地介绍了电工学的基本理论和方法，内容包括电路的基本概念和基本定律、直流电路、正弦交流电路、三相电路等。",
        publisher: "高等教育出版社",
        publishDate: "2019-07-01",
        isbn: "9787040510839",
        pageCount: 480,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["电气", "基础"],
      },
      {
        id: 601,
        title: "液压与气压传动",
        author: "左健民",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/hydraulic601/400/560",
        description:
          "本书系统地介绍了液压与气压传动的基本理论和方法，内容包括液压流体力学基础、液压泵和液压马达、液压缸、液压控制阀等。",
        publisher: "机械工业出版社",
        publishDate: "2020-03-01",
        isbn: "9787111644949",
        pageCount: 420,
        viewCount: 2980,
        favoriteCount: 810,
        tags: ["液压", "气压"],
      },
      {
        id: 602,
        title: "控制工程基础",
        author: "胡寿松",
        price: 52.0,
        originalPrice: 72.0,
        image: "https://picsum.photos/seed/control602/400/560",
        description:
          "本书系统地介绍了控制工程基础的基本理论和方法，内容包括控制系统的一般概念、控制系统的数学模型、时域分析法、根轨迹法等。",
        publisher: "科学出版社",
        publishDate: "2019-02-01",
        isbn: "9787030634565",
        pageCount: 460,
        viewCount: 3210,
        favoriteCount: 890,
        tags: ["控制", "基础"],
      },
      {
        id: 603,
        title: "机械制造技术基础",
        author: "卢秉恒",
        price: 55.0,
        originalPrice: 75.0,
        image: "https://picsum.photos/seed/manufacturing603/400/560",
        description:
          "本书系统地介绍了机械制造技术基础的基本理论和方法，内容包括金属切削原理、金属切削刀具、金属切削机床、机械加工工艺规程等。",
        publisher: "机械工业出版社",
        publishDate: "2019-08-01",
        isbn: "9787111644956",
        pageCount: 510,
        viewCount: 3560,
        favoriteCount: 980,
        tags: ["机械", "制造"],
      },
      {
        id: 604,
        title: "机电传动控制",
        author: "冯清秀",
        price: 50.0,
        originalPrice: 70.0,
        image: "https://picsum.photos/seed/mecdrive604/400/560",
        description:
          "本书系统地介绍了机电传动控制的基本理论和方法，内容包括直流电机、交流电机、控制电机、电力拖动系统的动力学基础等。",
        publisher: "电子工业出版社",
        publishDate: "2020-02-01",
        isbn: "9787121407729",
        pageCount: 450,
        viewCount: 3340,
        favoriteCount: 920,
        tags: ["机电", "控制"],
      },
      {
        id: 605,
        title: "数控技术",
        author: "王永章",
        price: 52.0,
        originalPrice: 72.0,
        image: "https://picsum.photos/seed/cnc605/400/560",
        description:
          "本书系统地介绍了数控技术的基本理论和方法，内容包括数控技术概论、数控加工编程基础、数控机床的机械结构、数控系统等。",
        publisher: "机械工业出版社",
        publishDate: "2019-09-01",
        isbn: "9787111644963",
        pageCount: 480,
        viewCount: 3670,
        favoriteCount: 1020,
        tags: ["数控", "技术"],
      },
      {
        id: 606,
        title: "CAD/CAM技术",
        author: "宁汝新",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/cadcam606/400/560",
        description:
          "本书系统地介绍了CAD/CAM技术的基本理论和方法，内容包括CAD/CAM技术概述、计算机图形学基础、CAD/CAM系统的硬件和软件等。",
        publisher: "机械工业出版社",
        publishDate: "2020-01-01",
        isbn: "9787111644970",
        pageCount: 430,
        viewCount: 3120,
        favoriteCount: 850,
        tags: ["CAD", "CAM"],
      },
      // 电信学院补充课程
      {
        id: 702,
        title: "高等数学A(上)",
        author: "同济大学",
        price: 42.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/math702/400/560",
        description:
          "本书是高等数学课程的经典教材，内容包括函数与极限、导数与微分、微分中值定理与导数的应用、不定积分、定积分及其应用等。",
        publisher: "高等教育出版社",
        publishDate: "2019-06-01",
        isbn: "9787040517206",
        pageCount: 450,
        viewCount: 8920,
        favoriteCount: 2150,
        tags: ["数学", "必修"],
      },
      {
        id: 703,
        title: "大学物理(上)",
        author: "张三",
        price: 40.0,
        originalPrice: 54.0,
        image: "https://picsum.photos/seed/physics703/400/560",
        description:
          "本书系统地介绍了大学物理的基本概念和原理，内容包括力学、热学、电磁学、光学、近代物理等。",
        publisher: "高等教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787040513253",
        pageCount: 420,
        viewCount: 5670,
        favoriteCount: 1520,
        tags: ["物理", "公共"],
      },
      {
        id: 704,
        title: "模拟电子技术基础",
        author: "童诗白",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/analog704/400/560",
        description:
          "本书系统地介绍了模拟电子技术基础的基本理论和方法，内容包括半导体二极管及其基本电路、半导体三极管及其放大电路基础等。",
        publisher: "高等教育出版社",
        publishDate: "2019-05-01",
        isbn: "9787040510846",
        pageCount: 520,
        viewCount: 4340,
        favoriteCount: 1180,
        tags: ["电子", "模拟"],
      },
      {
        id: 705,
        title: "高等数学A(下)",
        author: "同济大学",
        price: 42.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/math705/400/560",
        description:
          "本书是高等数学课程的经典教材，内容包括向量代数与空间解析几何、多元函数微分学、重积分、曲线积分与曲面积分、无穷级数等。",
        publisher: "高等教育出版社",
        publishDate: "2019-06-01",
        isbn: "9787040517213",
        pageCount: 480,
        viewCount: 8560,
        favoriteCount: 2030,
        tags: ["数学", "必修"],
      },
      {
        id: 706,
        title: "大学物理(下)",
        author: "张三",
        price: 40.0,
        originalPrice: 54.0,
        image: "https://picsum.photos/seed/physics706/400/560",
        description:
          "本书系统地介绍了大学物理的基本概念和原理，内容包括电磁学、光学、近代物理等。",
        publisher: "高等教育出版社",
        publishDate: "2019-08-01",
        isbn: "9787040513260",
        pageCount: 430,
        viewCount: 5340,
        favoriteCount: 1450,
        tags: ["物理", "公共"],
      },
      {
        id: 801,
        title: "数字电子技术",
        author: "阎石",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/digital801/400/560",
        description:
          "本书系统地介绍了数字电子技术的基本理论和方法，内容包括数制和码制、逻辑代数基础、门电路、组合逻辑电路等。",
        publisher: "高等教育出版社",
        publishDate: "2019-04-01",
        isbn: "9787040510853",
        pageCount: 510,
        viewCount: 4560,
        favoriteCount: 1230,
        tags: ["电子", "数字"],
      },
      {
        id: 802,
        title: "信号与系统",
        author: "郑君里",
        price: 52.0,
        originalPrice: 72.0,
        image: "https://picsum.photos/seed/signals802/400/560",
        description:
          "本书系统地介绍了信号与系统的基本理论和方法，内容包括连续时间系统的时域分析、傅里叶变换、拉普拉斯变换等。",
        publisher: "高等教育出版社",
        publishDate: "2019-03-01",
        isbn: "9787040510860",
        pageCount: 550,
        viewCount: 4890,
        favoriteCount: 1350,
        tags: ["信号", "系统"],
      },
      {
        id: 803,
        title: "电磁场与电磁波",
        author: "谢处方",
        price: 45.0,
        originalPrice: 62.0,
        image: "https://picsum.photos/seed/emfield803/400/560",
        description:
          "本书系统地介绍了电磁场与电磁波的基本理论和方法，内容包括矢量分析、静电场、恒定电场、恒定磁场等。",
        publisher: "高等教育出版社",
        publishDate: "2019-05-01",
        isbn: "9787040510877",
        pageCount: 480,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["电磁", "波"],
      },
      {
        id: 804,
        title: "高频电子线路",
        author: "张肃文",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/hf804/400/560",
        description:
          "本书系统地介绍了高频电子线路的基本理论和方法，内容包括高频小信号放大器、高频功率放大器、正弦波振荡器等。",
        publisher: "高等教育出版社",
        publishDate: "2019-04-01",
        isbn: "9787040510884",
        pageCount: 520,
        viewCount: 3890,
        favoriteCount: 1050,
        tags: ["电子", "高频"],
      },
      {
        id: 805,
        title: "自动控制原理",
        author: "胡寿松",
        price: 50.0,
        originalPrice: 68.0,
        image: "https://picsum.photos/seed/control805/400/560",
        description:
          "本书系统地介绍了自动控制原理的基本理论和方法，内容包括自动控制的一般概念、控制系统的数学模型、时域分析法等。",
        publisher: "科学出版社",
        publishDate: "2019-02-01",
        isbn: "9787030634572",
        pageCount: 510,
        viewCount: 4450,
        favoriteCount: 1210,
        tags: ["控制", "原理"],
      },
      {
        id: 806,
        title: "通信原理",
        author: "樊昌信",
        price: 55.0,
        originalPrice: 75.0,
        image: "https://picsum.photos/seed/comm806/400/560",
        description:
          "本书系统地介绍了通信原理的基本理论和方法，内容包括通信系统概述、随机信号分析、信道、模拟调制系统等。",
        publisher: "国防工业出版社",
        publishDate: "2019-01-01",
        isbn: "9787118117757",
        pageCount: 580,
        viewCount: 4670,
        favoriteCount: 1280,
        tags: ["通信", "原理"],
      },
      {
        id: 901,
        title: "数字信号处理",
        author: "程佩青",
        price: 52.0,
        originalPrice: 72.0,
        image: "https://picsum.photos/seed/dsp901/400/560",
        description:
          "本书系统地介绍了数字信号处理的基本理论和方法，内容包括离散时间信号与系统、z变换、离散傅里叶变换、数字滤波器等。",
        publisher: "清华大学出版社",
        publishDate: "2018-08-01",
        isbn: "9787302481204",
        pageCount: 490,
        viewCount: 4230,
        favoriteCount: 1150,
        tags: ["信号", "处理"],
      },
      {
        id: 902,
        title: "微机原理与接口技术",
        author: "周明德",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/micro902/400/560",
        description:
          "本书系统地介绍了微机原理与接口技术的基本理论和方法，内容包括微型计算机基础、8086微处理器、汇编语言程序设计等。",
        publisher: "清华大学出版社",
        publishDate: "2019-02-01",
        isbn: "9787302519102",
        pageCount: 520,
        viewCount: 4010,
        favoriteCount: 1080,
        tags: ["微机", "接口"],
      },
      {
        id: 903,
        title: "单片机原理及应用",
        author: "张毅刚",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/mcu903/400/560",
        description:
          "本书系统地介绍了单片机原理及应用的基本理论和方法，内容包括MCS-51单片机的结构、指令系统、汇编语言程序设计等。",
        publisher: "高等教育出版社",
        publishDate: "2019-03-01",
        isbn: "9787040510891",
        pageCount: 460,
        viewCount: 3890,
        favoriteCount: 1020,
        tags: ["单片机", "应用"],
      },
      {
        id: 904,
        title: "嵌入式系统",
        author: "韦东山",
        price: 55.0,
        originalPrice: 78.0,
        image: "https://picsum.photos/seed/embedded904/400/560",
        description:
          "本书系统地介绍了嵌入式系统的基本理论和方法，内容包括嵌入式系统概述、ARM处理器、Linux操作系统等。",
        publisher: "北京航空航天大学出版社",
        publishDate: "2020-01-01",
        isbn: "9787512431377",
        pageCount: 580,
        viewCount: 4450,
        favoriteCount: 1230,
        tags: ["嵌入式", "系统"],
      },
      {
        id: 905,
        title: "光纤通信",
        author: "张宝富",
        price: 50.0,
        originalPrice: 70.0,
        image: "https://picsum.photos/seed/fiber905/400/560",
        description:
          "本书系统地介绍了光纤通信的基本理论和方法，内容包括光纤和光缆、光发送机、光接收机、光纤通信系统等。",
        publisher: "电子工业出版社",
        publishDate: "2019-05-01",
        isbn: "9787121407736",
        pageCount: 490,
        viewCount: 3670,
        favoriteCount: 980,
        tags: ["光纤", "通信"],
      },
      {
        id: 906,
        title: "移动通信",
        author: "曹丽娜",
        price: 52.0,
        originalPrice: 72.0,
        image: "https://picsum.photos/seed/mobile906/400/560",
        description:
          "本书系统地介绍了移动通信的基本理论和方法，内容包括移动通信概述、移动信道、模拟蜂窝移动通信系统等。",
        publisher: "西安电子科技大学出版社",
        publishDate: "2019-02-01",
        isbn: "9787560654488",
        pageCount: 520,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["移动", "通信"],
      },
      // 经贸学院补充课程
      {
        id: 1102,
        title: "管理学原理",
        author: "周三多",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/management1102/400/560",
        description:
          "本书系统地介绍了管理学的基本原理和方法，内容包括管理与管理学、管理思想的发展、计划、组织、领导、控制等。",
        publisher: "复旦大学出版社",
        publishDate: "2021-01-01",
        isbn: "9787309156888",
        pageCount: 450,
        viewCount: 6750,
        favoriteCount: 1820,
        tags: ["管理", "基础"],
      },
      {
        id: 1103,
        title: "会计学原理",
        author: "葛家澍",
        price: 40.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/accounting1103/400/560",
        description:
          "本书系统地介绍了会计学原理的基本理论和方法，内容包括会计的基本概念、会计要素与会计等式、账户与复式记账等。",
        publisher: "中国财政经济出版社",
        publishDate: "2019-08-01",
        isbn: "9787509589838",
        pageCount: 420,
        viewCount: 5430,
        favoriteCount: 1480,
        tags: ["会计", "基础"],
      },
      {
        id: 1104,
        title: "统计学原理",
        author: "贾俊平",
        price: 40.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/stats1104/400/560",
        description:
          "本书系统地介绍了统计学原理的基本理论和方法，内容包括统计数据的收集与整理、描述统计、概率与概率分布等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787300266031",
        pageCount: 430,
        viewCount: 5120,
        favoriteCount: 1380,
        tags: ["统计", "基础"],
      },
      {
        id: 1105,
        title: "财政学",
        author: "陈共",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/finance1105/400/560",
        description:
          "本书系统地介绍了财政学的基本理论和方法，内容包括财政概念和财政职能、财政支出规模与结构分析、财政收入规模与结构分析等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787300269834",
        pageCount: 480,
        viewCount: 4890,
        favoriteCount: 1280,
        tags: ["财政", "基础"],
      },
      {
        id: 1106,
        title: "经济法",
        author: "杨紫烜",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/law1106/400/560",
        description:
          "本书系统地介绍了经济法的基本理论和方法，内容包括经济法的概念、体系和渊源、经济法的地位和作用、经济法律关系等。",
        publisher: "北京大学出版社",
        publishDate: "2019-09-01",
        isbn: "9787301305444",
        pageCount: 520,
        viewCount: 4670,
        favoriteCount: 1230,
        tags: ["法律", "经济"],
      },
      {
        id: 1201,
        title: "西方经济学(宏观)",
        author: "高鸿业",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/macroeco1201/400/560",
        description:
          "本书系统地介绍了宏观经济学的基本理论和方法，内容包括国民收入核算、简单国民收入决定理论、产品市场和货币市场的一般均衡等。",
        publisher: "中国人民大学出版社",
        publishDate: "2018-09-01",
        isbn: "9787300260114",
        pageCount: 450,
        viewCount: 5230,
        favoriteCount: 1380,
        tags: ["经济", "宏观"],
      },
      {
        id: 1202,
        title: "市场营销学",
        author: "菲利普·科特勒",
        price: 45.0,
        originalPrice: 62.0,
        image: "https://picsum.photos/seed/marketing1202/400/560",
        description:
          "本书系统地介绍了市场营销学的基本理论和方法，内容包括市场营销概述、市场营销环境分析、消费者市场和购买行为分析等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-01-01",
        isbn: "9787300262125",
        pageCount: 580,
        viewCount: 6450,
        favoriteCount: 1750,
        tags: ["营销", "专业"],
      },
      {
        id: 1203,
        title: "财务管理",
        author: "荆新",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/finance1203/400/560",
        description:
          "本书系统地介绍了财务管理的基本理论和方法，内容包括财务管理概述、财务报表分析、财务预测与计划、长期投资决策等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787300265850",
        pageCount: 520,
        viewCount: 5670,
        favoriteCount: 1520,
        tags: ["财务", "管理"],
      },
      {
        id: 1204,
        title: "货币银行学",
        author: "黄达",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/banking1204/400/560",
        description:
          "本书系统地介绍了货币银行学的基本理论和方法，内容包括货币与货币制度、信用与利率、金融市场、金融机构等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787300273005",
        pageCount: 560,
        viewCount: 5890,
        favoriteCount: 1620,
        tags: ["金融", "银行"],
      },
      {
        id: 1205,
        title: "国际金融",
        author: "姜波克",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/intfinance1205/400/560",
        description:
          "本书系统地介绍了国际金融的基本理论和方法，内容包括国际收支、外汇与汇率、国际储备、国际金融市场等。",
        publisher: "复旦大学出版社",
        publishDate: "2019-09-01",
        isbn: "9787309146656",
        pageCount: 490,
        viewCount: 5340,
        favoriteCount: 1450,
        tags: ["金融", "国际"],
      },
      {
        id: 1206,
        title: "国际贸易理论",
        author: "薛荣久",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/trade1206/400/560",
        description:
          "本书系统地介绍了国际贸易理论的基本理论和方法，内容包括国际贸易的基本概念和分类、古典国际贸易理论、新古典国际贸易理论等。",
        publisher: "对外经济贸易大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787566320342",
        pageCount: 460,
        viewCount: 4890,
        favoriteCount: 1320,
        tags: ["贸易", "理论"],
      },
      {
        id: 1301,
        title: "国际贸易实务",
        author: "黎孝先",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/tradeprac1301/400/560",
        description:
          "本书系统地介绍了国际贸易实务的基本理论和方法，内容包括国际贸易术语、商品的品质、数量和包装、国际货物运输等。",
        publisher: "对外经济贸易大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787566320359",
        pageCount: 520,
        viewCount: 5120,
        favoriteCount: 1380,
        tags: ["贸易", "实务"],
      },
      {
        id: 1302,
        title: "电子商务",
        author: "黄敏学",
        price: 45.0,
        originalPrice: 62.0,
        image: "https://picsum.photos/seed/ecommerce1302/400/560",
        description:
          "本书系统地介绍了电子商务的基本理论和方法，内容包括电子商务概述、电子商务技术基础、电子商务安全、电子商务支付等。",
        publisher: "高等教育出版社",
        publishDate: "2019-03-01",
        isbn: "9787040510907",
        pageCount: 550,
        viewCount: 5670,
        favoriteCount: 1520,
        tags: ["电商", "专业"],
      },
      {
        id: 1303,
        title: "证券投资学",
        author: "吴晓求",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/investment1303/400/560",
        description:
          "本书系统地介绍了证券投资学的基本理论和方法，内容包括证券投资概述、证券投资工具、证券市场、证券投资分析等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787300265867",
        pageCount: 580,
        viewCount: 6120,
        favoriteCount: 1680,
        tags: ["投资", "证券"],
      },
      {
        id: 1304,
        title: "期货市场",
        author: "张树忠",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/futures1304/400/560",
        description:
          "本书系统地介绍了期货市场的基本理论和方法，内容包括期货市场概述、期货合约与期货品种、期货交易制度、期货价格分析等。",
        publisher: "中国财政经济出版社",
        publishDate: "2019-09-01",
        isbn: "9787509589845",
        pageCount: 490,
        viewCount: 4890,
        favoriteCount: 1320,
        tags: ["期货", "市场"],
      },
      {
        id: 1305,
        title: "国际结算",
        author: "苏宗祥",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/settlement1305/400/560",
        description:
          "本书系统地介绍了国际结算的基本理论和方法，内容包括国际结算概述、国际结算工具、国际结算方式、国际结算融资等。",
        publisher: "中国金融出版社",
        publishDate: "2019-06-01",
        isbn: "9787504999833",
        pageCount: 460,
        viewCount: 4560,
        favoriteCount: 1230,
        tags: ["结算", "国际"],
      },
      {
        id: 1306,
        title: "商务谈判",
        author: "刘园",
        price: 40.0,
        originalPrice: 54.0,
        image: "https://picsum.photos/seed/negotiation1306/400/560",
        description:
          "本书系统地介绍了商务谈判的基本理论和方法，内容包括商务谈判概述、商务谈判的准备、商务谈判的策略与技巧等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787300265874",
        pageCount: 430,
        viewCount: 4340,
        favoriteCount: 1180,
        tags: ["谈判", "商务"],
      },
      // 人文学院补充课程
      {
        id: 1402,
        title: "文学理论",
        author: "童庆炳",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/literature1402/400/560",
        description:
          "本书系统地介绍了文学理论的基本理论和方法，内容包括文学理论的性质和形态、马克思主义文学理论与中国当代文学理论建设等。",
        publisher: "高等教育出版社",
        publishDate: "2019-03-01",
        isbn: "9787040510914",
        pageCount: 480,
        viewCount: 3980,
        favoriteCount: 1080,
        tags: ["文学", "理论"],
      },
      {
        id: 1403,
        title: "写作基础",
        author: "陈果安",
        price: 38.0,
        originalPrice: 52.0,
        image: "https://picsum.photos/seed/writing1403/400/560",
        description:
          "本书系统地介绍了写作基础的基本理论和方法，内容包括写作概述、写作的基本要素、写作的基本过程、各类文体的写作等。",
        publisher: "湖南师范大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787564834413",
        pageCount: 420,
        viewCount: 3670,
        favoriteCount: 980,
        tags: ["写作", "基础"],
      },
      {
        id: 1404,
        title: "现代汉语",
        author: "黄伯荣",
        price: 40.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/modernchinese1404/400/560",
        description:
          "本书系统地介绍了现代汉语的基本理论和方法，内容包括语音、文字、词汇、语法、修辞等。",
        publisher: "高等教育出版社",
        publishDate: "2019-04-01",
        isbn: "9787040510921",
        pageCount: 520,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["语言", "现代"],
      },
      {
        id: 1405,
        title: "古代汉语(上)",
        author: "王力",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/archaic1405/400/560",
        description:
          "本书系统地介绍了古代汉语的基本理论和方法，内容包括古代汉语的文字、词汇、语法、修辞等。",
        publisher: "中华书局",
        publishDate: "2018-12-01",
        isbn: "9787101132598",
        pageCount: 480,
        viewCount: 4340,
        favoriteCount: 1180,
        tags: ["语言", "古代"],
      },
      {
        id: 1406,
        title: "外国文学(上)",
        author: "郑克鲁",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/foreign1406/400/560",
        description:
          "本书系统地介绍了外国文学的基本理论和方法，内容包括古代文学、中世纪文学、文艺复兴时期文学、17世纪古典主义文学等。",
        publisher: "高等教育出版社",
        publishDate: "2019-03-01",
        isbn: "9787040510938",
        pageCount: 550,
        viewCount: 4670,
        favoriteCount: 1280,
        tags: ["文学", "外国"],
      },
      {
        id: 1501,
        title: "中国文学史(现当代)",
        author: "钱理群",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/modern1501/400/560",
        description:
          "本书系统地介绍了中国现当代文学的发展历程，内容包括五四文学革命、左翼文学运动、抗战文学、解放区文学等。",
        publisher: "北京大学出版社",
        publishDate: "2019-09-01",
        isbn: "9787301305451",
        pageCount: 580,
        viewCount: 4890,
        favoriteCount: 1320,
        tags: ["文学", "现当代"],
      },
      {
        id: 1502,
        title: "古代汉语(下)",
        author: "王力",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/archaic1502/400/560",
        description:
          "本书系统地介绍了古代汉语的基本理论和方法，内容包括古代汉语的文字、词汇、语法、修辞等。",
        publisher: "中华书局",
        publishDate: "2018-12-01",
        isbn: "9787101132604",
        pageCount: 480,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["语言", "古代"],
      },
      {
        id: 1503,
        title: "外国文学(下)",
        author: "郑克鲁",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/foreign1503/400/560",
        description:
          "本书系统地介绍了外国文学的基本理论和方法，内容包括18世纪启蒙文学、19世纪浪漫主义文学、19世纪现实主义文学等。",
        publisher: "高等教育出版社",
        publishDate: "2019-03-01",
        isbn: "9787040510945",
        pageCount: 550,
        viewCount: 4450,
        favoriteCount: 1230,
        tags: ["文学", "外国"],
      },
      {
        id: 1504,
        title: "语言学概论",
        author: "叶蜚声",
        price: 40.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/linguistics1504/400/560",
        description:
          "本书系统地介绍了语言学概论的基本理论和方法，内容包括语言的本质、语言的结构、语言的发展、语言的使用等。",
        publisher: "北京大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787301305468",
        pageCount: 430,
        viewCount: 3980,
        favoriteCount: 1080,
        tags: ["语言", "概论"],
      },
      {
        id: 1505,
        title: "美学原理",
        author: "朱立元",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/aesthetics1505/400/560",
        description:
          "本书系统地介绍了美学原理的基本理论和方法，内容包括美学的对象和范围、美学的学科性质和研究方法、美的本质等。",
        publisher: "华东师范大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787567588203",
        pageCount: 480,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["美学", "原理"],
      },
      {
        id: 1506,
        title: "比较文学",
        author: "陈惇",
        price: 45.0,
        originalPrice: 62.0,
        image: "https://picsum.photos/seed/comparative1506/400/560",
        description:
          "本书系统地介绍了比较文学的基本理论和方法，内容包括比较文学的定义和研究对象、比较文学的历史和现状、比较文学的基本类型等。",
        publisher: "高等教育出版社",
        publishDate: "2019-04-01",
        isbn: "9787040510952",
        pageCount: 490,
        viewCount: 3890,
        favoriteCount: 1050,
        tags: ["文学", "比较"],
      },
      {
        id: 1601,
        title: "古代文论",
        author: "张少康",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/classic1601/400/560",
        description:
          "本书系统地介绍了古代文论的基本理论和方法，内容包括先秦两汉文学理论、魏晋南北朝文学理论、唐宋文学理论等。",
        publisher: "北京大学出版社",
        publishDate: "2019-09-01",
        isbn: "9787301305475",
        pageCount: 480,
        viewCount: 3670,
        favoriteCount: 980,
        tags: ["文论", "古代"],
      },
      {
        id: 1602,
        title: "现当代文论",
        author: "王先霈",
        price: 40.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/moderncrit1602/400/560",
        description:
          "本书系统地介绍了现当代文论的基本理论和方法，内容包括现代主义文学理论、后现代主义文学理论、女性主义文学理论等。",
        publisher: "华中师范大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787562286126",
        pageCount: 450,
        viewCount: 3890,
        favoriteCount: 1020,
        tags: ["文论", "现当代"],
      },
      {
        id: 1603,
        title: "文化产业管理",
        author: "胡惠林",
        price: 48.0,
        originalPrice: 65.0,
        image: "https://picsum.photos/seed/culture1603/400/560",
        description:
          "本书系统地介绍了文化产业管理的基本理论和方法，内容包括文化产业概述、文化产业管理的基本理论、文化产业的发展战略等。",
        publisher: "上海交通大学出版社",
        publishDate: "2019-03-01",
        isbn: "9787313208745",
        pageCount: 520,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["文化", "产业"],
      },
      {
        id: 1604,
        title: "文学批评",
        author: "王一川",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/criticism1604/400/560",
        description:
          "本书系统地介绍了文学批评的基本理论和方法，内容包括文学批评的性质和功能、文学批评的历史和现状、文学批评的方法等。",
        publisher: "高等教育出版社",
        publishDate: "2019-05-01",
        isbn: "9787040510969",
        pageCount: 460,
        viewCount: 3980,
        favoriteCount: 1080,
        tags: ["文学", "批评"],
      },
      {
        id: 1605,
        title: "专业写作",
        author: "葛红兵",
        price: 40.0,
        originalPrice: 54.0,
        image: "https://picsum.photos/seed/professional1605/400/560",
        description:
          "本书系统地介绍了专业写作的基本理论和方法，内容包括专业写作的基本概念、专业写作的基本要素、专业写作的基本过程等。",
        publisher: "上海大学出版社",
        publishDate: "2019-08-01",
        isbn: "9787567135442",
        pageCount: 430,
        viewCount: 3670,
        favoriteCount: 980,
        tags: ["写作", "专业"],
      },
      {
        id: 1606,
        title: "媒介文化研究",
        author: "周宪",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/media1606/400/560",
        description:
          "本书系统地介绍了媒介文化研究的基本理论和方法，内容包括媒介文化概述、媒介文化的生产与消费、媒介文化的文本分析等。",
        publisher: "北京大学出版社",
        publishDate: "2019-09-01",
        isbn: "9787301305482",
        pageCount: 490,
        viewCount: 4120,
        favoriteCount: 1120,
        tags: ["媒介", "文化"],
      },
      // 管理学院补充课程
      {
        id: 1702,
        title: "组织行为学",
        author: "斯蒂芬·罗宾斯",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/org1702/400/560",
        description:
          "本书系统地介绍了组织行为学的基本理论和方法，内容包括组织行为学概述、个体行为、群体行为、组织行为等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787300265881",
        pageCount: 580,
        viewCount: 5670,
        favoriteCount: 1520,
        tags: ["管理", "组织"],
      },
      {
        id: 1703,
        title: "统计学原理",
        author: "贾俊平",
        price: 45.0,
        originalPrice: 62.0,
        image: "https://picsum.photos/seed/stats1703/400/560",
        description:
          "本书系统地介绍了统计学原理的基本理论和方法，内容包括统计数据的收集与整理、描述统计、概率与概率分布等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787300266031",
        pageCount: 430,
        viewCount: 5120,
        favoriteCount: 1380,
        tags: ["统计", "基础"],
      },
      {
        id: 1704,
        title: "会计学原理",
        author: "葛家澍",
        price: 40.0,
        originalPrice: 56.0,
        image: "https://picsum.photos/seed/accounting1704/400/560",
        description:
          "本书系统地介绍了会计学原理的基本理论和方法，内容包括会计的基本概念、会计要素与会计等式、账户与复式记账等。",
        publisher: "中国财政经济出版社",
        publishDate: "2019-08-01",
        isbn: "9787509589838",
        pageCount: 420,
        viewCount: 5430,
        favoriteCount: 1480,
        tags: ["会计", "基础"],
      },
      {
        id: 1705,
        title: "财务管理",
        author: "荆新",
        price: 45.0,
        originalPrice: 60.0,
        image: "https://picsum.photos/seed/finance1705/400/560",
        description:
          "本书系统地介绍了财务管理的基本理论和方法，内容包括财务管理概述、财务报表分析、财务预测与计划、长期投资决策等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-07-01",
        isbn: "9787300265850",
        pageCount: 520,
        viewCount: 5670,
        favoriteCount: 1520,
        tags: ["财务", "管理"],
      },
      {
        id: 1706,
        title: "市场营销学",
        author: "菲利普·科特勒",
        price: 42.0,
        originalPrice: 58.0,
        image: "https://picsum.photos/seed/marketing1706/400/560",
        description:
          "本书系统地介绍了市场营销学的基本理论和方法，内容包括市场营销概述、市场营销环境分析、消费者市场和购买行为分析等。",
        publisher: "中国人民大学出版社",
        publishDate: "2019-01-01",
        isbn: "9787300262125",
        pageCount: 580,
        viewCount: 6450,
        favoriteCount: 1750,
        tags: ["营销", "专业"],
      },
    ];

    // 将bookId转换为数字类型进行比较
    const bookIdNum = parseInt(this.data.bookId, 10);

    // 返回模拟图书数据库
    return mockBooksDatabase;
  },

  // 使用模拟数据（旧方法，用于兼容）
  useMockDataOld: function () {
    // 将bookId转换为数字类型进行比较
    const bookIdNum = parseInt(this.data.bookId, 10);
    const mockBooksDatabase = this.useMockData();

    // 查找对应的图书数据
    let bookData = mockBooksDatabase.find((book) => book.id === bookIdNum);

    // 如果找不到对应的图书，使用默认数据
    if (!bookData) {
      console.warn(`未找到ID为${this.data.bookId}的图书，使用默认数据`);
      bookData = {
        id: bookIdNum,
        title: "未知图书",
        author: "未知作者",
        price: 0,
        originalPrice: 0,
        image: `https://picsum.photos/seed/${this.data.bookId}/400/560`,
        description: "暂无图书描述信息",
        publisher: "未知出版社",
        publishDate: "2023-01-01",
        isbn: "0000000000000",
        pageCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        tags: ["未知"],
      };
    }

    this.setData({
      bookDetail: bookData,
      loading: false,
    });

    // 记录浏览历史
    this.recordBrowseHistory(bookData);
  },

  // 检查收藏状态
  checkFavoriteStatus: function () {
    // 从本地存储获取收藏列表
    const favorites = wx.getStorageSync("favorites") || [];
    const isFavorited = favorites.some(
      (fav) => fav.bookId === parseInt(this.data.bookId, 10),
    );

    this.setData({
      isFavorited: isFavorited,
    });
  },

  // 记录浏览历史
  recordBrowseHistory: function (book) {
    // 从本地存储获取历史记录
    let history = wx.getStorageSync("browseHistory") || [];

    // 移除已存在的相同图书记录
    history = history.filter((item) => item.bookId !== book.id);

    // 添加到历史记录开头
    const now = new Date();
    const viewTime = `${this.formatDate(now)} ${this.formatTime(now)}`;

    history.unshift({
      id: "h" + now.getTime(),
      bookId: book.id,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        image: book.image,
        publisher: book.publisher,
        publishDate: book.publishDate,
        viewCount: book.viewCount,
      },
      viewTime: viewTime,
    });

    // 限制历史记录数量
    if (history.length > 20) {
      history = history.slice(0, 20);
    }

    // 保存到本地存储
    wx.setStorageSync("browseHistory", history);
  },

  // 格式化日期
  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  // 格式化时间
  formatTime: function (date) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  },

  // 添加或取消收藏
  toggleFavorite: function () {
    let favorites = wx.getStorageSync("favorites") || [];
    const bookIdNum = parseInt(this.data.bookId, 10);
    const isCurrentlyFavorited = favorites.some(
      (fav) => fav.bookId === bookIdNum,
    );

    if (isCurrentlyFavorited) {
      // 取消收藏
      favorites = favorites.filter((fav) => fav.bookId !== bookIdNum);
      wx.showToast({
        title: "已取消收藏",
        icon: "success",
      });
    } else {
      // 添加收藏
      favorites.push({
        id: "f" + Date.now(),
        bookId: bookIdNum,
        book: this.data.bookDetail,
        favoriteTime:
          this.formatDate(new Date()) + " " + this.formatTime(new Date()),
      });
      wx.showToast({
        title: "收藏成功",
        icon: "success",
      });
    }

    wx.setStorageSync("favorites", favorites);

    this.setData({
      isFavorited: !isCurrentlyFavorited,
    });
  },

  // 增加数量
  increaseQuantity: function () {
    this.setData({
      quantity: this.data.quantity + 1,
    });
  },

  // 减少数量
  decreaseQuantity: function () {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1,
      });
    }
  },

  // 添加到购物车
  addToCart: function () {
    // 获取购物车数据
    let cart = wx.getStorageSync("cart") || [];
    const bookIdNum = parseInt(this.data.bookId, 10);
    const bookDetail = this.data.bookDetail;

    // 检查是否已存在
    const index = cart.findIndex((item) => item.bookId == bookIdNum);

    if (index > -1) {
      // 已存在，增加数量
      cart[index].quantity += this.data.quantity;
    } else {
      // 不存在，添加新项（只使用默认图片，避免大图片）
      cart.push({
        id: "c" + Date.now(),
        bookId: bookIdNum,
        title: bookDetail.title,
        author: bookDetail.author,
        price: bookDetail.price,
        image: '/Default.jpg',
        quantity: this.data.quantity,
        selected: false
      });
    }

    // 保存购物车数据
    try {
      wx.setStorageSync("cart", cart);
    } catch (e) {
      console.error('保存购物车失败:', e);
      // 如果保存失败，清理旧数据重试
      this.cleanupStorage();
      wx.setStorageSync("cart", cart);
    }

    // 显示成功提示
    wx.showToast({
      title: "已加入购物车",
      icon: "success",
    });
  },

  // 立即购买
  buyNow: function () {
    // 先添加到购物车
    this.addToCart();

    // 跳转到购物车页面
    wx.navigateTo({
      url: "/pages/cart/cart",
    });
  },

  // 立即购买（直接跳转到结算页面）
  buyBook: function () {
    const bookIdNum = parseInt(this.data.bookId, 10);
    const bookDetail = this.data.bookDetail;
    const quantity = this.data.quantity;

    // 准备结算数据
    const checkoutItem = {
      bookId: bookIdNum,
      title: bookDetail.title,
      author: bookDetail.author,
      price: bookDetail.price,
      image: bookDetail.image,
      quantity: quantity,
    };

    // 保存到全局数据
    const app = getApp();
    app.globalData.checkoutItems = [checkoutItem];

    // 跳转到结算页面
    wx.navigateTo({
      url: "/pages/checkout/checkout",
    });
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack();
  },

  // 清理存储空间
  cleanupStorage: function() {
    console.log('开始清理存储空间...');
    try {
      // 清理购物车中的大图片
      let cart = wx.getStorageSync('cart') || [];
      cart = cart.map(item => ({
        ...item,
        image: '/Default.jpg'
      }));
      wx.setStorageSync('cart', cart);

      // 清理发布图书中的大图片
      let publishedBooks = wx.getStorageSync('publishedBooks') || [];
      publishedBooks = publishedBooks.map(book => ({
        ...book,
        image: '/Default.jpg'
      }));
      wx.setStorageSync('publishedBooks', publishedBooks);

      // 清理本地图书中的大图片
      let localBooks = wx.getStorageSync('localBooks') || [];
      localBooks = localBooks.map(book => ({
        ...book,
        image: '/Default.jpg'
      }));
      wx.setStorageSync('localBooks', localBooks);

      // 清理浏览历史
      wx.removeStorageSync('browseHistory');

      console.log('存储空间清理完成');
      wx.showToast({
        title: '已清理存储空间',
        icon: 'success'
      });
    } catch (e) {
      console.error('清理存储失败:', e);
    }
  },
});
