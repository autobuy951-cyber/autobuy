const express = require('express');
const router = express.Router();
const dolgozoController = require('../controllers/dolgozoController');

router.get('/', dolgozoController.getAll);
router.post('/', dolgozoController.create);

module.exports = router;
