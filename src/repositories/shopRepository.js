const supabase = require('../config/supabase');

const shopRepo = {
    async findByOwnerId(ownerId) {
        const { data, error } = await supabase
            .from('shops')
            .select('*, shop_addresses(*)')
            .eq('owner_id', ownerId)
            .single();
        if (error) throw error;
        return data;
    },
    async findById(id) {
        const { data, error } = await supabase
            .from('shops')
            .select('id, shop_name, shop_logo, shop_description, admin_control_status, seller_control_status, shop_addresses(receiver_name, receiver_phone, city, ward, details)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },
    async create(ownerId, shopData) {
        const { data, error } = await supabase
            .from('shops')
            .insert({ ...shopData, owner_id: ownerId })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    async update(ownerId, updateData) {
        const dataToUpdate = {
            ...updateData,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('shops')
            .update(dataToUpdate)
            .eq('owner_id', ownerId)
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },
    async updateById(shopId, updateData) {
        const { data, error } = await supabase
            .from('shops')
            .update(updateData)
            .eq('id', shopId)
            .select();
        if (error) throw new Error(`Lỗi cập nhật Shop: ${error.message}`);
        return data;
    },
    async upsertAddress (shopId, addressData) {
        const { data, error } = await supabase
            .from('shop_addresses')
            .upsert({ ...addressData, shop_id: shopId }, { onConflict: 'shop_id' })
            .select();
        if (error) throw error;
        return data;
    },
    async listShops({ filters, from, to, page, limit }) {
        let query = supabase.from('shops')
            .select('id, shop_name, shop_logo, shop_description, admin_control_status, seller_control_status, shop_addresses(receiver_name, receiver_phone, city, ward, details)');
        if (filters.official_verify_status) {
            query = query.eq('official_verify_status', filters.official_verify_status);
        }
        if (filters.admin_control_status) {
            query = query.eq('admin_control_status', filters.admin_control_status);
        }
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }
        const { data, error, count } = await query
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Lỗi lấy danh sách Shop: ${error.message}`);
        return {
            data,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        };
    },
    async assignUserToSeller (sellerId) {
        const { data, error } = await supabase
            .schema('private_auth')
            .from('user_roles')
            .insert({ user_id: sellerId, role_id: 2 });
        if (error) throw error;
        return data;
    }
}

module.exports = shopRepo;