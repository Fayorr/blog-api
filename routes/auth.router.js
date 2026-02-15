const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/logout', authController.logout);

module.exports = router;
