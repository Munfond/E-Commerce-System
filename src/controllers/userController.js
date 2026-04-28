const userRepo = require('../repositories/userRepository');
const passwordService = require('../services/passwordService');

const userController = {
    async getMe (req, res) {
        try {
            const userId = req.user.id;
            
            const { data: user, error } = await userRepo.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "Không tìm thấy người dùng." });
            }

            const roles = await userRepo.getUserRoles(userId);

            res.status(200).json({
                status: 'success',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar_url: user.avatar_url,
                    roles: roles
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }, 

    async updateProfile (req, res) {
        try {
            const userId = req.user.id;
            const { username, avatar_url } = req.body;

            const updatedUser = await userRepo.updateUserProfile(userId, { username, avatar_url });
            if (!updatedUser) {
                return res.status(404).json({ error: "Không tìm thấy người dùng." });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    avatar_url: updatedUser.avatar_url
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async changePassword (req, res) {
        try {
            console.log(req.user);
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            const result = await passwordService.changePassword(userId, currentPassword, newPassword);
            if (result.error) {
                return res.status(400).json({ error: result.error });
            }

            res.status(200).json({
                status: 'success',
                message: 'Đổi mật khẩu thành công.'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

};

module.exports = userController;