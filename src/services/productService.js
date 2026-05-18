const productRepo = require('../repositories/productRepository');
const categoryRepo = require('../repositories/categoryRepository');

/**
 * Search and filter products (public)
 */
exports.searchProducts = async (query = '', category = null, sort = 'name', page = 1, limit = 10) => {
    try {
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (page - 1) * limit;

        // Validate category if provided
        if (category) {
            const categoryExists = await categoryRepo.categoryExists(category);
            if (!categoryExists) {
                throw new Error('Danh mục không tồn tại');
            }
        }

        // Validate sort parameter
        const validSorts = ['name', '-name', 'price', '-price', 'created_at', '-created_at'];
        if (!validSorts.includes(sort)) {
            sort = 'name';
        }

        const { data, count } = await productRepo.searchProducts(query, category, sort, limit, offset);
        const total = count ?? data?.length ?? 0;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: total > 0 ? Math.ceil(total / limit) : 0
            }
        };
    } catch (err) {
        throw new Error(`Lỗi khi tìm kiếm sản phẩm: ${err.message}`);
    }
};

/**
 * Get product details (public)
 */
exports.getProductDetails = async (id) => {
    try {
        if (!id) {
            throw new Error('ID sản phẩm không được để trống');
        }

        const product = await productRepo.getProductById(id);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // Get reviews
        const reviews = await productRepo.getProductReviews(id, 5);

        // Get seller info using shop_id
        const seller = await productRepo.getSellerInfo(product.shop_id);

        return {
            ...product,
            seller,
            reviews: reviews.data
        };
    } catch (err) {
        throw new Error(`Lỗi khi lấy thông tin sản phẩm: ${err.message}`);
    }
};

/**
 * Create product review (customer)
 */
