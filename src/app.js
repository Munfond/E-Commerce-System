const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: "E-Commerce API is running..." });
});
app.get('/api/v1', (req, res) => {
    res.json({ message: "E-Commerce API V1 is running..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is barking on port http://localhost:${PORT}`);
});