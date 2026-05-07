const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('./config/db');

dotenv.config();

// Database pool is initialized in config/db.js

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
    res.json({ message: "Welcome to UrbanCare API v1.0" });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 UrbanCare Server berjalan di http://localhost:${PORT}`);
});
