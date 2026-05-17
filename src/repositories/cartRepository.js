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
        .maybeSingle();

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
            cart_id,
            variant_id,
            quantity,
            product_variants:variant_id (
                id,
                name,
                price,
                stock,
                image_url,
                products:product_id (
                    id,
                    name,
                    brand
                )
            )
        `)
        .eq('cart_id', cart.id)

    if (error) throw error;
    return items || [];
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
exports.addToCart = async (userId, productId, quantity) => {
    if (quantity < 1) throw new Error('Số lượng thêm phải lớn hơn 0');

    // Không cần kiểm tra sản phẩm tồn tại, tại đã mua đâu, nó kiểu todo-list ấy
    const { data: variant, error: variantError } = await variantTable()
        .select('id, stock')
        .eq('id', variantId)
        .single();

    if (variantError || !variant) {
        throw new Error('Mẫu sản phẩm này không tồn tại');
    }
    /*
    if (variant.stock < quantity) {
        throw new Error('Số lượng hàng trong kho không đủ');
    }*/

    // Lấy hoặc tạo cart
    const cart = await this.getOrCreateCart(userId);

    // Kiểm tra sản phẩm đã có trong giỏ không
    const { data: existingItem } = await cartItemsTable()
        .select('*')
        .eq('cart_id', cart.id)
        .eq('variant_id', variantId)
        .single();

    if (existingItem) {
        // Cập nhật số lượng
        const newQuantity = existingItem.quantity + quantity;

        /*
        if (variant.stock < newQuantity) {
            throw new Error('Số lượng sản phẩm không đủ');
        }*/

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
                variant_id: variantId,
                quantity,
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
    const cart = await this.getOrCreateCart(userId);

    const { error, count } = await cartItemsTable()
        .delete({ count: 'exact' }) // Để biết có dòng nào bị xóa thật không
        .eq('id', itemId)
        .eq('cart_id', cart.id);

    if (error) throw error;
    if (count === 0) throw new Error('Sản phẩm không tồn tại trong giỏ hàng của bạn');

    return { success: true, message: 'Xóa sản phẩm khỏi giỏ hàng thành công' };
};

/**
 * Cập nhật số lượng sản phẩm
 */
exports.updateQuantity = async (userId, itemId, quantity) => {
    if (quantity < 1) {
        return await this.removeFromCart(userId, itemId);
    }

    const cart = await this.getOrCreateCart(userId);

    // Kiểm tra item thuộc giỏ của user
    const { data: cartItem, error: itemError } = await cartItemsTable()
        .select('variant_id')
        .eq('id', itemId)
        .eq('cart_id', cart.id)
        .single();

    if (itemError || !cartItem) {
        throw new Error('Item không tồn tại trong giỏ');
    }

    if (cartItem.carts.user_id !== userId) {
        throw new Error('Không có quyền cập nhật item này');
    }

    /*
    //Không cần Kiểm tra stock
    const { data: variant } = await variantTable()
        .select('stock')
        .eq('id', cartItem.variant_id)
        .single();

    if (!variant || variant.stock < quantity) {
        throw new Error('Số lượng sản phẩm không đủ');
    }*/

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
        .delete()
        .eq('cart_id', cart.id);

    if (error) throw error;
    return { success: true, message: 'Giỏ hàng đã được xóa' };
};
