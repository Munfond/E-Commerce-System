const categoryRepo = require('../repositories/categoryRepository');

/**
 * Lấy tất cả danh mục công khai
 */
exports.getAllCategories = async () => {
    try {
        const categories = await categoryRepo.getAllCategories();
        return categories;
    } catch (err) {
        throw new Error(`Lỗi khi lấy danh sách danh mục: ${err.message}`);
    }
};

/**
 * Lấy sản phẩm theo danh mục
 */
exports.getProductsByCategory = async (categoryId, page = 1, limit = 10) => {
    try {
        // Kiểm tra danh mục có tồn tại không
        const categoryExists = await categoryRepo.categoryExists(categoryId);
        if (!categoryExists) {
            throw new Error('Danh mục không tồn tại');
        }

        // Validate pagination params
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 10));

        const result = await categoryRepo.getProductsByCategory(categoryId, page, limit);
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi lấy sản phẩm: ${err.message}`);
    }
};

/**
 * Tạo danh mục (Admin only)
 */
exports.createCategory = async (name, image, parentId = null) => {
    try {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Tên danh mục không được để trống');
        }

        name = name.trim();
        if (name.length > 255) {
            throw new Error('Tên danh mục tối đa 255 ký tự');
        }

        if (parentId) {
            const parentExists = await categoryRepo.categoryExists(parentId);
            if (!parentExists) {
                throw new Error('Danh mục cha không tồn tại');
            }
        }

        // Tạo slug chuẩn
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        const insertData = {
            name,
            slug,
            parent_id: parentId || null
        };

        // Nếu Admin có đăng tải file ảnh danh mục
        if (image) {
            const uploadResult = await categoryRepo.uploadImage(image, 'categories');
            insertData.image_url = uploadResult.path; 
        }

        return await categoryRepo.createCategory(insertData);
    } catch (err) {
        throw new Error(`Lỗi khi tạo danh mục: ${err.message}`);
    }
};

/**
 * Cập nhật danh mục (Admin only)
 */
exports.updateCategory = async (id, name, image) => {
    try {
        // 1. Kiểm tra danh mục gốc có tồn tại hay không
        const category = await categoryRepo.getCategoryById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại'); 
        }

        const updates = {};

        // 2. Xử lý cập nhật Tên & Slug nếu có truyền lên
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                throw new Error('Tên danh mục không được để trống');
            }
            name = name.trim();
            if (name.length > 255) {
                throw new Error('Tên danh mục tối đa 255 ký tự');
            }
            updates.name = name;
            updates.slug = name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        }

        // 3. Xử lý cập nhật Ảnh mới (nếu có)
        if (image) {
            // Upload ảnh mới lên thư mục 'categories' trong bucket 'category'
            const uploadResult = await categoryRepo.uploadImage(image, 'categories');
            updates.image_url = uploadResult.path;

            // Xóa ảnh cũ trên Storage để dọn rác (nếu trước đó danh mục đã có sẵn ảnh)
            if (category.image_url) {
                categoryRepo.deleteImage(category.image_url).catch(err => 
                    console.error('Lỗi dọn rác ảnh cũ trên Storage (bỏ qua):', err.message)
                );
            }
        }

        // 4. Nếu không truyền gì lên body để thay đổi cả
        if (Object.keys(updates).length === 0) {
            throw new Error('Không có thông tin nào để cập nhật');
        }

        // 5. Thực thi update database
        const result = await categoryRepo.updateCategory(id, updates);
        return { success: true, data: result };

    } catch (err) {
        // Giữ lại cụm từ gốc để Controller phân tách mã lỗi 404
        if (err.message.includes('không tồn tại')) {
            throw err;
        }
        throw new Error(`Lỗi khi cập nhật danh mục: ${err.message}`);
    }
};

/**
 * Xóa danh mục (Admin only)
 */
exports.deleteCategory = async (id) => {
    try {
        // Kiểm tra danh mục có tồn tại không
        const category = await categoryRepo.getCategoryById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại');
        }

        const result = await categoryRepo.deleteCategory(id);
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi xóa danh mục: ${err.message}`);
    }
};
