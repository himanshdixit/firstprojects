const express = require('express');
const postController = require('../controllers/post.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware');
const { uploadPostImage } = require('../middlewares/upload.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');
const {
  createPostSchema,
  updatePostSchema,
  postsQuerySchema,
  userPostsParamsSchema,
} = require('../validators/post.schemas');
const { objectIdParamSchema } = require('../validators/common.schemas');

const router = express.Router();

router.get('/', optionalAuth, validateRequest({ query: postsQuerySchema }), postController.getAllPosts);
router.get('/user/:userId', optionalAuth, validateRequest({ params: userPostsParamsSchema, query: postsQuerySchema }), postController.getPostsByUser);
router.get('/:id', optionalAuth, validateRequest({ params: objectIdParamSchema }), postController.getSinglePost);

router.post('/', requireAuth, uploadPostImage.single('coverImageFile'), validateRequest({ body: createPostSchema }), postController.createPost);
router.patch('/:id', requireAuth, uploadPostImage.single('coverImageFile'), validateRequest({ params: objectIdParamSchema, body: updatePostSchema, allowEmptyBodyWithFile: true }), postController.updatePost);
router.delete('/:id', requireAuth, validateRequest({ params: objectIdParamSchema }), postController.deletePost);
router.patch('/:id/like', requireAuth, validateRequest({ params: objectIdParamSchema }), postController.togglePostLike);
router.patch('/:id/bookmark', requireAuth, validateRequest({ params: objectIdParamSchema }), postController.togglePostBookmark);

module.exports = router;
