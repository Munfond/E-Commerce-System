const authService = require('../services/authService');
const validator = require('../utils/validator');
const userRepo = require('../repositories/userRepository');

//Customer Register
exports.register = async (req, res) => {
    try {
        const { email, password, username} = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        const validationErrors = validator.validateRegisterInput({ email, password, username});
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors });
        }
        
        const result = await authService.register(email, password, username);
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
        const { email, password, username} = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        const validationErrors = validateRegisterInput({ email, password, username});
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors });
        }
        
        const result = await authService.registerSeller(email, password, username);
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