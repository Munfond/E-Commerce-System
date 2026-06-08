const { VNPay, VnpLocale, ProductCode } = require('vnpay');

const secureSecret = process.env.VNPAY_SECURE_SECRET || process.env.VNPAY_HASH_SECRET;
let vnpayHost = process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn';
// Loại bỏ các đường dẫn endpoint thanh toán phổ biến để lấy tên miền gốc
vnpayHost = vnpayHost
    .replace('/paymentv2/vpcpay.html', '')
    .replace('/vpcpay.html', '');

// Kiểm tra env khi khởi động, báo lỗi rõ ràng thay vì crash lúc runtime
if (!process.env.VNPAY_TMN_CODE || !secureSecret) {
    console.error('[paymentService] Thiếu VNPAY_TMN_CODE hoặc VNPAY_SECURE_SECRET/VNPAY_HASH_SECRET trong .env');
}

const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: secureSecret,
    vnpayHost: vnpayHost,
    testMode: process.env.NODE_ENV !== 'production',
});

/**
 * Tạo URL thanh toán VNPay
 * @param {string} orderId - ID đơn hàng
 * @param {number} amount  - Số tiền (VND)
 * @param {string} ipAddr  - IP của khách hàng
 * @returns {string} URL chuyển hướng thanh toán
 */
exports.createPaymentUrl = (orderId, amount, ipAddr = '127.0.0.1') => {
    if (!process.env.VNPAY_TMN_CODE || !secureSecret) {
        throw new Error('Chưa cấu hình VNPAY_TMN_CODE hoặc VNPAY_SECURE_SECRET/VNPAY_HASH_SECRET trong file .env');
    }
    if (!process.env.VNPAY_RETURN_URL) {
        throw new Error('Chưa cấu hình VNPAY_RETURN_URL trong file .env');
    }

    const toVnpDate = (date) => {
        // Cộng thêm 7 tiếng để convert UTC -> GMT+7 (giờ Việt Nam)
        const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        return vn.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    };

    const now = new Date();
    const expire = new Date(now.getTime() + 15 * 60 * 1000); // hết hạn sau 15 phút

    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: String(orderId),
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: Number(toVnpDate(now)),
        vnp_ExpireDate: Number(toVnpDate(expire)),
    });

    return paymentUrl;
};

/**
 * Xác thực chữ ký từ VNPay trả về (Return URL / IPN)
 * @param {object} query - req.query từ VNPay callback
 * @returns {{ isValid: boolean, isSuccess: boolean, data: object }}
 */
exports.verifyReturn = (query) => {
    const result = vnpay.verifyReturnUrl(query);
    return {
        isValid: result.isVerified,
        isSuccess: result.isSuccess,
        data: result,
    };
};