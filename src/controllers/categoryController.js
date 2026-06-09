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
 * Body: { name, description, parent_id? }
 */
exports.createCategory = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const image = req.file; // Nhận file từ multer memoryStorage

        if (!name) {
            return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
        }

        const result = await categoryService.createCategory(name, image, parent_id);
        return res.status(201).json({
            success: true,
            message: 'Tạo danh mục mới thành công',
            data: result
        });
    } catch (err) {
        if (err.message.includes('cha không tồn tại')) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * PUT /admin/categories/:id
 * Sửa danh mục (Admin only)
 * Body: { name, description }
 */
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const image = req.file;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID danh mục' });
        }

        // 💡 SỬA ĐỔI: Chỉ báo lỗi khi không truyền cả TEXT lẫn FILE ảnh lên để cập nhật
        if (name === undefined && !image) {
            return res.status(400).json({ error: 'Cần ít nhất trường tên (name) hoặc tệp ảnh (image) để cập nhật' });
        }

        const result = await categoryService.updateCategory(id, name, image);
        
        // 💡 ĐỒNG BỘ RESPONSE: Trả ra kết quả chuẩn hóa từ object service trả về
        return res.status(200).json({
            success: result.success,
            message: 'Cập nhật danh mục thành công',
            data: result.data
        });
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
        return res.status(200).json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        // Trường hợp lỗi dính ràng buộc khóa ngoại (vẫn còn sản phẩm thuộc danh mục)
        return res.status(400).json({ error: err.message });
    }
};
