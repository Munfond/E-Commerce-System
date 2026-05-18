const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeSeller } = require('../middlewares/authMiddleware');

// POST /api/v1/sellers/shops - Register shop (API docs)
router.post('/shops', authenticateToken, sellerController.registerSeller);
// Legacy alias
router.post('/register', authenticateToken, sellerController.registerSeller);

router.use(authenticateToken, authorizeSeller);

// GET /api/v1/sellers/shops/me
router.get('/shops/me', sellerController.getShopInfo);
router.get('/shop', sellerController.getShopInfo);

// PATCH /api/v1/sellers/shops/me
router.patch('/shops/me', sellerController.updateShop);
router.put('/shop', sellerController.updateShop);

// PATCH /api/v1/sellers/shops/me/status
router.patch('/shops/me/status', sellerController.updateShopStatus);

// PATCH /api/v1/sellers/shops/address
router.patch('/shops/address', sellerController.updateShopAddress);

// GET /api/v1/sellers/dashboard (extra, not in API docs)
router.get('/dashboard', sellerController.getDashboard);

// Order routes (alias: /api/v1/sellers/orders — doc path is /api/v1/orders/seller/orders)
router.get('/orders', orderController.getSellerOrders);
router.get('/orders/:id/status', orderController.getOrderStatus);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

module.exports = router;
