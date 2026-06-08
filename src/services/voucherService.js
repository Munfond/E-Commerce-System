const voucherRepo = require('../repositories/voucherRepository');
const shopRepo =   require('../repositories/shopRepository');

// 1. NGHIỆP VỤ: TẠO VOUCHER MỚI (ADMIN / SELLER)
exports.createVoucher = async (rawData, user) => {
    let voucherShopId = null;
    const userRoles = user.roles || [];

    if (userRoles.includes('admin')) {
        voucherShopId = rawData.shop_id || null;
    } else if (userRoles.includes('seller')) {
        const shop = await shopRepo.findByOwnerId(user.id);
        if (!shop) throw new Error("Tài khoản này chưa cấu hình cửa hàng.");
        voucherShopId = shop.id;
    } else {
        throw new Error("Bạn không có quyền tạo mã giảm giá.");
    }

    const voucherData = {
        code: rawData.code.toUpperCase().trim(),
        shop_id: voucherShopId,
        description: rawData.description,
        type: rawData.type,
        discount_value: Number(rawData.discount_value),
        max_discount_amount: rawData.max_discount_amount ? Number(rawData.max_discount_amount) : null,
        min_order_value: Number(rawData.min_order_value || 0),
        usage_limit: Number(rawData.usage_limit || 1),
        per_user_limit: Number(rawData.per_user_limit || 1),
        start_date: new Date(rawData.start_date).toISOString(),
        end_date: new Date(rawData.end_date).toISOString(),
        is_active: true
    };

    return await voucherRepo.create(voucherData);
};

// 2. NGHIỆP VỤ: USER LƯU MÃ VÀO VÍ
exports.saveVoucherToWallet = async (code, userId) => {
    const voucher = await voucherRepo.findByCode(code);
    if (!voucher) throw new Error("Mã giảm giá không tồn tại hoặc đã hết hạn.");

    if (new Date() > new Date(voucher.end_date)) throw new Error("Mã giảm giá đã hết hạn.");
    if (voucher.used_count >= voucher.usage_limit) throw new Error("Mã giảm giá đã được phát hết.");

    // Check giới hạn sở hữu dựa trên per_user_limit
    const savedCount = await voucherRepo.getUserSavedCount(userId, voucher.id);
    if (savedCount >= voucher.per_user_limit) {
        throw new Error(`Bạn chỉ được lưu mã này tối đa ${voucher.per_user_limit} lần.`);
    }

    return await voucherRepo.saveToWallet(userId, voucher.id);
};

// 3. NGHIỆP VỤ: ĐỌC VÀ TÍNH TIỀN GIẢM (Gọi nội bộ trong hàm tạo đơn hàng hoặc pre-checkout)
exports.validateAndCalculateDiscount = async (code, userId, shopItems, isFromAdminVoucher = false) => {
    const voucher = await voucherRepo.findByCode(code);
    if (!voucher) throw new Error(`Mã ${code} không hợp lệ.`);

    const now = new Date();
    if (now < new Date(voucher.start_date) || now > new Date(voucher.end_date)) throw new Error(`Mã ${code} đã hết hạn.`);
    if (voucher.used_count >= voucher.usage_limit) throw new Error(`Mã ${code} đã hết lượt dùng.`);

    // Đếm số lần ĐÃ SỬ DỤNG thực tế trong ví user_vouchers
    const usedCount = await voucherRepo.getUserUsedCount(userId, voucher.id);
    if (usedCount >= voucher.per_user_limit) throw new Error(`Bạn đã xài hết lượt mã ${code}.`);

    // Tính tổng số tiền các món hàng hợp lệ chịu tác động từ voucher
    const applicableTotal = shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (applicableTotal < voucher.min_order_value) {
        throw new Error(`Đơn hàng không đủ điều kiện tối thiểu để áp dụng mã ${code}.`);
    }

    let discountAmount = 0;
    if (voucher.type === 'FIXED') {
        discountAmount = Number(voucher.discount_value);
    } else if (voucher.type === 'PERCENTAGE') {
        discountAmount = (applicableTotal * Number(voucher.discount_value)) / 100;
        if (voucher.max_discount_amount && discountAmount > Number(voucher.max_discount_amount)) {
            discountAmount = Number(voucher.max_discount_amount);
        }
    }

    if (discountAmount > applicableTotal) discountAmount = applicableTotal;

    return {
        voucher_id: voucher.id,
        code: voucher.code,
        discount_amount: discountAmount,
        shop_id: voucher.shop_id
    };
};