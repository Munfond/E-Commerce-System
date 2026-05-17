const orderService = require('../services/orderService');

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
 * Body: { cart_items, payment_method, address_id }
 */
exports.createOrder = async (req, res) => {
    try {
        const { cart_items, payment_method, address_id } = req.body;
        const userId = req.user.id;

        if (!cart_items || !payment_method || !address_id) {
            return res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
        }

        const result = await orderService.createOrder(userId, cart_items, payment_method, address_id);
        return res.status(201).json(result);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

/**
 * GET /customer/orders/:id/payment_link
 * Get payment link for order
 */
exports.getPaymentLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        const result = await orderService.getPaymentLink(id, userId);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};
