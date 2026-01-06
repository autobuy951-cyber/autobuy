const express = require('express');
const router = express.Router();
const autoKibeController = require('../controllers/autoKibeController');

router.get('/', autoKibeController.getAll);
router.post('/', autoKibeController.create);

module.exports = router;
