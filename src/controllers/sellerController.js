const supabase = require('../config/supabase');
const productRepo = require('../repositories/productRepository');

/**
 * POST /sellers/register
 */
exports.registerSeller = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shop_name, shop_description, legal_full_name, identity_number } = req.body;

        if (!shop_name || !legal_full_name || !identity_number) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc để đăng ký shop' });
        }

        // Check if shop already exists
        const { data: existingShop } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
        if (existingShop) {
            return res.status(400).json({ error: 'Bạn đã đăng ký shop rồi' });
        }

        const { data: shop, error: shopError } = await supabase.from('shops')
            .insert({
                owner_id: userId,
                shop_name,
                shop_description,
                legal_full_name,
                identity_number,
                rating: 0
            })
            .select()
            .single();

        if (shopError) throw shopError;

        // Assign seller role
        const { data: role } = await supabase.from('roles').select('id').eq('role_name', 'seller').single();
        if (role) {
            await supabase.schema('private_auth').from('user_roles')
                .upsert({ user_id: userId, role_id: role.id });
        }

        return res.status(201).json({
            success: true,
            message: 'Đăng ký bán hàng thành công. Vui lòng đăng nhập lại để cập nhật quyền.',
            shop
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /sellers/shop
 */
exports.getShopInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: shop, error } = await supabase.from('shops')
            .select('*')
            .eq('owner_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!shop) return res.status(404).json({ error: 'Shop không tồn tại' });

        return res.status(200).json(shop);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /sellers/shop
 */
exports.updateShop = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const { data: shop, error } = await supabase.from('shops')
            .update(updates)
            .eq('owner_id', userId)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({
            success: true,
            message: 'Cập nhật shop thành công',
            shop
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /sellers/dashboard
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 'month' } = req.query;

        const stats = await productRepo.getSellerStatistics(userId, period);
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
