const supabase = require('../config/supabase');

const cartTable = () => supabase.from('carts');
const cartItemsTable = () => supabase.from('cart_items');
const productsTable = () => supabase.from('products');

/**
 * Lấy hoặc tạo giỏ hàng cho user
 */
exports.getOrCreateCart = async (userId) => {
    let { data: cart, error } = await cartTable()
        .select('*')
        .eq('user_id', userId)
        .single();

    // Nếu chưa có cart, tạo mới
    if ((error && error.code === 'PGRST116') || !cart) {
        const { data: newCart, error: createError } = await cartTable()
            .insert([{ user_id: userId, status: 'ACTIVE' }])
            .select()
            .single();

        if (createError) throw createError;
        return newCart;
    }

    if (error) throw error;
    return cart;
};

/**
 * Lấy tất cả items trong giỏ hàng của user
 */
exports.getCartItems = async (userId) => {
    const cart = await this.getOrCreateCart(userId);

    const { data: items, error } = await cartItemsTable()
        .select(`
            id,
            product_id,
            quantity,
            price_at_time,
            products:product_id(id, name, price, image_url, stock)
        `)
        .eq('cart_id', cart.id)
        .eq('is_deleted', false);

    if (error) throw error;
    return items || [];
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
exports.addToCart = async (userId, productId, quantity) => {
    // Kiểm tra sản phẩm tồn tại
    const { data: product, error: productError } = await productsTable()
        .select('id, price, stock')
        .eq('id', productId)
        .single();

    if (productError || !product) {
        throw new Error('Sản phẩm không tồn tại');
    }

    if (product.stock < quantity) {
        throw new Error('Số lượng sản phẩm không đủ');
    }

    // Lấy hoặc tạo cart
    const cart = await this.getOrCreateCart(userId);

    // Kiểm tra sản phẩm đã có trong giỏ không
    const { data: existingItem } = await cartItemsTable()
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .eq('is_deleted', false)
        .single();

    if (existingItem) {
        // Cập nhật số lượng
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock < newQuantity) {
            throw new Error('Số lượng sản phẩm không đủ');
        }

        const { data, error } = await cartItemsTable()
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // Thêm mới
        const { data, error } = await cartItemsTable()
            .insert([{
                cart_id: cart.id,
                product_id: productId,
                quantity,
                price_at_time: product.price,
                is_deleted: false
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
exports.removeFromCart = async (userId, itemId) => {
    // Kiểm tra item thuộc giỏ của user
    const { data: cartItem, error: itemError } = await cartItemsTable()
        .select('carts:cart_id(user_id)')
        .eq('id', itemId)
        .single();

    if (itemError || !cartItem) {
        throw new Error('Item không tồn tại trong giỏ');
    }

    if (cartItem.carts.user_id !== userId) {
        throw new Error('Không có quyền xóa item này');
    }

    // Soft delete (đánh dấu is_deleted = true)
    const { error } = await cartItemsTable()
        .update({ is_deleted: true })
        .eq('id', itemId);

    if (error) throw error;
    return { success: true, message: 'Xóa sản phẩm thành công' };
};

/**
 * Cập nhật số lượng sản phẩm
 */
exports.updateQuantity = async (userId, itemId, quantity) => {
    if (quantity < 1) {
        throw new Error('Số lượng phải lớn hơn 0');
    }

    // Kiểm tra item thuộc giỏ của user
    const { data: cartItem, error: itemError } = await cartItemsTable()
        .select('product_id, carts:cart_id(user_id)')
        .eq('id', itemId)
        .single();

    if (itemError || !cartItem) {
        throw new Error('Item không tồn tại trong giỏ');
    }

    if (cartItem.carts.user_id !== userId) {
        throw new Error('Không có quyền cập nhật item này');
    }

    // Kiểm tra stock
    const { data: product } = await productsTable()
        .select('stock')
        .eq('id', cartItem.product_id)
        .single();

    if (product.stock < quantity) {
        throw new Error('Số lượng sản phẩm không đủ');
    }

    // Cập nhật
    const { data, error } = await cartItemsTable()
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Xóa toàn bộ giỏ hàng
 */
exports.clearCart = async (userId) => {
    const cart = await this.getOrCreateCart(userId);

    const { error } = await cartItemsTable()
        .update({ is_deleted: true })
        .eq('cart_id', cart.id);

    if (error) throw error;
    return { success: true, message: 'Giỏ hàng đã được xóa' };
};
