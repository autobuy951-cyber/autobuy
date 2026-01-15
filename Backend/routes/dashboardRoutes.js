const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, statsController.getStats);
router.get('/tevekenysegek', authMiddleware, statsController.getActivities);

module.exports = router;
