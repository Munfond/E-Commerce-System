const supabase = require('../config/supabase');

const categoryTable = () => supabase.from('categories');
const productTable = () => supabase.from('products');

/**
 * Lấy tất cả danh mục
 */
exports.getAllCategories = async () => {
    const { data, error } = await categoryTable()
        .select('id, name, slug')
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Lấy danh mục theo ID
 */
exports.getCategoryById = async (id) => {
    const { data, error } = await categoryTable()
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

/**
 * Lấy sản phẩm theo danh mục
 */
exports.getProductsByCategory = async (categoryId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { data, error, count } = await productTable()
        .select('id, name, product_variants(sale_price), product_images(file_path)')
        .eq('category_id', categoryId)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
        data,
        pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil(count / limit)
        }
    };
};

/**
 * Tạo danh mục mới
 */
exports.createCategory = async (name, description, parentId = null) => {
    // Tạo slug từ name
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const { data, error } = await categoryTable()
        .insert({
            name,
            slug,
            description,
            parent_id: parentId
        })
        .select('id, name')
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cập nhật danh mục
 */
exports.updateCategory = async (id, updates) => {
    const { data, error } = await categoryTable()
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Xóa danh mục
 */
exports.deleteCategory = async (id) => {
    // Kiểm tra có sản phẩm nào liên quan không
    const { count: productCount, error: countError } = await productTable()
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

    if (countError) throw countError;

    if (productCount > 0) {
        throw new Error('Không thể xóa danh mục vì vẫn có sản phẩm liên quan');
    }

    const { error } = await categoryTable()
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
};

/**
 * Kiểm tra xem danh mục có tồn tại không
 */
exports.categoryExists = async (id) => {
    const { data, error } = await categoryTable()
        .select('id')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
};

async function getAllChildIdsRecursive(parentIds) {
    if (!parentIds || parentIds.length === 0) return [];

    // Tìm tất cả các danh mục con trực tiếp của danh sách parentIds này
    const { data: children, error } = await categoryTable()
        .select('id')
        .in('parent_id', parentIds); // Dùng .in() để quét hàng loạt parent_id

    if (error) throw error;

    if (!children || children.length === 0) return [];

    // Bóc tách mảng ID con vừa tìm được
    const childIds = children.map(c => c.id);

    // Tiếp tục đào sâu xuống để tìm con của con (gọi đệ quy)
    const grandChildIds = await getAllChildIdsRecursive(childIds);

    // Gộp tất cả lại thành một mảng phẳng
    return [...childIds, ...grandChildIds];
}

// Hàm chính của bạn
exports.categoryChildExists = async (id) => {
    // 1. Kiểm tra danh mục gốc có tồn tại không
    const { data: rootCategory, error } = await categoryTable()
        .select('id')
        .eq('id', id)
        .maybeSingle(); // Dùng maybeSingle() an toàn hơn .single(), đỡ lo lỗi PGRST116

    if (error) throw error;
    if (!rootCategory) {
        return { exists: false, categoryIds: [] };
    }

    // 2. Gọi hàm đệ quy để đào tận gốc trốc rễ các đời con cháu
    const allChildIds = await getAllChildIdsRecursive([id]);

    // 3. Trả về kết quả gộp: ID gốc + tất cả ID con cháu
    return {
        exists: true,
        categoryIds: [rootCategory.id, ...allChildIds]
    };
};
