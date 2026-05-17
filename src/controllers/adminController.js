const supabase = require('../config/supabase');

/**
 * GET /admin/dashboard
 */
exports.getDashboard = async (req, res) => {
    try {
        // Fetch basic platform stats
        const { count: totalUsers } = await supabase.schema('private_auth').from('users').select('*', { count: 'exact', head: true });
        const { count: totalShops } = await supabase.from('shops').select('*', { count: 'exact', head: true });
        const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });

        return res.status(200).json({
            total_users: totalUsers || 0,
            total_shops: totalShops || 0,
            total_orders: totalOrders || 0,
            total_products: totalProducts || 0
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /admin/shops
 */
exports.getShops = async (req, res) => {
    try {
        const { limit = 10, offset = 0, status } = req.query;

        let query = supabase.from('shops')
            .select('id, owner_id, shop_name, rating, admin_control_status, official_verify_status', { count: 'exact' })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('admin_control_status', status);
        }

        const { data: shops, error, count } = await query;

        if (error) throw error;

        return res.status(200).json({ shops, count });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /admin/shops/:id/verify
 */
exports.verifyShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { verify_status } = req.body; // VERIFIED, REJECTED, PENDING

        if (!verify_status) {
            return res.status(400).json({ error: 'Thiếu trạng thái xác thực' });
        }

        const { data: shop, error } = await supabase.from('shops')
            .update({ official_verify_status: verify_status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!shop) return res.status(404).json({ error: 'Shop không tồn tại' });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái xác thực thành công',
            shop
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /admin/shops/:id/control
 */
exports.controlShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // ACTIVE, SUSPENDED, BANNED

        if (!status) {
            return res.status(400).json({ error: 'Thiếu trạng thái kiểm duyệt' });
        }

        const { data: shop, error } = await supabase.from('shops')
            .update({ admin_control_status: status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!shop) return res.status(404).json({ error: 'Shop không tồn tại' });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái kiểm duyệt thành công',
            shop
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
