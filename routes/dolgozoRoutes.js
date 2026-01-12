const express = require('express');
const router = express.Router();
const dolgozoController = require('../controllers/dolgozoController');

router.get('/', dolgozoController.getAll);
router.post('/', dolgozoController.create);
router.delete('/:id', dolgozoController.delete);

module.exports = router;
