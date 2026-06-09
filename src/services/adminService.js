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
    },

    // Lấy tất cả products (Admin)
    async getAllProducts(query) {
        const supabase = require('../config/supabase');
        const { page = 1, limit = 10, search = '', shopId = null } = query;
        
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        let queryBuilder = supabase
            .from('products')
            .select('id, name, brand, status, sold_count, category_id, shop_id, created_at, product_images(file_path)', { count: 'exact' })
            .eq('product_images.display_order', 0)
            .order('created_at', { ascending: false });
        
        if (shopId) {
            queryBuilder = queryBuilder.eq('shop_id', shopId);
        }
        
        if (search) {
            queryBuilder = queryBuilder.ilike('name', `%${search}%`);
        }
        
        const { data, error, count } = await queryBuilder.range(from, to);
        
        if (error) throw error;
        
        return {
            products: data || [],
            total: count || 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil((count || 0) / limit)
        };
    }
};

module.exports = adminService;