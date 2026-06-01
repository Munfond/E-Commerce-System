const cartService = require('../services/cartService');

/**
 * GET /customer/cart
 * Lấy danh sách sản phẩm trong giỏ
 */
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id; // Từ middleware authenticateToken

        const cart = await cartService.getCart(userId);
        return res.status(200).json({ 
            success: true,
            cart 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * POST /customer/cart/:item_id
 * Thêm sản phẩm vào giỏ
 * Body: { quantity: number }
 */
exports.addItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { variant_id } = req.params;
        const { quantity } = req.body;

        if (!variant_id) {
            return res.status(400).json({ error: 'Thiếu ID biến thể sản phẩm' });
        }

        const result = await cartService.addItemToCart(userId, variant_id, quantity);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * DELETE /customer/cart/items/:item_id
 * Xóa sản phẩm khỏi giỏ
 */
exports.removeItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_id } = req.params;

        if (!item_id) {
            return res.status(400).json({ error: 'Thiếu ID item' });
        }

        const result = await cartService.removeItemFromCart(userId, item_id);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Không có quyền')) {
            return res.status(401).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * PUT /customer/cart/items/:item_id
 * Cập nhật số lượng sản phẩm
 * Body: { quantity: number }
 */
exports.updateQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_id } = req.params;
        const { quantity } = req.body;

        if (!item_id) {
            return res.status(400).json({ error: 'Thiếu ID item' });
        }

        const result = await cartService.updateItemQuantity(userId, item_id, quantity);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message.includes('không tồn tại')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Không có quyền')) {
            return res.status(401).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
};

/**
 * DELETE /customer/cart
 * Xóa toàn bộ giỏ hàng
 */
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await cartService.clearCart(userId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
