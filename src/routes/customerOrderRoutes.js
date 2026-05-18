const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * Customer order routes mounted at /api/v1/customer
 * Full paths: /api/v1/customer/orders, /api/v1/customer/orders/:id, ...
 * (parallel to /api/v1/customer/cart)
 */
router.get('/orders', authenticateToken, orderController.getCustomerOrders);
router.get('/orders/:id/payment_link', authenticateToken, orderController.getPaymentLink);
router.get('/orders/:id', authenticateToken, orderController.getOrderDetails);
router.patch('/orders/:id', authenticateToken, orderController.cancelOrder);
router.post('/orders', authenticateToken, orderController.createOrder);

module.exports = router;
