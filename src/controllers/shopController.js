const shopService = require('../services/shopService');

const shopController = {
    // POST /shops
    registerShop: async (req, res) => {
        try {
            const ownerId = req.user.id; // Lấy từ middleware auth
            const shopData = req.body;
            const newShop = await shopService.registerShop(ownerId, shopData);
            res.status(201).json({ message: 'Đăng ký shop thành công', data: newShop });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // GET /shops/me
    getMyShop: async (req, res) => {
        try {
            const ownerId = req.user.id;
            const shop = await shopService.getMyShop(ownerId);
            if (!shop) return res.status(404).json({ error: 'Shop không tồn tại' });
            res.json(shop);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // PATCH /shops/me
    updateShop: async (req, res) => {
        try {
            const ownerId = req.user.id;
            const updatedShop = await shopService.updateShop(ownerId, req.body);
            res.json({ message: 'Cập nhật thông tin thành công', data: updatedShop });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // PATCH /shops/me/status
    updateShopStatus: async (req, res) => {
        try {
            const ownerId = req.user.id;
            const { status } = req.body;
            await shopService.updateShopStatus(ownerId, status);
            res.json({ message: 'Cập nhật trạng thái thành công' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // PATCH /shops/address
    updateAddress: async (req, res) => {
        try {
            const ownerId = req.user.id;
            const updatedAddress = await shopService.updateAddress(ownerId, req.body);
            res.json({ message: 'Cập nhật địa chỉ thành công', data: updatedAddress });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // GET /shops (Public)
    getShops: async (req, res) => {
        try {
            const shops = await shopService.getPublicShops(req.query);
            res.json(shops);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /shops/:id (Public)
    getShopById: async (req, res) => {
        try {
            const { id } = req.params;
            const shop = await shopService.getShopById(id);
            res.json(shop);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
};

module.exports = shopController;