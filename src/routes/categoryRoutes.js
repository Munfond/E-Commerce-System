const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// GET /api/v1/categories
router.get('/', categoryController.getAllCategories);

// GET /api/v1/categories/:id/products
router.get('/:id/products', categoryController.getProductsByCategory);

// ============================================
// ADMIN ROUTES (Authentication + Admin role required)
// ============================================

// POST /api/v1/categories
router.post('/', authenticateToken, authorizeAdmin, categoryController.createCategory);

// PUT /api/v1/categories/:id
router.put('/:id', authenticateToken, authorizeAdmin, categoryController.updateCategory);

// DELETE /api/v1/categories/:id
router.delete('/:id', authenticateToken, authorizeAdmin, categoryController.deleteCategory);

module.exports = router;
