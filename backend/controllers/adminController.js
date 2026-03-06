const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

// 管理员登录
exports.login = async (req, res) => {
  try {
    // 同时支持从请求体和查询参数获取参数
    const phone = req.body.phone || req.query.phone;
    const password = req.body.password || req.query.password;
    
    console.log('管理员登录请求参数:', { phone, password, body: req.body, query: req.query });
    
    // 查找用户
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ message: '手机号或密码错误' });
    }
    
    // 检查是否为管理员
    if (user.level !== '管理员') {
      return res.status(403).json({ message: '该账号不是管理员账号' });
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
          level: user.level
        },
        token
      }
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取所有用户
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { level: '普通用户' } });
    
    res.status(200).json({
      message: '获取用户列表成功',
      data: users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    await user.update(updateData);
    
    res.status(200).json({
      message: '用户信息更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    await user.destroy();
    
    res.status(200).json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取所有商家
exports.getSellers = async (req, res) => {
  try {
    const sellers = await User.findAll({ where: { level: '商家' } });
    
    res.status(200).json({
      message: '获取商家列表成功',
      data: sellers
    });
  } catch (error) {
    console.error('获取商家列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新商家信息
exports.updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const seller = await User.findByPk(id);
    if (!seller) {
      return res.status(404).json({ message: '商家不存在' });
    }
    
    await seller.update(updateData);
    
    res.status(200).json({
      message: '商家信息更新成功',
      data: seller
    });
  } catch (error) {
    console.error('更新商家信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 删除商家
exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    
    const seller = await User.findByPk(id);
    if (!seller) {
      return res.status(404).json({ message: '商家不存在' });
    }
    
    await seller.destroy();
    
    res.status(200).json({ message: '商家删除成功' });
  } catch (error) {
    console.error('删除商家失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取所有图书
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    
    res.status(200).json({
      message: '获取图书列表成功',
      data: books
    });
  } catch (error) {
    console.error('获取图书列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新图书信息
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }
    
    await book.update(updateData);
    
    res.status(200).json({
      message: '图书信息更新成功',
      data: book
    });
  } catch (error) {
    console.error('更新图书信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 删除图书
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }
    
    await book.destroy();
    
    res.status(200).json({ message: '图书删除成功' });
  } catch (error) {
    console.error('删除图书失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取所有订单
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    
    res.status(200).json({
      message: '获取订单列表成功',
      data: orders
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新订单信息
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    await order.update(updateData);
    
    res.status(200).json({
      message: '订单信息更新成功',
      data: order
    });
  } catch (error) {
    console.error('更新订单信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取系统统计信息
exports.getStats = async (req, res) => {
  try {
    // 获取用户数量
    const userCount = await User.count({ where: { level: '普通用户' } });
    
    // 获取商家数量
    const sellerCount = await User.count({ where: { level: '商家' } });
    
    // 获取图书数量
    const bookCount = await Book.count();
    
    // 获取订单数量
    const orderCount = await Order.count();
    
    res.status(200).json({
      message: '获取统计信息成功',
      data: {
        userCount,
        sellerCount,
        bookCount,
        orderCount
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};