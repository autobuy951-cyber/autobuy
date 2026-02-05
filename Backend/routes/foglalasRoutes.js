const express = require('express');
const router = express.Router();
const foglalasController = require('../controllers/foglalasController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, foglalasController.getAll);
router.post('/', authMiddleware, foglalasController.create);
router.delete('/:id', authMiddleware, foglalasController.delete);
router.put('/:id/return', authMiddleware, foglalasController.return);
router.put('/:id/pickup', authMiddleware, foglalasController.recordPickup);
router.put('/:id/record-return', authMiddleware, foglalasController.recordReturn);

module.exports = router;
