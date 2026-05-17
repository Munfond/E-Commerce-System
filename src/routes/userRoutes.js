const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Require authentication for all account routes
router.use(authenticateToken);

// GET /api/v1/accounts/me
router.get('/me', userController.getProfile);

// PUT /api/v1/accounts/me
router.put('/me', userController.updateProfile);

// PUT /api/v1/accounts/password
router.put('/password', userController.changePassword);

module.exports = router;
