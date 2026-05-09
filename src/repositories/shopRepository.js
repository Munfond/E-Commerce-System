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
            .select('*, shop_addresses(*)')
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
        const { data, error } = await supabase
            .from('shops')
            .update(updateData)
            .eq('owner_id', ownerId)
            .select();
        if (error) throw error;
        return data;
    },
    async updateById(shopId, updateData) {
        const { data, error } = await supabase
            .from('shops')
            .update(updateData)
            .eq('id', shopId)
            .select();
        if (error) throw error;
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
    async listShops({ keyword, adminStatus, sellerStatus }) {
        let query = supabase.from('shops')
            .select('id, shop_name, shop_logo, shop_description, admin_control_status, seller_control_status, shop_addresses(receiver_name, receiver_phone, city, ward, details)');
        if (adminStatus) query = query.eq('admin_control_status', adminStatus);
        if (sellerStatus) query = query.eq('seller_control_status', sellerStatus);
        if (keyword) query = query.ilike('shop_name', `%${keyword}%`);
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
}

module.exports = shopRepo;