const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleAuthService = require('../services/googleAuthService');
const tokenService = require('../services/tokenService');
const userRepo = require('../repositories/userRepository');

// Tạo URL đăng nhập Google
exports.getGoogleUrl = (req, res) => {
    const url = googleAuthService.generateUrl();
    res.status(200).json({ url });
};

// Xử lý Callback
exports.googleCallback = async (req, res) => {
    try {
        const { code } = req.query;
        // 1. Gọi service để xác thực với Google
        const payload = await googleAuthService.verifyGoogleCode(code);
        
        // 2. Phối hợp với Repo để tìm hoặc tạo user
        let user = await userRepo.findByEmail(payload.email);
        if (!user) {
            user = await userRepo.createGoogleUser({
                email: payload.email,
                username: payload.name,
                avatar_url: payload.picture,
                provider_id: payload.sub,
                auth_provider: 'google'
            });
        }

        // 3. Cấp token (Có thể đưa logic tạo JWT vào một TokenService riêng)
        const accessToken = tokenService.generateAccessToken(user.id, user.roles);
        const refreshToken = await tokenService.createSession(user.id);

        res.redirect(`${process.env.FRONTEND_URL}?access=${accessToken}&refresh=${refreshToken}`);
    } catch (error) {
        console.error("Lỗi Google Callback:", error);
        res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }
};