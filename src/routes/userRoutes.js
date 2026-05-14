const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.get('/me', authenticateToken, userController.getMe);
router.put('/me', authenticateToken, userController.updateProfile);
router.put('/password', authenticateToken, userController.changePassword);

router.get('/me/addresses', authenticateToken, userController.getAddresses);
router.post('/me/addresses', authenticateToken, userController.addAddress);
router.put('/me/addresses/:id', authenticateToken, userController.updateAddress);
router.delete('/me/addresses/:id', authenticateToken, userController.deleteAddress);

module.exports = router;