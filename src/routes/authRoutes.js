const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const googleController = require('../controllers/googleController');
const passwordController = require('../controllers/passwordController');
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

// Link: /api/v1/auth/google
router.get('/google', googleController.getGoogleUrl);

// Link: /api/v1/auth/google/callback
router.get('/google/callback', googleController.googleCallback);

// Route lấy thông tin cá nhân (Phải đăng nhập mới lấy được)
router.get('/me', authenticateToken, authController.getMe);

// Link: /api/v1/auth/password-reset
router.post('/password-reset/request', passwordController.requestPasswordReset);
router.post('/password-reset/verify', passwordController.verifyOtp);
router.post('/password-reset/reset', passwordController.resetPassword);

module.exports = router;