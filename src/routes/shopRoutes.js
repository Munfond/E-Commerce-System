const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/:id', shopController.getShopById);
router.get('/', shopController.getShops);
//router.get('/:id/products', shopController.getProductsByShop);

module.exports = router;