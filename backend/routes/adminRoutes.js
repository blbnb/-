const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// 管理员登录路由
router.post('/login', adminController.login);

// 用户管理路由
router.get('/users', authMiddleware, adminMiddleware, adminController.getUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);

// 商家管理路由
router.get('/sellers', authMiddleware, adminMiddleware, adminController.getSellers);
router.put('/sellers/:id', authMiddleware, adminMiddleware, adminController.updateSeller);
router.delete('/sellers/:id', authMiddleware, adminMiddleware, adminController.deleteSeller);

// 图书管理路由
router.get('/books', authMiddleware, adminMiddleware, adminController.getBooks);
router.put('/books/:id', authMiddleware, adminMiddleware, adminController.updateBook);
router.delete('/books/:id', authMiddleware, adminMiddleware, adminController.deleteBook);

// 订单管理路由
router.get('/orders', authMiddleware, adminMiddleware, adminController.getOrders);
router.put('/orders/:id', authMiddleware, adminMiddleware, adminController.updateOrder);

// 系统统计路由
router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);

module.exports = router;