const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');
const {
  adminUsersQuerySchema,
  adminPostsQuerySchema,
  adminCommentsQuerySchema,
  adminUpdateUserSchema,
  adminResourceParamSchema,
} = require('../validators/admin.schemas');
const {
  adminContactsQuerySchema,
  adminUpdateContactSchema,
  contactParamSchema,
} = require('../validators/contact.schemas');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', validateRequest({ query: adminUsersQuerySchema }), adminController.getAllUsers);
router.patch('/users/:id', uploadAvatar.single('avatarFile'), validateRequest({ params: adminResourceParamSchema, body: adminUpdateUserSchema, allowEmptyBodyWithFile: true }), adminController.updateUser);
router.delete('/users/:id', validateRequest({ params: adminResourceParamSchema }), adminController.deleteUser);
router.get('/posts', validateRequest({ query: adminPostsQuerySchema }), adminController.viewAllPosts);
router.get('/comments', validateRequest({ query: adminCommentsQuerySchema }), adminController.getAllComments);
router.delete('/comments/:id', validateRequest({ params: adminResourceParamSchema }), adminController.deleteComment);
router.get('/contacts', validateRequest({ query: adminContactsQuerySchema }), adminController.getAllContacts);
router.patch('/contacts/:id', validateRequest({ params: contactParamSchema, body: adminUpdateContactSchema }), adminController.updateContact);
router.delete('/contacts/:id', validateRequest({ params: contactParamSchema }), adminController.deleteContact);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
