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
            const files = req.files || [];

            let variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : (req.body.variants || []);
            const product = await productRepoV2.getProductById(productId);

            variants = await ProductService.uploadMultipleFilesToSupabase(product.shop_id, productId, 'variant_files', variants, files);

            // Map thêm product_id, tự sinh SKU và lưu thẳng vào DB
            const data = await productRepoV2.createVariants(
                variants.map(v => ({
                    ...v,
                    product_id: productId,
                    sku: `${v.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`
                }))
            );

            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async updateVariant(req, res) {
        try {
            const { variant_id } = req.params;
            const { name, sale_price} = req.body; 
            const variantData = { name, sale_price };
            const file = req.file; // Nếu có file mới cho biến thể này
            let updateFields = { ...variantData };

            if (file) {
                const currentVariant = await productRepoV2.getVariantById(variant_id);
                if (!currentVariant) {
                    return res.status(404).json({ success: false, message: "Không tìm thấy biến thể" });
                }
                
                const productId = currentVariant.product_id;
                const shopId = currentVariant.products?.shop_id; 

                const uploadedPath = await ProductService.uploadSingleFileToSupabase(
                    shopId,
                    productId,
                    `variant-${variant_id}`, 
                    file
                );  

                // 3. Nhét đường dẫn ảnh mới vào object để chuẩn bị update vào DB
                updateFields.file_path = uploadedPath; 
            }
            
            const data = await productRepoV2.updateVariant(variant_id, updateFields);
            return res.status(200).json({ success: true, message: "Cập nhật biến thể thành công", data });

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async updateStock(req, res) {
        try {
            const { variant_id } = req.params;
            const { newStock } = req.body; 
            if (newStock === undefined || newStock < 0) {
                return res.status(400).json({ success: false, message: "Số lượng tồn kho mới không hợp lệ" });
            }                           

            await ProductService.adjustStock(variant_id, newStock);
            res.status(200).json({ success: true, message: "Cập nhật tồn kho thành công" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async deleteVariant(req, res) {
        try {
            const { variant_id } = req.params;
            const { id: userId } = req.user;
            
            // 1. Lấy thông tin của biến thể cần xóa để biết nó thuộc sản phẩm (product_id) nào
            const variant = await productRepoV2.getVariantById(variant_id);
            if (!variant) {
                return res.status(404).json({ success: false, message: "Không tìm thấy biến thể này" });
            }

            const productId = variant.product_id;
            //variant.products.shop_id có trùng với req.user.shop_id
            const product = await productRepoV2.getProductById(productId);
            if (product.shop_id !== req.user.shop_id) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền xóa biến thể này" });
            }

            // 2. Viết một hàm ở Repo hoặc dùng query trực tiếp để đếm số lượng biến thể của sản phẩm đó
            const { data: siblingVariants, error: countError } = await supabase
                .from('product_variants') // Đảm bảo trùng tên bảng biến thể của bạn
                .select('id')
                .eq('product_id', productId);

            if (countError) throw countError;

            // 3. Nếu tổng số biến thể hiện tại của sản phẩm nhỏ hơn hoặc bằng 1 thì CHẶN không cho xóa
            if (siblingVariants.length <= 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Không thể xóa! Sản phẩm bắt buộc phải giữ lại ít nhất 1 biến thể." 
                });
            }

            // 4. Nếu đủ điều kiện, tiến hành xóa bản ghi
            await productRepoV2.deleteVariant(variant_id);
            
            res.status(200).json({ success: true, message: "Đã xóa biến thể thành công" });
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