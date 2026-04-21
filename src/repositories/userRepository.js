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
        .eq('email', email.toLowerCase())
        .select('id, email')
        .single();

    if (error) throw error;
    return data;
};

exports.getUserRoles = async (userId) => {
    const { data, error } = await supabase
        .from('user_permissions') // Truy vấn thẳng vào View ở schema public
        .select('role_name')
        .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.role_name);
};

exports.createGoogleUser = async (userData) => {
    const defaultAvatar = userData.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random&color=fff&rounded=true&format=svg`;
    
    const { data: user, error: userError } = await userTable()
        .insert({
            email: userData.email,
            username: userData.username,
            avatar_url: defaultAvatar,
            auth_provider: 'google',
            provider_id: userData.provider_id,
            status: 'ACTIVE', // Google user mặc định active luôn
            created_at: new Date(),
            updated_at: new Date()
        })
        .select()
        .single();
    
    if (userError) {
        console.error("Lỗi tạo User Google:", userError.message);
        throw userError;
    }
    const { data: role } = await roleTable()
        .select('id')
        .eq('role_name', 'customer')
        .single();

    if (role) {
        await userRoleTable().insert({
            user_id: user.id,
            role_id: role.id
        });
    } else {
        console.error("Không tìm thấy role 'customer' để gán cho user Google mới tạo.");
    }

    return { ...user, roles: ['customer'] };
}