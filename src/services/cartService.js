const cartRepo = require('../repositories/cartRepository');

exports.getCart = async (userId) => {
    const items = await cartRepo.getCartItems(userId);
    
    // Tính tổng tiền
    const total = items.reduce((sum, item) => {
        return sum + ((item.price_at_time || 0) * (item.quantity || 0));
    }, 0);

    return {
        items: items.map(item => {
            // Handle Supabase relationship - product_variants returns object (single) or array
            const variant = Array.isArray(item.product_variants) 
                ? item.product_variants[0] 
                : item.product_variants;
            
            const product = variant?.products ? (Array.isArray(variant.products) ? variant.products[0] : variant.products) : null;
            
            return {
                id: item.id,
                variant_id: item.variant_id,
                product_name: product?.name || 'Unknown Product',
                variant_name: variant?.name || 'Unknown Variant',
                price: item.price_at_time || variant?.price || 0,
                quantity: item.quantity || 0,
                subtotal: (item.price_at_time || variant?.price || 0) * (item.quantity || 0)
            };
        }),
        total,
        count: items.length
    };
};

exports.addItemToCart = async (userId, productId, quantity) => {
    if (!quantity || quantity < 1) {
        throw new Error('Số lượng không hợp lệ');
    }

    const item = await cartRepo.addToCart(userId, productId, quantity);
    return {
        success: true,
        message: 'Thêm sản phẩm vào giỏ thành công',
        item
    };
};

exports.removeItemFromCart = async (userId, itemId) => {
    const result = await cartRepo.removeFromCart(userId, itemId);
    return result;
};

exports.updateItemQuantity = async (userId, itemId, quantity) => {
    if (!quantity || quantity < 1) {
        throw new Error('Số lượng không hợp lệ');
    }

    const item = await cartRepo.updateQuantity(userId, itemId, quantity);
    return {
        success: true,
        message: 'Cập nhật số lượng thành công',
        item
    };
};

exports.clearCart = async (userId) => {
    return await cartRepo.clearCart(userId);
};
