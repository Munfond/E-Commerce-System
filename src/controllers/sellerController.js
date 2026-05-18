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
 * PATCH /sellers/shops/me
 */
exports.updateShop = async (req, res) => {
    try {
        const userId = req.user.id;
        const allowedFields = [
            'shop_name', 'shop_description', 'shop_logo',
            'legal_full_name', 'identity_number', 'tax_code'
        ];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Không có thông tin nào để cập nhật' });
        }

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
 * PATCH /sellers/shops/me/status
 * Update shop status
 */
exports.updateShopStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Vui lòng cung cấp trạng thái shop' });
        }

        const validStatuses = ['OPEN', 'CLOSED', 'MAINTENANCE'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ. Chỉ chấp nhận: OPEN, CLOSED, MAINTENANCE' });
        }

        const { data: shop, error } = await supabase.from('shops')
            .update({ seller_control_status: status })
            .eq('owner_id', userId)
            .select()
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!shop) return res.status(404).json({ error: 'Shop không tồn tại' });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái shop thành công',
            shop
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /sellers/shops/address
 * Update shop address
 */
exports.updateShopAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiver_name, receiver_phone, city, ward, details } = req.body;

        if (!receiver_name || !receiver_phone || !city || !details) {
            return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin địa chỉ' });
        }

        // Get shop ID
        const { data: shop, error: shopError } = await supabase.from('shops')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (shopError && shopError.code !== 'PGRST116') throw shopError;
        if (!shop) return res.status(404).json({ error: 'Shop không tồn tại' });

        // Update or insert shop address
        const { data: address, error: addressError } = await supabase.from('shop_addresses')
            .upsert({
                shop_id: shop.id,
                receiver_name,
                receiver_phone,
                city,
                ward,
                details
            }, { onConflict: 'shop_id' })
            .select()
            .single();

        if (addressError) throw addressError;

        return res.status(200).json({
            success: true,
            message: 'Cập nhật địa chỉ shop thành công',
            address
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
