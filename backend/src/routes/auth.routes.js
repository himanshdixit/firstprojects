const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/register', uploadAvatar.single('avatar'), authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/profile', requireAuth, authController.getProfile);
router.patch('/profile', requireAuth, uploadAvatar.single('avatar'), authController.updateProfile);

module.exports = router;
