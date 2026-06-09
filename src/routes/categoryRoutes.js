// const express = require('express');
// const router = express.Router();
// const categoryController = require('../controllers/categoryController');
// const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

// // Public routes
// // GET /api/v1/categories
// router.get('/categories', categoryController.getAllCategories);

// // GET /api/v1/categories/:id/products
// router.get('/categories/:id/products', categoryController.getProductsByCategory);

// // Admin routes (require authentication and admin role)
// // POST /api/v1/admin/categories
// router.post('/categories', authenticateToken, authorizeAdmin, categoryController.createCategory);

// // PUT /api/v1/admin/categories/:id
// router.put('/categories/:id', authenticateToken, authorizeAdmin, categoryController.updateCategory);

// // DELETE /api/v1/admin/categories/:id
// router.delete('/categories/:id', authenticateToken, authorizeAdmin, categoryController.deleteCategory);

// module.exports = router;

// src/routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
// GET /api/v1/categories
router.get('/', categoryController.getAllCategories);

// GET /api/v1/categories/:id/products
router.get('/:id/products', categoryController.getProductsByCategory);

// Admin routes
// POST /api/v1/admin/categories  →  mount riêng trong adminRoutes hoặc dùng prefix /admin
router.post('/', authenticateToken, authorizeAdmin, upload.single('image'), categoryController.createCategory);

// PUT /api/v1/categories/:id
router.put('/:id', authenticateToken, authorizeAdmin, upload.single('image'), categoryController.updateCategory);

// DELETE /api/v1/categories/:id
router.delete('/:id', authenticateToken, authorizeAdmin, categoryController.deleteCategory);

module.exports = router;