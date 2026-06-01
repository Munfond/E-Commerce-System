const productRepoV2 = require('../repositories/productRepositoryV2');
const supabase = require('../config/supabase'); // Đảm bảo đường dẫn tới instance supabase chuẩn xác

class ProductImagesService {

    async addImage(productId, shopId, file) {
        if (!file) throw new Error("Vui lòng chọn file ảnh để tải lên");

        // Đếm số lượng ảnh hiện có để tự động tăng số display_order tiếp theo
        const currentImages = await productRepoV2.getProductImages(productId) || [];
        const nextOrder = currentImages.length; 

        // Upload file vật lý lên Supabase Storage
        const fileExt = file.originalname.split('.').pop();
        const fileName = `img-${Date.now()}.${fileExt}`;
        const filePath = `${productId}/gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (uploadError) throw uploadError;

        // Lưu thông tin đường dẫn vào Database (bỏ trường id để DB tự sinh UUID)
        return await productRepoV2.insertProductImage({
            product_id: productId,
            file_path: filePath,
            display_order: nextOrder
        });
    }

    async deleteImage(imageObj) {
        const productId = imageObj.product_id;
        //nếu chỉ có 1 ảnh thì ko được xoá
        const currentImages = await productRepoV2.getProductImages(productId) || [];
        if (currentImages.length <= 1) {
            throw new Error("Sản phẩm phải có ít nhất 1 hình ảnh. Vui lòng thêm hình ảnh mới trước khi xóa.");
        }
        // Xóa file vật lý trên Cloud Storage trước
        const { error: storageError } = await supabase.storage
            .from('products')
            .remove([imageObj.file_path]);
            
        if (storageError) {
            console.error("Cảnh báo lỗi Storage (Có thể ảnh không tồn tại vật lý):", storageError.message);
        }

        // Xóa bản ghi trong database qua Repo
        await productRepoV2.deleteProductImageById(imageObj.id);
        const remainingImages = await productRepoV2.getProductImages(productId) || [];

        if (remainingImages.length > 0) {
            // Đánh số lại từ 0, 1, 2... dựa trên thứ tự hiện tại của tụi nó
            const upsertRows = remainingImages.map((img, index) => ({
                ...img,
                display_order: index // Vị trí mới được dồn liên tục: 0, 1, 2...
            }));

            // Cập nhật loạt thứ tự mới này xuống database
            await productRepoV2.upsertImageOrders(upsertRows);
        }
        return true;
    }
    
    async reorderImages(productId, imageOrders) {
        if (!Array.isArray(imageOrders)) throw new Error("Dữ liệu gửi lên không đúng định dạng mảng");

        const dbImages = await productRepoV2.getProductImages(productId) || [];
        // Chuẩn bị dữ liệu mảng sạch để thực hiện Upsert an toàn
        const upsertRows = imageOrders.map(item => {
            // Tìm xem cái ảnh có ID này trong DB đang có file_path là gì
            const currentImg = dbImages.find(img => img.id === item.id);
            
            if (!currentImg) {
                throw new Error(`Không tìm thấy hình ảnh có ID: ${item.id} thuộc sản phẩm này`);
            }
            if (item.display_order === undefined || item.display_order === null || typeof item.display_order !== 'number' || item.display_order < 0 || item.display_order >= dbImages.length) {
                throw new Error(`Lỗi trường display_order cho ảnh`);
            }

            return {
                id: item.id,
                product_id: productId,
                file_path: currentImg.file_path, // <--- ĐÂY CHÍNH LÀ CHÌA KHÓA: Giữ lại path cũ để DB không bắt bẻ null
                display_order: item.display_order // Cập nhật số thứ tự kéo thả mới (0, 1, 2...)
            };
        });

        // Chạy lệnh lưu đồng loạt xuống DB
        return await productRepoV2.upsertImageOrders(upsertRows);
    }
}

module.exports = new ProductImagesService();