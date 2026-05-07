const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'UrbanCare',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Terhubung ke database MySQL (UrbanCare)');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke MySQL:', err.message);
    });

module.exports = pool;

