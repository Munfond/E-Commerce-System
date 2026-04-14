const validateRegisterInput = (data) => {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push("Email không đúng định dạng (VD: example@gmail.com).");
    }

    const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/;
    if (!data.phone || !phoneRegex.test(data.phone)) {
        errors.push("Số điện thoại Việt Nam không hợp lệ (phải có 10 số).");
    }

    // 3. Kiểm tra Username (Độ dài từ 3-30 ký tự, không chứa ký tự đặc biệt)
    const usernameRegex = /^[a-zA-Z0-9_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ mang\s]+$/;
    if (!data.username || data.username.length < 3 || data.username.length > 30 || !usernameRegex.test(data.username)) {
        errors.push("Username phải từ 3 đến 30 ký tự, không có ký tự đặc biệt.");
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&<>]{8,}$/;
    if (!data.password || !passwordRegex.test(data.password)) {
        errors.push("Mật khẩu tối thiểu 8 ký tự, bao gồm cả chữ và số.");
    }

    return errors;
};

module.exports = validateRegisterInput;