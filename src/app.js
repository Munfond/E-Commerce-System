const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer/cart', cartRoutes);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1/admin', categoryRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);
app.get('/', (req, res) => {
    res.json({ message: "E-Commerce API is running..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is barking on port ${PORT}`);
});