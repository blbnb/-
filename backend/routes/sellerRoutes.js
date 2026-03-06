const express = require('express');
const router = express.Router();
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const sellerController = require('../controllers/sellerController');

// 商家认证路由
router.post('/register', sellerController.register);
router.post('/login', sellerController.login);

// 商家图书管理路由
router.post('/books', authMiddleware, sellerMiddleware, sellerController.createBook);
router.get('/books', authMiddleware, sellerMiddleware, sellerController.getSellerBooks);
router.put('/books/:id', authMiddleware, sellerMiddleware, sellerController.updateBook);
router.delete('/books/:id', authMiddleware, sellerMiddleware, sellerController.deleteBook);

// 商家订单管理路由
router.get('/orders', authMiddleware, sellerMiddleware, sellerController.getSellerOrders);
router.put('/orders/:id/status', authMiddleware, sellerMiddleware, sellerController.updateOrderStatus);

// 商家信息管理路由
router.get('/profile', authMiddleware, sellerMiddleware, sellerController.getSellerProfile);
router.put('/profile', authMiddleware, sellerMiddleware, sellerController.updateSellerProfile);

module.exports = router;