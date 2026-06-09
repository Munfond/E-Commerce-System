const supabase = require('../config/supabase');
const paymentService = require('../services/paymentService');
const cartRepo = require('./cartRepository');

const orderTable = () => supabase.from('orders');
const orderItemsTable = () => supabase.from('order_items');
const productVariantsTable = () => supabase.from('product_variants');

/**
 * Get customer's orders
 */
exports.getCustomerOrders = async (userId, status = null) => {
    let query = orderTable()
        .select('id, total_amount, status, created_at, payment_method, address_id, shop_id')
        .eq('user_id', userId);

    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
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

    // order_items -> product_variants -> products (đúng theo schema)
    const { data: items, error: itemsError } = await orderItemsTable()
        .select(`
            id,
            quantity,
            price_at_purchase,
            variant:product_variants(
                id, name, sku, sale_price,
                product:products(id, name, slug)
            )
        `)
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return { ...order, items };
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

    // order_items -> product_variants -> products -> shops
    const { data: items, error: itemsError } = await orderItemsTable()
        .select(`
            id,
            quantity,
            price_at_purchase,
            variant:product_variants(
                id, name, sku,
                product:products(id, name, shop_id)
            )
        `)
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return { ...order, items };
};

/**
 * Get seller's orders
 * Lấy orders thuộc shop của seller (dùng shop_id trên orders)
 */
exports.getSellerOrders = async (sellerId, status = null, dateRange = null) => {
    // Tìm shop của seller
    const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', sellerId)
        .single();

    if (shopError && shopError.code !== 'PGRST116') throw shopError;
    if (!shop) return [];

    let query = orderTable()
        .select('id, user_id, total_amount, status, created_at, payment_method, shop_id')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: orders, error } = await query;
    if (error) throw error;

    // Apply date range filter
    if (dateRange) {
        const [startDate, endDate] = dateRange;
        return orders.filter(o => {
            const d = new Date(o.created_at);
            return d >= startDate && d <= endDate;
        });
    }

    return orders;
};

/**
 * Get admin's all orders
 */
exports.getAdminOrders = async (status = null, shopId = null, limit = 10, offset = 0) => {
    let query = orderTable()
        .select('id, user_id, total_amount, status, created_at, payment_method, shop_id', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (shopId) query = query.eq('shop_id', shopId);

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;
    return { data, count };
};

/**
 * Create new order
 */
exports.createOrder = async (userId, cartItems, paymentMethod, addressId, voucherDiscount = null) => {
    const voucherRepo = require('./voucherRepository');
    
    const { data: firstVariant, error: variantError } = await productVariantsTable()
        .select('product:products(shop_id)')
        .eq('id', cartItems[0].variant_id)
        .single();

    if (variantError || !firstVariant) throw new Error('Variant không tồn tại');
    const shopId = firstVariant.product.shop_id;

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
        const { data: variant, error: vError } = await productVariantsTable()
            .select('id, sale_price, stock')
            .eq('id', item.variant_id)
            .single();

        if (vError || !variant) throw new Error(`Variant ${item.variant_id} không tồn tại`);
        if (variant.stock < item.quantity) throw new Error('Số lượng tồn kho không đủ');

        totalAmount += variant.sale_price * item.quantity;
        orderItemsData.push({
            order_id: null,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price_at_purchase: variant.sale_price,
        });
    }

    let finalAmount = totalAmount;
    let voucherCode = null;
    let discountAmount = 0;
    
    if (voucherDiscount) {
        discountAmount = voucherDiscount.discount_amount;
        finalAmount = totalAmount - discountAmount;
        voucherCode = voucherDiscount.code;
        
        if (finalAmount < 0) finalAmount = 0;
    }

    const { data: order, error: orderError } = await orderTable()
        .insert({
            user_id: userId,
            address_id: addressId,
            shop_id: shopId,
            total_amount: finalAmount,
            status: 'PENDING',
            payment_method: paymentMethod,
            voucher_code: voucherCode
        })
        .select()
        .single();

    if (orderError) throw orderError;

    for (const item of orderItemsData) {
        item.order_id = order.id;
    }

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
    if (itemsError) throw itemsError;

    if (voucherDiscount && voucherDiscount.voucher_id) {
        try {
            await voucherRepo.markVoucherAsUsed(userId, voucherDiscount.voucher_id);
            await voucherRepo.incrementVoucherUsedCount(voucherDiscount.voucher_id);
        } catch (vError) {
            console.warn('Warning: Could not update voucher usage:', vError.message);
        }
    }

    await cartRepo.clearCart(userId);

    return { 
        id: order.id, 
        total_amount: finalAmount,
        discount_amount: discountAmount,
        voucher_code: voucherCode
    };
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

    if (fetchError || !order) throw new Error('Đơn hàng không tồn tại');
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new Error('Chỉ có thể hủy đơn chưa giao');
    }

    const { error } = await orderTable()
        .update({ status: 'CANCELLED' })
        .eq('id', orderId);
    if (error) throw error;

    return { success: true };
};

/**
 * Update order status (seller)
 */
exports.updateOrderStatus = async (orderId, sellerId, newStatus) => {
    // Verify order belongs to seller's shop
    const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', sellerId)
        .single();

    if (shopError || !shop) throw new Error('Không tìm thấy shop của seller');

    const { data: order, error: orderError } = await orderTable()
        .select('id')
        .eq('id', orderId)
        .eq('shop_id', shop.id)
        .single();

    if (orderError || !order) throw new Error('Không có quyền cập nhật đơn hàng này');

    const { error } = await orderTable()
        .update({ status: newStatus })
        .eq('id', orderId);
    if (error) throw error;

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

    if (error || !data) throw new Error('Đơn hàng không tồn tại');
    return data;
};

/**
 * Create VNPay payment link
 */
exports.createPaymentLink = async (orderId, ipAddr) => {
    const { data: order, error } = await orderTable()
        .select('id, total_amount')
        .eq('id', orderId)
        .single();

    if (error || !order) throw new Error('Đơn hàng không tồn tại');

    const paymentUrl = paymentService.createPaymentUrl(order.id, order.total_amount, ipAddr);
    return { payment_url: paymentUrl };
};

/**
 * Cập nhật đơn hàng sang CONFIRMED sau khi thanh toán VNPay thành công
 */
exports.handlePaymentSuccess = async (orderId) => {
    const { error } = await orderTable()
        .update({ status: 'CONFIRMED' })
        .eq('id', orderId);
    if (error) throw error;
};

/**
 * Cập nhật đơn hàng sang FAILED sau khi thanh toán VNPay thất bại
 */
exports.handlePaymentFailed = async (orderId) => {
    const { error } = await orderTable()
        .update({ status: 'FAILED' })
        .eq('id', orderId);
    if (error) throw error;
};

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
        .select('id, username, email')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};