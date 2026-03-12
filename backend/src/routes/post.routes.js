const express = require('express');
const postController = require('../controllers/post.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware');
const { uploadPostImage } = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/', optionalAuth, postController.getAllPosts);
router.get('/user/:userId', optionalAuth, postController.getPostsByUser);
router.get('/:id', optionalAuth, postController.getSinglePost);

router.post('/', requireAuth, uploadPostImage.single('coverImageFile'), postController.createPost);
router.patch('/:id', requireAuth, uploadPostImage.single('coverImageFile'), postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

module.exports = router;
