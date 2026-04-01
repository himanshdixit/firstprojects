const express = require('express');
const commentController = require('../controllers/comment.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');
const {
  createCommentSchema,
  updateCommentSchema,
  commentQuerySchema,
  commentParamSchema,
} = require('../validators/comment.schemas');

const router = express.Router();

router.get('/', optionalAuth, validateRequest({ query: commentQuerySchema }), commentController.getComments);
router.post('/', requireAuth, validateRequest({ body: createCommentSchema }), commentController.createComment);
router.patch('/:id', requireAuth, validateRequest({ params: commentParamSchema, body: updateCommentSchema }), commentController.updateComment);
router.delete('/:id', requireAuth, validateRequest({ params: commentParamSchema }), commentController.deleteComment);
router.patch('/:id/like', requireAuth, validateRequest({ params: commentParamSchema }), commentController.toggleLike);

module.exports = router;
