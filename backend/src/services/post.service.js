const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { buildPagination } = require('../utils/pagination');
const { deleteUploadFileByUrl } = require('../utils/fileCleanup');
const { sanitizeRichText, getRichTextPlainText } = require('../utils/richText');

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureUniqueSlug(baseSlug, postIdToExclude = null) {
  let slug = baseSlug;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (postIdToExclude) {
      query._id = { $ne: postIdToExclude };
    }

    const exists = await Post.exists(query);
    if (!exists) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function normalizeTags(tagsInput) {
  if (Array.isArray(tagsInput)) {
    return tagsInput;
  }

  if (typeof tagsInput === 'string') {
    const trimmed = tagsInput.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return [];
      }
    }

    return trimmed.split(',').map((tag) => tag.trim());
  }

  return [];
}

function normalizeCategory(categoryInput, normalizedTags = []) {
  if (typeof categoryInput === 'string' && categoryInput.trim()) {
    return categoryInput.trim().toLowerCase();
  }

  if (normalizedTags.length > 0) {
    return normalizedTags[0];
  }

  return 'general';
}

function withDerivedCategory(post) {
  const tags = Array.isArray(post.tags) ? post.tags : [];
  return {
    ...post,
    category: post.category || tags[0] || 'general',
  };
}

function getRequesterId(requester) {
  return requester ? String(requester.id || requester._id || '') : '';
}

