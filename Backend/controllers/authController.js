const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRASI USER
exports.register = async (req, res) => {
    try {
        const { userId, name, password, role } = req.body;

        // Cek apakah user ID sudah dipakai
        const [existingUser] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: 'error', message: 'User ID sudah terdaftar!' });
        }

        // Enkripsi Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const finalRole = role || 'WARGA';

        // Simpan ke Database MySQL
        await db.query(
            'INSERT INTO users (userId, name, password, role) VALUES (?, ?, ?, ?)',
            [userId, name, hashedPassword, finalRole]
        );

        res.status(201).json({
            status: 'success',
            message: 'Registrasi berhasil!',
            data: {
                userId,
                name,
                role: finalRole
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server', error: error.message });
    }
};

// 2. LOGIN USER & GENERATE JWT TOKEN
exports.login = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Cari user di Database MySQL
        const [users] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User tidak ditemukan!' });
        }

        const user = users[0];

        // Cek kecocokan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Password salah!' });
        }

        // Generate Token JWT
        const token = jwt.sign(
            { id: user.id, userId: user.userId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            status: 'success',
            message: 'Login berhasil!',
            token: token,
            data: {
                id: user.id,
                userId: user.userId,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server', error: error.message });
    }
};
