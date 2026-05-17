const supabase = require('../config/supabase');
const productRepo = require('../repositories/productRepository');

/**
 * GET /shops
 */
exports.getShops = async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        const { data: shops, error, count } = await supabase.from('shops')
            .select('id, shop_name, shop_logo, rating, business_type', { count: 'exact' })
            .eq('admin_control_status', 'ACTIVE')
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return res.status(200).json({ shops, count });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /shops/:id
 */
exports.getShopProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: shop, error } = await supabase.from('shops')
            .select('id, shop_name, shop_description, shop_logo, rating, business_type, created_at')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!shop) return res.status(404).json({ error: 'Shop không tồn tại' });

        return res.status(200).json(shop);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /shops/:id/products
 */
exports.getShopProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        // Query products belonging to shop
        let query = supabase.from('products')
            .select('id, name, status, category_id, product_variants(price, stock), product_images(image_url)', { count: 'exact' })
            .eq('shop_id', id)
            .eq('status', 'ACTIVE')
            .range(offset, offset + limit - 1);

        const { data: products, error, count } = await query;

        if (error) throw error;

        return res.status(200).json({ products, count });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * POST /shops/:id/reports
 */
exports.reportShop = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason, description } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Vui lòng cung cấp lý do báo cáo' });
        }

        const { error } = await supabase.from('reports')
            .insert({
                target_id: id,
                target_type: 'SHOP',
                reporter_id: userId,
                reason,
                description,
                status: 'PENDING'
            });

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Báo cáo đã được ghi nhận'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
