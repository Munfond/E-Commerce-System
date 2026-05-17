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
exports.createCategory = async (name, description, parentId = null, imageUrl = null) => {
    try {
        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Tên danh mục không được để trống');
        }

        name = name.trim();

        if (name.length > 255) {
            throw new Error('Tên danh mục tối đa 255 ký tự');
        }

        if (description && description.length > 1000) {
            throw new Error('Mô tả tối đa 1000 ký tự');
        }

        // Nếu có parent_id, kiểm tra xem parent có tồn tại không
        if (parentId) {
            const parentExists = await categoryRepo.categoryExists(parentId);
            if (!parentExists) {
                throw new Error('Danh mục cha không tồn tại');
            }
        }

        const result = await categoryRepo.createCategory(name, description, parentId, imageUrl);
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi tạo danh mục: ${err.message}`);
    }
};

/**
 * Cập nhật danh mục (Admin only)
 */
exports.updateCategory = async (id, name, description, imageUrl = null) => {
    try {
        // Kiểm tra danh mục có tồn tại không
        const category = await categoryRepo.getCategoryById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại');
        }

        // Validate input
        const updates = {};

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

        if (description !== undefined) {
            if (description !== null && description.length > 1000) {
                throw new Error('Mô tả tối đa 1000 ký tự');
            }
            updates.description = description;
        }

        if (imageUrl !== undefined) {
            updates.image_url = imageUrl;
        }

        if (Object.keys(updates).length === 0) {
            throw new Error('Không có thông tin nào để cập nhật');
        }

        await categoryRepo.updateCategory(id, updates);
        return { success: true };
    } catch (err) {
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
