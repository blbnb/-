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
    // 模拟不同学院的课程数据，按年级和学期组织
    let gradeSemesterBooks = {
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

    // 根据不同学院设置不同的课程数据
    switch(category) {
      case '计算机学院':
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 101, title: 'C语言程序设计', price: 35.00, image: 'https://picsum.photos/seed/cbook101/300/400' },
              { id: 102, title: '高等数学A(上)', price: 42.00, image: 'https://picsum.photos/seed/math102/300/400' },
              { id: 103, title: '线性代数', price: 38.00, image: 'https://picsum.photos/seed/linear103/300/400' }
            ],
            '下学期': [
              { id: 104, title: 'C++程序设计', price: 38.00, image: 'https://picsum.photos/seed/cpp104/300/400' },
              { id: 105, title: '高等数学A(下)', price: 42.00, image: 'https://picsum.photos/seed/math105/300/400' },
              { id: 106, title: '大学物理(上)', price: 40.00, image: 'https://picsum.photos/seed/physics106/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 201, title: '数据结构', price: 48.00, image: 'https://picsum.photos/seed/ds201/300/400' },
              { id: 202, title: 'Java程序设计', price: 45.00, image: 'https://picsum.photos/seed/java202/300/400' },
              { id: 203, title: '离散数学', price: 42.00, image: 'https://picsum.photos/seed/discrete203/300/400' }
            ],
            '下学期': [
              { id: 204, title: '操作系统', price: 55.00, image: 'https://picsum.photos/seed/os204/300/400' },
              { id: 205, title: '数据库系统原理', price: 50.00, image: 'https://picsum.photos/seed/db205/300/400' },
              { id: 206, title: '计算机组成原理', price: 52.00, image: 'https://picsum.photos/seed/cpu206/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 301, title: '计算机网络', price: 48.00, image: 'https://picsum.photos/seed/net301/300/400' },
              { id: 302, title: '软件工程', price: 48.00, image: 'https://picsum.photos/seed/se302/300/400' },
              { id: 303, title: '算法设计与分析', price: 52.00, image: 'https://picsum.photos/seed/algo303/300/400' }
            ],
            '下学期': [
              { id: 304, title: '编译原理', price: 50.00, image: 'https://picsum.photos/seed/compiler304/300/400' },
              { id: 305, title: '人工智能导论', price: 55.00, image: 'https://picsum.photos/seed/ai305/300/400' },
              { id: 306, title: 'Web前端开发', price: 45.00, image: 'https://picsum.photos/seed/web306/300/400' }
            ]
          }
        };
        break;
        
      case '机电学院':
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 401, title: '工程图学', price: 45.00, image: 'https://picsum.photos/seed/draw401/300/400' },
              { id: 402, title: '机械工程基础', price: 42.00, image: 'https://picsum.photos/seed/mech402/300/400' },
              { id: 403, title: '高等数学A(上)', price: 42.00, image: 'https://picsum.photos/seed/math403/300/400' }
            ],
            '下学期': [
              { id: 404, title: '工程力学', price: 48.00, image: 'https://picsum.photos/seed/engmech404/300/400' },
              { id: 405, title: '高等数学A(下)', price: 42.00, image: 'https://picsum.photos/seed/math405/300/400' },
              { id: 406, title: '大学物理(上)', price: 40.00, image: 'https://picsum.photos/seed/physics406/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 501, title: '理论力学', price: 48.00, image: 'https://picsum.photos/seed/mechanics501/300/400' },
              { id: 502, title: '材料力学', price: 50.00, image: 'https://picsum.photos/seed/material502/300/400' },
              { id: 503, title: '机械原理', price: 52.00, image: 'https://picsum.photos/seed/principle503/300/400' }
            ],
            '下学期': [
              { id: 504, title: '机械设计', price: 55.00, image: 'https://picsum.photos/seed/design504/300/400' },
              { id: 505, title: '互换性与测量技术', price: 45.00, image: 'https://picsum.photos/seed/tolerance505/300/400' },
              { id: 506, title: '电工学', price: 42.00, image: 'https://picsum.photos/seed/electrical506/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 601, title: '液压与气压传动', price: 48.00, image: 'https://picsum.photos/seed/hydraulic601/300/400' },
              { id: 602, title: '控制工程基础', price: 52.00, image: 'https://picsum.photos/seed/control602/300/400' },
              { id: 603, title: '机械制造技术基础', price: 55.00, image: 'https://picsum.photos/seed/manufacturing603/300/400' }
            ],
            '下学期': [
              { id: 604, title: '机电传动控制', price: 50.00, image: 'https://picsum.photos/seed/mecdrive604/300/400' },
              { id: 605, title: '数控技术', price: 52.00, image: 'https://picsum.photos/seed/cnc605/300/400' },
              { id: 606, title: 'CAD/CAM技术', price: 48.00, image: 'https://picsum.photos/seed/cadcam606/300/400' }
            ]
          }
        };
        break;
        
      case '电信学院':
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 701, title: '电路分析基础', price: 45.00, image: 'https://picsum.photos/seed/circuit701/300/400' },
              { id: 702, title: '高等数学A(上)', price: 42.00, image: 'https://picsum.photos/seed/math702/300/400' },
              { id: 703, title: '大学物理(上)', price: 40.00, image: 'https://picsum.photos/seed/physics703/300/400' }
            ],
            '下学期': [
              { id: 704, title: '模拟电子技术基础', price: 48.00, image: 'https://picsum.photos/seed/analog704/300/400' },
              { id: 705, title: '高等数学A(下)', price: 42.00, image: 'https://picsum.photos/seed/math705/300/400' },
              { id: 706, title: '大学物理(下)', price: 40.00, image: 'https://picsum.photos/seed/physics706/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 801, title: '数字电子技术', price: 48.00, image: 'https://picsum.photos/seed/digital801/300/400' },
              { id: 802, title: '信号与系统', price: 52.00, image: 'https://picsum.photos/seed/signals802/300/400' },
              { id: 803, title: '电磁场与电磁波', price: 45.00, image: 'https://picsum.photos/seed/emfield803/300/400' }
            ],
            '下学期': [
              { id: 804, title: '高频电子线路', price: 48.00, image: 'https://picsum.photos/seed/hf804/300/400' },
              { id: 805, title: '自动控制原理', price: 50.00, image: 'https://picsum.photos/seed/control805/300/400' },
              { id: 806, title: '通信原理', price: 55.00, image: 'https://picsum.photos/seed/comm806/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 901, title: '数字信号处理', price: 52.00, image: 'https://picsum.photos/seed/dsp901/300/400' },
              { id: 902, title: '微机原理与接口技术', price: 48.00, image: 'https://picsum.photos/seed/micro902/300/400' },
              { id: 903, title: '单片机原理及应用', price: 45.00, image: 'https://picsum.photos/seed/mcu903/300/400' }
            ],
            '下学期': [
              { id: 904, title: '嵌入式系统', price: 55.00, image: 'https://picsum.photos/seed/embedded904/300/400' },
              { id: 905, title: '光纤通信', price: 50.00, image: 'https://picsum.photos/seed/fiber905/300/400' },
              { id: 906, title: '移动通信', price: 52.00, image: 'https://picsum.photos/seed/mobile906/300/400' }
            ]
          }
        };
        break;
        
      case '经贸学院':
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 1101, title: '西方经济学(微观)', price: 42.00, image: 'https://picsum.photos/seed/microeco1101/300/400' },
              { id: 1102, title: '管理学原理', price: 38.00, image: 'https://picsum.photos/seed/management1102/300/400' },
              { id: 1103, title: '会计学原理', price: 40.00, image: 'https://picsum.photos/seed/accounting1103/300/400' }
            ],
            '下学期': [
              { id: 1104, title: '统计学原理', price: 40.00, image: 'https://picsum.photos/seed/stats1104/300/400' },
              { id: 1105, title: '财政学', price: 38.00, image: 'https://picsum.photos/seed/finance1105/300/400' },
              { id: 1106, title: '经济法', price: 42.00, image: 'https://picsum.photos/seed/law1106/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 1201, title: '西方经济学(宏观)', price: 42.00, image: 'https://picsum.photos/seed/macroeco1201/300/400' },
              { id: 1202, title: '市场营销学', price: 45.00, image: 'https://picsum.photos/seed/marketing1202/300/400' },
              { id: 1203, title: '财务管理', price: 48.00, image: 'https://picsum.photos/seed/finance1203/300/400' }
            ],
            '下学期': [
              { id: 1204, title: '货币银行学', price: 45.00, image: 'https://picsum.photos/seed/banking1204/300/400' },
              { id: 1205, title: '国际金融', price: 48.00, image: 'https://picsum.photos/seed/intfinance1205/300/400' },
              { id: 1206, title: '国际贸易理论', price: 45.00, image: 'https://picsum.photos/seed/trade1206/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 1301, title: '国际贸易实务', price: 48.00, image: 'https://picsum.photos/seed/tradeprac1301/300/400' },
              { id: 1302, title: '电子商务', price: 45.00, image: 'https://picsum.photos/seed/ecommerce1302/300/400' },
              { id: 1303, title: '证券投资学', price: 48.00, image: 'https://picsum.photos/seed/investment1303/300/400' }
            ],
            '下学期': [
              { id: 1304, title: '期货市场', price: 45.00, image: 'https://picsum.photos/seed/futures1304/300/400' },
              { id: 1305, title: '国际结算', price: 42.00, image: 'https://picsum.photos/seed/settlement1305/300/400' },
              { id: 1306, title: '商务谈判', price: 40.00, image: 'https://picsum.photos/seed/negotiation1306/300/400' }
            ]
          }
        };
        break;
        
      case '人文学院':
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 1401, title: '中国文学史(古代)', price: 45.00, image: 'https://picsum.photos/seed/chinese1401/300/400' },
              { id: 1402, title: '文学理论', price: 42.00, image: 'https://picsum.photos/seed/literature1402/300/400' },
              { id: 1403, title: '写作基础', price: 38.00, image: 'https://picsum.photos/seed/writing1403/300/400' }
            ],
            '下学期': [
              { id: 1404, title: '现代汉语', price: 40.00, image: 'https://picsum.photos/seed/modernchinese1404/300/400' },
              { id: 1405, title: '古代汉语(上)', price: 42.00, image: 'https://picsum.photos/seed/archaic1405/300/400' },
              { id: 1406, title: '外国文学(上)', price: 45.00, image: 'https://picsum.photos/seed/foreign1406/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 1501, title: '中国文学史(现当代)', price: 45.00, image: 'https://picsum.photos/seed/modern1501/300/400' },
              { id: 1502, title: '古代汉语(下)', price: 42.00, image: 'https://picsum.photos/seed/archaic1502/300/400' },
              { id: 1503, title: '外国文学(下)', price: 45.00, image: 'https://picsum.photos/seed/foreign1503/300/400' }
            ],
            '下学期': [
              { id: 1504, title: '语言学概论', price: 40.00, image: 'https://picsum.photos/seed/linguistics1504/300/400' },
              { id: 1505, title: '美学原理', price: 42.00, image: 'https://picsum.photos/seed/aesthetics1505/300/400' },
              { id: 1506, title: '比较文学', price: 45.00, image: 'https://picsum.photos/seed/comparative1506/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 1601, title: '古代文论', price: 42.00, image: 'https://picsum.photos/seed/classic1601/300/400' },
              { id: 1602, title: '现当代文论', price: 40.00, image: 'https://picsum.photos/seed/moderncrit1602/300/400' },
              { id: 1603, title: '文化产业管理', price: 48.00, image: 'https://picsum.photos/seed/culture1603/300/400' }
            ],
            '下学期': [
              { id: 1604, title: '文学批评', price: 42.00, image: 'https://picsum.photos/seed/criticism1604/300/400' },
              { id: 1605, title: '专业写作', price: 40.00, image: 'https://picsum.photos/seed/professional1605/300/400' },
              { id: 1606, title: '媒介文化研究', price: 45.00, image: 'https://picsum.photos/seed/media1606/300/400' }
            ]
          }
        };
        break;
        
      case '管理学院':
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 1701, title: '管理学原理', price: 40.00, image: 'https://picsum.photos/seed/mgmt1701/300/400' },
              { id: 1702, title: '组织行为学', price: 42.00, image: 'https://picsum.photos/seed/org1702/300/400' },
              { id: 1703, title: '统计学原理', price: 45.00, image: 'https://picsum.photos/seed/stats1703/300/400' }
            ],
            '下学期': [
              { id: 1704, title: '会计学原理', price: 40.00, image: 'https://picsum.photos/seed/accounting1704/300/400' },
              { id: 1705, title: '财务管理', price: 45.00, image: 'https://picsum.photos/seed/finance1705/300/400' },
              { id: 1706, title: '市场营销学', price: 42.00, image: 'https://picsum.photos/seed/marketing1706/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 1801, title: '人力资源管理', price: 45.00, image: 'https://picsum.photos/seed/hr1801/300/400' },
              { id: 1802, title: '运营管理', price: 48.00, image: 'https://picsum.photos/seed/operations1802/300/400' },
              { id: 1803, title: '战略管理', price: 45.00, image: 'https://picsum.photos/seed/strategy1803/300/400' }
            ],
            '下学期': [
              { id: 1804, title: '管理信息系统', price: 50.00, image: 'https://picsum.photos/seed/mis1804/300/400' },
              { id: 1805, title: '质量管理', price: 42.00, image: 'https://picsum.photos/seed/quality1805/300/400' },
              { id: 1806, title: '项目管理', price: 48.00, image: 'https://picsum.photos/seed/project1806/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 1901, title: '企业战略管理', price: 48.00, image: 'https://picsum.photos/seed/corpstrat1901/300/400' },
              { id: 1902, title: '供应链管理', price: 52.00, image: 'https://picsum.photos/seed/supply1902/300/400' },
              { id: 1903, title: '管理决策分析', price: 45.00, image: 'https://picsum.photos/seed/decision1903/300/400' }
            ],
            '下学期': [
              { id: 1904, title: '创新创业管理', price: 45.00, image: 'https://picsum.photos/seed/innovation1904/300/400' },
              { id: 1905, title: '国际企业管理', price: 48.00, image: 'https://picsum.photos/seed/international1905/300/400' },
              { id: 1906, title: '管理心理学', price: 42.00, image: 'https://picsum.photos/seed/psychology1906/300/400' }
            ]
          }
        };
        break;
        
      case '外国语学院':
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 2001, title: '综合英语(1)', price: 42.00, image: 'https://picsum.photos/seed/english2001/300/400' },
              { id: 2002, title: '英语听力(1)', price: 38.00, image: 'https://picsum.photos/seed/listening2002/300/400' },
              { id: 2003, title: '英语写作(1)', price: 40.00, image: 'https://picsum.photos/seed/engwrite2003/300/400' }
            ],
            '下学期': [
              { id: 2004, title: '综合英语(2)', price: 42.00, image: 'https://picsum.photos/seed/english2004/300/400' },
              { id: 2005, title: '英语听力(2)', price: 38.00, image: 'https://picsum.photos/seed/listening2005/300/400' },
              { id: 2006, title: '英语写作(2)', price: 40.00, image: 'https://picsum.photos/seed/engwrite2006/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 2101, title: '综合英语(3)', price: 42.00, image: 'https://picsum.photos/seed/english2101/300/400' },
              { id: 2102, title: '英语听力(3)', price: 38.00, image: 'https://picsum.photos/seed/listening2102/300/400' },
              { id: 2103, title: '英语国家概况', price: 45.00, image: 'https://picsum.photos/seed/countries2103/300/400' }
            ],
            '下学期': [
              { id: 2104, title: '综合英语(4)', price: 42.00, image: 'https://picsum.photos/seed/english2104/300/400' },
              { id: 2105, title: '英语听力(4)', price: 38.00, image: 'https://picsum.photos/seed/listening2105/300/400' },
              { id: 2106, title: '英美文学选读', price: 45.00, image: 'https://picsum.photos/seed/literature2106/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 2201, title: '翻译理论与实践', price: 48.00, image: 'https://picsum.photos/seed/translation2201/300/400' },
              { id: 2202, title: '语言学导论', price: 45.00, image: 'https://picsum.photos/seed/ling2202/300/400' },
              { id: 2203, title: '高级英语写作', price: 42.00, image: 'https://picsum.photos/seed/advanced2203/300/400' }
            ],
            '下学期': [
              { id: 2204, title: '商务英语', price: 45.00, image: 'https://picsum.photos/seed/business2204/300/400' },
              { id: 2205, title: '跨文化交际', price: 42.00, image: 'https://picsum.photos/seed/crosscultural2205/300/400' },
              { id: 2206, title: '英语教学法', price: 40.00, image: 'https://picsum.photos/seed/methodology2206/300/400' }
            ]
          }
        };
        break;
        
      default:
        // 为其他学院设置默认课程数据
        gradeSemesterBooks = {
          '大一': {
            '上学期': [
              { id: 3001, title: '大学英语(1)', price: 35.00, image: 'https://picsum.photos/seed/genenglish3001/300/400' },
              { id: 3002, title: '高等数学B(上)', price: 40.00, image: 'https://picsum.photos/seed/genmath3002/300/400' },
              { id: 3003, title: '思想道德与法治', price: 32.00, image: 'https://picsum.photos/seed/ethics3003/300/400' }
            ],
            '下学期': [
              { id: 3004, title: '大学英语(2)', price: 35.00, image: 'https://picsum.photos/seed/genenglish3004/300/400' },
              { id: 3005, title: '高等数学B(下)', price: 40.00, image: 'https://picsum.photos/seed/genmath3005/300/400' },
              { id: 3006, title: '大学近现代史纲要', price: 32.00, image: 'https://picsum.photos/seed/history3006/300/400' }
            ]
          },
          '大二': {
            '上学期': [
              { id: 3101, title: '大学物理(上)', price: 40.00, image: 'https://picsum.photos/seed/genphysics3101/300/400' },
              { id: 3102, title: '马克思主义基本原理', price: 35.00, image: 'https://picsum.photos/seed/marx3102/300/400' },
              { id: 3103, title: '大学英语(3)', price: 35.00, image: 'https://picsum.photos/seed/genenglish3103/300/400' }
            ],
            '下学期': [
              { id: 3104, title: '大学物理(下)', price: 40.00, image: 'https://picsum.photos/seed/genphysics3104/300/400' },
              { id: 3105, title: '毛泽东思想和中国特色社会主义理论体系概论', price: 38.00, image: 'https://picsum.photos/seed/mzm3105/300/400' },
              { id: 3106, title: '大学英语(4)', price: 35.00, image: 'https://picsum.photos/seed/genenglish3106/300/400' }
            ]
          },
          '大三': {
            '上学期': [
              { id: 3201, title: '专业英语', price: 40.00, image: 'https://picsum.photos/seed/profeng3201/300/400' },
              { id: 3202, title: '创新创业基础', price: 38.00, image: 'https://picsum.photos/seed/innovation3202/300/400' },
              { id: 3203, title: '就业指导', price: 32.00, image: 'https://picsum.photos/seed/career3203/300/400' }
            ],
            '下学期': [
              { id: 3204, title: '专业前沿讲座', price: 35.00, image: 'https://picsum.photos/seed/frontier3204/300/400' },
              { id: 3205, title: '毕业论文写作指导', price: 30.00, image: 'https://picsum.photos/seed/thesis3205/300/400' },
              { id: 3206, title: '社会实践', price: 28.00, image: 'https://picsum.photos/seed/social3206/300/400' }
            ]
          }
        };
    }

    // 更新页面数据
    this.setData({
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
    
    // 数据加载完成后更新当前选中的数据
    this.updateCurrentData();
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