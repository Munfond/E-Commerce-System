const ProductService = require('../services/productServiceV2');
const productRepoV2 = require('../repositories/productRepositoryV2');
const shopRepo = require('../repositories/shopRepository');

const productControllerV2 = {
    async getMyShopProducts(req, res) {
        try {
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id);
            const { page, limit, search } = req.query;

            const result = await productRepoV2.getAllProductsByShop(shopId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                search: search || '',
                isSeller: true
            });

            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getShopProducts(req, res) {
        try {
            const shopId = req.params.shopId;
            const { page, limit, search } = req.query;

            const result = await productRepoV2.getAllProductsByShop(shopId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                search: search || '',
                isSeller: false
            });

            res.status(200).json({ success: true, ...result });
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
            
            // Giải mã JSON string từ form-data
            const payload = {
                productData: typeof req.body.productData === 'string' ? JSON.parse(req.body.productData) : req.body.productData,
                variants: typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : (req.body.variants || []),
                images: typeof req.body.images === 'string' ? JSON.parse(req.body.images) : (req.body.images || [])
            };

            // Lấy các file ảnh từ multer field
            const files = {
                variant_files: req.files?.['variant_files'] || [],
                product_images: req.files?.['product_images'] || []
            };

            const data = await ProductService.createFullProduct(shopId, payload, files);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const shopId = await shopRepo.findByOwnerId(userId).then(shop => shop.id);

            const product = await productRepoV2.getProductById(id);
            if (product.shop_id !== shopId) throw new Error("Quyền truy cập bị từ chối");

            // Giải mã JSON string từ form-data cho hàm update
            const payload = {
                productData: typeof req.body.productData === 'string' ? JSON.parse(req.body.productData) : req.body.productData,
                variants: typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants,
                images: typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images
            };

            const files = {
                variant_files: req.files?.['variant_files'] || [],
                product_images: req.files?.['product_images'] || []
            };

            const result = await ProductService.updateFullProduct(id, shopId, payload, files);
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
            let variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body;
            const files = req.files || [];

            // Lấy shopId để tạo folder lưu ảnh
            const product = await productRepoV2.getProductById(productId);
            
            // Xử lý upload ảnh riêng lẻ cho cụm biến thể mới thêm
            variants = await ProductService.uploadMultipleFilesToSupabase(product.shop_id, productId, 'variant_files', variants, files);

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
            const variantData = req.body; 
            const data = await productRepoV2.updateVariant(variant_id, variantData);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async updateStock(req, res) {
        try {
            const { variant_id } = req.params;
            const { newStock } = req.body; 

            await ProductService.adjustStock(variant_id, newStock);
            res.status(200).json({ success: true, message: "Cập nhật tồn kho thành công" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async deleteVariant(req, res) {
        try {
            const { id, variant_id } = req.params;
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
            let images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : (req.body.images || []);
            const files = req.files || [];

            const product = await productRepoV2.getProductById(productId);
            
            // Upload mớ ảnh mô tả mới lên Supabase
            images = await ProductService.uploadMultipleFilesToSupabase(product.shop_id, productId, 'product_images', images, files);

            const data = await productRepoV2.createProductImages(
                images.map((img, index) => ({ ...img, product_id: productId, display_order: product.product_images.length + index }))
            );
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async deleteImage(req, res) {
        try {
            const { id, image_id } = req.params;
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