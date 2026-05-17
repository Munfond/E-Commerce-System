const supabase = require('../config/supabase');

const productTable = () => supabase.from('products');
const reviewTable = () => supabase.from('product_reviews');
const categoryTable = () => supabase.from('categories');

/**
 * Search and filter products (public)
 */
exports.searchProducts = async (searchQuery = '', categoryId = null, sortBy = 'name', limit = 10, offset = 0) => {
    let query = productTable()
        .select('id, name, status, category_id, product_variants(price, stock), product_images(image_url)')
        .eq('status', 'ACTIVE');

    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
    }

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    // Apply sorting (removed price sorting since it requires post-processing with joins)
    const validSortFields = ['name', 'created_at'];
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
        .select('*, product_variants(*), product_images(*)')
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
        .select('*, product_variants(*), product_images(*)')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

/**
 * Get seller's products
 */
exports.getSellerProducts = async (sellerId, status = null) => {
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) throw new Error('Seller chưa đăng ký shop');

    let query = productTable()
        .select('id, name, status, category_id, product_variants(price, stock)')
        .eq('shop_id', shop.id);

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
        stock_quantity = 0,
        brand = null
    } = productData;

    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) throw new Error('Seller chưa đăng ký shop');

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await productTable()
        .insert({
            shop_id: shop.id,
            name,
            description,
            category_id,
            slug,
            brand,
            sold_count: 0,
            status: 'PENDING'
        })
        .select('id, name')
        .single();

    if (error) throw error;

    // Create variant
    await supabase.from('product_variants').insert({
        product_id: data.id,
        name: 'Mặc định',
        price: price || 0,
        stock: stock_quantity
    });

    // Create image
    if (image_url) {
        await supabase.from('product_images').insert({
            product_id: data.id,
            image_url,
            display_order: 0
        });
    }

    return data;
};

/**
 * Update product
 */
exports.updateProduct = async (productId, sellerId, updates) => {
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) throw new Error('Seller chưa đăng ký shop');

    const { data: product, error: fetchError } = await productTable()
        .select('shop_id')
        .eq('id', productId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.shop_id !== shop.id) throw new Error('Không có quyền chỉnh sửa sản phẩm này');

    const { price, stock_quantity, image_url, ...productUpdates } = updates;

    if (Object.keys(productUpdates).length > 0) {
        const { error } = await productTable()
            .update(productUpdates)
            .eq('id', productId);
        if (error) throw error;
    }

    if (price !== undefined || stock_quantity !== undefined) {
        const variantUpdates = {};
        if (price !== undefined) variantUpdates.price = price;
        if (stock_quantity !== undefined) variantUpdates.stock = stock_quantity;

        const { data: variants } = await supabase.from('product_variants').select('id').eq('product_id', productId).limit(1);
        if (variants && variants.length > 0) {
            await supabase.from('product_variants').update(variantUpdates).eq('id', variants[0].id);
        }
    }

    if (image_url !== undefined) {
        const { data: images } = await supabase.from('product_images').select('id').eq('product_id', productId).limit(1);
        if (images && images.length > 0) {
            await supabase.from('product_images').update({ image_url }).eq('id', images[0].id);
        } else {
            await supabase.from('product_images').insert({ product_id: productId, image_url, display_order: 0 });
        }
    }

    return { id: productId, ...updates };
};

/**
 * Delete product (seller - soft delete)
 */
exports.deleteProduct = async (productId, sellerId) => {
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) throw new Error('Seller chưa đăng ký shop');

    const { data: product, error: fetchError } = await productTable()
        .select('shop_id')
        .eq('id', productId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.shop_id !== shop.id) throw new Error('Không có quyền xóa sản phẩm này');

    const { error } = await productTable()
        .update({ status: 'HIDDEN' })
        .eq('id', productId);

    if (error) throw error;
    return { success: true };
};

/**
 * Delete product (admin - hard delete)
 */
exports.adminDeleteProduct = async (productId, reason) => {
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
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) throw new Error('Seller chưa đăng ký shop');

    const { data: product, error: fetchError } = await productTable()
        .select('shop_id')
        .eq('id', productId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.shop_id !== shop.id) throw new Error('Không có quyền cập nhật sản phẩm này');

    const { data: variants } = await supabase.from('product_variants').select('id').eq('product_id', productId).limit(1);
    if (variants && variants.length > 0) {
        const { error } = await supabase.from('product_variants')
            .update({ stock: Math.max(0, parseInt(stockQuantity)) })
            .eq('id', variants[0].id);
        if (error) throw error;
    }

    return { success: true };
};

/**
 * Get seller statistics
 */
exports.getSellerStatistics = async (sellerId, period = 'month') => {
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', sellerId).single();
    if (!shop) return { total_revenue: 0, total_orders: 0, period, currency: 'VND' };

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

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            created_at,
            order_items!inner(
                quantity,
                price_at_purchase,
                product_variants!inner(product_id)
            )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

    if (error) throw error;

    // Filter to only include products owned by this shop
    // Since Supabase join deep filtering is tricky, we filter manually
    const { data: shopProducts } = await productTable().select('id').eq('shop_id', shop.id);
    const shopProductIds = new Set(shopProducts?.map(p => p.id) || []);

    let totalRevenue = 0;
    let totalOrders = 0;
    const uniqueOrderIds = new Set();

    if (orders && orders.length > 0) {
        orders.forEach(order => {
            let isShopOrder = false;
            order.order_items?.forEach(item => {
                if (item.product_variants && shopProductIds.has(item.product_variants.product_id)) {
                    isShopOrder = true;
                    totalRevenue += item.quantity * (item.price_at_purchase || 0);
                }
            });
            if (isShopOrder) uniqueOrderIds.add(order.id);
        });
        totalOrders = uniqueOrderIds.size;
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
        .select('id, name, shop_id, created_at, status')
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
            order_item_id: productId,
            user_id: userId,
            rating,
            comment,
            images_json: imageUrls
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
        .eq('order_item_id', productId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
};

/**
 * Get seller info (for products)
 */
exports.getSellerInfo = async (shopId) => {
    const { data: shop, error } = await supabase
        .from('shops')
        .select('owner_id')
        .eq('id', shopId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!shop) return null;

    const { data: user } = await supabase
        .schema('private_auth')
        .from('users')
        .select('id, username, email')
        .eq('id', shop.owner_id)
        .single();

    return user;
};
