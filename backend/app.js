const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database');

// 导入路由
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const messageRoutes = require('./routes/messageRoutes');
const addressRoutes = require('./routes/addressRoutes');

// 导入模型以确保关联被正确设置
const User = require('./models/User');
const Book = require('./models/Book');
const Order = require('./models/Order');
const Favorite = require('./models/Favorite');
const Message = require('./models/Message');
const Address = require('./models/Address');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 设置响应头
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务运行正常'
  });
});

// 注册路由
app.use('/api/user', userRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/address', addressRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 定义模型关联
const defineAssociations = () => {
  // 用户与图书的关系（一对多）
  User.hasMany(Book, { foreignKey: 'sellerId', as: 'books' });
  Book.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

  // 用户与订单的关系（一对多）
  User.hasMany(Order, { foreignKey: 'buyerId', as: 'buyerOrders' });
  User.hasMany(Order, { foreignKey: 'sellerId', as: 'sellerOrders' });
  Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
  Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

  // 图书与订单的关系（一对多）
  Book.hasMany(Order, { foreignKey: 'bookId' });
  Order.belongsTo(Book, { foreignKey: 'bookId' });

  // 用户与收藏的关系（一对多）
  User.hasMany(Favorite, { foreignKey: 'userId' });
  Favorite.belongsTo(User, { foreignKey: 'userId' });

  // 图书与收藏的关系（一对多）
  Book.hasMany(Favorite, { foreignKey: 'bookId' });
  Favorite.belongsTo(Book, { foreignKey: 'bookId' });

  // 用户与消息的关系（一对多）
  User.hasMany(Message, { foreignKey: 'userId' });
  Message.belongsTo(User, { foreignKey: 'userId' });

  // 用户与地址的关系（一对多）
  User.hasMany(Address, { foreignKey: 'userId' });
  Address.belongsTo(User, { foreignKey: 'userId' });
};

// 启动服务器
const startServer = async () => {
  try {
    // 定义关联
    defineAssociations();

    // 同步数据库（不修改现有表结构，避免数据丢失）
    await sequelize.sync({ alter: false });
    console.log('数据库同步成功');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
};

// 导出app以便测试
module.exports = { app, startServer };

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  startServer();
}