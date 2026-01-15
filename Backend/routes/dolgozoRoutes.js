const express = require('express');
const router = express.Router();
const dolgozoController = require('../controllers/dolgozoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, dolgozoController.getAll);
router.post('/', dolgozoController.create); // Assuming creation might be public first or admin-only
router.delete('/:id', authMiddleware, dolgozoController.delete);

module.exports = router;
