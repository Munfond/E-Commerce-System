const authService = require('../services/authService');
const validateRegisterInput = require('../utils/validator');
const userRepo = require('../repositories/userRepository');

//Customer Register
exports.register = async (req, res) => {
    try {
        const { email, password, username, phone } = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        const validationErrors = validateRegisterInput({ email, password, username, phone });
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors });
        }
        
        const result = await authService.register(email, password, username, phone);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.verify = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        if (!email || !otpCode) {
            return res.status(400).json({ error: "Thiếu Email hoặc mã OTP!" });
        }

        const result = await authService.verifyAccount(email, otpCode);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//Seller register và verify sẽ tương tự, chỉ khác ở chỗ type OTP sẽ là 'SELLER_REGISTER' và khi verify xong sẽ gán role 'seller' thay vì 'customer'.
exports.sellerRegister = async (req, res) => {
    try {
        const { email, password, username, phone } = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        const validationErrors = validateRegisterInput({ email, password, username, phone });
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors });
        }
        
        const result = await authService.registerSeller(email, password, username, phone);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });

    }
}

exports.verifySeller = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        if (!email || !otpCode) {
            return res.status(400).json({ error: "Thiếu Email hoặc mã OTP!" });
        }

        const result = await authService.verifySellerAccount(email, otpCode);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ email và mật khẩu!" });
        }
        const result = await authService.login(email, password);
        res.status(200).json({
            message: "Đăng nhập thành công!",
            data: result
        });
    } catch (err) {
        //lỗi 401 và 404 sẽ được xử lý trong service, controller chỉ cần trả về lỗi chung
        res.status(400).json({ error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        await authService.logout(refreshToken);

        res.status(200).json({
            status: 'success',
            message: 'Đăng xuất thành công.'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.refreshSession = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ error: "Không tìm thấy RefreshToken" });
        }
        const result = await authService.refreshSession(refreshToken);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user được tạo ra từ Middleware bên trên
        const userId = req.user.id;
        
        const user = await userRepo.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Không tìm thấy người dùng." });
        }

        const roles = await userRepo.getUserRoles(userId);

        res.status(200).json({
            status: 'success',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                roles: roles
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Vui lòng cung cấp email." });
        }
        const result = await authService.requestPasswordReset(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.verifyPasswordReset = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        if (!email || !otpCode) {
            return res.status(400).json({ error: "Vui lòng cung cấp email và mã OTP." });
        }
        const result = await authService.verifyPasswordReset(email, otpCode);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ error: "Vui lòng cung cấp token và mật khẩu mới." });
        }
        const result = await authService.resetPassword(resetToken, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    // Mock implementation for testing
    res.status(200).json({
        message: "Đây là API giả lập Đăng nhập Google. Truy cập callback để hoàn tất.",
        mock_auth_url: "http://localhost:3000/api/v1/auth/google/callback?code=mock_code_123"
    });
};

exports.googleCallback = async (req, res) => {
    // Mock implementation for testing
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: "Thiếu Authorization Code." });
    }
    res.status(200).json({
        message: "Đăng nhập Google giả lập thành công!",
        accessToken: "mock_access_token_google",
        refreshToken: "mock_refresh_token_google",
        user: {
            username: "Google User",
            email: "googleuser@example.com",
            roles: ["customer"]
        }
    });
};