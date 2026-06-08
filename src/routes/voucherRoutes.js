const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// CHÚ Ý: Bạn cần thay thế bằng đường dẫn file Middleware Auth thực tế trong dự án của bạn
const { authenticateToken, authorizeSellerOrAdmin } = require('../middlewares/authMiddleware');

// 1. Luồng hành động Tạo: Chỉ cho phép Seller (Chủ shop) hoặc Admin sàn vào tạo
router.post('/create', authenticateToken, authorizeSellerOrAdmin, voucherController.createVoucher);

// 2. Dành cho Khách hàng trải nghiệm mua sắm
router.post('/save', authenticateToken, voucherController.saveVoucher);
router.get('/my-wallet', authenticateToken, voucherController.getMyWallet);
router.get('/my-wallet/:shop_id', authenticateToken, voucherController.getShopVoucherFromMyWallet)

module.exports = router;


/* CREATE VOUCHERS
Nếu là shop thì shop.id lấy từ middleware auth 
{
  "code": "SAMSUNG100K",
  "description": "Mã giảm giá tri ân khách hàng mua điện thoại",
  "type": "FIXED",
  "discount_value": 100000,
  "min_order_value": 2000000,
  "usage_limit": 50,
  "per_user_limit": 1,
  "start_date": "2026-06-06T00:00:00Z",
  "end_date": "2026-07-06T23:59:59Z"
}
  
Nếu là admin thì sẽ ko cần shop_id
{
  "code": "ALLSAN66",
  "shop_id": null,
  "description": "Voucher toàn sàn giảm 10% dịp siêu sale",
  "type": "PERCENTAGE",
  "discount_value": 10,
  "max_discount_amount": 50000,
  "min_order_value": 150000,
  "usage_limit": 1000,
  "per_user_limit": 1,
  "start_date": "2026-06-06T00:00:00Z",
  "end_date": "2026-06-07T23:59:59Z"
}*/

/* SAVE VOUCHER TO WALLET
{
  "code": "SAMSUNG100K"
}
*/

/* GET MY WALLET
Không cần body, chỉ cần header Authorization: Bearer <token>
*/