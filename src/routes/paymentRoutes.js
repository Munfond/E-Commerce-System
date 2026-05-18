const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Public — VNPay redirects / calls these URLs (configure Return URL & IPN in VNPay portal)
router.get('/vnpay/return', paymentController.vnpayReturn);
router.get('/vnpay/ipn', paymentController.vnpayIpn);

module.exports = router;
