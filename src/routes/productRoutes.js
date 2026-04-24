const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeAdmin, authorizeSeller } = require('../middlewares/authMiddleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// GET /api/v1/customer/products
// Search and filter products
router.get('/customer/products', productController.searchProducts);

// GET /api/v1/customer/products/:id
// Get product details
router.get('/customer/products/:id', productController.getProductDetails);

// ============================================
// CUSTOMER ROUTES (Authentication required)
// ============================================

// POST /api/v1/customer/products/:id/reviews
// Create product review
router.post('/customer/products/:id/reviews', authenticateToken, productController.createReview);

// ============================================
// SELLER ROUTES (Authentication + Seller role required)
// ============================================

// GET /api/v1/seller/products
// Get seller's products list
router.get('/seller/products', authenticateToken, authorizeSeller, productController.getSellerProducts);

// POST /api/v1/seller/products
// Create new product
router.post('/seller/products', authenticateToken, authorizeSeller, productController.createProduct);

// PUT /api/v1/seller/products/:id
// Update product
router.put('/seller/products/:id', authenticateToken, authorizeSeller, productController.updateProduct);

// DELETE /api/v1/seller/products/:id
// Delete product
router.delete('/seller/products/:id', authenticateToken, authorizeSeller, productController.deleteProduct);

// PATCH /api/v1/seller/products/:id/stock
// Update stock quantity
router.patch('/seller/products/:id/stock', authenticateToken, authorizeSeller, productController.updateStock);

// GET /api/v1/seller/statistics
// Get seller revenue statistics
router.get('/seller/statistics', authenticateToken, authorizeSeller, productController.getStatistics);

// ============================================
// ADMIN ROUTES (Authentication + Admin role required)
// ============================================

// GET /api/v1/admin/products
// Get pending products for moderation
router.get('/admin/products', authenticateToken, authorizeAdmin, productController.getPendingProducts);

// DELETE /api/v1/admin/products/:id
// Delete product for violation
router.delete('/admin/products/:id', authenticateToken, authorizeAdmin, productController.adminDeleteProduct);

module.exports = router;
