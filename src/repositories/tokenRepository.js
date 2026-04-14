const supabase = require('../config/supabase');

const tokenTable = () => supabase.schema('private_auth').from('refresh_tokens');

exports.createRefreshToken = async (userId, token, expiresAt) => {
    const { data, error } = await tokenTable()
        .insert({
            user_id: userId,
            token: token,
            expires_at: expiresAt
        });

    if (error) throw error;
    return data;
};

exports.deleteRefreshToken = async (token) => {
    const { error } = await tokenTable()
        .delete()
        .eq('token', token);

    if (error) throw error;
};

exports.findRefreshToken = async (token) => {
    const { data, error } = await tokenTable()
        .select('*')
        .eq('token', token)
        .single();

    if (error) throw error;
    return data;
}