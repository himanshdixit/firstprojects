const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', uploadAvatar.single('avatarFile'), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/posts', adminController.viewAllPosts);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
