const express = require('express');
const router = express.Router();
const ugyfelController = require('../controllers/ugyfelController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', ugyfelController.getAll);
router.get('/search', ugyfelController.search);
router.get('/abc', ugyfelController.getAlphabetical);
router.get('/betuk/:betu', ugyfelController.getByLetter);
router.get('/tartomany/:tartomany', ugyfelController.getByLetterRange);
router.get('/:id', ugyfelController.getById);
router.get('/:id/history', authMiddleware, ugyfelController.getBookingHistory);
router.post('/', authMiddleware, ugyfelController.create);
router.put('/:id', authMiddleware, ugyfelController.update);
router.delete('/:id', authMiddleware, ugyfelController.delete);

module.exports = router;
