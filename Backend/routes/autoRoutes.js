const express = require('express');
const router = express.Router();
const autoController = require('../controllers/autoController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = require('../middleware/upload');

router.get('/', autoController.getAll);
router.get('/elerheto', autoController.getAvailable);
router.get('/markak', autoController.getBrands);
router.get('/:id', autoController.getById);
router.post('/', authMiddleware, (req, res, next) => {
  upload.single('kep')(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'Csak JPG, JPEG, PNG vagy GIF fájl tölthető fel! (Max 5MB)' });
    next();
  });
}, autoController.create);
router.put('/:id', authMiddleware, (req, res, next) => {
  upload.single('kep')(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'Csak JPG, JPEG, PNG vagy GIF fájl tölthető fel! (Max 5MB)' });
    next();
  });
}, autoController.update);
router.delete('/:id', authMiddleware, autoController.delete);

module.exports = router;
