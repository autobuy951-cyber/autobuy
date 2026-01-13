const express = require('express');
const router = express.Router();
const foglalasController = require('../controllers/foglalasController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, foglalasController.getAll);
router.post('/', authMiddleware, foglalasController.create);
router.delete('/:id', authMiddleware, foglalasController.delete);

module.exports = router;
