const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Book = require('../models/Book');
const { authMiddleware } = require('../middleware/auth');

// 获取图书列表接口
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category, college, keyword, status } = req.query;

    // 构建查询条件
    const where = {};
    if (category) where.category = category;
    if (college) where.college = college;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { author: { [Op.like]: `%${keyword}%` } },
        { ISBN: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 查询图书列表
    const { count, rows } = await Book.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']],
      include: ['seller'] // 关联查询卖家信息
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

// 获取图书详情接口
router.get('/detail/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: ['seller'] // 关联查询卖家信息
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '图书不存在'
      });
    }

    // 增加浏览次数
    await book.update({ viewCount: book.viewCount + 1 });

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 发布图书接口
router.post('/publish', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      author,
      ISBN,
      image,
      price,
      originalPrice,
      category,
      college,
      description,
      condition
    } = req.body;

    // 创建图书
    const newBook = await Book.create({
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
      status: 'available',
      viewCount: 0,
      favoriteCount: 0,
      sellerId: req.userId
    });

    res.status(201).json({
      success: true,
      message: '发布成功',
      data: newBook
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 更新图书接口
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '图书不存在'
      });
    }

    // 检查是否是图书卖家
    if (book.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权修改此图书信息'
      });
    }

    // 更新图书信息
    await book.update(req.body);

    res.status(200).json({
      success: true,
      message: '更新成功',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 删除图书接口
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '图书不存在'
      });
    }

    // 检查是否是图书卖家
    if (book.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权删除此图书'
      });
    }

    // 删除图书（软删除）
    await book.destroy();

    res.status(200).json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 获取用户发布的图书列表
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;

    const where = { sellerId: req.userId };
    if (status) where.status = status;

    const { count, rows } = await Book.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']]
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

// 获取分类图书接口
router.get('/category', async (req, res) => {
  try {
    const { category } = req.query;

    // 构建查询条件
    const where = {};
    if (category) where.category = category;

    // 查询图书列表
    const books = await Book.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    // 按年级和学期组织数据
    const gradeSemesterBooks = {
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

    // 将图书分配到不同的年级和学期（这里简化处理，实际应该根据图书的属性进行分配）
    books.forEach((book, index) => {
      const gradeIndex = index % 3;
      const semesterIndex = index % 2;
      
      if (gradeIndex === 0) {
        if (semesterIndex === 0) {
          gradeSemesterBooks['大一']['上学期'].push(book);
        } else {
          gradeSemesterBooks['大一']['下学期'].push(book);
        }
      } else if (gradeIndex === 1) {
        if (semesterIndex === 0) {
          gradeSemesterBooks['大二']['上学期'].push(book);
        } else {
          gradeSemesterBooks['大二']['下学期'].push(book);
        }
      } else {
        if (semesterIndex === 0) {
          gradeSemesterBooks['大三']['上学期'].push(book);
        } else {
          gradeSemesterBooks['大三']['下学期'].push(book);
        }
      }
    });

    res.status(200).json({
      success: true,
      data: gradeSemesterBooks
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