const supabase = require('../config/supabase');

const productTable = () => supabase.from('products');
const reviewTable = () => supabase.from('product_reviews');
const categoryTable = () => supabase.from('categories');

/**
 * Search and filter products (public)
 */
exports.searchProducts = async (searchQuery = '', categoryId = null, sortBy = 'name', limit = 10, offset = 0) => {
    let query = productTable()
        .select('id, name, price, image_url, category_id')
        .eq('status', 'ACTIVE');

    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
    }

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    // Apply sorting
    const validSortFields = ['name', 'price', 'created_at'];
    const [field, direction] = sortBy.includes('-') 
        ? [sortBy.substring(1), 'descending']
        : [sortBy, 'ascending'];

    if (validSortFields.includes(field)) {
        query = query.order(field, { ascending: direction === 'ascending' });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
};

/**
 * Get product by ID (public)
 */
exports.getProductById = async (id) => {
    const { data, error } = await productTable()
        .select('*')
        .eq('id', id)
        .eq('status', 'ACTIVE')
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

/**
 * Get product by ID (admin - can see any status)
 */
exports.getProductByIdAdmin = async (id) => {
    const { data, error } = await productTable()
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

/**
 * Get seller's products
 */
exports.getSellerProducts = async (sellerId, status = null) => {
    let query = productTable()
        .select('id, name, price, stock_quantity, status, category_id')
        .eq('seller_id', sellerId);

    if (status) {
        query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
};

/**
 * Create product
 */
exports.createProduct = async (sellerId, productData) => {
    const {
        name,
        description,
        price,
        category_id,
        image_url,
        stock_quantity = 0
    } = productData;

    const { data, error } = await productTable()
        .insert({
            seller_id: sellerId,
            name,
            description,
            price,
            category_id,
            image_url,
            stock_quantity,
            status: 'PENDING'
        })
        .select('id, name')
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update product
 */
exports.updateProduct = async (productId, sellerId, updates) => {
    // Verify seller owns the product
    const { data: product, error: fetchError } = await productTable()
        .select('seller_id')
        .eq('id', productId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.seller_id !== sellerId) throw new Error('Không có quyền chỉnh sửa sản phẩm này');

    const { data, error } = await productTable()
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete product (seller - soft delete)
 */
exports.deleteProduct = async (productId, sellerId) => {
    const { data: product, error: fetchError } = await productTable()
        .select('seller_id')
        .eq('id', productId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.seller_id !== sellerId) throw new Error('Không có quyền xóa sản phẩm này');

    const { error } = await productTable()
        .update({ status: 'DELETED' })
        .eq('id', productId);

    if (error) throw error;
    return { success: true };
};

/**
 * Delete product (admin - hard delete)
 */
exports.adminDeleteProduct = async (productId, reason) => {
    // Store deletion reason if needed
    const { error } = await productTable()
        .delete()
        .eq('id', productId);

    if (error) throw error;
    return { success: true };
};

/**
 * Update stock quantity
 */
exports.updateStock = async (productId, sellerId, stockQuantity) => {
    const { data: product, error: fetchError } = await productTable()
        .select('seller_id')
        .eq('id', productId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.seller_id !== sellerId) throw new Error('Không có quyền cập nhật sản phẩm này');

    const { error } = await productTable()
        .update({ stock_quantity: Math.max(0, parseInt(stockQuantity)) })
        .eq('id', productId);

    if (error) throw error;
    return { success: true };
};

/**
 * Get seller statistics
 */
exports.getSellerStatistics = async (sellerId, period = 'month') => {
    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Query orders for seller's products
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            created_at,
            order_items (
                quantity,
                price,
                product:products(seller_id)
            )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

    if (error) throw error;

    // Filter for seller's products and calculate total
    let totalRevenue = 0;
    let totalOrders = 0;

    if (orders && orders.length > 0) {
        const sellerOrders = orders.filter(order => 
            order.order_items && 
            order.order_items.some(item => item.product?.seller_id === sellerId)
        );

        totalOrders = sellerOrders.length;
        
        sellerOrders.forEach(order => {
            order.order_items?.forEach(item => {
                if (item.product?.seller_id === sellerId) {
                    totalRevenue += item.quantity * item.price;
                }
            });
        });
    }

    return {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        period,
        currency: 'VND'
    };
};

/**
 * Get pending products (admin)
 */
exports.getPendingProducts = async (limit = 10, offset = 0) => {
    const { data, error, count } = await productTable()
        .select('id, name, seller_id, created_at, status')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
};

/**
 * Check if product exists
 */
exports.productExists = async (id) => {
    const { data, error } = await productTable()
        .select('id')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
};

/**
 * Create product review
 */
exports.createReview = async (productId, userId, rating, comment, imageUrls = []) => {
    const { data, error } = await reviewTable()
        .insert({
            product_id: productId,
            user_id: userId,
            rating,
            comment,
            image_urls: imageUrls
        })
        .select('id, rating')
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get product reviews
 */
exports.getProductReviews = async (productId, limit = 10, offset = 0) => {
    const { data, error, count } = await reviewTable()
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
};

/**
 * Get seller info (for products)
 */
exports.getSellerInfo = async (sellerId) => {
    const { data, error } = await supabase
        .schema('private_auth')
        .from('users')
        .select('id, username, email')
        .eq('id', sellerId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};
