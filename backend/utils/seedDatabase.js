const { sequelize } = require('../config/database');
const User = require('../models/User');
const Book = require('../models/Book');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Favorite = require('../models/Favorite');
const Message = require('../models/Message');
const bcrypt = require('bcrypt');

// 模拟数据
const mockUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    nickName: '管理员',
    phone: '13800138000',
    password: 'admin123',
    level: '管理员'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    nickName: '商家1',
    phone: '13900139001',
    password: 'seller123',
    level: '商家'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    nickName: '用户1',
    phone: '13900139002',
    password: 'user123',
    level: '普通用户'
  }
];

const mockBooks = [
  {
    id: '11111111-1111-1111-1111-111111111112',
    title: 'JavaScript高级程序设计',
    author: '尼古拉斯·扎卡斯',
    ISBN: '9787115275790',
    image: 'https://img3.doubanio.com/view/subject/l/public/s1727290.jpg',
    price: 59.9,
    originalPrice: 99.0,
    category: '计算机',
    college: '计算机学院',
    description: '本书是JavaScript领域的经典著作，全面介绍了JavaScript语言的核心概念和高级特性。',
    condition: '九成新',
    status: '在售',
    sellerId: '22222222-2222-2222-2222-222222222222'
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    title: '算法导论',
    author: 'Thomas H. Cormen',
    ISBN: '9787111407010',
    image: 'https://img1.doubanio.com/view/subject/l/public/s1727291.jpg',
    price: 79.9,
    originalPrice: 128.0,
    category: '计算机',
    college: '计算机学院',
    description: '算法领域的经典教材，全面介绍了各种算法的设计和分析方法。',
    condition: '八成新',
    status: '在售',
    sellerId: '22222222-2222-2222-2222-222222222222'
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    title: '深入理解计算机系统',
    author: 'Randal E. Bryant',
    ISBN: '9787111407027',
    image: 'https://img2.doubanio.com/view/subject/l/public/s1727292.jpg',
    price: 69.9,
    originalPrice: 118.0,
    category: '计算机',
    college: '计算机学院',
    description: '从程序员的角度全面介绍计算机系统的工作原理。',
    condition: '九成新',
    status: '在售',
    sellerId: '22222222-2222-2222-2222-222222222222'
  },
  {
    id: '11111111-1111-1111-1111-111111111115',
    title: '数学分析',
    author: '华东师范大学数学系',
    ISBN: '9787040212781',
    image: 'https://img3.doubanio.com/view/subject/l/public/s1727293.jpg',
    price: 29.9,
    originalPrice: 49.8,
    category: '数学',
    college: '理学院',
    description: '高等院校数学专业经典教材，内容全面，讲解详细。',
    condition: '七成新',
    status: '在售',
    sellerId: '22222222-2222-2222-2222-222222222222'
  },
  {
    id: '11111111-1111-1111-1111-111111111116',
    title: '大学物理',
    author: '张三',
    ISBN: '9787040212782',
    image: 'https://img1.doubanio.com/view/subject/l/public/s1727294.jpg',
    price: 24.9,
    originalPrice: 42.0,
    category: '物理',
    college: '理学院',
    description: '大学物理课程教材，涵盖力学、热学、电磁学等内容。',
    condition: '八成新',
    status: '在售',
    sellerId: '22222222-2222-2222-2222-222222222222'
  }
];

async function seedDatabase() {
  try {
    console.log('开始同步数据库表结构...');
    // 同步数据库表结构
    await sequelize.sync({ force: true });
    console.log('数据库表结构同步完成');

    console.log('开始插入模拟数据...');
    // 对用户密码进行加密
    const usersWithHashedPasswords = await Promise.all(
      mockUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    // 插入用户数据
    await User.bulkCreate(usersWithHashedPasswords);
    console.log('用户数据插入完成');

    // 插入书籍数据
    await Book.bulkCreate(mockBooks);
    console.log('书籍数据插入完成');

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    throw error;
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => console.log('数据库初始化成功'))
    .catch(error => console.error('错误:', error));
}

module.exports = seedDatabase;