function canAccessPost(post, requester) {
  if (!post) {
    return false;
  }

  if (post.status === 'published') {
    return true;
  }

  const requesterId = getRequesterId(requester);
  if (!requesterId) {
    return false;
  }

  const authorId = String(post.author?._id || post.author || '');
  return requester?.role === 'admin' || authorId === requesterId;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function resolveBookmarkSet(requester) {
  const requesterId = getRequesterId(requester);
  if (!requesterId) {
    return new Set();
  }

  const user = await User.findById(requesterId).select('bookmarks').lean();
  return new Set((user?.bookmarks || []).map((bookmark) => String(bookmark)));
}

async function buildCommentCountMap(postIds) {
  const uniqueIds = [...new Set(postIds.map((postId) => String(postId)).filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const counts = await Comment.aggregate([
    {
      $match: {
        postId: {
          $in: uniqueIds.map((postId) => new mongoose.Types.ObjectId(postId)),
        },
      },
    },
    {
      $group: {
        _id: '$postId',
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    counts.map((entry) => [String(entry._id), entry.count])
  );
}

function mapPostForResponse(post, { requester, bookmarkSet, commentCountMap, preview = false } = {}) {
  const likeIds = Array.isArray(post.likes)
    ? post.likes.map((like) => String(like?._id || like))
    : [];
  const requesterId = getRequesterId(requester);
  const postId = String(post._id);
  const { likes, ...rest } = post;

  return withDerivedCategory({
    ...rest,
    content:
      preview && typeof post.content === 'string'
        ? getRichTextPlainText(post.content).slice(0, 280)
        : post.content,
    likeCount: likeIds.length,
    commentCount: commentCountMap.get(postId) || 0,
    likedByCurrentUser: requesterId ? likeIds.includes(requesterId) : false,
    bookmarkedByCurrentUser: bookmarkSet.has(postId),
  });
}

async function enrichPosts(itemsRaw, requester, { preview = false } = {}) {
  const postIds = itemsRaw.map((item) => item._id);
  const [commentCountMap, bookmarkSet] = await Promise.all([
    buildCommentCountMap(postIds),
    resolveBookmarkSet(requester),
  ]);

  return itemsRaw.map((item) =>
    mapPostForResponse(item, {
      requester,
      bookmarkSet,
      commentCountMap,
      preview,
    })
  );
}

async function enrichSinglePost(postDoc, requester) {
  if (!postDoc) {
    return null;
  }

  const post = typeof postDoc.toObject === 'function' ? postDoc.toObject() : postDoc;
  const [commentCountMap, bookmarkSet] = await Promise.all([
    buildCommentCountMap([post._id]),
    resolveBookmarkSet(requester),
  ]);

  return mapPostForResponse(post, {
    requester,
    bookmarkSet,
    commentCountMap,
    preview: false,
  });
}

async function findAccessiblePost(postId, requester) {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post id', 400);
  }

  const post = await Post.findById(postId).select('status author likes');
  if (!post || !canAccessPost(post, requester)) {
    throw new AppError('Post not found', 404);
  }

  return post;
}

async function createPost(payload, currentUser) {
  const { title, content, coverImage, status, tags, category } = payload;

  if (!title || !content) {
    throw new AppError('title and content are required', 400);
  }

  const sanitizedContent = sanitizeRichText(content);
  if (getRichTextPlainText(sanitizedContent).length < 20) {
    throw new AppError('content must be at least 20 characters of actual text', 400);
  }

  const normalizedTags = normalizeTags(tags);

  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(baseSlug);

  const post = await Post.create({
    title,
    slug,
    content: sanitizedContent,
    coverImage: coverImage || '',
    category: normalizeCategory(category, normalizedTags),
    status: status || 'draft',
    tags: normalizedTags,
    author: currentUser.id,
  });

  return getPostById(String(post._id), currentUser);
}

async function updatePost(postId, payload, currentUser) {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post id', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const isOwner = post.author.toString() === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You are not allowed to update this post', 403);
  }
  const previousCoverImage = post.coverImage;

  const updatableFields = ['title', 'content', 'coverImage', 'status', 'tags', 'category'];
  updatableFields.forEach((field) => {
    if (payload[field] !== undefined) {
      if (field === 'tags') {
        post[field] = normalizeTags(payload[field]);
      } else if (field === 'category') {
        post[field] = normalizeCategory(payload[field], post.tags);
      } else if (field === 'content') {
        const sanitizedContent = sanitizeRichText(payload[field]);
        if (getRichTextPlainText(sanitizedContent).length < 20) {
          throw new AppError('content must be at least 20 characters of actual text', 400);
        }
        post[field] = sanitizedContent;
      } else {
        post[field] = payload[field];
      }
    }
  });

  if (payload.tags !== undefined && payload.category === undefined) {
    post.category = normalizeCategory(post.category, post.tags);
  }

  if (payload.title) {
    const baseSlug = slugify(payload.title);
    post.slug = await ensureUniqueSlug(baseSlug, post._id);
  }

  await post.save();

  if (
    payload.coverImage !== undefined &&
    previousCoverImage &&
    previousCoverImage !== post.coverImage
  ) {
    await deleteUploadFileByUrl(previousCoverImage, { expectedFolder: 'posts' });
  }

  return getPostById(String(post._id), currentUser);
}

async function deletePost(postId, currentUser) {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post id', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const isOwner = post.author.toString() === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You are not allowed to delete this post', 403);
  }
  const coverImage = post.coverImage;

  await post.deleteOne();
  await Promise.all([
    Comment.deleteMany({ postId }),
    User.updateMany(
      { bookmarks: post._id },
      { $pull: { bookmarks: post._id } }
    ),
  ]);

  if (coverImage) {
    await deleteUploadFileByUrl(coverImage, { expectedFolder: 'posts' });
  }
}

async function getAllPosts(queryParams, requester) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit);
  const { search, status, tag, category, exclude } = queryParams;

  const filter = {};
  const baseFilter = {};

  if (requester.role !== 'admin') {
    filter.status = 'published';
    baseFilter.status = 'published';
  }

  if (status && requester.role === 'admin') {
    filter.status = status;
    baseFilter.status = status;
  }

  if (exclude) {
    const exclusions = String(exclude)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (exclusions.length > 0) {
      filter.$and = exclusions.map((value) =>
        (mongoose.Types.ObjectId.isValid(value) ? { _id: { $ne: value } } : { slug: { $ne: value } })
      );
      baseFilter.$and = filter.$and;
    }
  }

  if (tag) {
    filter.tags = String(tag).trim().toLowerCase();
  }

  if (category) {
    const normalizedCategory = String(category).trim().toLowerCase();
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { category: normalizedCategory },
          { category: { $exists: false }, tags: normalizedCategory },
          { category: '', tags: normalizedCategory },
        ],
      },
    ];
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { title: pattern },
      { content: pattern },
      { tags: pattern },
      { category: pattern },
    ];
  }

  const [itemsRaw, total, availableTagsRaw, availableCategoriesRaw] = await Promise.all([
    Post.find(filter)
      .select('title slug content coverImage author status tags category createdAt likes')
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
    Post.aggregate([
      { $match: baseFilter },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 12 },
    ]),
    Post.aggregate([
      { $match: baseFilter },
      {
        $project: {
          categoryLabel: {
            $ifNull: ['$category', { $arrayElemAt: ['$tags', 0] }],
          },
        },
      },
      { $match: { categoryLabel: { $ne: null } } },
      { $group: { _id: '$categoryLabel', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
  ]);

  const items = await enrichPosts(itemsRaw, requester, { preview: true });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
    filters: {
      tags: availableTagsRaw.map((entry) => entry._id).filter(Boolean),
      categories: availableCategoriesRaw.map((entry) => entry._id).filter(Boolean),
    },
  };
}

async function getPostById(postId, requester) {
  const findQuery = mongoose.Types.ObjectId.isValid(postId) ? { _id: postId } : { slug: postId };
  const postDoc = await Post.findOne(findQuery)
    .populate('author', 'name email role avatar');

  if (!postDoc || !canAccessPost(postDoc, requester)) {
    throw new AppError('Post not found', 404);
  }

  return enrichSinglePost(postDoc, requester);
}

async function getPostsByUser(userId, queryParams, requester) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user id', 400);
  }

  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit);

  const filter = { author: userId };
  if (requester.role !== 'admin' && requester.id !== userId) {
    filter.status = 'published';
  }

  const [itemsRaw, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  const items = await enrichPosts(itemsRaw, requester);

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

async function togglePostLike(postId, currentUser) {
  const post = await findAccessiblePost(postId, currentUser);
  const currentUserId = String(currentUser.id);
  const hasLiked = post.likes.some((likeId) => String(likeId) === currentUserId);

  if (hasLiked) {
    post.likes = post.likes.filter((likeId) => String(likeId) !== currentUserId);
  } else {
    post.likes.push(currentUser.id);
  }

  await post.save();
  return getPostById(String(post._id), currentUser);
}

async function togglePostBookmark(postId, currentUser) {
  const post = await findAccessiblePost(postId, currentUser);
  const user = await User.findById(currentUser.id).select('bookmarks');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const postIdString = String(post._id);
  const hasBookmarked = user.bookmarks.some((bookmarkId) => String(bookmarkId) === postIdString);

  if (hasBookmarked) {
    user.bookmarks = user.bookmarks.filter((bookmarkId) => String(bookmarkId) !== postIdString);
  } else {
    user.bookmarks.push(post._id);
  }

  await user.save();
  return getPostById(String(post._id), currentUser);
}

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  togglePostLike,
  togglePostBookmark,
};
