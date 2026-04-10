const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes cơ bản để test
app.get('/', (req, res) => {
    res.json({ message: "E-Commerce API is running..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is barking on port ${PORT}`);
});