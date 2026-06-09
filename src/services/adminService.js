const shopRepo = require('../repositories/shopRepository');
const userRepo = require('../repositories/userRepository');
const productRepo = require('../repositories/productRepository');

// Hàm phụ trợ tính toán khoảng (range) cho phân trang Supabase
const getPaginationRange = (page, limit) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return { from, to };
};

const adminService = {
    // 1. Duyệt shop (Official/Unofficial) + VALIDATE
    async verifyShop(shopId, status) {
        const validateStatus = ['OFFICIAL', 'UNOFFICIAL'];
        if (!validateStatus.includes(status)) {
            throw new Error(`Trạng thái xác thực không hợp lệ. Chỉ chấp nhận: ${validateStatus.join(', ')}`);
        }
        return await shopRepo.updateById(shopId, { official_verify_status: status });
    },

    // 2. Kiểm soát shop (BANNED/OK/RESTRICTED) + VALIDATE
    async controlShop(shopId, status) {
        const validateStatus = ['BANNED', 'OK', 'RESTRICTED'];
        if (!validateStatus.includes(status)) {
            throw new Error(`Trạng thái kiểm soát không hợp lệ. Chỉ chấp nhận: ${validateStatus.join(', ')}`);
        }
        return await shopRepo.updateById(shopId, { admin_control_status: status });
    },

    // 3. Thay đổi trạng thái User (PENDING/ACTIVE/BANNED) + VALIDATE
    async changeUserStatus(id, status) {
        const validateStatus = ['PENDING', 'ACTIVE', 'BANNED'];
        if (!validateStatus.includes(status)) {
            throw new Error(`Trạng thái tài khoản không hợp lệ. Chỉ chấp nhận: ${validateStatus.join(', ')}`);
        }
        return await userRepo.changeUserStatus(id, status);
    },

<<<<<<< HEAD
    // --- Các hàm Query lấy dữ liệu giữ nguyên ---
    async getAllShops(query) {
        const { page, limit, ...filters } = query;
        const { from, to } = getPaginationRange(page, limit);
        return await shopRepo.listShops({ filters, from, to, page, limit }); 
    },

    async getAllProducts(query) {
        const { page, limit, search } = query;
        const { from, to } = getPaginationRange(page, limit);
        return await productRepo.listProductsForAdmin({ search, from, to, page, limit });
    },

    async deleteProduct(productId) {
        return await productRepo.deleteById(productId);
    },

    async getAllUsers({ role, status, page, limit }) {
        const { from, to } = getPaginationRange(page, limit);
        return await userRepo.listUsers({ role, status, from, to, page, limit });
=======
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
>>>>>>> 2934b479acd41b4f3f046f64a0c8abe3f7c2b9b9
    }
};

module.exports = adminService;