const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Tất cả route cart cần phải authenticate
router.use(authenticateToken);

// GET /customer/cart - Lấy giỏ hàng
router.get('/', cartController.getCart);

// POST /customer/cart/:variant_id - Thêm sản phẩm vào giỏ
router.post('/:variant_id', cartController.addItem);

// PUT /customer/cart/items/:item_id - Cập nhật số lượng
router.put('/items/:item_id', cartController.updateQuantity);

// DELETE /customer/cart/items/:item_id - Xóa sản phẩm khỏi giỏ
router.delete('/items/:item_id', cartController.removeItem);

// DELETE /customer/cart - Xóa toàn bộ giỏ hàng
router.delete('/', cartController.clearCart);

module.exports = router;
