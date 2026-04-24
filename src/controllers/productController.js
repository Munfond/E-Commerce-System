const productService = require('../services/productService');

/**
 * GET /customer/products
 * Search and filter products
 * Query params: q (search), category, sort (name, -name, price, -price, created_at, -created_at)
 */
exports.searchProducts = async (req, res) => {
    try {
        const { q, category, sort, page, limit } = req.query;

        const result = await productService.searchProducts(q, category, sort, page, limit);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /customer/products/:id
 * Get product details
 */
exports.getProductDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID sản phẩm' });
        }

        const product = await productService.getProductDetails(id);
        return res.status(200).json(product);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
    }
};

/**
 * POST /customer/products/:id/reviews
 * Create product review
 * Body: { rating, comment, images[] }
 */
exports.createReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, images } = req.body;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID sản phẩm' });
        }

        const result = await productService.createReview(id, userId, rating, comment, images);
        return res.status(201).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * GET /seller/products
 * Get seller's products list
 * Query params: status (PENDING, ACTIVE, INACTIVE, DELETED)
 */
exports.getSellerProducts = async (req, res) => {
    try {
        const { status } = req.query;
        const sellerId = req.user.id;

        const products = await productService.getSellerProducts(sellerId, status);
        return res.status(200).json(products);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

/**
 * POST /seller/products
 * Create new product
 * Body: { name, description, price, category_id, image_url, stock_quantity }
 */
exports.createProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { name, description, price, category_id, image_url, stock_quantity } = req.body;

        const result = await productService.createProduct(sellerId, {
            name,
            description,
            price,
            category_id,
            image_url,
            stock_quantity
        });

        return res.status(201).json(result);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

/**
 * PUT /seller/products/:id
 * Update product
 * Body: { name, description, price, category_id, image_url }
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID sản phẩm' });
        }

        const result = await productService.updateProduct(id, sellerId, updates);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Không có quyền')) {
            return res.status(403).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * DELETE /seller/products/:id
 * Delete product (soft delete)
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID sản phẩm' });
        }

        const result = await productService.deleteProduct(id, sellerId);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Không có quyền')) {
            return res.status(403).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * PATCH /seller/products/:id/stock
 * Update stock quantity
 * Body: { stock_quantity }
 */
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock_quantity } = req.body;
        const sellerId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID sản phẩm' });
        }

        const result = await productService.updateStock(id, sellerId, stock_quantity);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('Không có quyền')) {
            return res.status(403).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * GET /seller/statistics
 * Get seller revenue statistics
 * Query params: period (week, month, year)
 */
exports.getStatistics = async (req, res) => {
    try {
        const { period } = req.query;
        const sellerId = req.user.id;

        const stats = await productService.getSellerStatistics(sellerId, period);
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /admin/products
 * Get pending products for moderation
 * Query params: status (default: pending), page, limit
 */
exports.getPendingProducts = async (req, res) => {
    try {
        const { page, limit } = req.query;

        const result = await productService.getPendingProducts(page, limit);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE /admin/products/:id
 * Delete product for violation (hard delete)
 * Body: { reason }
 */
exports.adminDeleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Thiếu ID sản phẩm' });
        }

        const result = await productService.adminDeleteProduct(id, reason);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};
