const db = require('../config/db');

exports.createReport = async (req, res) => {
    try {
        const { title, description, category, address } = req.body;
        const userId = req.user.id;

        await db.query(
            'INSERT INTO reports (user_id, title, description, category, address) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description, category || 'LAINNYA', address]
        );

        res.status(201).json({ status: 'success', message: 'Laporan berhasil dibuat.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const [reports] = await db.query(`
            SELECT r.*, u.name as reporter_name 
            FROM reports r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `);
        res.status(200).json({ status: 'success', data: reports });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getMyReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const [reports] = await db.query(`
            SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC
        `, [userId]);
        res.status(200).json({ status: 'success', data: reports });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.upvoteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const userId = req.user.id;

        // Insert ke upvotes_history
        await db.query('INSERT INTO upvotes_history (report_id, user_id) VALUES (?, ?)', [reportId, userId]);
        
        // Update total upvotes
        await db.query('UPDATE reports SET upvotes = upvotes + 1 WHERE id = ?', [reportId]);

        res.status(200).json({ status: 'success', message: 'Upvote berhasil.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Anda sudah melakukan upvote pada laporan ini.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const reportId = req.params.id;
        const { status } = req.body;

        if (req.user.role !== 'PETUGAS' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ status: 'error', message: 'Akses ditolak. Hanya Petugas yang bisa mengubah status.' });
        }

        await db.query('UPDATE reports SET status = ? WHERE id = ?', [status, reportId]);
        res.status(200).json({ status: 'success', message: 'Status laporan diperbarui.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
