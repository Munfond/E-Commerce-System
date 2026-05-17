const cartRepo = require('../repositories/cartRepository');

exports.getCart = async (userId) => {
    const items = await cartRepo.getCartItems(userId);
    
    // Tính tổng tiền
    const total = items.reduce((sum, item) => {
        return sum + (item.price_at_time * item.quantity);
    }, 0);

    return {
        items: items.map(item => ({
            id: item.id,
            variant_id: item.variant_id,
            product_name: item.product_variants?.products?.name,
            variant_name: item.product_variants?.name,
            price: item.price_at_time,
            quantity: item.quantity,
            subtotal: item.price_at_time * item.quantity
        })),
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
