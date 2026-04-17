const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTP = async (toEmail, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `Shopee Clone <${process.env.EMAIL_SENDER}>`,
            to: toEmail,
            headers: {
                'List-Unsubscribe': '<mailto:unsubscribe@antnv3467.id.vn>, <https://antnv3467.id.vn/unsubscribe>'
            },
            subject: 'Mã xác thực đăng ký tài khoản',
            html: `
                <div style="background-color: #fef9e7; padding: 40px 20px; font-family: Arial, sans-serif;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; text-align: center; border: 1px solid #f7dc6f;">
                        <h2 style="color: #333;">Xác thực tài khoản của bạn</h2>
                        <p style="color: #666; font-size: 16px;">Chào bạn, mã OTP để hoàn tất đăng ký của bạn là:</p>
                        
                        <div style="display: inline-block; padding: 10px 30px; border-radius: 5px; margin: 20px 0;">
                            <h1 style="color: #333333; font-size: 40px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                        </div>

                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            Mã này có hiệu lực trong <b style="color: #333333;">5 phút</b>.<br>
                            Vui lòng không chia sẻ mã này với bất kỳ ai để bảo mật tài khoản.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #bbb;">Đây là email tự động, vui lòng không phản hồi.</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("Lỗi Resend:", error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Lỗi gửi mail: ', error);
        throw new Error('Không thể gửi email xác thực.');
    }
};