const supabase = require('../config/supabase');
const cartRepo = require('./cartRepository');

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
            "product image": productImage,
            "total amout": order.total_amount,
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

    // Get order items joining variants and products
    const { data: rawItems, error: itemsError } = await orderItemsTable()
        .select(`
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
        `)
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    const items = (rawItems || []).map(item => ({
        id: item.id,
        price_at_purchase: item.price_at_purchase,
        quantity: item.quantity,
        product: {
            name: item.product_variants?.products?.name || '',
            image_url: item.product_variants?.file_path || ''
        }
    }));

    // Get order history safely
    let history = [];
    try {
        const { data, error } = await orderHistoryTable()
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });
        if (!error && data) {
            history = data;
        }
    } catch (e) {
        console.warn('order_history table not available:', e.message);
    }

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

    // Get order items joining variants and products
    const { data: rawItems, error: itemsError } = await orderItemsTable()
        .select(`
            id,
            price_at_purchase,
            quantity,
            product_variants (
                id,
                name,
                file_path,
                products (
                    id,
                    name,
                    shop_id
                )
            )
        `)
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    const items = (rawItems || []).map(item => ({
        id: item.id,
        price_at_purchase: item.price_at_purchase,
        quantity: item.quantity,
        product: {
            name: item.product_variants?.products?.name || '',
            image_url: item.product_variants?.file_path || '',
            seller_id: item.product_variants?.products?.shop_id || null // use shop_id as seller identifier
        }
    }));

    // Get order history safely
    let history = [];
    try {
        const { data, error } = await orderHistoryTable()
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });
        if (!error && data) {
            history = data;
        }
    } catch (e) {
        console.warn('order_history table not available:', e.message);
    }

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
exports.createOrder = async (userId, paymentMethod, addressId) => {
    // 1. Lấy thông tin từ giỏ hàng hiện tại của user
    const cartItems = await cartRepo.getCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
        throw new Error('Giỏ hàng trống, không thể tạo đơn hàng');
    }

    // 2. Kiểm tra tồn kho (stock) của từng mẫu sản phẩm (variant)
    for (const item of cartItems) {
        const variantStock = item.product_variants?.stock || 0;
        const variantName = item.product_variants?.name || 'Sản phẩm';
        if (variantStock < item.quantity) {
            throw new Error(`Mẫu sản phẩm "${variantName}" không đủ hàng trong kho (Còn lại: ${variantStock})`);
        }
    }

    // 3. Tính tổng tiền & lấy shop_id từ sản phẩm đầu tiên
    let totalAmount = 0;
    for (const item of cartItems) {
        const price = item.product_variants?.sale_price || 0;
        totalAmount += price * item.quantity;
    }
    
    const shopId = cartItems[0]?.product_variants?.products?.shop_id || null;

    // 4. Tạo đơn hàng mới trong bảng orders
    const { data: order, error: orderError } = await orderTable()
        .insert({
            user_id: userId,
            address_id: addressId,
            shop_id: shopId,
            total_amount: totalAmount,
            status: 'PENDING',
            payment_method: paymentMethod
        })
        .select()
        .single();

    if (orderError) throw orderError;

    // 5. Thêm các sản phẩm vào order_items & Trừ số lượng tồn kho (stock) trong product_variants
    const orderItemsData = [];
    for (const item of cartItems) {
        const priceAtPurchase = item.product_variants?.sale_price || 0;
        orderItemsData.push({
            order_id: order.id,
            variant_id: item.variant_id,
            price_at_purchase: priceAtPurchase,
            quantity: item.quantity
        });

        // Trừ tồn kho (stock) của variant
        const newStock = (item.product_variants?.stock || 0) - item.quantity;
        const { error: stockError } = await supabase
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', item.variant_id);

        if (stockError) throw stockError;
    }

    // Chèn danh sách order_items
    const { error: itemsError } = await orderItemsTable()
        .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // 6. Lưu vào lịch sử đơn hàng (order_history) safely
    try {
        await orderHistoryTable()
            .insert({
                order_id: order.id,
                status: 'PENDING',
                message: 'Đơn hàng được tạo thành công từ giỏ hàng'
            });
    } catch (historyErr) {
        console.warn('order_history table not available:', historyErr.message);
    }

    // 7. Xóa toàn bộ giỏ hàng hiện tại (reset cart)
    await cartRepo.clearCart(userId);

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

    // Add to history safely
    try {
        await orderHistoryTable()
            .insert({
                order_id: orderId,
                status: 'CANCELLED',
                message: `Hủy đơn hàng: ${reason}`
            });
    } catch (historyErr) {
        console.warn('order_history table not available:', historyErr.message);
    }

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

    // Add to history safely
    try {
        await orderHistoryTable()
            .insert({
                order_id: orderId,
                status: newStatus,
                message: `Cập nhật trạng thái: ${getStatusMessage(newStatus)}`
            });
    } catch (historyErr) {
        console.warn('order_history table not available:', historyErr.message);
    }

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

/**
 * Direct update order status (bypassing seller check, e.g. for IPN/payment callbacks)
 */
exports.updateOrderStatusDirect = async (orderId, newStatus) => {
    const { error } = await orderTable()
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) throw error;

    // Add to history safely
    try {
        await orderHistoryTable()
            .insert({
                order_id: orderId,
                status: newStatus,
                message: `Thanh toán thành công: Cập nhật trạng thái thành ${getStatusMessage(newStatus)}`
            });
    } catch (historyErr) {
        console.warn('order_history table not available:', historyErr.message);
    }
};
