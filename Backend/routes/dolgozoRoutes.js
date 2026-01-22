const express = require('express');
const router = express.Router();
const dolgozoController = require('../controllers/dolgozoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, dolgozoController.getAll);
router.post('/', authMiddleware, dolgozoController.create);
router.put('/:id', authMiddleware, dolgozoController.update);
router.delete('/:id', authMiddleware, dolgozoController.delete);

module.exports = router;
