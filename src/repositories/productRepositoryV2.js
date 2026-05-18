const supabase = require('../config/supabase');
const sanitizeHtml = require('sanitize-html');

const productTable = () => supabase.from('products');
const productVariantTable = () => supabase.from('product_variants');
const productImageTable = () => supabase.from('product_images');

function cleanHtmlInput (input) {
    return sanitizeHtml(input, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'img' ],
        allowedAttributes: {
            'a': [ 'href', 'target' ],
            'img': [ 'src', 'alt', 'width', 'height' ]
        },
        allowedIframeHostnames: [] // Chặn tuyệt đối nhúng iframe bậy bạ
    });
}

const shopRepo = require('./shopRepository');
const productRepoV2 = {
    async getProductById(productId) {
        //ra cả Product và Variants và Images
        const {data, error} = await productTable()
            .select('*, product_variants(*), product_images(*)')
            .eq ('id', productId)
            .single();
        if (error) throw error;
        return data;
    },
    async getAllProductsByShop(shopId, { page = 1, limit = 10, search = '', isSeller = false }) {
        //Lấy tất cả thông tin products và image số 0 của shop, không cần lấy variants
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        let query = productTable()
            .select('*, product_images(image_url)', { count: 'exact' })
            .eq('shop_id', shopId)
            .eq('product_images.display_order', 0)
            .order('created_at', { ascending: false });

        if (!isSeller) {
            query = query.eq('status', 'ACTIVE');
        } else {
            // Nếu là chủ shop, hiện mọi thứ trừ hàng đã xóa hẳn
            query = query.neq('status', 'DELETED');
        }
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }
        const { data, error, count } = await query.range(from, to);
        if (error) throw error;
        return {
            products: data || [],
            total: count || 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / limit)
        };
    },
    async getVariantById(variantId) {
        const {data, error} = await productVariantTable()
            .select('*, products(*)')
            .eq('id', variantId)
            .single();
        if (error) throw error;
        return data;
    },
    async getProductImageById (productId) {
        const {data, error} = await productImageTable()
            .select('*, products(*)')
            .eq('id', productId)
            .single();
        if (error) throw error;
        return data;
    },
    async createProduct(productData) {
        const {data, error} = await productTable()
            .insert({...productData, description: cleanHtmlInput(productData.description)})
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },
    async createVariants(variants) {
        const {data, error} = await productVariantTable()
            .insert(variants)
            .select('*');
        if (error) throw error;
        return data;
    },
    async createProductImages(images) {
        const {data, error} = await productImageTable()
            .insert(images)
            .select('*');
        if (error) throw error;
        return data;
    },
    async updateProduct(productId, updateData) {
        const {data, error} = await productTable()
            .update({...updateData, description: cleanHtmlInput(updateData.description)})
            .eq('id', productId)
            .select('*')
            .single();
        if (error) {
            console.error("Error updating product:", error);
            throw error;
        }
        return data;
    },
    async updateVariant(variantId, updateData) {
        const {data, error} = await productVariantTable()
            .update(updateData)
            .eq('id', variantId)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },
    async updateProductImages(imageId, updateData) {
        const {data, error} = await productImageTable()
            .update(updateData)
            .eq('id', imageId)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },
    async updateProductStatus(productId, status) {
        const {data, error} = await productTable()
            .update({status})
            .eq('id', productId)
            .single();
        if (error) throw error;
        return data;
    },
    async deleteVariant(variantId) {
        const {data, error} = await productVariantTable()
            .delete()
            .eq('id', variantId)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },
    async deleteProductImages(imageId) {
        const {data, error} = await productImageTable()
            .delete()
            .eq('id', imageId)
            .select('*');
        if (error) throw error;
        return data;
    },
    // Các hàm cập nhật đặc biệt (RPC)
    async updateStock(variantId, offset) {
        const { error } = await supabase.rpc('increment_stock', { target_variant_id: variantId, amount: offset });
        if (error) throw error;
    },
};

module.exports = productRepoV2;