const supabase = require('../config/supabase');

const orderTable = () => supabase.from('orders');
const orderItemsTable = () => supabase.from('order_items');
const orderHistoryTable = () => supabase.from('order_history');
const cartTable = () => supabase.from('cart');
const productTable = () => supabase.from('products');

/**
 * Get customer's orders
 */
exports.getCustomerOrders = async (userId, status = null) => {
    let query = orderTable()
        .select(`
            id,
            total_amount,
            status,
            created_at,
            payment_method,
            address_id,
            order_items (
                id,
                price_at_purchase,
                quantity,
                product_variants (
                    id,
                    name,
                    file_path,
                    products (
                        id,
                        name
                    )
                )
            )
        `)
        .eq('user_id', userId);

    if (status) {
        query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return data.map(order => {
        const firstItem = order.order_items?.[0];
        const productName = firstItem?.product_variants?.products?.name || '';
        const productImage = firstItem?.product_variants?.file_path || '';

        return {
            id: order.id,
            "product name": productName,
            "product_name": productName,
            "productName": productName,
            "product image": productImage,
            "product_image": productImage,
            "productImage": productImage,
            "total amout": order.total_amount,
            "total_amount": order.total_amount,
            "totalAmount": order.total_amount,
            status: order.status,
            created_at: order.created_at,
            payment_method: order.payment_method,
            address_id: order.address_id,
            order_items: order.order_items
        };
    });
};

/**
 * Get order by ID (customer view)
 */
exports.getOrderById = async (orderId, userId) => {
    const { data: order, error: orderError } = await orderTable()
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

    if (orderError && orderError.code !== 'PGRST116') throw orderError;
    if (!order) throw new Error('Đơn hàng không tồn tại');

    // Get order items
    const { data: items, error: itemsError } = await orderItemsTable()
        .select('*, product:products(name, image_url)')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Get order history
    const { data: history, error: historyError } = await orderHistoryTable()
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    return {
        ...order,
        items,
        history
    };
};

/**
 * Get order by ID (admin/seller view - no user restriction)
 */
exports.getOrderByIdAdmin = async (orderId) => {
    const { data: order, error: orderError } = await orderTable()
        .select('*')
        .eq('id', orderId)
        .single();

    if (orderError && orderError.code !== 'PGRST116') throw orderError;
    if (!order) throw new Error('Đơn hàng không tồn tại');

    // Get order items
    const { data: items, error: itemsError } = await orderItemsTable()
        .select('*, product:products(name, image_url, seller_id)')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Get order history
    const { data: history, error: historyError } = await orderHistoryTable()
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    return {
        ...order,
        items,
        history
    };
};

/**
 * Get seller's orders
 */
exports.getSellerOrders = async (sellerId, status = null, dateRange = null) => {
    // Get products belonging to seller
    const { data: sellerProducts, error: productsError } = await productTable()
        .select('id')
        .eq('seller_id', sellerId);

    if (productsError) throw productsError;

    if (!sellerProducts || sellerProducts.length === 0) {
        return [];
    }

    const productIds = sellerProducts.map(p => p.id);

    // Get orders that contain seller's products
    let query = orderItemsTable()
        .select(`
            order_id,
            orders:order_id(
                id,
                user_id,
                total_amount,
                status,
                created_at,
                payment_method,
                users:user_id(username, email, phone)
            )
        `)
        .in('product_id', productIds);

    const { data, error } = await query;

    if (error) throw error;

    // Group by order_id and apply filters
    const uniqueOrders = {};
    if (data && data.length > 0) {
        data.forEach(item => {
            const orderId = item.order_id;
            if (!uniqueOrders[orderId]) {
                uniqueOrders[orderId] = item.orders;
            }
        });
    }

    let orders = Object.values(uniqueOrders);

    // Apply status filter
    if (status) {
        orders = orders.filter(o => o.status === status);
    }

    // Apply date range filter
    if (dateRange) {
        const [startDate, endDate] = dateRange;
        orders = orders.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }

    return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

/**
 * Get admin's all orders
 */
exports.getAdminOrders = async (status = null, shopId = null, limit = 10, offset = 0) => {
    let query = orderTable()
        .select('id, user_id, total_amount, status, created_at, payment_method')
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
};

/**
 * Create new order from cart
 */
exports.createOrder = async (userId, cartItems, paymentMethod, shippingAddress) => {
    // Start transaction-like behavior
    // Create order
    const { data: order, error: orderError } = await orderTable()
        .insert({
            user_id: userId,
            total_amount: 0, // Will be calculated
            status: 'PENDING',
            payment_method: paymentMethod,
            shipping_address: shippingAddress
        })
        .select()
        .single();

    if (orderError) throw orderError;

    // Create order items and calculate total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
        const { data: product, error: productError } = await productTable()
            .select('price, stock_quantity')
            .eq('id', cartItem.product_id)
            .single();

        if (productError || !product) {
            throw new Error(`Sản phẩm ${cartItem.product_id} không tồn tại`);
        }

        if (product.stock_quantity < cartItem.quantity) {
            throw new Error(`Hết hàng: Số lượng tồn kho không đủ`);
        }

        const itemTotal = product.price * cartItem.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
            order_id: order.id,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            price: product.price
        });
    }

    // Insert order items
    const { error: itemsError } = await orderItemsTable()
        .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Update order total
    const { error: updateError } = await orderTable()
        .update({ total_amount: totalAmount })
        .eq('id', order.id);

    if (updateError) throw updateError;

    // Add to order history
    await orderHistoryTable()
        .insert({
            order_id: order.id,
            status: 'PENDING',
            message: 'Đơn hàng được tạo'
        });

    // Clear user's cart
    await cartTable()
        .delete()
        .eq('user_id', userId);

    return { id: order.id, total_amount: totalAmount };
};

