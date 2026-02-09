const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');

// Csak admin férhet hozzá az audit logokhoz
router.get('/', authMiddleware, auditController.getAll);
router.get('/stats', authMiddleware, auditController.getStats);
router.get('/:entityType/:entityId', authMiddleware, auditController.getByEntity);

module.exports = router;
