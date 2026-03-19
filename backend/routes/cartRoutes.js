const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// 模拟购物车数据存储
let cartItems = [];

// 获取购物车列表
router.get('/list', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    // 筛选当前用户的购物车商品
    const userCartItems = cartItems.filter(item => item.userId === userId);
    
    res.status(200).json({
      success: true,
      data: userCartItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 添加商品到购物车
router.post('/add', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const { bookId, quantity, title, price, image, author } = req.body;
    
    // 检查是否已在购物车中
    const existingItem = cartItems.find(item => item.userId === userId && item.bookId === bookId);
    
    if (existingItem) {
      // 如果已存在，更新数量
      existingItem.quantity += quantity || 1;
    } else {
      // 如果不存在，添加新商品
      const newItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        bookId,
        title,
        author,
        price,
        image,
        quantity: quantity || 1,
        createdAt: new Date()
      };
      cartItems.push(newItem);
    }
    
    res.status(200).json({
      success: true,
      message: '添加成功',
      data: cartItems.filter(item => item.userId === userId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 更新购物车商品数量
router.post('/update', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const { cart } = req.body;
    
    // 更新购物车商品
    if (Array.isArray(cart)) {
      cart.forEach(item => {
        const existingItem = cartItems.find(cartItem => cartItem.userId === userId && cartItem.bookId === item.bookId);
        if (existingItem) {
          existingItem.quantity = item.quantity || 1;
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: '更新成功',
      data: cartItems.filter(item => item.userId === userId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 从购物车移除商品
router.post('/remove', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const { bookId } = req.body;
    
    // 移除商品
    cartItems = cartItems.filter(item => !(item.userId === userId && item.bookId === bookId));
    
    res.status(200).json({
      success: true,
      message: '删除成功',
      data: cartItems.filter(item => item.userId === userId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 清空购物车
router.post('/clear', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    
    // 清空当前用户的购物车
    cartItems = cartItems.filter(item => item.userId !== userId);
    
    res.status(200).json({
      success: true,
      message: '清空成功',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

module.exports = router;