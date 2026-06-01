const productRepoV2 = require('../repositories/productRepositoryV2');
const supabase = require('../config/supabase');

const ProductService = {
    async uploadSingleFileToSupabase(shopId, productId, prefix, file) {
        if (!file) return null;

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${prefix}-${Date.now()}.${fileExt}`;
        const filePath = `${shopId}/${productId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products') 
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) throw new Error(`Lỗi tải ảnh lên Supabase: ${uploadError.message}`);
        return uploadData.path;
    },
    // Hàm phụ trợ độc lập: Thực hiện Upload mảng file lên Supabase Storage và trả về mảng dữ liệu chứa file_path
    async uploadMultipleFilesToSupabase(shopId, productId, prefix, textArray, files) {
        if (!files || files.length === 0) return textArray;
        
        const updatedArray = [...textArray];
        for (let i = 0; i < updatedArray.length; i++) {
            // Khớp file theo thứ tự truyền lên từ Postman
            if (files[i]) {
                const file = files[i];
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${prefix}-${Date.now()}-${i}.${fileExt}`;
                const filePath = `${shopId}/${productId}/${fileName}`;

                // Thực hiện upload lên Bucket tên là 'products' trên Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products') 
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) throw new Error(`Lỗi tải ảnh lên Supabase: ${uploadError.message}`);

                // Gán đường dẫn lưu trữ tương đối vào cột file_path
                updatedArray[i].file_path = uploadData.path;
            }
        }
        return updatedArray;
    },

    // 1. Tạo trọn gói
    async createFullProduct(shopId, payload, files) {
        let { productData, variants } = payload; // Bỏ biến images lấy từ payload đi

        // 1. Tạo slug từ name
        const slug = productData.name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '') + '-' + Date.now();

        // Bước 1: Tạo Product gốc để lấy productId
        const product = await productRepoV2.createProduct({
            ...productData,
            shop_id: shopId,
            slug
        });

        const productId = product.id;

        // 2. Xử lý Upload ảnh biến thể (variants) lên Supabase Storage
        if (files && files.variant_files) {
            variants = await this.uploadMultipleFilesToSupabase(shopId, productId, 'variant', variants, files.variant_files);
        }

        // 3. Xử lý Upload ảnh mô tả chung (product_images) dựa hoàn toàn vào FILE THỰC TẾ
        let finalImages = [];
        if (files && files.product_images && files.product_images.length > 0) {
            const productImagesFiles = files.product_images;

            for (let i = 0; i < productImagesFiles.length; i++) {
                const file = productImagesFiles[i];
                const fileExt = file.originalname.split('.').pop();
                const fileName = `general-${Date.now()}-${i}.${fileExt}`;
                const filePath = `${shopId}/${productId}/${fileName}`;

                // Upload trực tiếp từng file lên Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products') // Đảm bảo đúng tên bucket công khai của bạn
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) throw new Error(`Lỗi tải ảnh mô tả lên Supabase: ${uploadError.message}`);

                // Lưu lại đường dẫn để chuẩn bị ghi vào Database
                // Lưu ý: Nếu tên cột trong DB của bạn là image_url thì đổi key thành image_url: uploadData.path
                finalImages.push({
                    file_path: uploadData.path, 
                    display_order: i
                });
            }
        }

        // 4. Chuẩn bị mảng dữ liệu để Bulk Insert vào Database
        const variantTasks = variants.map(v => {
            return { 
                ...v, 
                product_id: productId, 
                sku: `${v.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}` 
            };
        });
        const imageTasks = finalImages.map(img => ({ ...img, product_id: productId }));

        // Thực thi lưu xuống Database cùng một lúc
        await Promise.all([
            variantTasks.length > 0 ? productRepoV2.createVariants(variantTasks) : null,
            imageTasks.length > 0 ? productRepoV2.createProductImages(imageTasks) : null
        ]);

        return product;
    },

    // 2. Cập nhật phức hợp (Sync Logic)
    async updateFullProduct(productId, shopId, payload, files) {
        let { productData, variants, images } = payload;

        // Cập nhật thông tin chính của Product
        if (productData) {
            await productRepoV2.updateProduct(productId, productData);
        }

        // Đồng bộ Variants nâng cao có hỗ trợ File upload
        if (variants) {
            const currentData = await productRepoV2.getProductById(productId);
            const currentVariants = currentData.product_variants;

            let toCreate = variants.filter(v => !v.id);
            const toUpdate = variants.filter(v => v.id && currentVariants.some(cv => cv.id === v.id));
            const toDeleteIds = currentVariants
                .filter(cv => !variants.some(v => v.id === cv.id))
                .map(cv => cv.id);

            // Chỉ upload file cho các Variant chuẩn bị thêm mới
            if (files && files.variant_files.length > 0) {
                toCreate = await this.uploadMultipleFilesToSupabase(shopId, productId, 'variant-new', toCreate, files.variant_files);
            }

            await Promise.all([
                toCreate.length > 0 ? productRepoV2.createVariants(toCreate.map(v => ({...v, product_id: productId}))) : null,
                ...toUpdate.map(v => productRepoV2.updateVariant(v.id, v)),
                ...toDeleteIds.map(id => productRepoV2.deleteVariant(id))
            ]);
        }

        // Đồng bộ Images nâng cao có hỗ trợ File upload
        if (images) {
            const currentData = await productRepoV2.getProductById(productId);
            const currentImages = currentData.product_images;

            let toCreate = images.filter(img => !img.id);
            const toDeleteIds = currentImages
                .filter(ci => !images.some(img => img.id === ci.id))
                .map(ci => ci.id);

            if (files && files.product_images.length > 0) {
                toCreate = await this.uploadMultipleFilesToSupabase(shopId, productId, 'general-new', toCreate, files.product_images);
            }

            await Promise.all([
                toCreate.length > 0 ? productRepoV2.createProductImages(toCreate.map(img => ({...img, product_id: productId}))) : null,
                ...toDeleteIds.map(id => productRepoV2.deleteProductImages(id)) 
            ]);
        }

        return { 
            success: true,
            message: "Sync product success",
            product: await productRepoV2.getProductById(productId)
        };
    },

    // 3. Điều chỉnh Stock
    async adjustStock(variantId, newTotalStock) {
        const variant = await productRepoV2.getVariantById(variantId);
        const offset = newTotalStock - variant.stock;
        
        if (offset === 0) {
            return { message: "Số lượng không thay đổi" };
        }
        await productRepoV2.updateStock(variantId, offset);
        return { message: "Cập nhật tồn kho thành công", data: { variantId, newTotalStock } };
    },
    async syncProductImages({ productId, shopId, imageLayout, files }) {
        // 1. Lấy toàn bộ ảnh hiện tại đang có trong DB của sản phẩm này
        const dbImages = await productRepoV2.getProductImages(productId) || [];

        // 2. TÌM VÀ XÓA: Những ảnh cũ không nằm trong layout mới
        const keepImageIds = imageLayout.filter(item => item.type === 'old').map(item => item.id);
        const imagesToDelete = dbImages.filter(img => !keepImageIds.includes(img.id));

        if (imagesToDelete.length > 0) {
            // Xóa file trên Storage
            const pathsToDelete = imagesToDelete.map(img => img.file_path);
            await supabase.storage.from('products').remove(pathsToDelete);

            // Xóa bản ghi ở DB qua Repo
            const idsToDelete = imagesToDelete.map(img => img.id);
            await productRepoV2.deleteProductImagesByIds(idsToDelete);
        }

        // 3. UPLOAD FILE MỚI: Đẩy file lên Storage
        const uploadedFilesMap = {};
        for (const file of files) {
            const fileExt = file.originalname.split('.').pop();
            const fileName = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
            const filePath = `${shopId}/${productId}/gallery/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file.buffer, { contentType: file.mimetype });

            if (uploadError) throw uploadError;

            uploadedFilesMap[file.originalname] = filePath;
        }

        // 4. ĐỒNG BỘ LẠI THỨ TỰ (UPSERT)
        const upsertRows = [];
        let currentOrder = 0;

        for (const item of imageLayout) {
            if (item.type === 'old') {
                const currentImg = dbImages.find(img => img.id === item.id);
                if (currentImg) {
                    upsertRows.push({
                        id: item.id,
                        product_id: productId,
                        file_path: currentImg.file_path,
                        display_order: currentOrder++
                    });
                }
            } else if (item.type === 'new') {
                const filePath = uploadedFilesMap[item.id];
                if (filePath) {
                    upsertRows.push({
                        product_id: productId,
                        file_path: filePath,
                        display_order: currentOrder++
                    });
                }
            }
        }

        // 5. Gọi Repo thực hiện lưu dữ liệu hàng loạt xuống DB
        if (upsertRows.length > 0) {
            return await productRepoV2.upsertProductImages(upsertRows);
        }
        
        return [];
    }
};

module.exports = ProductService;