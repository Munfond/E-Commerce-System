const shopService = require('../services/shopService');

const shopController = {
    // POST /shops
    registerShop: async (req, res) => {
        try {
            const ownerId = req.user.id; // Lấy từ middleware auth
            const shop_info = typeof req.body.shop_info === 'string' ? JSON.parse(req.body.shop_info) : req.body.shop_info;
            const shop_address = typeof req.body.shop_address === 'string' ? JSON.parse(req.body.shop_address) : req.body.shop_address;
            const file = req.file;

            if (!shop_info || !shop_address) {
                return res.status(400).json({ error: "Thiếu thông tin shop hoặc địa chỉ!" });
            }
            const result = await shopService.registerShop(ownerId, shop_info, shop_address, file);
            res.status(201).json({
                success: true,
                message: "Đăng ký shop và địa chỉ thành công!",
                data: result
            });
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
            res.json({ success: true, data: shop });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // PATCH /shops/me
    updateShop: async (req, res) => {
        try {
            const ownerId = req.user.id;
            let updateData = req.body;
            if (typeof req.body.shop_info === 'string') {
                updateData = JSON.parse(req.body.shop_info);
            }
            
            const file = req.file;                              
            const updatedShop = await shopService.updateShop(ownerId, updateData, file);
            res.json({ success: true, message: 'Cập nhật thông tin thành công', data: updatedShop });
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
            res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // PATCH /shops/address
    updateAddress: async (req, res) => {
        try {
            const ownerId = req.user.id;
            const updatedAddress = await shopService.updateAddress(ownerId, req.body);
            res.json({ success: true, message: 'Cập nhật địa chỉ thành công', data: updatedAddress });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // GET /shops (Public)
    getShops: async (req, res) => {
        try {
            const shops = await shopService.getPublicShops(req.query);
            res.json({success: true, data: shops });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /shops/:id (Public)
    getShopById: async (req, res) => {
        try {
            const { id } = req.params;
            const shop = await shopService.getShopById(id);
            res.json({success: true, data: shop });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
};

module.exports = shopController;