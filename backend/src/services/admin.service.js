const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const { buildPagination } = require('../utils/pagination');
const { deleteUploadFileByUrl } = require('../utils/fileCleanup');

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getAllUsers(queryParams) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit);

  const [items, total] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments({}),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

async function deleteUser(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user id', 400);
  }

  const deleted = await User.findByIdAndDelete(userId);
  if (!deleted) {
    throw new AppError('User not found', 404);
  }

  const authoredPosts = await Post.find({ author: userId }).select('coverImage').lean();
  await Post.deleteMany({ author: userId });

  await Promise.allSettled(
    authoredPosts
      .map((post) => post.coverImage)
      .filter(Boolean)
      .map((coverImage) => deleteUploadFileByUrl(coverImage, { expectedFolder: 'posts' }))
  );

  if (deleted.avatar) {
    await deleteUploadFileByUrl(deleted.avatar, { expectedFolder: 'avatars' });
  }
}

async function updateUser(userId, payload) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user id', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const previousAvatar = user.avatar;

  const allowedFields = ['name', 'email', 'role', 'avatar', 'password'];
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      user[field] = payload[field];
    }
  });

  await user.save();

  if (payload.avatar !== undefined && previousAvatar && previousAvatar !== user.avatar) {
    await deleteUploadFileByUrl(previousAvatar, { expectedFolder: 'avatars' });
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function viewAllPosts(queryParams) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit);
  const { search, status } = queryParams;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { content: pattern }, { tags: pattern }];
  }

  const [items, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

function buildLastMonthsMap(monthCount) {
  const now = new Date();
  const months = [];

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      key,
      label: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }

  return months;
}

async function getAnalytics() {
  const [usersTotal, postsTotal, draftPosts, publishedPosts] = await Promise.all([
    User.countDocuments({}),
    Post.countDocuments({}),
    Post.countDocuments({ status: 'draft' }),
    Post.countDocuments({ status: 'published' }),
  ]);

  const months = buildLastMonthsMap(6);
  const oldestMonth = months[0];
  const fromDate = new Date(oldestMonth.year, oldestMonth.month - 1, 1);

  const [usersByMonthRaw, postsByMonthRaw] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Post.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const usersMap = new Map(
    usersByMonthRaw.map((item) => [
      `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      item.count,
    ])
  );

  const postsMap = new Map(
    postsByMonthRaw.map((item) => [
      `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      item.count,
    ])
  );

  const monthly = months.map((m) => ({
    month: m.label,
    users: usersMap.get(m.key) || 0,
    posts: postsMap.get(m.key) || 0,
  }));

  return {
    totals: {
      users: usersTotal,
      posts: postsTotal,
      drafts: draftPosts,
      published: publishedPosts,
    },
    monthly,
    statusBreakdown: [
      { name: 'Published', value: publishedPosts },
      { name: 'Draft', value: draftPosts },
    ],
  };
}

module.exports = {
  getAllUsers,
  deleteUser,
  updateUser,
  viewAllPosts,
  getAnalytics,
};
