const express = require('express');
const router = express.Router();
const autoController = require('../controllers/autoController');

router.get('/', autoController.getAll);
router.post('/', autoController.create);

module.exports = router;
