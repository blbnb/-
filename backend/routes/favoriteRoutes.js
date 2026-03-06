const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Book = require('../models/Book');
const { authMiddleware } = require('../middleware/auth');

// 添加收藏接口
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.body;

    // 检查图书是否存在
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '图书不存在'
      });
    }

    // 检查是否已收藏
    const existingFavorite = await Favorite.findOne({
      where: { userId: req.userId, bookId: bookId }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过该图书'
      });
    }

    // 添加收藏
    await Favorite.create({
      userId: req.userId,
      bookId: bookId
    });

    // 更新图书收藏数量
    await book.update({ favoriteCount: book.favoriteCount + 1 });

    res.status(200).json({
      success: true,
      message: '收藏成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 取消收藏接口
router.post('/remove', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.body;

    // 查找收藏记录
    const favorite = await Favorite.findOne({
      where: { userId: req.userId, bookId: bookId }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: '未收藏该图书'
      });
    }

    // 查找图书信息
    const book = await Book.findByPk(bookId);

    // 删除收藏记录
    await favorite.destroy();

    // 更新图书收藏数量
    if (book && book.favoriteCount > 0) {
      await book.update({ favoriteCount: book.favoriteCount - 1 });
    }

    res.status(200).json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 获取收藏列表接口
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId: req.userId },
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Book,
          include: ['seller']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 检查图书是否已收藏接口
router.get('/check/:bookId', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId: req.userId, bookId: bookId }
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: favorite ? true : false
      }
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