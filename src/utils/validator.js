const validator = {
    // 1. Check Email
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return "Email không đúng định dạng (VD: example@gmail.com).";
        }
        return null;
    },

    // 2. Check Username
    validateUsername: (username) => {
        const cleanedUsername = username?.trim();
        const usernameRegex = /^(?![._])(?!.*[._]{2})[a-zA-Z0-9._]+(?<![._])$/;
        if (!cleanedUsername || cleanedUsername.length < 3 || cleanedUsername.length > 30 || !usernameRegex.test(cleanedUsername)) {
            return "Username phải từ 3 đến 30 ký tự, không chứa ký tự đặc biệt.";
        }
        return null;
    },

    // 3. Check Password
    validatePassword: (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&<>]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            return "Mật khẩu tối thiểu 8 ký tự, bao gồm cả chữ và số.";
        }
        return null;
    }
};

// Hàm tổng hợp dùng cho Register
const validateRegisterInput = (data) => {
    const errors = [];
    
    const emailError = validator.validateEmail(data.email);
    if (emailError) errors.push(emailError);

    const usernameError = validator.validateUsername(data.username);
    if (usernameError) errors.push(usernameError);

    const passwordError = validator.validatePassword(data.password);
    if (passwordError) errors.push(passwordError);

    return errors;
};

module.exports = {
    ...validator,
    validateRegisterInput
};