const userRepository = require('../repositories/userRepository');
const authController = require('./authController'); // To reuse getMe
const bcrypt = require('bcryptjs');

/**
 * GET /accounts/me
 * Get user profile
 */
exports.getProfile = authController.getMe;

/**
 * PUT /accounts/me
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, phone, avatar_url } = req.body;

        const updates = {};
        if (username !== undefined) updates.username = username;
        if (phone !== undefined) updates.phone = phone;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Không có thông tin cần cập nhật' });
        }

        const updatedUser = await userRepository.updateProfile(userId, updates);
        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            user: updatedUser
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /accounts/password
 * Change password
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu cũ và mới' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        // Fetch current user to check old password
        const user = await userRepository.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Mật khẩu cũ không chính xác' });
        }

        const hashedNewPassword = await bcrypt.hash(new_password, 10);
        await userRepository.updatePassword(user.email, hashedNewPassword);

        return res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
