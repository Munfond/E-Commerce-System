const passwordService = require('../services/passwordService');
const validator = require('../utils/validator');

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email là bắt buộc!" });
        }
        const result = await passwordService.requestPasswordReset(email);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        if (!email || !otpCode) {
            return res.status(400).json({ error: "Thiếu Email hoặc mã OTP!" });
        }
        const result = await passwordService.verifyPasswordResetOtp(email, otpCode);
        res.status(200).json(result);   

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: "Thiếu Email hoặc mật khẩu mới!" });
        }

        // Kiểm tra mật khẩu mới có hợp lệ không
        const validationErrors = validator.validatePassword(newPassword);
        if (validationErrors) {
            return res.status(400).json({ error: validationErrors });
        }

        const result = await passwordService.resetPassword(email, newPassword);
        if (result && result.message) {
            return res.status(200).json(result);
        } else {
            throw new Error("Không nhận được phản hồi từ hệ thống.");
        }

    } catch (err) {
        res.status(400).json({ error: err.message || "Đã có lỗi xảy ra" });
    }
}