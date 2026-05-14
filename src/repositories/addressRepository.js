const supabase = require('../config/supabase');

const addressRepo = {
    async getUserAddresses(userId) {
        const { data, error } = await supabase
            .from('user_addresses')
            .select('id, label, recipient_name, recipient_phone, country, city, ward, details')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    },
    async addUserAddress(userId, addressData) {
        const { data, error } = await supabase
            .from('user_addresses')
            .insert({ ...addressData, user_id: userId })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    async updateUserAddress(userId, addressId, updateData) {
        const { data, error } = await supabase
            .from('user_addresses')
            .update(updateData)
            .eq('id', addressId)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;    
    },
    async deleteUserAddress(userId, addressId) {
        const { data, error } = await supabase
            .from('user_addresses')
            .delete()
            .eq('id', addressId)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;    
    }
};

module.exports = addressRepo;