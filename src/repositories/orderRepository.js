const supabase = require('../config/supabase');
const vnpayService = require('../services/vnpayService');

const orderTable = () => supabase.from('orders');
const orderItemsTable = () => supabase.from('order_items');
const productTable = () => supabase.from('products');
const productVariantsTable = () => supabase.from('product_variants');
const userAddressesTable = () => supabase.from('user_addresses');

/** Columns that exist on public.orders (schema uses address_id, not shipping_address) */
const ORDER_COLUMNS = [
    'id', 'user_id', 'address_id', 'shop_id', 'total_amount', 'shipping_fee',
    'voucher_code', 'payment_method', 'status', 'created_at'
].join(', ');

const ORDER_WITH_ADDRESS_SELECT = `
    ${ORDER_COLUMNS},
    user_addresses:address_id(
        id, label, recipient_name, recipient_phone, city, ward, details, country
    )
`;

/**
 * Verify seller owns at least one product in the order
 */
async function verifySellerOrderAccess(orderId, sellerId) {
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) throw new Error('Seller chưa đăng ký shop');

    const { data: orderItems, error: itemsError } = await orderItemsTable()
        .select('variant_id, product_variants(product_id)')
        .eq('order_id', orderId);

    if (itemsError || !orderItems || orderItems.length === 0) {
        throw new Error('Đơn hàng không tồn tại');
    }

    const productIds = orderItems
        .map(item => item.product_variants?.product_id)
        .filter(Boolean);

    const { data: products, error: productsError } = await productTable()
        .select('id')
        .in('id', productIds)
        .eq('shop_id', shop.id);

    if (productsError || !products || products.length === 0) {
        throw new Error('Không có quyền truy cập đơn hàng này');
    }

    return true;
}

/**
 * Verify delivery address belongs to user
 */
exports.verifyUserAddress = async (userId, addressId) => {
    const { data, error } = await userAddressesTable()
        .select('id')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        throw new Error('Địa chỉ giao hàng không tồn tại');
    }
    return data;
};

/**
 * Get customer's orders
 */
exports.getCustomerOrders = async (userId, status = null) => {
    let query = orderTable()
        .select(ORDER_WITH_ADDRESS_SELECT)
        .eq('user_id', userId);

    if (status) {
        query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(order => ({
        ...order,
        shipping_address: order.user_addresses || null
    }));
};

/**
 * Get order by ID (customer view)
 */
exports.getOrderById = async (orderId, userId) => {
    const { data: order, error: orderError } = await orderTable()
        .select(ORDER_WITH_ADDRESS_SELECT)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

    if (orderError && orderError.code !== 'PGRST116') throw orderError;
    if (!order) throw new Error('Đơn hàng không tồn tại');

    const { data: items, error: itemsError } = await orderItemsTable()
        .select('*, product_variants(name, price, products(name))')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
        ...order,
        shipping_address: order.user_addresses || null,
        items
    };
};

/**
 * Get order by ID (admin/seller view - no user restriction)
 */
exports.getOrderByIdAdmin = async (orderId) => {
    const { data: order, error: orderError } = await orderTable()
        .select(ORDER_WITH_ADDRESS_SELECT)
        .eq('id', orderId)
        .single();

    if (orderError && orderError.code !== 'PGRST116') throw orderError;
    if (!order) throw new Error('Đơn hàng không tồn tại');

    const { data: items, error: itemsError } = await orderItemsTable()
        .select('*, product_variants(name, products(name, shop_id))')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
        ...order,
        shipping_address: order.user_addresses || null,
        items
    };
};

/**
 * Get seller's orders
 */
exports.getSellerOrders = async (sellerId, status = null, dateRange = null) => {
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) return [];

    const { data: sellerProducts, error: productsError } = await productTable()
        .select('id')
        .eq('shop_id', shop.id);

    if (productsError || !sellerProducts || sellerProducts.length === 0) return [];

    const productIds = sellerProducts.map(p => p.id);

    const { data: variants } = await productVariantsTable()
        .select('id')
        .in('product_id', productIds);

    if (!variants || variants.length === 0) return [];

    const variantIds = variants.map(v => v.id);

    const { data: orderItems, error: orderItemsError } = await orderItemsTable()
        .select('order_id')
        .in('variant_id', variantIds);

    if (orderItemsError) throw orderItemsError;

    const orderIds = [...new Set((orderItems || []).map(i => i.order_id).filter(Boolean))];
    if (orderIds.length === 0) return [];

    let query = orderTable()
        .select(ORDER_COLUMNS)
        .in('id', orderIds)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    if (dateRange) {
        const [startDate, endDate] = dateRange;
        query = query
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
};

/**
 * Get admin's all orders
 */
