const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

exports.createOtp = async (email, otpCode, type) => {
    await supabase
        .schema('private_auth')
        .from('otp_codes')
        .delete()
        .or(`expires_at.lt.${new Date().toISOString()},and(email.eq.${email},type.eq.${type},status.eq.PENDING)`);
    
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 phút từ hiện tại

    const { data, error } = await supabase
        .schema('private_auth')
        .from('otp_codes')
        .insert([{ 
            email, 
            otp_code: otpCode, 
            type, 
            expires_at: expiresAt,
            status: 'PENDING' 
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.verifyOtp = async (email, otpCode, type) => {
    const { data: otpRecord, error } = await supabase
        .schema('private_auth')
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .eq('type', type)
        .eq('status', 'PENDING')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !otpRecord) return { valid: false, message: "Mã không tồn tại hoặc hết hạn" };

    if (otpRecord.attempts >= 5) {
        await supabase.schema('private_auth').from('otp_codes')
            .update({ status: 'EXPIRED' })
            .eq('id', otpRecord.id);
        return { valid: false, message: "Bạn đã nhập sai quá nhiều lần. Hãy yêu cầu mã mới." };
    }

    const isMatch = await bcrypt.compare(otpCode, otpRecord.otp_code);
    const updatePayload = isMatch 
        ? { status: 'VERIFIED' } 
        : { attempts: otpRecord.attempts + 1 };

    await supabase.schema('private_auth')
        .from('otp_codes')
        .update(updatePayload)
        .eq('id', otpRecord.id);

    if (!isMatch) {
        return { valid: false, message: `Mã OTP không đúng. Bạn còn ${4 - otpRecord.attempts} lần thử.` };
    }

    return { valid: true, data: otpRecord };
};