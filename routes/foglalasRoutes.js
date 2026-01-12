const express = require('express');
const router = express.Router();
const foglalasController = require('../controllers/foglalasController');

router.get('/', foglalasController.getAll);
router.post('/', foglalasController.create);
router.delete('/:id', foglalasController.delete);

module.exports = router;
