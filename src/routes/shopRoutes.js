const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Public routes
// GET /api/v1/shops
router.get('/', shopController.getShops);

// GET /api/v1/shops/:id
router.get('/:id', shopController.getShopProfile);

// GET /api/v1/shops/:id/products
router.get('/:id/products', shopController.getShopProducts);

// Protected routes
// POST /api/v1/shops/:id/reports
router.post('/:id/reports', authenticateToken, shopController.reportShop);

module.exports = router;
