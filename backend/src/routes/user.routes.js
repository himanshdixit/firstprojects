const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../validators/auth.schemas');

const router = express.Router();

router.get('/profile', requireAuth, authController.getProfile);
router.patch('/profile', requireAuth, uploadAvatar.single('avatar'), validateRequest({ body: updateProfileSchema, allowEmptyBodyWithFile: true }), authController.updateProfile);

module.exports = router;
