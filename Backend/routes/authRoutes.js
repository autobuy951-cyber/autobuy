const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/login/customer', authController.loginCustomer);
router.post('/register/customer', authController.registerCustomer);
router.get('/verify', authMiddleware, authController.verify);

module.exports = router;
