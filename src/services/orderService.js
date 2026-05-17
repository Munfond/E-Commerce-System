const orderRepo = require('../repositories/orderRepository');
const cartRepo = require('../repositories/cartRepository');

/**
 * Get customer's orders list
 */
exports.getCustomerOrders = async (userId, status = null) => {
    try {
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
        
        if (status && !validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        const orders = await orderRepo.getCustomerOrders(userId, status);
        return orders;
    } catch (err) {
        throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${err.message}`);
    }
};

/**
 * Get order details with history (customer)
 */
exports.getOrderDetails = async (orderId, userId) => {
    try {
        if (!orderId) {
            throw new Error('ID đơn hàng không được để trống');
        }

        const order = await orderRepo.getOrderById(orderId, userId);
        return order;
    } catch (err) {
        throw new Error(`Lỗi khi lấy chi tiết đơn hàng: ${err.message}`);
    }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (orderId, userId, reason) => {
    try {
        if (!orderId) {
            throw new Error('ID đơn hàng không được để trống');
        }

        if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
            throw new Error('Lý do hủy đơn không được để trống');
        }

        if (reason.length > 500) {
            throw new Error('Lý do tối đa 500 ký tự');
        }

        await orderRepo.cancelOrder(orderId, userId, reason.trim());
        return { success: true };
    } catch (err) {
        throw new Error(`Lỗi khi hủy đơn hàng: ${err.message}`);
    }
};

/**
 * Get seller's orders
 */
exports.getSellerOrders = async (sellerId, status = null, dateRange = null) => {
    try {
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
        
        if (status && !validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        let parsedDateRange = null;
        if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
            parsedDateRange = [new Date(dateRange[0]), new Date(dateRange[1])];
        }

        const orders = await orderRepo.getSellerOrders(sellerId, status, parsedDateRange);
        return orders;
    } catch (err) {
        throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${err.message}`);
    }
};

/**
 * Get admin's orders
 */
exports.getAdminOrders = async (status = null, shopId = null, page = 1, limit = 10) => {
    try {
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (page - 1) * limit;

        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
        
        if (status && !validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        const { data, count } = await orderRepo.getAdminOrders(status, shopId, limit, offset);

        return {
            data,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    } catch (err) {
        throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${err.message}`);
    }
};

/**
 * Create new order (checkout)
 */
exports.createOrder = async (userId, cartItems, paymentMethod, addressId) => {
    try {
        // Validate input
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Giỏ hàng không thể trống');
        }

        if (!paymentMethod || typeof paymentMethod !== 'string') {
            throw new Error('Phương thức thanh toán không hợp lệ');
        }

        const validPaymentMethods = ['CASH', 'VNPAY', 'MOMO', 'CARD'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            throw new Error('Phương thức thanh toán không được hỗ trợ');
        }

        if (!addressId || typeof addressId !== 'string' || addressId.trim().length === 0) {
            throw new Error('Địa chỉ giao hàng không được để trống');
        }

        // Validate cart items
        const validatedItems = [];
        for (const item of cartItems) {
            if (!item.variant_id || !item.quantity) {
                throw new Error('Dữ liệu sản phẩm trong giỏ không hợp lệ');
            }
            if (item.quantity <= 0) {
                throw new Error('Số lượng sản phẩm phải lớn hơn 0');
            }
            validatedItems.push({
                variant_id: item.variant_id,
                quantity: parseInt(item.quantity)
            });
        }

        const result = await orderRepo.createOrder(userId, validatedItems, paymentMethod, addressId.trim());
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi tạo đơn hàng: ${err.message}`);
    }
};

/**
 * Update order status (seller)
 */
exports.updateOrderStatus = async (orderId, sellerId, status) => {
    try {
        if (!orderId) {
            throw new Error('ID đơn hàng không được để trống');
        }

        if (!status) {
            throw new Error('Trạng thái không được để trống');
        }

        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
        if (!validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        await orderRepo.updateOrderStatus(orderId, sellerId, status);
        return { success: true };
    } catch (err) {
        throw new Error(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    }
};

/**
 * Get order status
 */
exports.getOrderStatus = async (orderId, sellerId) => {
    try {
        if (!orderId) {
            throw new Error('ID đơn hàng không được để trống');
        }

        // Verify seller has products in this order
        const result = await orderRepo.getOrderStatus(orderId);
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi lấy trạng thái đơn hàng: ${err.message}`);
    }
};

/**
 * Get payment link
 */
exports.getPaymentLink = async (orderId, userId) => {
    try {
        if (!orderId) {
            throw new Error('ID đơn hàng không được để trống');
        }

        // Verify order belongs to user
        const order = await orderRepo.getOrderById(orderId, userId);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Only pending orders can generate payment links
        if (order.status !== 'PENDING') {
            throw new Error('Chỉ có thể tạo link thanh toán cho đơn hàng chưa thanh toán');
        }

        const result = await orderRepo.createPaymentLink(orderId);
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi tạo link thanh toán: ${err.message}`);
    }
};
