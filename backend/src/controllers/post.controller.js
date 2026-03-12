const postService = require('../services/post.service');
const catchAsync = require('../utils/catchAsync');
const { getUploadedFileUrl } = require('../middlewares/upload.middleware');

exports.createPost = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  delete payload.coverImage;
  if (req.file) {
    payload.coverImage = getUploadedFileUrl(req, 'posts', req.file.filename);
  }

  const post = await postService.createPost(payload, req.user);
  return res.status(201).json({
    success: true,
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
  return res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: { post },
  });
});

exports.deletePost = catchAsync(async (req, res) => {
  await postService.deletePost(req.params.id, req.user);
  return res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

exports.getAllPosts = catchAsync(async (req, res) => {
  const result = await postService.getAllPosts(req.query, req.user || { role: 'user' });
  return res.status(200).json({ success: true, data: result });
});

exports.getSinglePost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.id, req.user || null);
  return res.status(200).json({ success: true, data: { post } });
});

exports.getPostsByUser = catchAsync(async (req, res) => {
  const requester = req.user || { role: 'user', id: '' };
  const result = await postService.getPostsByUser(req.params.userId, req.query, requester);
  return res.status(200).json({ success: true, data: result });
});
