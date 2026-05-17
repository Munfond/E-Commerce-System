const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');
const otpRepo = require('../repositories/otpRepository');
const mailService = require('./mailService');
const tokenRepo = require('../repositories/tokenRepository');
const crypto = require('crypto');

exports.register = async (email, password, username, phone) => {
    // Check xem đã active chưa
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser && existingUser.status === 'ACTIVE') {
        throw new Error('Email đã được sử dụng.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Upsert (Ghi đè nếu đang PENDING)
    await userRepo.upsertPendingUser({
        email,
        password: hashedPassword,
        username,
        phone
    });
    await otpRepo.createOtp(email, hashedOtp, 'REGISTER');
    await mailService.sendOTP(email, otp);
    return { message: "Mã OTP đã được gửi thành công!" };
};

exports.registerSeller = async (email, password, username, phone) => {
    // Check xem đã active chưa
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser && existingUser.status === 'ACTIVE') {
        throw new Error('Email đã được sử dụng.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Upsert (Ghi đè nếu đang PENDING)
    await userRepo.upsertPendingSeller({
        email,
        password: hashedPassword,
        username,
        phone
    });
    await otpRepo.createOtp(email, hashedOtp, 'SELLER_REGISTER');
    await mailService.sendOTP(email, otp);
    return { message: "Mã OTP đã được gửi thành công!" };
}

exports.verifyAccount = async (email, otpCode) => {
    const result = await otpRepo.verifyOtp(email, otpCode, 'REGISTER');
    if (!result.valid) {
        throw new Error(result.message);
    }
    // Kích hoạt User sang ACTIVE
    await userRepo.updateUserStatus(email, 'ACTIVE');

    return { message: "Tài khoản của bạn đã được kích hoạt thành công." };
};

exports.login = async (email, password) => {
    const user = await userRepo.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }
    if (user.status !== 'ACTIVE') {
        throw new Error('Email không tồn tại hoặc tài khoản chưa được kích hoạt.');
    }
    const roles = await userRepo.getUserRoles(user.id); 

    const accessToken = jwt.sign({ id: user.id, roles }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Lưu Refresh Token vào DB
    await tokenRepo.createRefreshToken(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken, user: { username: user.username, email: user.email, roles } };
    
}

exports.logout = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh Token là bắt buộc để đăng xuất.');
    }
    // Xóa token trong DB
    await tokenRepo.deleteRefreshToken(refreshToken);
};

exports.refreshSession = async (oldRefreshToken) => {
    const tokenData = await tokenRepo.findRefreshToken(oldRefreshToken);

    if (!tokenData) {
        throw new Error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
    }

    // 2. Kiểm tra xem token đã hết hạn chưa
    const now = new Date();
    if (new Date(tokenData.expires_at) < now) {
        await tokenRepo.deleteRefreshToken(oldRefreshToken);
        throw new Error('Phiên đăng nhập không hợp lệ hoặc hết hạn, vui lòng đăng nhập lại.');
    }

    // 3. Lấy thông tin User & Roles để tạo Access Token mới
    const user = await userRepo.findById(tokenData.user_id);
    const roles = await userRepo.getUserRoles(user.id);

    // 4. Tạo Access Token mới
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, roles },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES }
    );

    // 5. XOAY VÒNG TOKEN (Security Best Practice)
    // Tạo Refresh Token mới, xóa cái cũ để tránh bị dùng lại (Replay Attack)
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await tokenRepo.deleteRefreshToken(oldRefreshToken);
    await tokenRepo.createRefreshToken(user.id, newRefreshToken, newExpiresAt);

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
};

exports.requestPasswordReset = async (email) => {
    const user = await userRepo.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') {
        throw new Error('Email không tồn tại hoặc chưa được kích hoạt.');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await otpRepo.createOtp(email, hashedOtp, 'PASSWORD_RESET');
    await mailService.sendOTP(email, otp);
    return { message: "Mã OTP đặt lại mật khẩu đã được gửi." };
};

exports.verifyPasswordReset = async (email, otpCode) => {
    const result = await otpRepo.verifyOtp(email, otpCode, 'PASSWORD_RESET');
    if (!result.valid) {
        throw new Error(result.message);
    }
    
    // Sinh ra một resetToken tạm thời
    const resetToken = jwt.sign({ email, purpose: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    return { resetToken, message: "Xác thực OTP thành công." };
};

exports.resetPassword = async (resetToken, newPassword) => {
    let decoded;
    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    }
    
    if (decoded.purpose !== 'password_reset') {
        throw new Error("Token không hợp lệ cho tác vụ này.");
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepo.updatePassword(decoded.email, hashedPassword);
    
    return { message: "Đặt lại mật khẩu thành công." };
};