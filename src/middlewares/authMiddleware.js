const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    // Lấy token từ header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Bạn cần đăng nhập để thực hiện thao tác này." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Phiên đăng nhập hết hạn hoặc không hợp lệ." });
        }
        // Lưu thông tin user đã giải mã vào request để các hàm sau sử dụng
        req.user = decoded; 
        next();
    });
};

exports.authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        // 1. Kiểm tra đã có user và roles chưa
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ error: "Bạn chưa đăng nhập hoặc không có quyền." });
        }

        // 2. Kiểm tra xem mảng roles của user có chứa quyền yêu cầu không. Ví dụ: requiredRole là 'admin', mảng là ['user', 'admin']
        if (req.user.roles.includes(requiredRole)) {
            next(); 
        } else {
            return res.status(403).json({ error: "Bạn không có quyền truy cập tài nguyên này." });
        }
    };
};