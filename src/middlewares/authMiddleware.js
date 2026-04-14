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