const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const tokenRepo = require('../repositories/tokenRepository');

const tokenService = {
    // Tạo Access Token (có kèm roles)
    generateAccessToken(userId, roles) {
        return jwt.sign(
            { id: userId, roles },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES }
        );
    },

    //Tạo và lưu Refresh Token mới vào DB
    async createSession(userId) {
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await tokenRepo.createRefreshToken(userId, refreshToken, expiresAt);
        return { refreshToken, expiresAt };
    },

    // Xóa token cũ và tạo cái mới (Xoay vòng token)
    async rotateSession(userId, oldToken) {
        await tokenRepo.deleteRefreshToken(oldToken);
        return await this.createSession(userId);
    },

    async findRefreshToken(refreshToken) {
        return await tokenRepo.findRefreshToken(refreshToken);
    },
    async deleteRefreshToken(refreshToken) {
        await tokenRepo.deleteRefreshToken(refreshToken);
    }
};

module.exports = tokenService;