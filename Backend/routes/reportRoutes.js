const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, reportController.createReport);
router.get('/', verifyToken, reportController.getReports);
router.get('/my-reports', verifyToken, reportController.getMyReports);
router.post('/:id/upvote', verifyToken, reportController.upvoteReport);
router.put('/:id/status', verifyToken, reportController.updateStatus);

module.exports = router;
