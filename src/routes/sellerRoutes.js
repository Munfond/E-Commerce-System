const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const shopController = require('../controllers/shopController');

router.use(authenticateToken);

router.post('/shops', shopController.registerShop);
router.get('/shops/me', shopController.getMyShop);
router.patch('/shops/me', shopController.updateShop);
router.patch('/shops/me/status', shopController.updateShopStatus);
router.patch('/shops/address', shopController.updateAddress);

module.exports = router;