exports.createReview = async (productId, userId, rating, comment, images = []) => {
    try {
        if (!productId) {
            throw new Error('ID sản phẩm không được để trống');
        }

        // Validate rating
        rating = parseInt(rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            throw new Error('Đánh giá phải từ 1 đến 5');
        }

        // Validate comment
        if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
            throw new Error('Bình luận không được để trống');
        }

        if (comment.length > 1000) {
            throw new Error('Bình luận tối đa 1000 ký tự');
        }

        // Check product exists
        const productExists = await productRepo.productExists(productId);
        if (!productExists) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // Validate images
        let imageUrls = [];
        if (Array.isArray(images) && images.length > 0) {
            if (images.length > 5) {
                throw new Error('Tối đa 5 hình ảnh');
            }
            imageUrls = images.filter(img => typeof img === 'string' && img.length > 0);
        }

        const result = await productRepo.createReview(productId, userId, rating, comment, imageUrls);
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi tạo đánh giá: ${err.message}`);
    }
};

/**
 * Get seller's products list
 */
exports.getSellerProducts = async (sellerId, status = null) => {
    try {
        const validStatuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'HIDDEN', 'DELETED'];
        
        if (status && !validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        const products = await productRepo.getSellerProducts(sellerId, status);
        return products;
    } catch (err) {
        throw new Error(`Lỗi khi lấy danh sách sản phẩm: ${err.message}`);
    }
};

/**
 * Create new product (seller)
 */
exports.createProduct = async (sellerId, productData) => {
    try {
        const { name, description, price, category_id, image_url, stock_quantity, brand } = productData;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Tên sản phẩm không được để trống');
        }
        
        if (!price || isNaN(price) || price <= 0) {
            throw new Error('Giá sản phẩm phải lớn hơn 0');
        }

        if (!category_id) {
            throw new Error('Danh mục sản phẩm là bắt buộc');
        }

        // Validate category exists
        const categoryExists = await categoryRepo.categoryExists(category_id);
        if (!categoryExists) {
            throw new Error('Danh mục không tồn tại');
        }

        // Validate optional fields
        if (description && description.length > 5000) {
            throw new Error('Mô tả tối đa 5000 ký tự');
        }

        if (stock_quantity && (isNaN(stock_quantity) || stock_quantity < 0)) {
            throw new Error('Số lượng tồn kho phải >= 0');
        }

        const result = await productRepo.createProduct(sellerId, {
            name: name.trim(),
            description: description?.trim(),
            price: parseFloat(price),
            category_id,
            image_url,
            stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
            brand: brand || null
        });

        return result;
    } catch (err) {
        throw new Error(`Lỗi khi tạo sản phẩm: ${err.message}`);
    }
};

/**
 * Update product (seller)
 */
exports.updateProduct = async (productId, sellerId, updates) => {
    try {
        if (!productId) {
            throw new Error('ID sản phẩm không được để trống');
        }

        const validUpdates = {};

        // Validate each field
        if (updates.name !== undefined) {
            if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
                throw new Error('Tên sản phẩm không được để trống');
            }
            validUpdates.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            if (updates.description && updates.description.length > 5000) {
                throw new Error('Mô tả tối đa 5000 ký tự');
            }
            validUpdates.description = updates.description?.trim();
        }

        if (updates.price !== undefined) {
            if (isNaN(updates.price) || updates.price <= 0) {
                throw new Error('Giá sản phẩm phải lớn hơn 0');
            }
            validUpdates.price = parseFloat(updates.price);
        }

        if (updates.category_id !== undefined) {
            const categoryExists = await categoryRepo.categoryExists(updates.category_id);
            if (!categoryExists) {
                throw new Error('Danh mục không tồn tại');
            }
            validUpdates.category_id = updates.category_id;
        }

        if (updates.image_url !== undefined) {
            validUpdates.image_url = updates.image_url;
        }

        if (updates.brand !== undefined) {
            validUpdates.brand = updates.brand;
        }

        if (updates.stock_quantity !== undefined) {
            if (isNaN(updates.stock_quantity) || updates.stock_quantity < 0) {
                throw new Error('Số lượng tồn kho phải >= 0');
            }
            validUpdates.stock_quantity = parseInt(updates.stock_quantity);
        }

        if (Object.keys(validUpdates).length === 0) {
            throw new Error('Không có thông tin nào để cập nhật');
        }

        await productRepo.updateProduct(productId, sellerId, validUpdates);
        return { success: true };
    } catch (err) {
        throw new Error(`Lỗi khi cập nhật sản phẩm: ${err.message}`);
    }
};

/**
 * Delete product (seller - soft delete)
 */
exports.deleteProduct = async (productId, sellerId) => {
    try {
        if (!productId) {
            throw new Error('ID sản phẩm không được để trống');
        }

        await productRepo.deleteProduct(productId, sellerId);
        return { success: true };
    } catch (err) {
        throw new Error(`Lỗi khi xóa sản phẩm: ${err.message}`);
    }
};

/**
 * Update stock quantity
 */
exports.updateStock = async (productId, sellerId, stockQuantity) => {
    try {
        if (!productId) {
            throw new Error('ID sản phẩm không được để trống');
        }

        if (stockQuantity === undefined || isNaN(stockQuantity) || stockQuantity < 0) {
            throw new Error('Số lượng tồn kho phải >= 0');
        }

        await productRepo.updateStock(productId, sellerId, stockQuantity);
        return { success: true };
    } catch (err) {
        throw new Error(`Lỗi khi cập nhật tồn kho: ${err.message}`);
    }
};

/**
 * Get seller statistics
 */
exports.getSellerStatistics = async (sellerId, period = 'month') => {
    try {
        const validPeriods = ['week', 'month', 'year'];
        if (!validPeriods.includes(period)) {
            period = 'month';
        }

        const stats = await productRepo.getSellerStatistics(sellerId, period);
        return stats;
    } catch (err) {
        throw new Error(`Lỗi khi lấy thống kê: ${err.message}`);
    }
};

/**
 * Get pending products (admin)
 */
exports.getPendingProducts = async (page = 1, limit = 10) => {
    try {
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (page - 1) * limit;

        const { data, count } = await productRepo.getPendingProducts(limit, offset);
        const total = count ?? data?.length ?? 0;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: total > 0 ? Math.ceil(total / limit) : 0
            }
        };
    } catch (err) {
        throw new Error(`Lỗi khi lấy danh sách chờ duyệt: ${err.message}`);
    }
};

/**
 * Admin moderate product status (approve/reject)
 */
exports.moderateProduct = async (productId, status) => {
    try {
        if (!productId) {
            throw new Error('ID sản phẩm không được để trống');
        }
        if (!status) {
            throw new Error('Trạng thái không được để trống');
        }

        const result = await productRepo.moderateProduct(productId, status);
        return result;
    } catch (err) {
        throw new Error(`Lỗi khi duyệt sản phẩm: ${err.message}`);
    }
};

/**
 * Admin delete product (hard delete)
 */
exports.adminDeleteProduct = async (productId, reason = '') => {
    try {
        if (!productId) {
            throw new Error('ID sản phẩm không được để trống');
        }

        // Verify product exists
        const product = await productRepo.getProductByIdAdmin(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        await productRepo.adminDeleteProduct(productId, reason);
        return { success: true };
    } catch (err) {
        throw new Error(`Lỗi khi xóa sản phẩm: ${err.message}`);
    }
};
