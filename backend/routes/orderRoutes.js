const express = require("express");
const router = express.Router();
const { Op, sequelize } = require("sequelize");
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const Message = require("../models/Message");
const { authMiddleware } = require("../middleware/auth");

// 生成订单号
const generateOrderNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${random.toString().padStart(3, "0")}`;
};

// 发送消息通知
const sendMessageNotification = async (
  userId,
  title,
  content,
  type = "order",
) => {
  try {
    await Message.create({
      userId,
      title,
      content,
      type,
      isRead: false,
    });
  } catch (error) {
    console.error("发送消息通知失败:", error);
  }
};

// 创建订单接口
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { items, addressId, totalPrice } = req.body;

    // 开始事务
    const transaction = await sequelize.transaction();

    try {
      // 处理多商品订单
      for (const item of items) {
        const bookId = item.bookId;
        const quantity = item.quantity || 1;

        // 查询图书信息
        const book = await Book.findByPk(bookId, { transaction });
        if (!book) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: "图书不存在",
          });
        }

        // 检查图书状态
        if (book.status !== "available") {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "该图书暂不可购买",
          });
        }

        // 检查是否是自己的图书
        if (book.sellerId === req.userId) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "不能购买自己发布的图书",
          });
        }

        // 创建订单
        const order = await Order.create(
          {
            orderNo: generateOrderNo(),
            buyerId: req.userId,
            sellerId: book.sellerId,
            bookId: book.id,
            price: book.price,
            quantity: quantity,
            totalPrice: book.price * quantity,
            status: "pending",
            // 这里应该从地址表中获取地址信息，暂时使用默认地址
            shippingAddress: "默认地址",
            contactPhone: "13800138000",
            paymentMethod: "wechat",
          },
          { transaction },
        );

        // 更新图书状态
        await book.update({ status: "sold" }, { transaction });

        // 发送消息通知给卖家
        await sendMessageNotification(
          book.sellerId,
          "新订单通知",
          `您的图书《${book.title}》有新的订单，请及时处理。`,
          "order",
        );

        // 发送消息通知给买家
        await sendMessageNotification(
          req.userId,
          "订单创建成功",
          `您的订单 ${order.orderNo} 已创建成功，请及时支付。`,
          "order",
        );

        // 提交事务
        await transaction.commit();

        res.status(201).json({
          success: true,
          message: "订单创建成功",
          data: order,
        });

        // 由于是多商品订单，这里只处理第一个商品，实际项目中应该处理所有商品
        break;
      }
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

// 获取订单列表接口（买家视角）
router.get("/buyer", authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;

    const where = { buyerId: req.userId };
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Book, include: ["seller"] },
        { model: User, as: "seller" },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

// 获取订单列表接口（卖家视角）
router.get("/seller", authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;

    const where = { sellerId: req.userId };
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [["createdAt", "DESC"]],
      include: [{ model: Book }, { model: User, as: "buyer" }],
    });

    res.status(200).json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

// 获取订单详情接口
router.get("/detail/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Book, include: ["seller"] },
        { model: User, as: "buyer" },
        { model: User, as: "seller" },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "订单不存在",
      });
    }

    // 检查是否是买家或卖家
    if (order.buyerId !== req.userId && order.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权查看此订单",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

// 更新订单状态接口
router.put("/update-status/:id", authMiddleware, async (req, res) => {
  try {
    const { status, paymentTime, shippingTime, completionTime } = req.body;

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Book }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "订单不存在",
      });
    }

    // 检查是否是买家或卖家
    if (order.buyerId !== req.userId && order.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权修改此订单",
      });
    }

    // 更新订单状态
    const updateData = { status };
    if (status === "paid" && paymentTime) updateData.paymentTime = paymentTime;
    if (status === "shipped" && shippingTime)
      updateData.shippingTime = shippingTime;
    if (status === "completed" && completionTime)
      updateData.completionTime = completionTime;

    await order.update(updateData);

    // 根据订单状态发送消息通知
    if (status === "paid") {
      // 发送消息通知给卖家
      await sendMessageNotification(
        order.sellerId,
        "订单已支付",
        `您的图书《${order.Book?.title || "图书"}》的订单已支付，请及时处理。`,
        "order",
      );
      // 发送消息通知给买家
      await sendMessageNotification(
        order.buyerId,
        "支付成功",
        `您的订单 ${order.orderNo} 已支付成功，卖家将尽快处理。`,
        "order",
      );
    } else if (status === "shipped") {
      // 发送消息通知给买家
      await sendMessageNotification(
        order.buyerId,
        "订单已发货",
        `您的订单 ${order.orderNo} 已发货，请及时查收。`,
        "order",
      );
    } else if (status === "completed") {
      // 发送消息通知给卖家
      await sendMessageNotification(
        order.sellerId,
        "订单已完成",
        `您的图书《${order.Book?.title || "图书"}》的订单已完成，感谢您的服务。`,
        "order",
      );
      // 发送消息通知给买家
      await sendMessageNotification(
        order.buyerId,
        "订单已完成",
        `您的订单 ${order.orderNo} 已完成，感谢您的购买。`,
        "order",
      );
    } else if (status === "cancelled") {
      // 发送消息通知给卖家
      await sendMessageNotification(
        order.sellerId,
        "订单已取消",
        `您的图书《${order.Book?.title || "图书"}》的订单已取消。`,
        "order",
      );
      // 发送消息通知给买家
      await sendMessageNotification(
        order.buyerId,
        "订单已取消",
        `您的订单 ${order.orderNo} 已取消。`,
        "order",
      );
    }

    res.status(200).json({
      success: true,
      message: "订单状态更新成功",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

module.exports = router;
