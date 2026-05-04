const shopRepo = require('../repositories/shopRepository');

const shopService = {
    // 1. Đăng ký shop
    async registerShop(ownerId, shopData) {
        return await shopRepo.create(ownerId, shopData);
    },

    // 2. Lấy thông tin shop của chính mình (có xử lý lỗi not found)
    async getMyShop(ownerId) {
        try {
            return await shopRepo.findByOwnerId(ownerId);
        } catch (error) {
            if (error.code === 'PGRST116') return null; 
            throw error;
        }
    },

    // 3. Cập nhật thông tin shop (chỉ cho phép update nếu shop không bị BANNED)
    async updateShop(ownerId, updateData) {
        const shop = await shopRepo.findByOwnerId(ownerId);
        if (shop.admin_control_status === 'BANNED') {
            throw new Error('Shop đang bị khóa bởi hệ thống, không thể cập nhật.');
        }
        return await shopRepo.update(ownerId, updateData);
    },

    // 4. Cập nhật trạng thái (OPEN/CLOSED/MAINTENANCE)
    async updateShopStatus(ownerId, status) {
        const shop = await shopRepo.findByOwnerId(ownerId);
        
        if (shop.admin_control_status === 'BANNED') {
            throw new Error('Bạn không thể mở shop khi đã bị Admin khóa.');
        }
        return await shopRepo.update(ownerId, { seller_control_status: status });
    },

    // 5. Cập nhật địa chỉ
    async updateAddress(ownerId, addressData) {
        const shop = await shopRepo.findByOwnerId(ownerId);
        return await shopRepo.upsertAddress(shop.id, addressData);
    },

    // 6. Lấy danh sách shop (Public)
    async getPublicShops(query) {
        // Logic: Luôn mặc định lọc admin_control_status = 'OK'
        const filters = {
            keyword: query.keyword,
            adminStatus: 'OK', 
            sellerStatus: query.sellerStatus || 'OPEN'
        };
        return await shopRepo.listShops(filters);
    },

    // 7. Lấy chi tiết shop (Public)
    async getShopById(id) {
        const shop = await shopRepo.findById(id);
        if (shop.admin_control_status === 'BANNED') {
            throw new Error('Shop không tồn tại hoặc không khả dụng.');
        }
        return shop;
    }
};

module.exports = shopService;