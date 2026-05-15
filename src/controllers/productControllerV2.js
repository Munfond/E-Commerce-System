const ProductService = require('../services/productServiceV2');
const productRepoV2 = require('../repositories/productRepositoryV2');
const shopRepo = require('../repositories/shopRepository');

const productControllerV2 = {
    // 1. [GET] /me -> Lấy danh sách sản phẩm của chính shop
    async getMyShopProducts(req, res) {
        try {
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id); // Lấy shopId từ userId
            const { page, limit, search } = req.query;

            const result = await productRepoV2.getAllProductsByShop(shopId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                search: search || '',
                isSeller: true
            });

            res.status(200).json({
                success: true,
                ...result // Trả về cả list products và thông tin phân trang (total, totalPages...)
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getShopProducts(req, res) {
        try {
            const shopId = req.params.shopId; // Lấy shopId từ tham số URL
            const { page, limit, search } = req.query;

            const result = await productRepoV2.getAllProductsByShop(shopId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                search: search || '',
                isSeller: false
            });

            res.status(200).json({
                success: true,
                ...result // Trả về cả list products và thông tin phân trang (total, totalPages...)
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getDetail(req, res) {
        try {
            const { id } = req.params;

            const data = await productRepoV2.getProductById(id);

            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
    },

    async create(req, res) {
        try {
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id);
            // req.body bao gồm: productData, variants[], images[]
            const data = await ProductService.createFullProduct(shopId, req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // [PUT] /me/:id -> Cập nhật phức hợp (Sync)
    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id);
            console.log("ID và shopId nhận được trong Controller:", id, shopId);

            // Kiểm tra chủ sở hữu trước khi sửa
            const product = await productRepoV2.getProductById(id);
            if (product.shop_id !== shopId) throw new Error("Quyền truy cập bị từ chối");

            const result = await ProductService.updateFullProduct(id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id);
            console.log("ID và shopId nhận được trong Controller:", id, shopId);

            // Kiểm tra chủ sở hữu trước khi sửa
            const product = await productRepoV2.getProductById(id);
            if (product.shop_id !== shopId) throw new Error("Quyền truy cập bị từ chối");

            const data = await productRepoV2.updateProduct(id, req.body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // --- VARIANT SECTIONS ---

    async addVariants(req, res) {
        try {
            const productId = req.params.id;
            const variants = req.body; // Mảng các biến thể mới
            
            const data = await productRepoV2.createVariants(
                variants.map(v => ({ ...v, product_id: productId }))
            );
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async updateVariants(req, res) {
        try {
            const { variant_id } = req.params;
            const variantData = req.body; // Dữ liệu cập nhật cho biến thể
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id);

            const data = await productRepoV2.updateVariant(variant_id, variantData); // Cần thêm hàm này vào Repo
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async updateStock(req, res) {
        try {
            const { variant_id } = req.params;
            const { newStock } = req.body; // Số lượng tồn kho mới mong muốn

            await ProductService.adjustStock(variant_id, newStock);
            res.status(200).json({ success: true, message: "Cập nhật tồn kho thành công" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async deleteVariant(req, res) {
        try {
            const {id, variant_id } = req.params;
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id);
            //Phải có 1 variant thì mới được phép xóa
            const product = await productRepoV2.getProductById(id);
            if (product.product_variants.length <= 1) {
                return res.status(400).json({ success: false, message: "Sản phẩm phải có ít nhất 1 variant" });
            }
            await productRepoV2.deleteVariant(variant_id);
            res.status(200).json({ success: true, message: "Đã xóa biến thể" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // --- IMAGE SECTIONS ---

    async addImages(req, res) {
        try {
            const productId = req.params.id;
            const images = req.body; // Mảng     các ảnh mới
            const data = await productRepoV2.createProductImages(
                images.map(img => ({ ...img, product_id: productId }))
            );
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async deleteImage(req, res) {
        try {
            const {id, image_id } = req.params;
            //nếu chỉ còn 1 ảnh thì không cho xóa
            const product = await productRepoV2.getProductById(id);
            if (product.product_images.length <= 1) {
                return res.status(400).json({ success: false, message: "Sản phẩm phải có ít nhất 1 hình ảnh" });
            }
            await productRepoV2.deleteProductImages(image_id);
            res.status(200).json({ success: true, message: "Đã xóa hình ảnh" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

module.exports = productControllerV2;