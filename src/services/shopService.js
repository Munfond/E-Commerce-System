const shopRepo = require('../repositories/shopRepository');

async function uploadLogoToStorage(ownerId, file) {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `logo-${ownerId}-${Date.now()}.${fileExt}`;
    const filePath = `${ownerId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shops') // Đảm bảo bạn đã tạo bucket tên là 'shops' trên Supabase Storage
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });

    if (uploadError) {
        throw new Error(`Lỗi upload logo lên Storage: ${uploadError.message}`);
    }

    return uploadData.path; // Trả về đường dẫn tương đối
}

const shopService = {
    // 1. Đăng ký shop
    async registerShop(ownerId, shopInfo, shopAddress, file) {
        if (file) {
            shopInfo.shop_logo = await uploadLogoToStorage(ownerId, file);
        }
        const newShop = await shopRepo.create(ownerId, shopInfo);

        if (!newShop || !newShop.id) {
            throw new Error("Lỗi khi tạo thông tin Shop.");
        }
        const newAddress = await shopRepo.upsertAddress(newShop.id, shopAddress);
        // Gán role "seller" cho user
        await shopRepo.assignUserToSeller(ownerId);

        // Trả về kết quả tổng hợp
        return {
            ...newShop,
            address: newAddress
        };
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
    async updateShop(ownerId, updateData, file) {
        const shop = await shopRepo.findByOwnerId(ownerId);
        if (shop.admin_control_status === 'BANNED') {
            throw new Error('Shop đang bị khóa bởi hệ thống, không thể cập nhật.');
        }
        if (file) {
            updateData.shop_logo = await uploadLogoToStorage(ownerId, file);
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