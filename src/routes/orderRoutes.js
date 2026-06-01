const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeAdmin, authorizeSeller } = require('../middlewares/authMiddleware');

// ============================================
// CUSTOMER ROUTES (Authentication required)
// ============================================

// GET /api/v1/customer/orders
// Get customer's orders list
router.get('/customer/orders', authenticateToken, orderController.getCustomerOrders);

// GET /api/v1/customer/orders/:id
// Get order details with tracking history
router.get('/customer/orders/:id', authenticateToken, orderController.getOrderDetails);

// PATCH /api/v1/customer/orders/:id
// Cancel order
router.patch('/customer/orders/:id', authenticateToken, orderController.cancelOrder);

// POST /api/v1/customer/orders
// Create new order (checkout)
router.post('/customer/orders', authenticateToken, orderController.createOrder);

// GET /api/v1/customer/orders/:id/payment_link
// Get VNPay payment link for order
router.get('/customer/orders/:id/payment_link', authenticateToken, orderController.getPaymentLink);

// GET /api/v1/orders/customer/vnpay_return
// VNPay payment return callback (does NOT require token as it is a redirect from gateway)
router.get('/customer/vnpay_return', orderController.vnpayReturn);

// ============================================
// SELLER ROUTES (Authentication + Seller role required)
// ============================================

// GET /api/v1/seller/orders
// Get seller's orders list
router.get('/seller/orders', authenticateToken, authorizeSeller, orderController.getSellerOrders);

// GET /api/v1/seller/orders/:id/status
// Get order status quickly
router.get('/seller/orders/:id/status', authenticateToken, authorizeSeller, orderController.getOrderStatus);

// PATCH /api/v1/seller/orders/:id/status
// Update order status
router.patch('/seller/orders/:id/status', authenticateToken, authorizeSeller, orderController.updateOrderStatus);

// ============================================
// ADMIN ROUTES (Authentication + Admin role required)
// ============================================

// GET /api/v1/admin/orders
// Get all orders for admin
router.get('/admin/orders', authenticateToken, authorizeAdmin, orderController.getAdminOrders);

module.exports = router;
