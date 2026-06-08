const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');

/**
 * GET /customer/orders
 * Get customer's orders list
 * Query params: status
 */
exports.getCustomerOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.user.id;

        const orders = await orderService.getCustomerOrders(userId, status);
        return res.status(200).json(orders);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /customer/orders/:id
 * Get order details with tracking history
 */
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        const order = await orderService.getOrderDetails(id, userId);
        return res.status(200).json(order);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /customer/orders/:id
 * Cancel order
 * Body: { reason }
 */
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        const result = await orderService.cancelOrder(id, userId, reason);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại') || err.message.includes('không thể')) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /seller/orders
 * Get seller's orders list
 * Query params: status, date_range
 */
exports.getSellerOrders = async (req, res) => {
    try {
        const { status, date_range } = req.query;
        const sellerId = req.user.id;

        const orders = await orderService.getSellerOrders(sellerId, status, date_range);
        return res.status(200).json(orders);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /seller/orders/:id/status
 * Get order status quickly
 */
exports.getOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        const status = await orderService.getOrderStatus(id, sellerId);
        return res.status(200).json(status);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /admin/orders
 * Get all orders for admin
 * Query params: status, shop_id, page, limit
 */
exports.getAdminOrders = async (req, res) => {
    try {
        const { status, shop_id, page, limit } = req.query;

        const result = await orderService.getAdminOrders(status, shop_id, page, limit);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /seller/orders/:id/status
 * Update order status
 * Body: { status }
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const sellerId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        if (!status) {
            return res.status(400).json({ error: 'Trạng thái không được để trống' });
        }

        const result = await orderService.updateOrderStatus(id, sellerId, status);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('Không có quyền')) {
            return res.status(403).json({ error: err.message });
        }
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * POST /customer/orders
 * Create new order (checkout)
 * Body: { payment_method, shipping_address }
 * Cart items are automatically fetched from user's cart
 */
exports.createOrder = async (req, res) => {
    try {
        const { payment_method, shipping_address } = req.body;
        const userId = req.user.id;

        if (!payment_method || !shipping_address) {
            return res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
        }

        const result = await orderService.createOrder(userId, payment_method, shipping_address);
        return res.status(201).json(result);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

/**
 * GET /customer/orders/:id/payment_link
 * Get VNPay payment link for order
 */
exports.getPaymentLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const ipAddr = req.headers['x-forwarded-for']?.split(',')[0].trim()
            || req.socket.remoteAddress
            || '127.0.0.1';

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        const result = await orderService.getPaymentLink(id, userId, ipAddr);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * GET /orders/vnpay-return
 * VNPay redirect callback sau khi khách thanh toán (public route)
 * VNPay gắn kết quả vào query string, ví dụ: ?vnp_ResponseCode=00&vnp_TxnRef=...
 */
exports.vnpayReturn = async (req, res) => {
    try {
        const { isValid, isSuccess, data } = paymentService.verifyReturn(req.query);

        if (!isValid) {
            return res.status(400).json({ error: 'Chữ ký không hợp lệ', data });
        }

        const orderId = data.vnp_TxnRef;

        if (isSuccess) {
            await orderService.handlePaymentSuccess(orderId);
            return res.redirect(`${process.env.FRONTEND_URL}/orders/${orderId}?payment=success`);
        } else {
            await orderService.handlePaymentFailed(orderId);
            return res.redirect(`${process.env.FRONTEND_URL}/orders/${orderId}?payment=failed&code=${data.vnp_ResponseCode}`);
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};