const adminService = require('../services/adminService');


const adminController = {
    // PATCH /admin/shops/:id/verify
    verifyShop: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // VD: 'OFFICIAL', 'UNOFFICIAL'
            await adminService.verifyShop(id, status);
            res.json({ message: `Đã cập nhật trạng thái verify thành ${status}` });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // PATCH /admin/shops/:id/control
    controlShop: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // VD: 'BANNED', 'OK'
            await adminService.controlShop(id, status);
            res.json({ message: `Đã cập nhật trạng thái control thành ${status}` });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // GET /admin/shops
    getShops: async (req, res) => {
        try {
            const shops = await adminService.getAllShops(req.query);
            res.json(shops);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = adminController;