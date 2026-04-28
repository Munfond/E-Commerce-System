const userRepo = require('../repositories/userRepository');
const otpRepo = require('../repositories/otpRepository');
const mailService = require('./mailService');
const bcrypt = require('bcryptjs');

const passwordService = {
    async requestPasswordReset (email) {
        const user = await userRepo.findByEmail(email);
        if (!user || user.status !== 'ACTIVE' || !user.password) {
            throw new Error('Email không tồn tại hoặc tài khoản chưa được kích hoạt.');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        await otpRepo.createOtp(email, hashedOtp, 'PASSWORD_RESET');
        await mailService.sendOTP(email, otp);
        return { message: "Mã OTP đã được gửi đến email của bạn." };
    },
    async verifyPasswordResetOtp (email, otpCode) {
        const result = await otpRepo.verifyOtp(email, otpCode, 'PASSWORD_RESET');
        if (!result.valid) {
            throw new Error(result.message);
        }
        return { message: "Mã OTP hợp lệ. Bạn có thể đặt lại mật khẩu mới." };
    },
    async resetPassword (email, newPassword) {
        const otpRecord = await otpRepo.checkOtp(email, 'PASSWORD_RESET');
        if (!otpRecord) {
            throw new Error("Bạn chưa xác thực mã OTP hoặc mã đã hết hạn.");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRepo.updatePassword(email, hashedPassword);
        await otpRepo.invalidateOtp(otpRecord.id, 'PASSWORD_RESET');
        return { success: true, message: "Mật khẩu của bạn đã được đặt lại thành công." };
    },
    async changePassword (userId, currentPassword, newPassword) {
        const { data: user, error: userError } = await userRepo.findById(userId);
    
        if (userError) throw userError;
        if (!user) return { error: "Người dùng không tồn tại." };
    
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return { error: "Mật khẩu hiện tại không đúng." };
    
        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateResult = await userRepo.updatePasswordById(userId, hashedPassword);
        if (updateResult.error) throw updateResult.error;
    
        return { success: true, message: "Đổi mật khẩu thành công." };
    }
}

module.exports = passwordService;