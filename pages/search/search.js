// pages/search/search.js
const app = getApp();

Page({
  data: {
    keyword: '',
    searchResults: [],
    loading: false,
    noResults: false,
    hotKeywords: ['JavaScript', '数据结构', '算法', 'Python', '经济学', '编译原理', '操作系统', '数据库']
  },

  onLoad: function(options) {
    if (options.keyword) {
      this.setData({ keyword: options.keyword });
      this.performSearch(options.keyword);
    }
  },

  // 输入框内容变化时触发
  onInput: function(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 点击搜索按钮或回车时触发
  onSearch: function() {
    const keyword = this.data.keyword.trim();
    if (keyword) {
      this.performSearch(keyword);
      
      // 保存搜索历史
      this.saveSearchHistory(keyword);
    }
  },

  // 获取所有学院的专业书籍数据（与分类页面一致）
  getAllCollegeBooks: function() {
    let allBooks = [];
    
    // 整合分类页面中的所有学院专业书籍数据
    const collegeBooksData = {
      '计算机学院': {
        '大一': {
          '上学期': [
            { id: 101, title: 'C语言程序设计', price: 35.00, originalPrice: 48.00, author: '谭浩强', image: 'https://picsum.photos/seed/cbook101/300/400', tags: ['计算机', '大一', '专业'], college: '计算机学院' },
            { id: 102, title: '高等数学A(上)', price: 42.00, originalPrice: 56.00, author: '同济大学', image: 'https://picsum.photos/seed/math102/300/400', tags: ['数学', '大一', '公共'], college: '计算机学院' },
            { id: 103, title: '线性代数', price: 38.00, originalPrice: 52.00, author: '同济大学', image: 'https://picsum.photos/seed/linear103/300/400', tags: ['数学', '大一', '公共'], college: '计算机学院' }
          ],
          '下学期': [
            { id: 104, title: 'C++程序设计', price: 38.00, originalPrice: 52.00, author: '郑莉', image: 'https://picsum.photos/seed/cpp104/300/400', tags: ['计算机', '大一', '专业'], college: '计算机学院' },
            { id: 105, title: '高等数学A(下)', price: 42.00, originalPrice: 56.00, author: '同济大学', image: 'https://picsum.photos/seed/math105/300/400', tags: ['数学', '大一', '公共'], college: '计算机学院' },
            { id: 106, title: '大学物理(上)', price: 40.00, originalPrice: 54.00, author: '张三', image: 'https://picsum.photos/seed/physics106/300/400', tags: ['物理', '大一', '公共'], college: '计算机学院' }
          ]
        },
        '大二': {
          '上学期': [
            { id: 201, title: '数据结构', price: 48.00, originalPrice: 65.00, author: '严蔚敏', image: 'https://picsum.photos/seed/ds201/300/400', tags: ['计算机', '大二', '专业'], college: '计算机学院' },
            { id: 202, title: 'Java程序设计', price: 45.00, originalPrice: 60.00, author: '李刚', image: 'https://picsum.photos/seed/java202/300/400', tags: ['计算机', '大二', '专业'], college: '计算机学院' },
            { id: 203, title: '离散数学', price: 42.00, originalPrice: 58.00, author: '屈婉玲', image: 'https://picsum.photos/seed/discrete203/300/400', tags: ['数学', '大二', '专业'], college: '计算机学院' }
          ],
          '下学期': [
            { id: 204, title: '操作系统', price: 55.00, originalPrice: 75.00, author: '汤小丹', image: 'https://picsum.photos/seed/os204/300/400', tags: ['计算机', '大二', '专业'], college: '计算机学院' },
            { id: 205, title: '数据库系统原理', price: 50.00, originalPrice: 68.00, author: '王珊', image: 'https://picsum.photos/seed/db205/300/400', tags: ['计算机', '大二', '专业'], college: '计算机学院' },
            { id: 206, title: '计算机组成原理', price: 52.00, originalPrice: 70.00, author: '唐朔飞', image: 'https://picsum.photos/seed/cpu206/300/400', tags: ['计算机', '大二', '专业'], college: '计算机学院' }
          ]
        },
        '大三': {
          '上学期': [
            { id: 301, title: '计算机网络', price: 48.00, originalPrice: 65.00, author: '谢希仁', image: 'https://picsum.photos/seed/net301/300/400', tags: ['计算机', '大三', '专业'], college: '计算机学院' },
            { id: 302, title: '软件工程', price: 48.00, originalPrice: 65.00, author: '张海藩', image: 'https://picsum.photos/seed/se302/300/400', tags: ['计算机', '大三', '专业'], college: '计算机学院' },
            { id: 303, title: '算法设计与分析', price: 52.00, originalPrice: 72.00, author: '王晓东', image: 'https://picsum.photos/seed/algo303/300/400', tags: ['计算机', '大三', '专业'], college: '计算机学院' }
          ],
          '下学期': [
            { id: 304, title: '编译原理', price: 50.00, originalPrice: 70.00, author: '陈火旺', image: 'https://picsum.photos/seed/compiler304/300/400', tags: ['计算机', '大三', '专业'], college: '计算机学院' },
            { id: 305, title: '人工智能导论', price: 55.00, originalPrice: 78.00, author: ' Stuart Russell', image: 'https://picsum.photos/seed/ai305/300/400', tags: ['计算机', '大三', '专业'], college: '计算机学院' },
            { id: 306, title: 'Web前端开发', price: 45.00, originalPrice: 62.00, author: '李战', image: 'https://picsum.photos/seed/web306/300/400', tags: ['计算机', '大三', '专业'], college: '计算机学院' }
          ]
        }
      },
      '机电学院': {
        '大一': {
          '上学期': [
            { id: 401, title: '工程图学', price: 45.00, originalPrice: 60.00, author: '华楚生', image: 'https://picsum.photos/seed/draw401/300/400', tags: ['机电', '大一', '专业'], college: '机电学院' },
            { id: 402, title: '机械工程基础', price: 42.00, originalPrice: 56.00, author: '杨可桢', image: 'https://picsum.photos/seed/mech402/300/400', tags: ['机电', '大一', '专业'], college: '机电学院' },
            { id: 403, title: '高等数学A(上)', price: 42.00, originalPrice: 56.00, author: '同济大学', image: 'https://picsum.photos/seed/math403/300/400', tags: ['数学', '大一', '公共'], college: '机电学院' }
          ],
          '下学期': [
            { id: 404, title: '工程力学', price: 48.00, originalPrice: 65.00, author: '孙训方', image: 'https://picsum.photos/seed/engmech404/300/400', tags: ['力学', '大一', '专业'], college: '机电学院' },
            { id: 405, title: '高等数学A(下)', price: 42.00, originalPrice: 56.00, author: '同济大学', image: 'https://picsum.photos/seed/math405/300/400', tags: ['数学', '大一', '公共'], college: '机电学院' },
            { id: 406, title: '大学物理(上)', price: 40.00, originalPrice: 54.00, author: '张三', image: 'https://picsum.photos/seed/physics406/300/400', tags: ['物理', '大一', '公共'], college: '机电学院' }
          ]
        },
        '大二': {
          '上学期': [
            { id: 501, title: '理论力学', price: 48.00, originalPrice: 65.00, author: '哈工大', image: 'https://picsum.photos/seed/mechanics501/300/400', tags: ['力学', '大二', '专业'], college: '机电学院' },
            { id: 502, title: '材料力学', price: 50.00, originalPrice: 68.00, author: '刘鸿文', image: 'https://picsum.photos/seed/material502/300/400', tags: ['力学', '大二', '专业'], college: '机电学院' },
            { id: 503, title: '机械原理', price: 52.00, originalPrice: 70.00, author: '孙恒', image: 'https://picsum.photos/seed/principle503/300/400', tags: ['机电', '大二', '专业'], college: '机电学院' }
          ],
          '下学期': [
            { id: 504, title: '机械设计', price: 55.00, originalPrice: 75.00, author: '濮良贵', image: 'https://picsum.photos/seed/design504/300/400', tags: ['机电', '大二', '专业'], college: '机电学院' },
            { id: 505, title: '互换性与测量技术', price: 45.00, originalPrice: 60.00, author: '廖念钊', image: 'https://picsum.photos/seed/tolerance505/300/400', tags: ['机电', '大二', '专业'], college: '机电学院' },
            { id: 506, title: '电工学', price: 42.00, originalPrice: 58.00, author: '秦曾煌', image: 'https://picsum.photos/seed/electrical506/300/400', tags: ['电气', '大二', '专业'], college: '机电学院' }
          ]
        },
        '大三': {
          '上学期': [
            { id: 601, title: '液压与气压传动', price: 48.00, originalPrice: 65.00, author: '左健民', image: 'https://picsum.photos/seed/hydraulic601/300/400', tags: ['机电', '大三', '专业'], college: '机电学院' },
            { id: 602, title: '控制工程基础', price: 52.00, originalPrice: 72.00, author: '胡寿松', image: 'https://picsum.photos/seed/control602/300/400', tags: ['控制', '大三', '专业'], college: '机电学院' },
            { id: 603, title: '机械制造技术基础', price: 55.00, originalPrice: 75.00, author: '卢秉恒', image: 'https://picsum.photos/seed/manufacturing603/300/400', tags: ['机电', '大三', '专业'], college: '机电学院' }
          ],
          '下学期': [
            { id: 604, title: '机电传动控制', price: 50.00, originalPrice: 70.00, author: '冯清秀', image: 'https://picsum.photos/seed/mecdrive604/300/400', tags: ['机电', '大三', '专业'], college: '机电学院' },
            { id: 605, title: '数控技术', price: 52.00, originalPrice: 72.00, author: '王永章', image: 'https://picsum.photos/seed/cnc605/300/400', tags: ['机电', '大三', '专业'], college: '机电学院' },
            { id: 606, title: 'CAD/CAM技术', price: 48.00, originalPrice: 65.00, author: '宁汝新', image: 'https://picsum.photos/seed/cadcam606/300/400', tags: ['机电', '大三', '专业'], college: '机电学院' }
          ]
        }
      },
      '电信学院': {
        '大一': {
          '上学期': [
            { id: 701, title: '电路分析基础', price: 45.00, originalPrice: 60.00, author: '邱关源', image: 'https://picsum.photos/seed/circuit701/300/400', tags: ['电信', '大一', '专业'], college: '电信学院' },
            { id: 702, title: '高等数学A(上)', price: 42.00, originalPrice: 56.00, author: '同济大学', image: 'https://picsum.photos/seed/math702/300/400', tags: ['数学', '大一', '公共'], college: '电信学院' },
            { id: 703, title: '大学物理(上)', price: 40.00, originalPrice: 54.00, author: '张三', image: 'https://picsum.photos/seed/physics703/300/400', tags: ['物理', '大一', '公共'], college: '电信学院' }
          ],
          '下学期': [
            { id: 704, title: '模拟电子技术基础', price: 48.00, originalPrice: 65.00, author: '童诗白', image: 'https://picsum.photos/seed/analog704/300/400', tags: ['电信', '大一', '专业'], college: '电信学院' },
            { id: 705, title: '高等数学A(下)', price: 42.00, originalPrice: 56.00, author: '同济大学', image: 'https://picsum.photos/seed/math705/300/400', tags: ['数学', '大一', '公共'], college: '电信学院' },
            { id: 706, title: '大学物理(下)', price: 40.00, originalPrice: 54.00, author: '张三', image: 'https://picsum.photos/seed/physics706/300/400', tags: ['物理', '大一', '公共'], college: '电信学院' }
          ]
        },
        '大二': {
          '上学期': [
            { id: 801, title: '数字电子技术', price: 48.00, originalPrice: 65.00, author: '阎石', image: 'https://picsum.photos/seed/digital801/300/400', tags: ['电信', '大二', '专业'], college: '电信学院' },
            { id: 802, title: '信号与系统', price: 52.00, originalPrice: 72.00, author: '郑君里', image: 'https://picsum.photos/seed/signals802/300/400', tags: ['电信', '大二', '专业'], college: '电信学院' },
            { id: 803, title: '电磁场与电磁波', price: 45.00, originalPrice: 62.00, author: '谢处方', image: 'https://picsum.photos/seed/emfield803/300/400', tags: ['电信', '大二', '专业'], college: '电信学院' }
          ],
          '下学期': [
            { id: 804, title: '高频电子线路', price: 48.00, originalPrice: 65.00, author: '张肃文', image: 'https://picsum.photos/seed/hf804/300/400', tags: ['电信', '大二', '专业'], college: '电信学院' },
            { id: 805, title: '自动控制原理', price: 50.00, originalPrice: 68.00, author: '胡寿松', image: 'https://picsum.photos/seed/control805/300/400', tags: ['控制', '大二', '专业'], college: '电信学院' },
            { id: 806, title: '通信原理', price: 55.00, originalPrice: 75.00, author: '樊昌信', image: 'https://picsum.photos/seed/comm806/300/400', tags: ['通信', '大二', '专业'], college: '电信学院' }
          ]
        },
        '大三': {
          '上学期': [
            { id: 901, title: '数字信号处理', price: 52.00, originalPrice: 72.00, author: '程佩青', image: 'https://picsum.photos/seed/dsp901/300/400', tags: ['电信', '大三', '专业'], college: '电信学院' },
            { id: 902, title: '微机原理与接口技术', price: 48.00, originalPrice: 65.00, author: '周明德', image: 'https://picsum.photos/seed/micro902/300/400', tags: ['电信', '大三', '专业'], college: '电信学院' },
            { id: 903, title: '单片机原理及应用', price: 45.00, originalPrice: 60.00, author: '张毅刚', image: 'https://picsum.photos/seed/mcu903/300/400', tags: ['电信', '大三', '专业'], college: '电信学院' }
          ],
          '下学期': [
            { id: 904, title: '嵌入式系统', price: 55.00, originalPrice: 78.00, author: '韦东山', image: 'https://picsum.photos/seed/embedded904/300/400', tags: ['电信', '大三', '专业'], college: '电信学院' },
            { id: 905, title: '光纤通信', price: 50.00, originalPrice: 70.00, author: '张宝富', image: 'https://picsum.photos/seed/fiber905/300/400', tags: ['通信', '大三', '专业'], college: '电信学院' },
            { id: 906, title: '移动通信', price: 52.00, originalPrice: 72.00, author: '曹丽娜', image: 'https://picsum.photos/seed/mobile906/300/400', tags: ['通信', '大三', '专业'], college: '电信学院' }
          ]
        }
      },
      '经贸学院': {
        '大一': {
          '上学期': [
            { id: 1101, title: '西方经济学(微观)', price: 42.00, originalPrice: 58.00, author: '高鸿业', image: 'https://picsum.photos/seed/microeco1101/300/400', tags: ['经济', '大一', '专业'], college: '经贸学院' },
            { id: 1102, title: '管理学原理', price: 38.00, originalPrice: 52.00, author: '周三多', image: 'https://picsum.photos/seed/management1102/300/400', tags: ['管理', '大一', '专业'], college: '经贸学院' },
            { id: 1103, title: '会计学原理', price: 40.00, originalPrice: 56.00, author: '葛家澍', image: 'https://picsum.photos/seed/accounting1103/300/400', tags: ['会计', '大一', '专业'], college: '经贸学院' }
          ],
          '下学期': [
            { id: 1104, title: '统计学原理', price: 40.00, originalPrice: 56.00, author: '贾俊平', image: 'https://picsum.photos/seed/stats1104/300/400', tags: ['统计', '大一', '专业'], college: '经贸学院' },
            { id: 1105, title: '财政学', price: 38.00, originalPrice: 52.00, author: '陈共', image: 'https://picsum.photos/seed/finance1105/300/400', tags: ['财政', '大一', '专业'], college: '经贸学院' },
            { id: 1106, title: '经济法', price: 42.00, originalPrice: 58.00, author: '杨紫烜', image: 'https://picsum.photos/seed/law1106/300/400', tags: ['法律', '大一', '专业'], college: '经贸学院' }
          ]
        },
        '大二': {
          '上学期': [
            { id: 1201, title: '西方经济学(宏观)', price: 42.00, originalPrice: 58.00, author: '高鸿业', image: 'https://picsum.photos/seed/macroeco1201/300/400', tags: ['经济', '大二', '专业'], college: '经贸学院' },
            { id: 1202, title: '市场营销学', price: 45.00, originalPrice: 62.00, author: '菲利普·科特勒', image: 'https://picsum.photos/seed/marketing1202/300/400', tags: ['营销', '大二', '专业'], college: '经贸学院' },
            { id: 1203, title: '财务管理', price: 48.00, originalPrice: 65.00, author: '荆新', image: 'https://picsum.photos/seed/finance1203/300/400', tags: ['财务', '大二', '专业'], college: '经贸学院' }
          ],
          '下学期': [
            { id: 1204, title: '货币银行学', price: 45.00, originalPrice: 60.00, author: '黄达', image: 'https://picsum.photos/seed/banking1204/300/400', tags: ['金融', '大二', '专业'], college: '经贸学院' },
            { id: 1205, title: '国际金融', price: 48.00, originalPrice: 65.00, author: '姜波克', image: 'https://picsum.photos/seed/intfinance1205/300/400', tags: ['金融', '大二', '专业'], college: '经贸学院' },
            { id: 1206, title: '国际贸易理论', price: 45.00, originalPrice: 60.00, author: '薛荣久', image: 'https://picsum.photos/seed/trade1206/300/400', tags: ['贸易', '大二', '专业'], college: '经贸学院' }
          ]
        },
        '大三': {
          '上学期': [
            { id: 1301, title: '国际贸易实务', price: 48.00, originalPrice: 65.00, author: '黎孝先', image: 'https://picsum.photos/seed/tradeprac1301/300/400', tags: ['贸易', '大三', '专业'], college: '经贸学院' },
            { id: 1302, title: '电子商务', price: 45.00, originalPrice: 62.00, author: '黄敏学', image: 'https://picsum.photos/seed/ecommerce1302/300/400', tags: ['电商', '大三', '专业'], college: '经贸学院' },
            { id: 1303, title: '证券投资学', price: 48.00, originalPrice: 65.00, author: '吴晓求', image: 'https://picsum.photos/seed/investment1303/300/400', tags: ['投资', '大三', '专业'], college: '经贸学院' }
          ],
          '下学期': [
            { id: 1304, title: '期货市场', price: 45.00, originalPrice: 60.00, author: '张树忠', image: 'https://picsum.photos/seed/futures1304/300/400', tags: ['期货', '大三', '专业'], college: '经贸学院' },
            { id: 1305, title: '国际结算', price: 42.00, originalPrice: 58.00, author: '苏宗祥', image: 'https://picsum.photos/seed/settlement1305/300/400', tags: ['结算', '大三', '专业'], college: '经贸学院' },
            { id: 1306, title: '商务谈判', price: 40.00, originalPrice: 54.00, author: '刘园', image: 'https://picsum.photos/seed/negotiation1306/300/400', tags: ['谈判', '大三', '专业'], college: '经贸学院' }
          ]
        }
      },
      '人文学院': {
        '大一': {
          '上学期': [
            { id: 1401, title: '中国文学史(古代)', price: 45.00, originalPrice: 60.00, author: '袁行霈', image: 'https://picsum.photos/seed/chinese1401/300/400', tags: ['文学', '大一', '专业'], college: '人文学院' },
            { id: 1402, title: '文学理论', price: 42.00, originalPrice: 58.00, author: '童庆炳', image: 'https://picsum.photos/seed/literature1402/300/400', tags: ['文学', '大一', '专业'], college: '人文学院' },
            { id: 1403, title: '写作基础', price: 38.00, originalPrice: 52.00, author: '陈果安', image: 'https://picsum.photos/seed/writing1403/300/400', tags: ['写作', '大一', '专业'], college: '人文学院' }
          ],
          '下学期': [
            { id: 1404, title: '现代汉语', price: 40.00, originalPrice: 56.00, author: '黄伯荣', image: 'https://picsum.photos/seed/modernchinese1404/300/400', tags: ['语言', '大一', '专业'], college: '人文学院' },
            { id: 1405, title: '古代汉语(上)', price: 42.00, originalPrice: 58.00, author: '王力', image: 'https://picsum.photos/seed/archaic1405/300/400', tags: ['语言', '大一', '专业'], college: '人文学院' },
            { id: 1406, title: '外国文学(上)', price: 45.00, originalPrice: 60.00, author: '郑克鲁', image: 'https://picsum.photos/seed/foreign1406/300/400', tags: ['文学', '大一', '专业'], college: '人文学院' }
          ]
        },
        '大二': {
          '上学期': [
            { id: 1501, title: '中国文学史(现当代)', price: 45.00, originalPrice: 60.00, author: '钱理群', image: 'https://picsum.photos/seed/modern1501/300/400', tags: ['文学', '大二', '专业'], college: '人文学院' },
            { id: 1502, title: '古代汉语(下)', price: 42.00, originalPrice: 58.00, author: '王力', image: 'https://picsum.photos/seed/archaic1502/300/400', tags: ['语言', '大二', '专业'], college: '人文学院' },
            { id: 1503, title: '外国文学(下)', price: 45.00, originalPrice: 60.00, author: '郑克鲁', image: 'https://picsum.photos/seed/foreign1503/300/400', tags: ['文学', '大二', '专业'], college: '人文学院' }
          ],
          '下学期': [
            { id: 1504, title: '语言学概论', price: 40.00, originalPrice: 56.00, author: '叶蜚声', image: 'https://picsum.photos/seed/linguistics1504/300/400', tags: ['语言', '大二', '专业'], college: '人文学院' },
            { id: 1505, title: '美学原理', price: 42.00, originalPrice: 58.00, author: '朱立元', image: 'https://picsum.photos/seed/aesthetics1505/300/400', tags: ['美学', '大二', '专业'], college: '人文学院' },
            { id: 1506, title: '比较文学', price: 45.00, originalPrice: 62.00, author: '陈惇', image: 'https://picsum.photos/seed/comparative1506/300/400', tags: ['文学', '大二', '专业'], college: '人文学院' }
          ]
        },
        '大三': {
          '上学期': [
            { id: 1601, title: '古代文论', price: 42.00, originalPrice: 58.00, author: '张少康', image: 'https://picsum.photos/seed/classic1601/300/400', tags: ['文论', '大三', '专业'], college: '人文学院' },
            { id: 1602, title: '现当代文论', price: 40.00, originalPrice: 56.00, author: '王先霈', image: 'https://picsum.photos/seed/moderncrit1602/300/400', tags: ['文论', '大三', '专业'], college: '人文学院' },
            { id: 1603, title: '文化产业管理', price: 48.00, originalPrice: 65.00, author: '胡惠林', image: 'https://picsum.photos/seed/culture1603/300/400', tags: ['文化', '大三', '专业'], college: '人文学院' }
          ],
          '下学期': [
            { id: 1604, title: '文学批评', price: 42.00, originalPrice: 58.00, author: '王一川', image: 'https://picsum.photos/seed/criticism1604/300/400', tags: ['批评', '大三', '专业'], college: '人文学院' },
            { id: 1605, title: '专业写作', price: 40.00, originalPrice: 54.00, author: '葛红兵', image: 'https://picsum.photos/seed/professional1605/300/400', tags: ['写作', '大三', '专业'], college: '人文学院' },
            { id: 1606, title: '媒介文化研究', price: 45.00, originalPrice: 60.00, author: '周宪', image: 'https://picsum.photos/seed/media1606/300/400', tags: ['媒介', '大三', '专业'], college: '人文学院' }
          ]
        }
      },
      '管理学院': {
        '大一': {
          '上学期': [
            { id: 1701, title: '管理学原理', price: 40.00, originalPrice: 56.00, author: '周三多', image: 'https://picsum.photos/seed/mgmt1701/300/400', tags: ['管理', '大一', '专业'], college: '管理学院' },
            { id: 1702, title: '组织行为学', price: 42.00, originalPrice: 58.00, author: '斯蒂芬·罗宾斯', image: 'https://picsum.photos/seed/org1702/300/400', tags: ['管理', '大一', '专业'], college: '管理学院' },
            { id: 1703, title: '统计学原理', price: 45.00, originalPrice: 62.00, author: '贾俊平', image: 'https://picsum.photos/seed/stats1703/300/400', tags: ['统计', '大一', '专业'], college: '管理学院' }
          ],
          '下学期': [
            { id: 1704, title: '会计学原理', price: 40.00, originalPrice: 56.00, author: '葛家澍', image: 'https://picsum.photos/seed/accounting1704/300/400', tags: ['会计', '大一', '专业'], college: '管理学院' },
            { id: 1705, title: '财务管理', price: 45.00, originalPrice: 60.00, author: '荆新', image: 'https://picsum.photos/seed/finance1705/300/400', tags: ['财务', '大一', '专业'], college: '管理学院' },
            { id: 1706, title: '市场营销学', price: 42.00, originalPrice: 58.00, author: '菲利普·科特勒', image: 'https://picsum.photos/seed/marketing1706/300/400', tags: ['营销', '大一', '专业'], college: '管理学院' }
          ]
        }
      },
      '外国语学院': {
        '大一': {
          '上学期': [
            { id: 2001, title: '大学英语(1)', price: 38.00, originalPrice: 52.00, author: '董亚芬', image: 'https://picsum.photos/seed/english2001/300/400', tags: ['英语', '大一', '公共'], college: '外国语学院' },
            { id: 2002, title: '英语听力教程(1)', price: 35.00, originalPrice: 48.00, author: '张民伦', image: 'https://picsum.photos/seed/listening2002/300/400', tags: ['英语', '听力', '大一'], college: '外国语学院' },
            { id: 2003, title: '英语口语教程(1)', price: 32.00, originalPrice: 45.00, author: '王守仁', image: 'https://picsum.photos/seed/speaking2003/300/400', tags: ['英语', '口语', '大一'], college: '外国语学院' }
          ],
          '下学期': [
            { id: 2004, title: '大学英语(2)', price: 38.00, originalPrice: 52.00, author: '董亚芬', image: 'https://picsum.photos/seed/english2004/300/400', tags: ['英语', '大二', '公共'], college: '外国语学院' },
            { id: 2005, title: '英语听力教程(2)', price: 35.00, originalPrice: 48.00, author: '张民伦', image: 'https://picsum.photos/seed/listening2005/300/400', tags: ['英语', '听力', '大二'], college: '外国语学院' },
            { id: 2006, title: '英语口语教程(2)', price: 32.00, originalPrice: 45.00, author: '王守仁', image: 'https://picsum.photos/seed/speaking2006/300/400', tags: ['英语', '口语', '大二'], college: '外国语学院' }
          ]
        },
        '大二': {
          '上学期': [
            { id: 2101, title: '大学英语(3)', price: 38.00, originalPrice: 52.00, author: '董亚芬', image: 'https://picsum.photos/seed/english2101/300/400', tags: ['英语', '大三', '公共'], college: '外国语学院' },
            { id: 2102, title: '英语写作教程(1)', price: 35.00, originalPrice: 48.00, author: '丁往道', image: 'https://picsum.photos/seed/writing2102/300/400', tags: ['英语', '写作', '大二'], college: '外国语学院' },
            { id: 2103, title: '英语阅读教程(1)', price: 36.00, originalPrice: 49.00, author: '王守仁', image: 'https://picsum.photos/seed/reading2103/300/400', tags: ['英语', '阅读', '大二'], college: '外国语学院' }
          ],
          '下学期': [
            { id: 2104, title: '大学英语(4)', price: 38.00, originalPrice: 52.00, author: '董亚芬', image: 'https://picsum.photos/seed/english2104/300/400', tags: ['英语', '大四', '公共'], college: '外国语学院' },
            { id: 2105, title: '英语写作教程(2)', price: 35.00, originalPrice: 48.00, author: '丁往道', image: 'https://picsum.photos/seed/writing2105/300/400', tags: ['英语', '写作', '大二'], college: '外国语学院' },
            { id: 2106, title: '英语阅读教程(2)', price: 36.00, originalPrice: 49.00, author: '王守仁', image: 'https://picsum.photos/seed/reading2106/300/400', tags: ['英语', '阅读', '大二'], college: '外国语学院' }
          ]
        },
        '大三': {
          '上学期': [
            { id: 2201, title: '英语语言学', price: 42.00, originalPrice: 58.00, author: '胡壮麟', image: 'https://picsum.photos/seed/linguistics2201/300/400', tags: ['英语', '语言学', '大三'], college: '外国语学院' },
            { id: 2202, title: '英美文学选读', price: 45.00, originalPrice: 60.00, author: '张伯香', image: 'https://picsum.photos/seed/literature2202/300/400', tags: ['英语', '文学', '大三'], college: '外国语学院' },
            { id: 2203, title: '英汉翻译教程', price: 38.00, originalPrice: 52.00, author: '张培基', image: 'https://picsum.photos/seed/translation2203/300/400', tags: ['英语', '翻译', '大三'], college: '外国语学院' }
          ],
          '下学期': [
            { id: 2204, title: '英语词汇学', price: 36.00, originalPrice: 49.00, author: '陆国强', image: 'https://picsum.photos/seed/vocabulary2204/300/400', tags: ['英语', '词汇', '大三'], college: '外国语学院' },
            { id: 2205, title: '英语语法教程', price: 35.00, originalPrice: 48.00, author: '章振邦', image: 'https://picsum.photos/seed/grammar2205/300/400', tags: ['英语', '语法', '大三'], college: '外国语学院' },
            { id: 2206, title: '汉英翻译教程', price: 38.00, originalPrice: 52.00, author: '吕瑞昌', image: 'https://picsum.photos/seed/translation2206/300/400', tags: ['英语', '翻译', '大三'], college: '外国语学院' }
          ]
        }
      }
    };
    
    // 将嵌套结构转换为扁平数组
    for (const college in collegeBooksData) {
      const grades = collegeBooksData[college];
      for (const grade in grades) {
        const semesters = grades[grade];
        for (const semester in semesters) {
          const books = semesters[semester];
          allBooks = allBooks.concat(books);
        }
      }
    }
    
    return allBooks;
  },
  
  // 执行搜索
  performSearch: function(keyword) {
    this.setData({ loading: true, noResults: false });
    
    // 获取所有学院的专业书籍数据
    const allBooks = this.getAllCollegeBooks();
    
    // 模拟搜索延迟
    setTimeout(() => {
      // 过滤包含关键词的图书，只返回专业书籍
      const results = allBooks.filter(book => 
        (book.tags && book.tags.includes('专业')) && // 只包含专业书籍
        (book.title.includes(keyword) || 
         book.author.includes(keyword) ||
         (book.tags && book.tags.some(tag => tag.includes(keyword))) ||
         (book.college && book.college.includes(keyword)))
      );
      
      this.setData({
        searchResults: results,
        loading: false,
        noResults: results.length === 0
      });
    }, 800);
    
    // 注释掉实际的网络请求，开发环境暂时不使用
    /*
    wx.request({
      url: `${app.globalData.baseUrl}/book/search`,
      method: 'GET',
      data: { keyword: keyword },
      success: (res) => {
        if (res.data.success && res.data.data) {
          this.setData({
            searchResults: res.data.data,
            loading: false,
            noResults: res.data.data.length === 0
          });
        }
      },
      fail: (err) => {
        console.error('搜索失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: '搜索失败', icon: 'none' });
      }
    });
    */
  },

  // 保存搜索历史
  saveSearchHistory: function(keyword) {
    let history = wx.getStorageSync('searchHistory') || [];
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到最前面
    history.unshift(keyword);
    
    // 最多保存10条
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    wx.setStorageSync('searchHistory', history);
  },

  // 点击历史记录或热门关键词进行搜索
  searchByKeyword: function(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword: keyword });
    this.performSearch(keyword);
    this.saveSearchHistory(keyword);
  },

  // 清除搜索历史
  clearHistory: function() {
    wx.showModal({
      title: '提示',
      content: '确定要清除搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({ searchHistory: [] });
        }
      }
    });
  },

  // 跳转到图书详情页
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});