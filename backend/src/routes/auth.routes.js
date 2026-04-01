const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { authRateLimiter } = require('../middlewares/rateLimit.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
} = require('../validators/auth.schemas');

const router = express.Router();

router.post('/register', authRateLimiter, uploadAvatar.single('avatar'), validateRequest({ body: registerSchema }), authController.register);
router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), authController.login);
router.post('/refresh', authRateLimiter, validateRequest({ body: refreshSchema }), authController.refresh);
router.post('/logout', authController.logout);
router.get('/profile', requireAuth, authController.getProfile);
router.patch('/profile', requireAuth, uploadAvatar.single('avatar'), validateRequest({ body: updateProfileSchema, allowEmptyBodyWithFile: true }), authController.updateProfile);

module.exports = router;
