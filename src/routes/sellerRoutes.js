const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticateToken, authorizeSeller } = require('../middlewares/authMiddleware');

// POST /api/v1/sellers/register - Register as seller
router.post('/register', authenticateToken, sellerController.registerSeller);

// Require seller role for the rest
router.use(authenticateToken, authorizeSeller);

// GET /api/v1/sellers/shop
router.get('/shop', sellerController.getShopInfo);

// PUT /api/v1/sellers/shop
router.put('/shop', sellerController.updateShop);

// GET /api/v1/sellers/dashboard
router.get('/dashboard', sellerController.getDashboard);

module.exports = router;
