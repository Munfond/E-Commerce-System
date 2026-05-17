const supabase = require('../config/supabase');

const userTable = () => supabase.schema('private_auth').from('users');
const userRoleTable = () => supabase.schema('private_auth').from('user_roles');
const roleTable = () => supabase.from('roles'); // Bảng này nằm ở schema public

exports.findByEmail = async (email) => {
    const { data, error } = await userTable()
        .select('*')
        .eq('email', email)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

exports.findByUsername = async (username) => {
    const { data, error } = await userTable()
        .select('*')
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

exports.findByPhoneNumber = async (phone) => {
    const { data, error } = await userTable()
        .select('*')
        .eq('phone', phone)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

exports.findById = async (id) => {
    const { data, error } = await userTable()
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Đăng ký/Cập nhật thông tin User ở trạng thái PENDING
 * Sử dụng cơ chế Upsert để tránh tạo trùng bản ghi nếu user chưa active
 */
exports.upsertPendingUser = async (userData) => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random&color=fff&rounded=true&format=svg`;

    // Upsert vào bảng Users trong schema private_auth
    const { data: user, error: userError } = await userTable()
        .upsert(
            { 
                email: userData.email,
                password: userData.password, // Mật khẩu này đã được hash từ Service
                username: userData.username,
                phone: userData.phone, 
                avatar_url: defaultAvatar,
                status: 'PENDING', // Phải viết hoa khớp với ENUM trong SQL
                updated_at: new Date() 
            }, 
            { onConflict: 'email' }
        )
        .select()
        .single();

    if (userError) {
        console.error("Lỗi Upsert User:", userError.message);
        throw userError;
    }

    // Role ID mặc định là 'customer'
    const { data: role, error: roleError } = await roleTable()
        .select('id')
        .eq('role_name', 'customer')
        .single();

    if (roleError) {
        console.error("Lỗi lấy Role:", roleError.message);
        throw roleError;
    }

    // Gán Role cho User (Bảng này cũng nằm trong private_auth)
    if (role && user) {
        const { error: linkError } = await userRoleTable()
            .upsert(
                { user_id: user.id, role_id: role.id },
                { onConflict: 'user_id,role_id' }
            );
        if (linkError) throw linkError;
    }

    return user;
};

exports.updateUserStatus = async (email, status) => {
    const { data, error } = await userTable()
        .update({ status, updated_at: new Date() })
        .eq('email', email)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.updatePassword = async (email, hashedPassword) => {
    const { data, error } = await userTable()
        .update({ 
            password: hashedPassword, 
            updated_at: new Date() 
        })
        .eq('email', email)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.getUserRoles = async (userId) => {
    // 1. Get role IDs for the user
    const { data: userRoles, error: urError } = await userRoleTable()
        .select('role_id')
        .eq('user_id', userId);

    if (urError) throw urError;
    if (!userRoles || userRoles.length === 0) return [];

    const roleIds = userRoles.map(r => r.role_id);

    // 2. Fetch role names from public.roles using those IDs
    const { data: roles, error: rError } = await roleTable()
        .select('role_name')
        .in('id', roleIds);

    if (rError) throw rError;
    return roles.map(r => r.role_name);
};

exports.upsertPendingSeller = async (userData) => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random&color=fff&rounded=true&format=svg`;

    // Upsert vào bảng Users trong schema private_auth
    const { data: user, error: userError } = await userTable()
        .upsert(
            { 
                email: userData.email,
                password: userData.password, // Mật khẩu này đã được hash từ Service
                username: userData.username,
                phone: userData.phone, 
                avatar_url: defaultAvatar,
                status: 'PENDING', // Phải viết hoa khớp với ENUM trong SQL
                updated_at: new Date() 
            }, 
            { onConflict: 'email' }
        )
        .select()
        .single();

    if (userError) {
        console.error("Lỗi Upsert User:", userError.message);
        throw userError;
    }

    // Role ID mặc định là 'seller'
    const { data: role, error: roleError } = await roleTable()
        .select('id')
        .eq('role_name', 'seller')
        .single();

    if (roleError) {
        console.error("Lỗi lấy Role:", roleError.message);
        throw roleError;
    }

    // Gán Role cho User (Bảng này cũng nằm trong private_auth)
    if (role && user) {
        const { error: linkError } = await userRoleTable()
            .upsert(
                { user_id: user.id, role_id: role.id },
                { onConflict: 'user_id,role_id' }
            );
        if (linkError) throw linkError;
    } else {
        console.error("Không tìm thấy user hoặc role để gán:", { user, role });
    }
    return user;
};

exports.updateProfile = async (userId, updates) => {
    const { data, error } = await userTable()
        .update({ ...updates, updated_at: new Date() })
        .eq('id', userId)
        .select('id, username, email, phone, avatar_url')
        .single();

    if (error) throw error;
    return data;
};