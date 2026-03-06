const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

// 商家注册
exports.register = async (req, res) => {
  try {
    const { nickName, phone, password, college } = req.body;
    
    // 检查手机号是否已存在
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ message: '手机号已被注册' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建商家用户
    const seller = await User.create({
      nickName,
      phone,
      password: hashedPassword,
      college,
      level: '商家'
    });
    
    // 生成token
    const token = generateToken(seller.id, seller.level);
    
    res.status(201).json({
      message: '商家注册成功',
      data: {
        user: {
          id: seller.id,
          nickName: seller.nickName,
          phone: seller.phone,
          college: seller.college,
          level: seller.level
        },
        token
      }
    });
  } catch (error) {
    console.error('商家注册失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 商家登录
exports.login = async (req, res) => {
  try {
    // 同时支持从请求体和查询参数获取参数
    const phone = req.body.phone || req.query.phone;
    const password = req.body.password || req.query.password;
    
    // 查找用户
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ message: '手机号或密码错误' });
    }
    
    // 检查是否为商家
    if (user.level !== '商家') {
      return res.status(403).json({ message: '该账号不是商家账号' });
    }
    
    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: '手机号或密码错误' });
    }
    
    // 生成token
    const token = generateToken(user.id, user.level);
    
    res.status(200).json({
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          nickName: user.nickName,
          phone: user.phone,
          college: user.college,
          level: user.level
        },
        token
      }
    });
  } catch (error) {
    console.error('商家登录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 创建图书
exports.createBook = async (req, res) => {
  try {
    const { title, author, ISBN, image, price, originalPrice, category, college, description, condition } = req.body;
    const sellerId = req.user.id;
    
    const book = await Book.create({
      title,
      author,
      ISBN,
      image,
      price,
      originalPrice,
      category,
      college,
      description,
      condition,
      status: '在售',
      sellerId
    });
    
    res.status(201).json({
      message: '图书创建成功',
      data: book
    });
  } catch (error) {
    console.error('创建图书失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取商家的图书
exports.getSellerBooks = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const books = await Book.findAll({ where: { sellerId } });
    
    res.status(200).json({
      message: '获取图书成功',
      data: books
    });
  } catch (error) {
    console.error('获取图书失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新图书
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    const updateData = req.body;
    
    // 检查图书是否存在且属于该商家
    const book = await Book.findOne({ where: { id, sellerId } });
    if (!book) {
      return res.status(404).json({ message: '图书不存在或无权操作' });
    }
    
    await book.update(updateData);
    
    res.status(200).json({
      message: '图书更新成功',
      data: book
    });
  } catch (error) {
    console.error('更新图书失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 删除图书
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    
    // 检查图书是否存在且属于该商家
    const book = await Book.findOne({ where: { id, sellerId } });
    if (!book) {
      return res.status(404).json({ message: '图书不存在或无权操作' });
    }
    
    await book.destroy();
    
    res.status(200).json({ message: '图书删除成功' });
  } catch (error) {
    console.error('删除图书失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取商家的订单
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await Order.findAll({ where: { sellerId } });
    
    res.status(200).json({
      message: '获取订单成功',
      data: orders
    });
  } catch (error) {
    console.error('获取订单失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新订单状态
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.id;
    
    // 检查订单是否存在且属于该商家
    const order = await Order.findOne({ where: { id, sellerId } });
    if (!order) {
      return res.status(404).json({ message: '订单不存在或无权操作' });
    }
    
    await order.update({ status });
    
    res.status(200).json({
      message: '订单状态更新成功',
      data: order
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取商家信息
exports.getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const seller = await User.findByPk(sellerId, {
      attributes: ['id', 'nickName', 'phone', 'college', 'avatarUrl', 'level', 'points']
    });
    
    res.status(200).json({
      message: '获取商家信息成功',
      data: seller
    });
  } catch (error) {
    console.error('获取商家信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新商家信息
exports.updateSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const updateData = req.body;
    
    const seller = await User.findByPk(sellerId);
    await seller.update(updateData);
    
    res.status(200).json({
      message: '商家信息更新成功',
      data: {
        id: seller.id,
        nickName: seller.nickName,
        phone: seller.phone,
        college: seller.college,
        avatarUrl: seller.avatarUrl,
        level: seller.level,
        points: seller.points
      }
    });
  } catch (error) {
    console.error('更新商家信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};