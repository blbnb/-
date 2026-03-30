const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Order = require('../models/Order');

// 伪支付接口
router.post('/pay', authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentPassword } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: '订单ID不能为空'
      });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.buyerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权支付此订单'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '订单状态不允许支付'
      });
    }

    const correctPassword = '123456';

    if (paymentPassword !== correctPassword) {
      return res.status(400).json({
        success: false,
        message: '支付密码错误'
      });
    }

    await order.update({
      status: 'paid',
      paymentMethod: paymentMethod || 'wechat',
      paymentTime: new Date()
    });

    res.status(200).json({
      success: true,
      message: '支付成功',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 查询支付状态
router.get('/status/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentTime: order.paymentTime
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
