const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // dùng SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOTP = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"E-Commerce" System <${process.env.EMAIL_USER}>`,
            to: toEmail,
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
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Lỗi gửi mail: ', error);
        throw new Error('Không thể gửi email xác thực.');
    }
};