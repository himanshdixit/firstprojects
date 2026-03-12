const User = require('../models/User');
const AppError = require('../utils/AppError');
const { deleteUploadFileByUrl } = require('../utils/fileCleanup');

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}

async function updateProfile(userId, payload) {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const previousAvatar = user.avatar;

  const allowedFields = ['name', 'email', 'avatar', 'password'];
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      user[field] = payload[field];
    }
  });

  await user.save();
  if (payload.avatar !== undefined && previousAvatar && previousAvatar !== user.avatar) {
    await deleteUploadFileByUrl(previousAvatar, { expectedFolder: 'avatars' });
  }

  return user;
}

module.exports = {
  getProfile,
  updateProfile,
};
