const orderService = require('../services/orderService');

function mapOrderErrorStatus(err, defaults = { notFound: 404, badRequest: 400, server: 500 }) {
    const message = err.message || '';
    if (message.includes('không tồn tại') || message.includes('Không có quyền')) {
        return message.includes('Không có quyền') ? 403 : defaults.notFound;
    }
    if (message.includes('không thể') || message.includes('không hợp lệ') || message.includes('không được')) {
        return defaults.badRequest;
    }
    return defaults.server;
}

/**
 * GET /customer/orders
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
 */
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ error: 'ID đơn hàng không hợp lệ' });
        }

        const order = await orderService.getOrderDetails(id, userId);
        return res.status(200).json(order);
    } catch (err) {
        return res.status(mapOrderErrorStatus(err)).json({ error: err.message });
    }
};

/**
 * PATCH /customer/orders/:id
 * Body: { reason }
 */
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const body = req.body || {};
        const reason = body.reason;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Lý do hủy đơn không được để trống' });
        }

        const result = await orderService.cancelOrder(id, userId, reason);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(mapOrderErrorStatus(err, { notFound: 404, badRequest: 400, server: 500 })).json({ error: err.message });
    }
};

/**
 * GET /seller/orders
 */
exports.getSellerOrders = async (req, res) => {
    try {
        const { status, date_range } = req.query;
        const sellerId = req.user.id;

        let parsedDateRange = null;
        if (date_range) {
            const parts = typeof date_range === 'string'
                ? date_range.split(',').map(d => d.trim())
                : date_range;
            if (Array.isArray(parts) && parts.length === 2) {
                parsedDateRange = parts;
            }
        }

        const orders = await orderService.getSellerOrders(sellerId, status, parsedDateRange);
        return res.status(200).json(orders);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /seller/orders/:id/status
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
        return res.status(mapOrderErrorStatus(err)).json({ error: err.message });
    }
};

/**
 * GET /admin/orders
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
 * Body: { status }
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const { status } = body;
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
        return res.status(mapOrderErrorStatus(err)).json({ error: err.message });
    }
};

/**
 * POST /customer/orders
 * Body: { cart_items?, payment_method, address_id | shipping_address, use_cart? }
 */
exports.createOrder = async (req, res) => {
    try {
        const body = req.body || {};
        const cart_items = body.cart_items;
        const payment_method = body.payment_method;
        const address_id = body.address_id || body.shipping_address;
        const use_cart = body.use_cart === true || body.use_cart === 'true';
        const userId = req.user.id;

        if (!payment_method) {
            return res.status(400).json({ error: 'Thiếu phương thức thanh toán (payment_method)' });
        }

        if (!address_id) {
            return res.status(400).json({ error: 'Thiếu địa chỉ giao hàng (address_id)' });
        }

        if (!use_cart && (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0)) {
            return res.status(400).json({
                error: 'Thiếu cart_items hoặc đặt use_cart: true để checkout từ giỏ hàng'
            });
        }

        const result = await orderService.createOrder(
            userId,
            cart_items,
            payment_method,
            address_id,
            use_cart
        );
        return res.status(201).json(result);
    } catch (err) {
        return res.status(mapOrderErrorStatus(err)).json({ error: err.message });
    }
};

/**
 * GET /customer/orders/:id/payment_link
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
        return res.status(mapOrderErrorStatus(err)).json({ error: err.message });
    }
};
