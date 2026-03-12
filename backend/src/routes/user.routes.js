const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/profile', requireAuth, authController.getProfile);
router.patch('/profile', requireAuth, uploadAvatar.single('avatar'), authController.updateProfile);

module.exports = router;
