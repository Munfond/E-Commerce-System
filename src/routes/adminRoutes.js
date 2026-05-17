const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');
const productControllerV2 = require('../controllers/productControllerV2');

// Chỉ Admin mới được truy cập
router.use(authenticateToken, authorizeRole('admin')); 

router.patch('/shops/:id/verify', adminController.verifyShop); 
router.patch('/shops/:id/control', adminController.controlShop);
router.get('/shops', adminController.getShops);

router.get('/products', adminController.getProducts);
module.exports = router;