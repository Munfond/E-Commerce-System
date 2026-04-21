const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');
const otpRepo = require('../repositories/otpRepository');
const mailService = require('./mailService');
const tokenService = require('./tokenService');
const tokenRepo = require('../repositories/tokenRepository');
const crypto = require('crypto');

exports.register = async (email, password, username) => {
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
    });
    await otpRepo.createOtp(email, hashedOtp, 'REGISTER');
    await mailService.sendOTP(email, otp);
    return { message: "Mã OTP đã được gửi thành công!" };
};

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

    const accessToken = tokenService.generateAccessToken(user.id, roles);
    const refreshTokenData = await tokenService.createSession(user.id);

    return {
        accessToken,
        refreshToken: refreshTokenData.refreshToken,
        user: { username: user.username, email: user.email, roles }
    };
    
}

exports.logout = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh Token là bắt buộc để đăng xuất.');
    }
    // Xóa token trong DB
    await tokenRepo.deleteRefreshToken(refreshToken);
};

exports.refreshSession = async (oldRefreshToken) => {
    const tokenData = await tokenService.findRefreshToken(oldRefreshToken);

    if (!tokenData) {
        throw new Error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
    }

    // 2. Kiểm tra xem token đã hết hạn chưa
    if (new Date(tokenData.expires_at) < new Date()) {
        await tokenService.deleteRefreshToken(oldRefreshToken);
        throw new Error('Phiên đã hết hạn.');
    }

    // 3. Lấy thông tin User & Roles để tạo Access Token mới
    const user = await userRepo.findById(tokenData.user_id);
    const roles = await userRepo.getUserRoles(user.id);

    const accessToken = tokenService.generateAccessToken(tokenData.user_id, roles);
    const { refreshToken: newRefreshToken } = await tokenService.rotateSession(tokenData.user_id, oldRefreshToken);

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
};