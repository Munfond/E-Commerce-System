const adminService = require('../services/adminService');

const adminController = {
    // PATCH /admin/shops/:id/verify
    verifyShop: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'OFFICIAL', 'UNOFFICIAL'
            await adminService.verifyShop(id, status);
            res.json({ success: true, message: `Đã cập nhật trạng thái verify thành ${status}` });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PATCH /admin/shops/:id/control
    controlShop: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'BANNED', 'OK'
            await adminService.controlShop(id, status);
            res.json({ success: true, message: `Đã cập nhật trạng thái control thành ${status}` });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // GET /admin/shops?page=1&limit=10&status=OK
    getShops: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await adminService.getAllShops({ ...req.query, page, limit });
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // GET /admin/products?page=1&limit=10&search=Sữa+rửa+mặt
    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { search } = req.query;

            const result = await adminService.getAllProducts({ page, limit, search });
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // DELETE /admin/products/:id
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            await adminService.deleteProduct(id);
            res.json({ success: true, message: `Đã xóa thành công sản phẩm có id ${id}` });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // GET /admin/users?page=1&limit=10&role=customer&status=ACTIVE
    getAllUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { role, status } = req.query;

            const result = await adminService.getAllUsers({ role, status, page, limit });
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // PATCH /admin/users/:id/status
    changeUserStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await adminService.changeUserStatus(id, status);
            res.json({ success: true, message: `Đã cập nhật trạng thái user thành ${status}` });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
};

module.exports = adminController;