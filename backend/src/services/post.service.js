const mongoose = require('mongoose');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const { buildPagination } = require('../utils/pagination');
const { deleteUploadFileByUrl } = require('../utils/fileCleanup');

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

async function createPost(payload, currentUser) {
  const { title, content, coverImage, status, tags } = payload;

  if (!title || !content) {
    throw new AppError('title and content are required', 400);
  }

  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(baseSlug);

  const post = await Post.create({
    title,
    slug,
    content,
    coverImage: coverImage || '',
    status: status || 'draft',
    tags: normalizeTags(tags),
    author: currentUser.id,
  });

  return post;
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

  const updatableFields = ['title', 'content', 'coverImage', 'status', 'tags'];
  updatableFields.forEach((field) => {
    if (payload[field] !== undefined) {
      post[field] = field === 'tags' ? normalizeTags(payload[field]) : payload[field];
    }
  });

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

  return post;
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
  if (coverImage) {
    await deleteUploadFileByUrl(coverImage, { expectedFolder: 'posts' });
  }
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getAllPosts(queryParams, requester) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit);
  const { search, status } = queryParams;

  const filter = {};

  if (requester.role !== 'admin') {
    filter.status = 'published';
  }

  if (status && requester.role === 'admin') {
    filter.status = status;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { content: pattern }, { tags: pattern }];
  }

  const [itemsRaw, total] = await Promise.all([
    Post.find(filter)
      .select('title slug content coverImage author status tags createdAt')
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  const items = itemsRaw.map((item) => ({
    ...item,
    content: typeof item.content === 'string' ? item.content.slice(0, 280) : '',
  }));

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

async function getPostById(postId, requester) {
  const findQuery = mongoose.Types.ObjectId.isValid(postId) ? { _id: postId } : { slug: postId };
  const post = await Post.findOne(findQuery).populate('author', 'name email role avatar');
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const isAuthor = requester && post.author && post.author._id.toString() === requester.id;
  const isAdmin = requester && requester.role === 'admin';

  if (post.status !== 'published' && !isAuthor && !isAdmin) {
    throw new AppError('Post not found', 404);
  }

  return post;
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

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUser,
};
