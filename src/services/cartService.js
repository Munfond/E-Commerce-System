const cartRepo = require('../repositories/cartRepository');

exports.getCart = async (userId) => {
    const items = await cartRepo.getCartItems(userId);
    
    const shopMap = {};
    let cartTotalItemsCount = 0;

    items.forEach(item => {
        const variant = item.product_variants;
        const product = variant?.products;
        const shop = product?.shops; // Lấy thông tin shop đã select ở Repo

        // Fallback nếu dữ liệu DB bị thiếu/lỗi liên kết
        const shopId = product?.shop_id || 'unknown_shop';
        const shopName = shop?.shop_name || 'Cửa hàng thành viên';
        const shopLogo = shop?.shop_logo || null;

        const price = variant?.sale_price || 0;
        const quantity = item.quantity || 0;
        const subtotal = price * quantity;

        // Cộng dồn tổng số lượng item có trong giỏ hàng
        cartTotalItemsCount += quantity;

        // Nếu shop này chưa có trong Map thì khởi tạo cấu trúc cho Shop đó
        if (!shopMap[shopId]) {
            shopMap[shopId] = {
                shop_id: shopId,
                shop_name: shopName,
                shop_logo: shopLogo,
                shop_subtotal: 0,
                items: []
            };
        }

        // Đẩy sản phẩm vào đúng nhóm của Shop
        shopMap[shopId].items.push({
            id: item.id,
            product_id: variant?.product_id,
            product_name: product?.name,
            variant_id: item.variant_id,
            variant_name: variant?.name || "Mặc định", // 'Phân loại: Tím, 128GB'
            file_path: variant?.file_path,
            price: price,
            quantity: quantity,
            subtotal: subtotal,
            stock: variant?.stock || 0
        });

        // Cộng dồn tổng tiền của riêng Shop này
        shopMap[shopId].shop_subtotal += subtotal;
    });

    // Chuyển Object Map thành Mảng các Shop để trả về đúng cấu trúc yêu cầu
    const shopsArray = Object.values(shopMap);

    // Tính tổng tiền của toàn bộ giỏ hàng (Cộng tất cả các shop_subtotal lại)
    const cartTotalPrice = shopsArray.reduce((sum, shop) => sum + shop.shop_subtotal, 0);

    return {
        shops: shopsArray,
        cart_total_price: cartTotalPrice,
        cart_total_items_count: cartTotalItemsCount
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
