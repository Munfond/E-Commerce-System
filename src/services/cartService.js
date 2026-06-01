const cartRepo = require('../repositories/cartRepository');

exports.getCart = async (userId) => {
    const items = await cartRepo.getCartItems(userId);
    //console.log(items);
    /*
    `
            id,
            cart_id,
            variant_id,
            quantity,
            product_variants:variant_id (
                id,
                name,
                sale_price,
                stock,
                file_path,
                products:product_id (
                    id,
                    name,
                    brand
                )
            )
        ` */
    
    // Tính tổng tiền
    const total = items.reduce((sum, item) => {
        return sum + (item.product_variants?.sale_price * item.quantity);
    }, 0);

    return {
        items: items.map(item => ({
            id: item.id,
            product_id: item.product_variants?.product_id,
            product_name: item.product_variants?.products?.name,
            file_path: item.product_variants?.file_path,
            price: item.product_variants?.sale_price,
            quantity: item.quantity,
            subtotal: item.product_variants?.sale_price * item.quantity
        })),
        total,
        count: items.length
    };
};

exports.addItemToCart = async (userId, variantId, quantity) => {
    if (!quantity || quantity < 1) {
        throw new Error('Số lượng không hợp lệ');
    }

    const item = await cartRepo.addToCart(userId, variantId, quantity);
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
    if (quantity === undefined || quantity === null || quantity < 0) {
        throw new Error('Số lượng không hợp lệ');
    }

    const item = await cartRepo.updateQuantity(userId, itemId, quantity);
    if (quantity === 0) {
        return {
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng'
        };
    }
    return {
        success: true,
        message: 'Cập nhật số lượng thành công',
        item
    };
};

exports.clearCart = async (userId) => {
    return await cartRepo.clearCart(userId);
};
