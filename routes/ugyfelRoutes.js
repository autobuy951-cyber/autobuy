const express = require('express');
const router = express.Router();
const ugyfelController = require('../controllers/ugyfelController');

router.get('/', ugyfelController.getAll);
router.post('/', ugyfelController.create);

module.exports = router;
