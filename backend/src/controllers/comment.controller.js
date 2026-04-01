const commentService = require('../services/comment.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

exports.createComment = catchAsync(async (req, res) => {
  const comment = await commentService.createComment(req.body, req.user);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Comment added successfully',
    data: { comment },
  });
});

exports.getComments = catchAsync(async (req, res) => {
  const result = await commentService.getCommentsByPost(req.query.post, req.query, req.user || null);
  return sendSuccess(res, { data: result });
});

exports.updateComment = catchAsync(async (req, res) => {
  const comment = await commentService.updateComment(req.params.id, req.body, req.user);
  return sendSuccess(res, {
    message: 'Comment updated successfully',
    data: { comment },
  });
});

exports.deleteComment = catchAsync(async (req, res) => {
  await commentService.deleteComment(req.params.id, req.user);
  return sendSuccess(res, { message: 'Comment deleted successfully' });
});

exports.toggleLike = catchAsync(async (req, res) => {
  const comment = await commentService.toggleLike(req.params.id, req.user);
  return sendSuccess(res, {
    message: 'Comment like updated successfully',
    data: { comment },
  });
});
