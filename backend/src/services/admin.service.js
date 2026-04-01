const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Contact = require('../models/Contact');
const AppError = require('../utils/AppError');
const { buildPagination } = require('../utils/pagination');
const { deleteUploadFileByUrl } = require('../utils/fileCleanup');

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getAllUsers(queryParams) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit);

  const [items, total] = await Promise.all([
    User.find({})
      .select('name email role avatar createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
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

  const authoredPosts = await Post.find({ author: userId }).select('_id coverImage').lean();
  const authoredPostIds = authoredPosts.map((post) => post._id);
  await Post.deleteMany({ author: userId });
  await Promise.all([
    Comment.deleteMany({ userId }),
    Comment.deleteMany({ postId: { $in: authoredPostIds } }),
    Post.updateMany({}, { $pull: { likes: deleted._id } }),
    Comment.updateMany({}, { $pull: { likes: deleted._id } }),
    User.updateMany(
      { bookmarks: { $in: authoredPostIds } },
      { $pull: { bookmarks: { $in: authoredPostIds } } }
    ),
  ]);

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
      .select('title slug content coverImage author status tags category createdAt updatedAt')
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
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

async function getAllComments(queryParams) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit || 20);
  const filter = {};

  if (queryParams.search) {
    filter.content = new RegExp(escapeRegex(queryParams.search), 'i');
  }

  if (queryParams.post) {
    if (mongoose.Types.ObjectId.isValid(queryParams.post)) {
      filter.postId = queryParams.post;
    } else {
      const post = await Post.findOne({ slug: queryParams.post }).select('_id');
      if (!post) {
        throw new AppError('Post not found', 404);
      }
      filter.postId = post._id;
    }
  }

  const [items, total] = await Promise.all([
    Comment.find(filter)
      .populate('userId', 'name email role avatar')
      .populate('postId', 'title slug status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
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

async function getAllContacts(queryParams) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit || 20);
  const filter = {};

  if (queryParams.status && queryParams.status !== 'all') {
    filter.status = queryParams.status;
  }

  if (queryParams.search) {
    const pattern = new RegExp(escapeRegex(queryParams.search), 'i');
    filter.$or = [
      { name: pattern },
      { email: pattern },
      { subject: pattern },
      { message: pattern },
      { notes: pattern },
    ];
  }

  const [items, total] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Contact.countDocuments(filter),
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

async function updateContact(contactId, payload) {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw new AppError('Invalid contact id', 400);
  }

  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  const allowedFields = ['name', 'email', 'subject', 'message', 'status', 'notes'];
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      if (field === 'email') {
        contact[field] = payload[field].trim().toLowerCase();
      } else if (typeof payload[field] === 'string') {
        contact[field] = payload[field].trim();
      } else {
        contact[field] = payload[field];
      }
    }
  });

  if (payload.status !== undefined) {
    contact.resolvedAt = payload.status === 'resolved' ? new Date() : null;
  }

  await contact.save();
  return contact;
}

async function deleteContact(contactId) {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw new AppError('Invalid contact id', 400);
  }

  const deleted = await Contact.findByIdAndDelete(contactId);
  if (!deleted) {
    throw new AppError('Contact not found', 404);
  }
}

async function deleteComment(commentId, currentUser) {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError('Invalid comment id', 400);
  }

  const target = await Comment.findById(commentId).select('_id postId parentId');
  if (!target) {
    throw new AppError('Comment not found', 404);
  }

  const comments = await Comment.find({ postId: target.postId }).select('_id parentId').lean();
  const idsToDelete = new Set([String(target._id)]);
  let changed = true;

  while (changed) {
    changed = false;
    comments.forEach((comment) => {
      const parentId = comment.parentId ? String(comment.parentId) : null;
      const commentId = String(comment._id);
      if (parentId && idsToDelete.has(parentId) && !idsToDelete.has(commentId)) {
        idsToDelete.add(commentId);
        changed = true;
      }
    });
  }

  await Comment.deleteMany({ _id: { $in: [...idsToDelete] } });
}

async function getAnalytics() {
  const [usersTotal, postsTotal, draftPosts, publishedPosts, contactsTotal, newContacts, resolvedContacts] = await Promise.all([
    User.countDocuments({}),
    Post.countDocuments({}),
    Post.countDocuments({ status: 'draft' }),
    Post.countDocuments({ status: 'published' }),
    Contact.countDocuments({}),
    Contact.countDocuments({ status: 'new' }),
    Contact.countDocuments({ status: 'resolved' }),
  ]);

  const months = buildLastMonthsMap(6);
  const oldestMonth = months[0];
  const fromDate = new Date(oldestMonth.year, oldestMonth.month - 1, 1);

  const [usersByMonthRaw, postsByMonthRaw, contactsByMonthRaw] = await Promise.all([
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
    Contact.aggregate([
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

  const contactsMap = new Map(
    contactsByMonthRaw.map((item) => [
      `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      item.count,
    ])
  );

  const monthly = months.map((m) => ({
    month: m.label,
    users: usersMap.get(m.key) || 0,
    posts: postsMap.get(m.key) || 0,
    contacts: contactsMap.get(m.key) || 0,
  }));

  return {
    totals: {
      users: usersTotal,
      posts: postsTotal,
      drafts: draftPosts,
      published: publishedPosts,
      contacts: contactsTotal,
      newContacts,
      resolvedContacts,
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
  getAllComments,
  getAllContacts,
  updateContact,
  deleteContact,
  deleteComment,
  getAnalytics,
};
