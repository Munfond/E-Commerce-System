const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

// All admin routes require authentication and admin role
router.use(authenticateToken, authorizeAdmin);

// GET /api/v1/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// GET /api/v1/admin/shops
router.get('/shops', adminController.getShops);

// PATCH /api/v1/admin/shops/:id/verify
router.patch('/shops/:id/verify', adminController.verifyShop);

// PATCH /api/v1/admin/shops/:id/control
router.patch('/shops/:id/control', adminController.controlShop);

// GET /api/v1/admin/orders (alias — doc path is /api/v1/orders/admin/orders)
router.get('/orders', orderController.getAdminOrders);

module.exports = router;