/**
 * Cancel order
 */
exports.cancelOrder = async (orderId, userId, reason) => {
    const { data: order, error: fetchError } = await orderTable()
        .select('status')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

    if (fetchError || !order) {
        throw new Error('Đơn hàng không tồn tại');
    }

    // Can only cancel pending or confirmed orders
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new Error('Chỉ có thể hủy đơn chưa giao');
    }

    // Update status
    const { error: updateError } = await orderTable()
        .update({ status: 'CANCELLED' })
        .eq('id', orderId);

    if (updateError) throw updateError;

    // Add to history
    await orderHistoryTable()
        .insert({
            order_id: orderId,
            status: 'CANCELLED',
            message: `Hủy đơn hàng: ${reason}`
        });

    return { success: true };
};

/**
 * Update order status (seller)
 */
exports.updateOrderStatus = async (orderId, sellerId, newStatus) => {
    // Verify seller has products in this order
    const { data: orderItems, error: itemsError } = await orderItemsTable()
        .select('product_id')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    if (!orderItems || orderItems.length === 0) {
        throw new Error('Đơn hàng không tồn tại');
    }

    // Check if any product belongs to seller
    const productIds = orderItems.map(item => item.product_id);
    const { data: products, error: productsError } = await productTable()
        .select('id')
        .in('id', productIds)
        .eq('seller_id', sellerId);

    if (productsError) throw productsError;

    if (!products || products.length === 0) {
        throw new Error('Không có quyền cập nhật đơn hàng này');
    }

    // Update order status
    const { error: updateError } = await orderTable()
        .update({ status: newStatus })
        .eq('id', orderId);

    if (updateError) throw updateError;

    // Add to history
    await orderHistoryTable()
        .insert({
            order_id: orderId,
            status: newStatus,
            message: `Cập nhật trạng thái: ${getStatusMessage(newStatus)}`
        });

    return { success: true };
};

/**
 * Get order status
 */
exports.getOrderStatus = async (orderId) => {
    const { data, error } = await orderTable()
        .select('status')
        .eq('id', orderId)
        .single();

    if (error || !data) {
        throw new Error('Đơn hàng không tồn tại');
    }

    return data;
};

/**
 * Create payment link (for external payment gateway)
 */
exports.createPaymentLink = async (orderId) => {
    const { data: order, error } = await orderTable()
        .select('id, total_amount')
        .eq('id', orderId)
        .single();

    if (error || !order) {
        throw new Error('Đơn hàng không tồn tại');
    }

    // Generate payment link (integrate with VNPay/Momo)
    // This is a placeholder - integrate with actual payment gateway
    const paymentUrl = generatePaymentUrl(orderId, order.total_amount);

    return { payment_url: paymentUrl };
};

/**
 * Update stock after order confirmed
 */
exports.updateStockAfterOrder = async (orderId) => {
    const { data: items, error: itemsError } = await orderItemsTable()
        .select('product_id, quantity')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    for (const item of items) {
        const { error: updateError } = await productTable()
            .update({
                stock_quantity: supabase.raw(`stock_quantity - ${item.quantity}`)
            })
            .eq('id', item.product_id);

        if (updateError) throw updateError;
    }
};

/**
 * Helper: Get status Vietnamese message
 */
function getStatusMessage(status) {
    const messages = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPED': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy',
        'FAILED': 'Thất bại'
    };
    return messages[status] || status;
}

/**
 * Helper: Generate payment URL
 */
function generatePaymentUrl(orderId, amount) {
    // Placeholder for VNPay/Momo integration
    // Should return actual payment gateway URL
    const baseUrl = process.env.PAYMENT_GATEWAY_URL || 'https://payment.example.com';
    return `${baseUrl}/pay?orderId=${orderId}&amount=${amount}&timestamp=${Date.now()}`;
}

/**
 * Check if order exists
 */
exports.orderExists = async (orderId) => {
    const { data, error } = await orderTable()
        .select('id')
        .eq('id', orderId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
};

/**
 * Get customer info for order
 */
exports.getCustomerInfo = async (userId) => {
    const { data, error } = await supabase
        .schema('private_auth')
        .from('users')
        .select('id, username, email, phone')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};
