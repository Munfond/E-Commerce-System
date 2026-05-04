const shopRepo = require('../repositories/shopRepo');

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
    }
};

module.exports = adminService;