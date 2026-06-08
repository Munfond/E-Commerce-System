const supabase = require('../config/supabase');

// Tìm voucher gốc bằng Code còn hạn và đang kích hoạt
exports.findByCode = async (code) => {
    const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

// Đếm xem User đã SỬ DỤNG voucher này bao nhiêu lần thông qua bảng user_vouchers
exports.getUserUsedCount = async (userId, voucherId) => {
    const { count, error } = await supabase
        .from('user_vouchers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('voucher_id', voucherId)
        .eq('is_used', true);

    if (error) throw error;
    return count || 0;
};

// Đếm xem User đã LƯU voucher này vào ví bao nhiêu lần (bất kể dùng hay chưa)
exports.getUserSavedCount = async (userId, voucherId) => {
    const { count, error } = await supabase
        .from('user_vouchers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('voucher_id', voucherId);

    if (error) throw error;
    return count || 0;
};

// Thêm voucher mới vào bảng hệ thống công khai
exports.create = async (voucherData) => {
    const { data, error } = await supabase.from('vouchers').insert([voucherData]).select().single();
    if (error) throw error;
    return data;
};

// Người dùng thu thập mã - thêm vào ví
exports.saveToWallet = async (userId, voucherId) => {
    const { data, error } = await supabase
        .from('user_vouchers')
        .insert([{ user_id: userId, voucher_id: voucherId, is_used: false }])
        .select()
        .single();
    if (error) throw error;
    return data;
};