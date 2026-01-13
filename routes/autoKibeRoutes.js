const express = require('express');
const router = express.Router();
const autoKibeController = require('../controllers/autoKibeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, autoKibeController.getAll);
router.post('/', authMiddleware, autoKibeController.create);
router.put('/:id', authMiddleware, autoKibeController.update);
router.delete('/:id', authMiddleware, autoKibeController.delete);

module.exports = router;
