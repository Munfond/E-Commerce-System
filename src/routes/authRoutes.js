const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Link: /api/v1/auth/accounts
router.post('/accounts', authController.register);

// Link: /api/v1/auth/verifications
router.post('/verifications', authController.verify);

// Link: /api/v1/auth/sessions
router.post('/sessions', authController.login);

// Link: /api/v1/auth/sessions/logout
router.delete('/sessions', authController.logout);

// Link: /api/v1/auth/sessions/refresh
router.post('/sessions/refresh', authController.refreshSession);

// Link: /api/v1/auth/sessions/google
//router.post('/sessions/google', authController.googleLogin);

// Route lấy thông tin cá nhân (Phải đăng nhập mới lấy được)
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;