exports.getAdminOrders = async (status = null, shopId = null, limit = 10, offset = 0) => {
    let orderIdsFilter = null;

    if (shopId) {
        const { data: shopProducts } = await productTable().select('id').eq('shop_id', shopId);
        const productIds = shopProducts?.map(p => p.id) || [];

        if (productIds.length === 0) {
            return { data: [], count: 0 };
        }

        const { data: variants } = await productVariantsTable()
            .select('id')
            .in('product_id', productIds);

        const variantIds = variants?.map(v => v.id) || [];
        if (variantIds.length === 0) {
            return { data: [], count: 0 };
        }

        const { data: orderItems } = await orderItemsTable()
            .select('order_id')
            .in('variant_id', variantIds);

        orderIdsFilter = [...new Set(orderItems?.map(i => i.order_id) || [])];
        if (orderIdsFilter.length === 0) {
            return { data: [], count: 0 };
        }
    }

    let query = orderTable()
        .select(ORDER_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    if (orderIdsFilter) {
        query = query.in('id', orderIdsFilter);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
};

/**
 * Create new order from cart
 */
exports.createOrder = async (userId, cartItems, paymentMethod, addressId) => {
    await exports.verifyUserAddress(userId, addressId);

    let totalAmount = 0;
    const orderItemsData = [];
    let shopId = null;

    for (const cartItem of cartItems) {
        const { data: variant, error: variantError } = await productVariantsTable()
            .select('price, stock, products(shop_id, status)')
            .eq('id', cartItem.variant_id)
            .single();

        if (variantError || !variant) {
            throw new Error(`Sản phẩm (Biến thể) ${cartItem.variant_id} không tồn tại`);
        }

        if (variant.products?.status !== 'ACTIVE') {
            throw new Error('Sản phẩm không còn khả dụng');
        }

        if (variant.stock < cartItem.quantity) {
            throw new Error('Hết hàng: Số lượng tồn kho không đủ');
        }

        const itemShopId = variant.products?.shop_id;
        if (!itemShopId) {
            throw new Error('Sản phẩm không thuộc shop hợp lệ');
        }

        if (shopId === null) {
            shopId = itemShopId;
        } else if (shopId !== itemShopId) {
            throw new Error('Giỏ hàng có sản phẩm từ nhiều shop. Vui lòng đặt từng shop một.');
        }

        const itemTotal = variant.price * cartItem.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
            variant_id: cartItem.variant_id,
            quantity: cartItem.quantity,
            price_at_purchase: variant.price
        });
    }

    const { data: order, error: orderError } = await orderTable()
        .insert({
            user_id: userId,
            shop_id: shopId,
            total_amount: totalAmount,
            status: 'PENDING',
            payment_method: paymentMethod,
            address_id: addressId
        })
        .select()
        .single();

    if (orderError) throw orderError;

    const itemsWithOrderId = orderItemsData.map(item => ({
        ...item,
        order_id: order.id
    }));

    const { error: itemsError } = await orderItemsTable().insert(itemsWithOrderId);

    if (itemsError) {
        await orderTable().delete().eq('id', order.id);
        throw itemsError;
    }

    await exports.updateStockAfterOrder(order.id);

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

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new Error('Chỉ có thể hủy đơn chưa giao');
    }

    const { error: updateError } = await orderTable()
        .update({ status: 'CANCELLED' })
        .eq('id', orderId);

    if (updateError) throw updateError;

    await exports.restoreStockAfterCancel(orderId);

    return { success: true, reason: reason || null };
};

/**
 * Update order status (seller)
 */
exports.updateOrderStatus = async (orderId, sellerId, newStatus) => {
    await verifySellerOrderAccess(orderId, sellerId);

    const { error: updateError } = await orderTable()
        .update({ status: newStatus })
        .eq('id', orderId);

    if (updateError) throw updateError;

    return { success: true };
};

/**
 * Get order status (seller must own products in order)
 */
exports.getOrderStatus = async (orderId, sellerId) => {
    await verifySellerOrderAccess(orderId, sellerId);

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
 * Create VNPay payment link
 */
exports.createPaymentLink = async (orderId, ipAddr, options = {}) => {
    const { data: order, error } = await orderTable()
        .select('id, total_amount, status, payment_method')
        .eq('id', orderId)
        .single();

    if (error || !order) {
        throw new Error('Đơn hàng không tồn tại');
    }

    if (order.payment_method && order.payment_method !== 'VNPAY') {
        throw new Error(
            `Đơn hàng dùng ${order.payment_method}. Chỉ tạo link VNPay cho đơn có payment_method = VNPAY`
        );
    }

    const vnpay = vnpayService.createPaymentUrl({
        orderId: order.id,
        amount: order.total_amount,
        orderInfo: `Thanh toan don hang ${order.id}`,
        ipAddr,
        locale: options.locale || 'vn',
        bankCode: options.bankCode || null
    });

    return {
        order_id: order.id,
        ...vnpay
    };
};

/**
 * Decrease stock after order created
 */
exports.updateStockAfterOrder = async (orderId) => {
    const { data: items, error: itemsError } = await orderItemsTable()
        .select('variant_id, quantity')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    for (const item of items) {
        const { data: variant } = await productVariantsTable()
            .select('stock')
            .eq('id', item.variant_id)
            .single();

        if (variant) {
            await productVariantsTable()
                .update({ stock: Math.max(0, variant.stock - item.quantity) })
                .eq('id', item.variant_id);
        }
    }
};

/**
 * Restore stock when order is cancelled
 */
exports.restoreStockAfterCancel = async (orderId) => {
    const { data: items, error: itemsError } = await orderItemsTable()
        .select('variant_id, quantity')
        .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    for (const item of items) {
        const { data: variant } = await productVariantsTable()
            .select('stock')
            .eq('id', item.variant_id)
            .single();

        if (variant) {
            await productVariantsTable()
                .update({ stock: variant.stock + item.quantity })
                .eq('id', item.variant_id);
        }
    }
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
        .select('id, username, email, phone')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};
