const express = require('express');
const router = express.Router();
const ugyfelController = require('../controllers/ugyfelController');

router.get('/', ugyfelController.getAll);
router.get('/abc', ugyfelController.getAlphabetical);
router.get('/betuk/:betu', ugyfelController.getByLetter);
router.get('/tartomany/:tartomany', ugyfelController.getByLetterRange);
router.post('/', ugyfelController.create);
router.delete('/:id', ugyfelController.delete);

module.exports = router;
