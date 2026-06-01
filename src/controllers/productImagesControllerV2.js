const productImagesService = require('../services/productImagesServiceV2');
const productRepoV2 = require('../repositories/productRepositoryV2');
const shopRepo = require('../repositories/shopRepository'); // Import repo lấy thông tin cửa hàng của bạn
const supabase = require('../config/supabase');

class ProductImagesController {

    // ==========================================
    // API: POST /products/me/:id/images (Thêm 1 ảnh)
    // ==========================================
    async addImage(req, res) {
        try {
            const productId = req.params.id;
            const file = req.file; // Nhận 1 file đơn lẻ từ Multer upload.single('image')
            const { id: userId } = req.user;

            // Kiểm tra quyền sở hữu sản phẩm
            const product = await productRepoV2.getProductById(productId);
            const shop = await shopRepo.findByOwnerId(userId);
            if (!product || product.shop_id !== shop.id) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền chỉnh sửa sản phẩm này" });
            }

            const data = await productImagesService.addImage(productId, shop.id, file);
            return res.status(201).json({ success: true, message: "Thêm hình ảnh thành công", data });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ==========================================
    // API: DELETE /products/me/images/:image_id (Xóa 1 ảnh)
    // ==========================================
    async deleteImage(req, res) {
        try {
            const { image_id } = req.params;
            const { id: userId } = req.user;

            // Tìm ảnh để lấy file_path gốc và kiểm tra quyền qua product liên kết
            const { data: image, error: fetchError } = await supabase
                .from('product_images')
                .select('*, products(shop_id)')
                .eq('id', image_id)
                .maybeSingle();

            if (fetchError || !image) {
                return res.status(404).json({ success: false, message: "Không tìm thấy hình ảnh này trên hệ thống" });
            }

            // Kiểm tra bảo mật xem shop_id của sản phẩm có khớp với shop_id của user không
            const shop = await shopRepo.findByOwnerId(userId);
            if (image.products?.shop_id !== shop.id) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền xóa hình ảnh của sản phẩm này" });
            }

            await productImagesService.deleteImage(image);
            return res.status(200).json({ success: true, message: "Đã xóa hình ảnh thành công" });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ==========================================
    // API: PUT /products/me/:id/images/reorder (Đổi chỗ ảnh)
    // ==========================================
    async reorderImages(req, res) {
        try {
            const productId = req.params.id;
            const { imageOrders } = req.body; // Mảng: [{"id": "uuid-1", "display_order": 0}, ...]
            const { id: userId } = req.user;

            // Kiểm tra bảo mật trước khi thay đổi vị trí ảnh hiển thị
            const product = await productRepoV2.getProductById(productId);
            const shop = await shopRepo.findByOwnerId(userId);
            if (!product || product.shop_id !== shop.id) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền thay đổi sản phẩm này" });
            }

            const data = await productImagesService.reorderImages(productId, imageOrders);
            return res.status(200).json({ success: true, message: "Đã cập nhật lại thứ tự hiển thị ảnh thành công", data });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProductImagesController();