const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutesV2 = require('./routes/productRoutesV2');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Auth & Account routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/accounts', userRoutes);

// Customer routes
app.use('/api/v1/customer/cart', cartRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v2/products', productRoutesV2);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/categories', categoryRoutes);

// Seller routes
app.use('/api/v1/sellers', require('./routes/sellerRoutes'));

// Admin routes
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/shops', require('./routes/shopRoutes'));
app.use('/api/v1/vouchers', require('./routes/voucherRoutes'));
app.get('/', (req, res) => {
    res.json({ message: "E-Commerce API is running..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is barking on port ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`Server is barking on port ${PORT}`);
// });