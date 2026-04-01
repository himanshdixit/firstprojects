const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const { getUploadedFileUrl } = require('../middlewares/upload.middleware');

exports.getAllUsers = catchAsync(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  return sendSuccess(res, { data: result });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  return sendSuccess(res, { message: 'User deleted successfully' });
});

exports.updateUser = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = getUploadedFileUrl(req, 'avatars', req.file.filename);
  }

  const user = await adminService.updateUser(req.params.id, payload);
  return sendSuccess(res, {
    message: 'User updated successfully',
    data: { user },
  });
});

exports.viewAllPosts = catchAsync(async (req, res) => {
  const result = await adminService.viewAllPosts(req.query);
  return sendSuccess(res, { data: result });
});

exports.getAnalytics = catchAsync(async (_req, res) => {
  const result = await adminService.getAnalytics();
  return sendSuccess(res, { data: result });
});

exports.getAllComments = catchAsync(async (req, res) => {
  const result = await adminService.getAllComments(req.query);
  return sendSuccess(res, { data: result });
});

exports.getAllContacts = catchAsync(async (req, res) => {
  const result = await adminService.getAllContacts(req.query);
  return sendSuccess(res, { data: result });
});

exports.updateContact = catchAsync(async (req, res) => {
  const contact = await adminService.updateContact(req.params.id, req.body);
  return sendSuccess(res, {
    message: 'Contact updated successfully',
    data: { contact },
  });
});

exports.deleteContact = catchAsync(async (req, res) => {
  await adminService.deleteContact(req.params.id);
  return sendSuccess(res, { message: 'Contact deleted successfully' });
});

exports.deleteComment = catchAsync(async (req, res) => {
  await adminService.deleteComment(req.params.id, req.user);
  return sendSuccess(res, { message: 'Comment deleted successfully' });
});
