const shopRepo = require('../repositories/shopRepository');
const userRepo = require('../repositories/userRepository');

const adminService = {
    // Duyệt shop (Official/Unofficial)
    async verifyShop(shopId, status) {
        return await shopRepo.updateById(shopId, { official_verify_status: status });
    },

    // Kiểm soát shop (BANNED/OK/RESTRICTED)
    async controlShop(shopId, status) {
        return await shopRepo.updateById(shopId, { admin_control_status: status });
    },

    // Lấy tất cả shop
    async getAllShops(query) {
        return await shopRepo.listShops(query); 
    },

    async getAllUsers(role, status) {
        return await userRepo.listUsers(role, status);
    },
    async changeUserStatus (id, status){
        const validateStatus = ['PENDING', 'ACTIVE', 'BANNED']
        if (!validateStatus.includes(status)) {
            throw new Error(`Trạng thái không hợp lệ.`);
        }
        return await userRepo.changeUserStatus(id, status);
    }
};

module.exports = adminService;