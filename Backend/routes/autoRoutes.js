const express = require('express');
const router = express.Router();
const autoController = require('../controllers/autoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', autoController.getAll);
router.get('/elerheto', autoController.getAvailable);
router.get('/markak', autoController.getBrands);
router.get('/:id', autoController.getById);
router.post('/', authMiddleware, autoController.create);
router.put('/:id', authMiddleware, autoController.update);
router.delete('/:id', authMiddleware, autoController.delete);

module.exports = router;
