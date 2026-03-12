const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');
const { getUploadedFileUrl } = require('../middlewares/upload.middleware');

exports.getAllUsers = catchAsync(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  return res.status(200).json({ success: true, data: result });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = getUploadedFileUrl(req, 'avatars', req.file.filename);
  }

  const user = await adminService.updateUser(req.params.id, payload);
  return res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

exports.viewAllPosts = catchAsync(async (req, res) => {
  const result = await adminService.viewAllPosts(req.query);
  return res.status(200).json({ success: true, data: result });
});

exports.getAnalytics = catchAsync(async (_req, res) => {
  const result = await adminService.getAnalytics();
  return res.status(200).json({ success: true, data: result });
});
