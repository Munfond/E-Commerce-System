const categoryService = require('../services/categoryService');

/**
 * GET /categories
 * Lấy danh sách danh mục công khai
 */
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        return res.status(200).json(categories);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /categories/:id/products
 * Lấy sản phẩm theo danh mục
 * Query params: page, limit
 */
exports.getProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { page, limit } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID danh mục' });
        }

        const result = await categoryService.getProductsByCategory(id, page, limit);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
    }
};

/**
 * POST /admin/categories
 * Thêm danh mục mới (Admin only)
 * Body: { name, description, parent_id?, image_url? }
 */
exports.createCategory = async (req, res) => {
    try {
        const { name, description, parent_id, image_url } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
        }

        const result = await categoryService.createCategory(name, description, parent_id, image_url);
        return res.status(201).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * PUT /admin/categories/:id
 * Sửa danh mục (Admin only)
 * Body: { name, description, image_url? }
 */
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image_url } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID danh mục' });
        }

        if (!name && description === undefined && image_url === undefined) {
            return res.status(400).json({ error: 'Cần ít nhất một trường để cập nhật (name, description, image_url)' });
        }

        const result = await categoryService.updateCategory(id, name, description, image_url);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * DELETE /admin/categories/:id
 * Xóa danh mục (Admin only)
 */
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID danh mục' });
        }

        const result = await categoryService.deleteCategory(id);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};
