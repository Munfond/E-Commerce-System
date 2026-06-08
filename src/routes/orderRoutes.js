const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeAdmin, authorizeSeller } = require('../middlewares/authMiddleware');

// ============================================
// VNPAY CALLBACK (Public - VNPay gọi trực tiếp, không có auth header)

// GET /api/v1/orders/vnpay-return
// VNPay redirect khách về đây sau khi thanh toán
router.get('/vnpay-return', orderController.vnpayReturn);

// ============================================
// CUSTOMER ROUTES (Authentication required)

// GET /api/v1/orders/customer/orders
router.get('/customer/orders', authenticateToken, orderController.getCustomerOrders);

// GET /api/v1/orders/customer/orders/:id
router.get('/customer/orders/:id', authenticateToken, orderController.getOrderDetails);

// PATCH /api/v1/orders/customer/orders/:id
router.patch('/customer/orders/:id', authenticateToken, orderController.cancelOrder);

// POST /api/v1/orders/customer/orders
router.post('/customer/orders', authenticateToken, orderController.createOrder);

// GET /api/v1/orders/customer/orders/:id/payment_link
router.get('/customer/orders/:id/payment_link', authenticateToken, orderController.getPaymentLink);

// ============================================
// SELLER ROUTES (Authentication + Seller role required)

// GET /api/v1/orders/seller/orders
router.get('/seller/orders', authenticateToken, authorizeSeller, orderController.getSellerOrders);

// GET /api/v1/orders/seller/orders/:id/status
router.get('/seller/orders/:id/status', authenticateToken, authorizeSeller, orderController.getOrderStatus);

// PATCH /api/v1/orders/seller/orders/:id/status
router.patch('/seller/orders/:id/status', authenticateToken, authorizeSeller, orderController.updateOrderStatus);

// ============================================
// ADMIN ROUTES (Authentication + Admin role required)

// GET /api/v1/orders/admin/orders
router.get('/admin/orders', authenticateToken, authorizeAdmin, orderController.getAdminOrders);

module.exports = router;