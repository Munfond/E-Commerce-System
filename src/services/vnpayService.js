const crypto = require('crypto');

function getConfig() {
    const vnpUrl = process.env.vnp_Url || process.env.VNP_URL;
    const tmnCode = process.env.vnp_TmnCode || process.env.VNP_TMN_CODE;
    const hashSecret = process.env.vnp_HashSecret || process.env.VNP_HASH_SECRET;
    const port = process.env.PORT || 3000;
    const returnUrl = process.env.vnp_ReturnUrl || process.env.VNP_RETURN_URL
        || `http://localhost:${port}/api/v1/payments/vnpay/return`;

    if (!vnpUrl || !tmnCode || !hashSecret) {
        throw new Error('Thiếu cấu hình VNPay (vnp_Url, vnp_TmnCode, vnp_HashSecret) trong .env');
    }

    return { vnpUrl, tmnCode, hashSecret, returnUrl };
}

function sortObject(obj) {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            const value = obj[key];
            if (value !== null && value !== undefined && value !== '') {
                sorted[key] = value;
            }
        });
    return sorted;
}

function toSignData(params) {
    const sorted = sortObject(params);
    return Object.keys(sorted)
        .map((key) => `${key}=${sorted[key]}`)
        .join('&');
}

function toQueryString(params) {
    const sorted = sortObject(params);
    return Object.keys(sorted)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(sorted[key]))}`)
        .join('&');
}

function formatCreateDate(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return (
        date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

function normalizeIp(ip) {
    if (!ip) return '127.0.0.1';
    const value = String(ip).split(',')[0].trim();
    if (value.startsWith('::ffff:')) return value.slice(7);
    return value === '::1' ? '127.0.0.1' : value;
}

/**
 * Build signed VNPay payment URL
 */
exports.createPaymentUrl = ({
    orderId,
    amount,
    orderInfo,
    ipAddr,
    locale = 'vn',
    bankCode = null
}) => {
    const { vnpUrl, tmnCode, hashSecret, returnUrl } = getConfig();

    const txnRef = String(orderId).replace(/-/g, '').slice(0, 32) + Date.now().toString().slice(-6);
    const vnpAmount = Math.round(Number(amount) * 100);

    if (!vnpAmount || vnpAmount <= 0) {
        throw new Error('Số tiền thanh toán không hợp lệ');
    }

    const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: vnpAmount,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: normalizeIp(ipAddr),
        vnp_CreateDate: formatCreateDate()
    };

    if (bankCode) {
        vnpParams.vnp_BankCode = bankCode;
    }

    const signData = toSignData(vnpParams);
    const secureHash = crypto
        .createHmac('sha512', hashSecret)
        .update(signData, 'utf8')
        .digest('hex');

    const paymentUrl = `${vnpUrl}?${toQueryString({ ...vnpParams, vnp_SecureHash: secureHash })}`;

    return {
        payment_url: paymentUrl,
        txn_ref: txnRef,
        amount: Number(amount),
        vnp_amount: vnpAmount,
        provider: 'VNPAY'
    };
};

/**
 * Verify VNPay return / IPN query signature
 */
exports.verifyReturn = (query) => {
    const { hashSecret } = getConfig();
    const params = { ...query };

    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const signData = toSignData(params);
    const signed = crypto
        .createHmac('sha512', hashSecret)
        .update(signData, 'utf8')
        .digest('hex');

    return secureHash === signed;
};

exports.isPaymentSuccess = (responseCode) => responseCode === '00';

exports.getConfig = getConfig;
