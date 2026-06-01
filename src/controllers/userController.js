const userRepo = require('../repositories/userRepository');
const addressRepo = require('../repositories/addressRepository');
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
            let avatarUrl = req.body.avatar_url;

            if (req.file) {
                const file = req.file;
                const fileExt = file.originalname.split('.').pop();
                const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
                const filePath = `${userId}/${fileName}`;

                // 1. Upload file trực tiếp lên bucket 'avatars' của Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars') // Đảm bảo bạn đã tạo bucket đặt tên là 'avatars' trên Supabase
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) {
                    throw new Error(`Lỗi upload ảnh đại diện: ${uploadError.message}`);
                }

                // 2. Gán đường dẫn vừa thu được vào biến để lưu xuống DB
                avatarUrl = uploadData.path; 
            }

                const updatedUser = await userRepo.updateUserProfile(userId, { 
                username, 
                avatar_url: avatarUrl 
            });

            if (!updatedUser) {
                return res.status(404).json({ error: "Không tìm thấy người dùng." });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    avatar_url: updatedUser.avatar_url // Trả về tương đối, Frontend tự nối Base URL
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
    },

    // Address management
    async getAddresses (req, res) {
        try {
            const userId = req.user.id;
            const addresses = await addressRepo.getUserAddresses(userId);
            res.status(200).json({
                status: 'success',
                data: addresses
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addAddress (req, res) {
        try {
            const userId = req.user.id;
            const { label, recipient_name, recipient_phone, country, city, ward, details } = req.body;

            const newAddress = await addressRepo.addUserAddress(userId, { label, recipient_name, recipient_phone, country, city, ward, details });
            res.status(201).json({
                status: 'success',
                data: newAddress
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async updateAddress (req, res) {
        try {
            const userId = req.user.id;
            const addressId = req.params.id;
            const updates = req.body;

            const updatedAddress = await addressRepo.updateUserAddress(userId, addressId, updates);
            if (!updatedAddress) {
                return res.status(404).json({ error: "Không tìm thấy địa chỉ." });
            }

            res.status(200).json({
                status: 'success',
                data: updatedAddress
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async deleteAddress (req, res) {
        try {
            const userId = req.user.id;
            const addressId = req.params.id;

            const result = await addressRepo.deleteUserAddress(userId, addressId);
            if (!result) {
                return res.status(404).json({ error: "Không tìm thấy địa chỉ." });
            }

            res.status(200).json({
                status: 'success',
                message: 'Xóa địa chỉ thành công.'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

};

module.exports = userController;