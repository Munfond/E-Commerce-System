const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const shopController = require('../controllers/shopController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post('/shops', upload.single('shop_logo'), shopController.registerShop);
router.get('/shops/me', shopController.getMyShop);
router.patch('/shops/me', upload.single('shop_logo'), shopController.updateShop);
router.patch('/shops/me/status', shopController.updateShopStatus);
router.patch('/shops/address', shopController.updateAddress);

module.exports = router;