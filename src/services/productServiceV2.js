const productRepoV2 = require('../repositories/productRepositoryV2');

const ProductService = {
    // 1. Tạo trọn gói
    async createFullProduct(shopId, payload) {
        const { productData, variants, images } = payload;

        // Tạo slug từ name
        const slug = productData.name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '') + '-' + Date.now();

        // Bước 1: Tạo Product gốc
        const product = await productRepoV2.createProduct({
            ...productData,
            shop_id: shopId,
            slug
        });

        const productId = product.id;

        // Bước 2: Tạo đồng thời Variants và Images
        const variantTasks = variants.map(v => ({ ...v, product_id: productId }));
        const imageTasks = images.map(img => ({ ...img, product_id: productId }));

        await Promise.all([
            productRepoV2.createVariants(variantTasks),
            productRepoV2.createProductImages(imageTasks)
        ]);

        return product;
    },

    // 2. Cập nhật phức hợp (Sync Logic)
    async updateFullProduct(productId, payload) {
        const { productData, variants, images } = payload;

        // Cập nhật thông tin chính của Product
        if (productData) {
            await productRepoV2.updateProduct(productId, productData);
        }

        // Logic So Khớp cho Variants (Nếu có gửi mảng variants lên)
        if (variants) {
            const currentData = await productRepoV2.getProductById(productId);
            const currentVariants = currentData.product_variants;

            const toCreate = variants.filter(v => !v.id);
            const toUpdate = variants.filter(v => v.id && currentVariants.some(cv => cv.id === v.id));
            const toDeleteIds = currentVariants
                .filter(cv => !variants.some(v => v.id === cv.id))
                .map(cv => cv.id);

            // Thực thi song song các hành động nhỏ
            await Promise.all([
                toCreate.length > 0 ? productRepoV2.createVariants(toCreate.map(v => ({...v, product_id: productId}))) : null,
                ...toUpdate.map(v => productRepoV2.updateVariant(v.id, v)), // Giả sử bạn thêm hàm này vào Repo tương tự updateProduct
                ...toDeleteIds.map(id => productRepoV2.deleteVariant(id))
            ]);
        }
        if (images) {
            const currentData = await productRepoV2.getProductById(productId);
            const currentImages = currentData.product_images;

            const toCreate = images.filter(img => !img.id);
            const toDeleteIds = currentImages
                .filter(ci => !images.some(img => img.id === ci.id))
                .map(ci => ci.id);

            await Promise.all([
                toCreate.length > 0 ? productRepoV2.createProductImages(toCreate.map(img => ({...img, product_id: productId}))) : null,
                ...toDeleteIds.map(id => productRepoV2.deleteProductImages(id)) 
            ]);
        }

        return { 
            success: true,
            message: "Sync product success",
            product: await productRepoV2.getProductById(productId) // Trả về dữ liệu mới nhất sau khi cập nhật
        };
    },

    // 3. Điều chỉnh Stock (Tính toán offset)
    async adjustStock(variantId, newTotalStock) {
        const variant = await productRepoV2.getVariantById(variantId);
        const offset = newTotalStock - variant.stock;
        
        if (offset === 0) return;
        return await productRepoV2.updateStock(variantId, offset);
    }
};

module.exports = ProductService;