const orderService = require('../services/orderService');
const qs = require('qs');
const crypto = require('crypto');


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
 * Body: { cart_items, payment_method, shipping_address }
 */
exports.createOrder = async (req, res) => {
    try {
        const { payment_method, shipping_address } = req.body;
        const userId = req.user.id;

        if (!payment_method || !shipping_address) {
            return res.status(400).json({ error: 'Thiếu thông tin đơn hàng (payment_method hoặc shipping_address)' });
        }

        const result = await orderService.createOrder(userId, payment_method, shipping_address);
        return res.status(201).json(result);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Helper: Format Date for VNPay (yyyyMMddHHmmss)
function formatDate(date) {
    const pad = n => String(n).padStart(2, "0");
    return (
        date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

function getVietnamDate() {
    const now = new Date();

    return new Date(
        now.toLocaleString("en-US", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    );
}

/**
 * GET /customer/orders/:id/payment_link
 * Get VNPay payment link for order
 */
exports.getPaymentLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID đơn hàng' });
        }

        // 1. Kiểm tra đơn hàng tồn tại & chưa thanh toán
        const order = await orderService.getOrderDetails(id, userId);
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({ error: 'Chỉ có thể tạo link thanh toán cho đơn hàng chưa thanh toán' });
        }

        // 2. Lấy config từ .env
        const tmnCode = process.env.VNP_TMN_CODE;
        const secret = process.env.VNP_HASH_SECRET;
        const baseUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        if (!tmnCode || !secret || !baseUrl || !returnUrl) {
            return res.status(500).json({ error: 'Cấu hình VNPay thiếu trong .env' });
        }

        // 3. Lấy IP khách
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        // 4. Tạo ngày tạo & ngày hết hạn (+15 phút)
        const date = getVietnamDate();
        const createDate = formatDate(date);

        const expire = new Date(date.getTime() + 15 * 60 * 1000);
        const expireDate = formatDate(expire);

        // 5. Số tiền nhân 100 theo VNPay
        const amount = order.total_amount * 100;

        // 6. Mã tham chiếu (txnRef)
        const txnRef = String(order.id);

        // 7. Tạo đối tượng params
        let params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Amount: amount,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
            vnp_OrderType: 'other',
            vnp_Locale: 'vn',
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
            vnp_ReturnUrl: returnUrl
        };

        // 8. Sắp xếp alphabet theo keys
        params = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {});

        // 9. Dựng chuỗi signData
        const signData = qs.stringify(params, { encode: false });

        // 10. Tạo checksum (SecureHash)
        const secureHash = crypto
            .createHmac('sha512', secret)
            .update(Buffer.from(signData, 'utf-8'))
            .digest('hex');

        params['vnp_SecureHash'] = secureHash;

        // 11. Build URL cuối cùng
        const paymentUrl = baseUrl + '?' + qs.stringify(params, { encode: true });

        // 12. Trả về cho frontend
        return res.status(200).json({ payment_url: paymentUrl });

    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /customer/vnpay_return
 * VNPay Payment Return Callback
 */
exports.vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp các tham số
        vnp_Params = Object.keys(vnp_Params)
            .sort()
            .reduce((result, key) => {
                result[key] = vnp_Params[key];
                return result;
            }, {});

        const secret = process.env.VNP_HASH_SECRET;
        const signData = qs.stringify(vnp_Params, { encode: false });
        const checkHash = crypto
            .createHmac('sha512', secret)
            .update(Buffer.from(signData, 'utf-8'))
            .digest('hex');

        if (secureHash === checkHash) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];

            if (responseCode === '00') {
                // Thanh toán thành công -> Cập nhật trạng thái đơn hàng trực tiếp
                await orderService.updateOrderStatusDirect(orderId, 'CONFIRMED');
                
                const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
                return res.redirect(`${frontendUrl}?payment=success&orderId=${orderId}`);
            } else {
                // Thanh toán thất bại
                const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
                return res.redirect(`${frontendUrl}?payment=fail&orderId=${orderId}`);
            }
        } else {
            return res.status(400).json({ error: 'Chữ ký SecureHash không khớp' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

