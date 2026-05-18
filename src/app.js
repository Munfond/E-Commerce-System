const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerOrderRoutes = require('./routes/customerOrderRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const shopRoutes = require('./routes/shopRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/accounts', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
// Orders: mount at /api/v1/orders (documented) and /orders (short path for Postman/tools)
app.use('/api/v1/orders', orderRoutes);
app.use('/orders', orderRoutes);
app.use('/api/v1/customer', customerOrderRoutes);
app.use('/customer', customerOrderRoutes);
app.use('/api/v1/customer/cart', cartRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/sellers', sellerRoutes);
app.use('/api/v1/shops', shopRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({ message: "E-Commerce API is running..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is barking on port ${PORT}`);
});