const voucherService = require('../services/voucherService');
const supabase = require('../config/supabase');

exports.createVoucher = async (req, res) => {
    try {
        const newVoucher = await voucherService.createVoucher(req.body, req.user);
        return res.status(201).json({ success: true, message: "Tạo voucher thành công!", data: newVoucher });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ success: false, error: "Mã code bị trùng lặp!" });
        return res.status(400).json({ success: false, error: error.message });
    }
};

exports.saveVoucher = async (req, res) => {
    try {
        const { code } = req.body;
        const result = await voucherService.saveVoucherToWallet(code, req.user.id);
        return res.status(201).json({ success: true, message: "Đã lưu mã vào ví của bạn!", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

exports.getMyWallet = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_vouchers')
            .select(`id, is_used, saved_at, vouchers ( id, code, description, type, discount_value, min_order_value, end_date, shop_id )`)
            .eq('user_id', req.user.id)
            .eq('is_used', false); // Chỉ lấy mã chưa xài

        if (error) throw error;
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getShopVoucherFromMyWallet = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_vouchers')
            .select(`id, is_used, saved_at, vouchers ( id, code, description, type, discount_value, min_order_value, end_date, shop_id )`)
            .eq('user_id', req.user.id)
            .eq('shop_id', req.params.shop_id)
            .eq('is_used', false); // Chỉ lấy mã chưa xài

        if (error) throw error;
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};