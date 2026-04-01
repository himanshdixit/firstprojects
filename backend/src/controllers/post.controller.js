const postService = require('../services/post.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const { getUploadedFileUrl } = require('../middlewares/upload.middleware');

exports.createPost = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  delete payload.coverImage;
  if (req.file) {
    payload.coverImage = getUploadedFileUrl(req, 'posts', req.file.filename);
  }

  const post = await postService.createPost(payload, req.user);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Post created successfully',
    data: { post },
  });
});

exports.updatePost = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  delete payload.coverImage;
  if (req.file) {
    payload.coverImage = getUploadedFileUrl(req, 'posts', req.file.filename);
  }

  const post = await postService.updatePost(req.params.id, payload, req.user);
  return sendSuccess(res, {
    message: 'Post updated successfully',
    data: { post },
  });
});

exports.deletePost = catchAsync(async (req, res) => {
  await postService.deletePost(req.params.id, req.user);
  return sendSuccess(res, { message: 'Post deleted successfully' });
});

exports.getAllPosts = catchAsync(async (req, res) => {
  const result = await postService.getAllPosts(req.query, req.user || { role: 'user' });
  return sendSuccess(res, { data: result });
});

exports.getSinglePost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.id, req.user || null);
  return sendSuccess(res, { data: { post } });
});

exports.getPostsByUser = catchAsync(async (req, res) => {
  const requester = req.user || { role: 'user', id: '' };
  const result = await postService.getPostsByUser(req.params.userId, req.query, requester);
  return sendSuccess(res, { data: result });
});

exports.togglePostLike = catchAsync(async (req, res) => {
  const post = await postService.togglePostLike(req.params.id, req.user);
  return sendSuccess(res, {
    message: 'Post like updated successfully',
    data: { post },
  });
});

exports.togglePostBookmark = catchAsync(async (req, res) => {
  const post = await postService.togglePostBookmark(req.params.id, req.user);
  return sendSuccess(res, {
    message: 'Post bookmark updated successfully',
    data: { post },
  });
});
