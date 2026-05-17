const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

// Public routes
// GET /api/v1/categories
router.get('/', categoryController.getAllCategories);

// GET /api/v1/categories/:id/products
router.get('/:id/products', categoryController.getProductsByCategory);

// Admin routes (require authentication and admin role)
// POST /api/v1/admin/categories
router.post('/', authenticateToken, authorizeAdmin, categoryController.createCategory);

// PUT /api/v1/admin/categories/:id
router.put('/:id', authenticateToken, authorizeAdmin, categoryController.updateCategory);

// DELETE /api/v1/admin/categories/:id
router.delete('/:id', authenticateToken, authorizeAdmin, categoryController.deleteCategory);

module.exports = router;
