const vnpayService = require('../services/vnpayService');
const orderRepo = require('../repositories/orderRepository');
const supabase = require('../config/supabase');

const orderTable = () => supabase.from('orders');

/**
 * Resolve order id from vnp_TxnRef (uuid without hyphens + timestamp suffix)
 */
async function findOrderByTxnRef(txnRef) {
    if (!txnRef) return null;

    const raw = String(txnRef);
    const uuidPart = raw.slice(0, 32);

    if (uuidPart.length === 32) {
        const orderId = `${uuidPart.slice(0, 8)}-${uuidPart.slice(8, 12)}-${uuidPart.slice(12, 16)}-${uuidPart.slice(16, 20)}-${uuidPart.slice(20, 32)}`;
        const { data } = await orderTable().select('id, status, payment_method').eq('id', orderId).single();
        if (data) return data;
    }

    const { data: orders } = await orderTable()
        .select('id, status, payment_method')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(50);

    if (!orders) return null;

    return orders.find((o) => o.id.replace(/-/g, '').startsWith(uuidPart)) || null;
}

/**
 * GET /payments/vnpay/return — VNPay redirects user here after payment
 */
exports.vnpayReturn = async (req, res) => {
    try {
        const query = req.query;

        if (!vnpayService.verifyReturn(query)) {
            return res.status(400).json({
                success: false,
                message: 'Chữ ký VNPay không hợp lệ',
                data: query
            });
        }

        const txnRef = query.vnp_TxnRef;
        const responseCode = query.vnp_ResponseCode;
        const transactionNo = query.vnp_TransactionNo;
        const amount = query.vnp_Amount ? Number(query.vnp_Amount) / 100 : null;

        const order = await findOrderByTxnRef(txnRef);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng tương ứng',
                txn_ref: txnRef,
                response_code: responseCode
            });
        }

        const paymentSuccess = vnpayService.isPaymentSuccess(responseCode);

        if (paymentSuccess && order.status === 'PENDING') {
            await orderTable()
                .update({ status: 'CONFIRMED' })
                .eq('id', order.id);
        }

        return res.status(200).json({
            success: paymentSuccess,
            message: paymentSuccess
                ? 'Thanh toán VNPay thành công'
                : 'Thanh toán VNPay thất bại hoặc bị hủy',
            order_id: order.id,
            txn_ref: txnRef,
            transaction_no: transactionNo,
            amount,
            response_code: responseCode,
            vnpay_message: query.vnp_Message || null
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * GET /payments/vnpay/ipn — VNPay server callback (optional)
 */
exports.vnpayIpn = async (req, res) => {
    try {
        const query = req.query;

        if (!vnpayService.verifyReturn(query)) {
            return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }

        const order = await findOrderByTxnRef(query.vnp_TxnRef);
        if (!order) {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        if (vnpayService.isPaymentSuccess(query.vnp_ResponseCode) && order.status === 'PENDING') {
            await orderTable().update({ status: 'CONFIRMED' }).eq('id', order.id);
        }

        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } catch {
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};
