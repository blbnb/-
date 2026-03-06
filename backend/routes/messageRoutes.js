const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

// 获取消息列表接口
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, type, isRead } = req.query;

    const where = { userId: req.userId };
    if (type) where.type = type;
    if (typeof isRead !== 'undefined') where.isRead = isRead === 'true';

    const { count, rows } = await Message.findAndCountAll({
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

// 获取消息详情接口
router.get('/detail/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }

    // 检查是否是用户自己的消息
    if (message.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权查看此消息'
      });
    }

    // 标记为已读
    if (!message.isRead) {
      await message.update({ isRead: true });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 获取未读消息数量接口
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.count({
      where: { userId: req.userId, isRead: false }
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count
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

// 标记消息为已读接口
router.put('/mark-read/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }

    // 检查是否是用户自己的消息
    if (message.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权操作此消息'
      });
    }

    // 标记为已读
    await message.update({ isRead: true });

    res.status(200).json({
      success: true,
      message: '标记已读成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 标记全部消息为已读接口
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    await Message.update(
      { isRead: true },
      { where: { userId: req.userId, isRead: false } }
    );

    res.status(200).json({
      success: true,
      message: '全部标记已读成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 删除消息接口
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }

    // 检查是否是用户自己的消息
    if (message.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权删除此消息'
      });
    }

    // 删除消息
    await message.destroy();

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

module.exports = router;