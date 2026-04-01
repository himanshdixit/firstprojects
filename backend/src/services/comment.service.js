const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const { buildPagination } = require('../utils/pagination');

async function resolvePost(postRef) {
  if (!postRef) {
    throw new AppError('Post reference is required', 400);
  }

  const query = mongoose.Types.ObjectId.isValid(postRef) ? { _id: postRef } : { slug: postRef };
  const post = await Post.findOne(query).select('_id status author');
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return post;
}

function mapComment(comment, currentUser = null) {
  const likeIds = Array.isArray(comment.likes)
    ? comment.likes.map((like) => String(like._id || like))
    : [];

  return {
    ...comment,
    likes: likeIds,
    likeCount: likeIds.length,
    likedByCurrentUser: currentUser ? likeIds.includes(String(currentUser.id)) : false,
    replies: Array.isArray(comment.replies) ? comment.replies.map((reply) => mapComment(reply, currentUser)) : [],
  };
}

function buildCommentTree(comments, currentUser = null) {
  const commentMap = new Map();
  const roots = [];

  comments.forEach((comment) => {
    commentMap.set(String(comment._id), {
      ...comment,
      replies: [],
    });
  });

  comments.forEach((comment) => {
    const commentId = String(comment._id);
    const parentId = comment.parentId ? String(comment.parentId._id || comment.parentId) : null;
    const node = commentMap.get(commentId);

    if (parentId && commentMap.has(parentId)) {
      commentMap.get(parentId).replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots.map((comment) => mapComment(comment, currentUser));
}

function collectDescendantIds(parentIds, comments) {
  const result = new Set(parentIds.map((id) => String(id)));
  let changed = true;

  while (changed) {
    changed = false;
    comments.forEach((comment) => {
      const parentId = comment.parentId ? String(comment.parentId._id || comment.parentId) : null;
      const commentId = String(comment._id);
      if (parentId && result.has(parentId) && !result.has(commentId)) {
        result.add(commentId);
        changed = true;
      }
    });
  }

  return result;
}

async function getCommentById(commentId) {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError('Invalid comment id', 400);
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  return comment;
}

async function deleteCommentBranch(commentId) {
  const target = await Comment.findById(commentId).select('postId').lean();
  const comments = await Comment.find({ postId: target.postId })
    .select('_id parentId')
    .lean();

  const idsToDelete = collectDescendantIds([String(commentId)], comments);
  await Comment.deleteMany({ _id: { $in: [...idsToDelete] } });
}

async function createComment(payload, currentUser) {
  const { post, content, parentId } = payload;

  if (!content || !String(content).trim()) {
    throw new AppError('Comment content is required', 400);
  }

  const postDoc = await resolvePost(post);
  if (postDoc.status !== 'published' && currentUser.role !== 'admin' && String(postDoc.author) !== currentUser.id) {
    throw new AppError('You cannot comment on this post', 403);
  }

  let parentComment = null;
  if (parentId !== undefined && parentId !== null && parentId !== '') {
    parentComment = await getCommentById(parentId);
    if (String(parentComment.postId) !== String(postDoc._id)) {
      throw new AppError('Reply target does not belong to this post', 400);
    }
  }

  const comment = await Comment.create({
    postId: postDoc._id,
    userId: currentUser.id,
    parentId: parentComment ? parentComment._id : null,
    content: String(content).trim(),
  });

  const populated = await Comment.findById(comment._id)
    .populate('userId', 'name email role avatar')
    .lean();

  return mapComment(populated, currentUser);
}

async function getCommentsByPost(postRef, queryParams = {}, requester = null) {
  const postDoc = await resolvePost(postRef);
  const canAccessDraft = requester && (requester.role === 'admin' || String(postDoc.author) === requester.id);
  if (postDoc.status !== 'published' && !canAccessDraft) {
    throw new AppError('Post not found', 404);
  }

  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit || 20);
  const rootFilter = { postId: postDoc._id, parentId: null };

  const [rootComments, total] = await Promise.all([
    Comment.find(rootFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(rootFilter),
  ]);

  const rootIds = rootComments.map((comment) => String(comment._id));
  const descendants = rootIds.length > 0
    ? await Comment.find({ postId: postDoc._id })
        .populate('userId', 'name email role avatar')
        .sort({ createdAt: 1 })
        .lean()
    : [];

  const includedIds = collectDescendantIds(rootIds, descendants);
  const pagedTreeComments = descendants.filter((comment) => includedIds.has(String(comment._id)));

  return {
    items: buildCommentTree(pagedTreeComments, requester),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
    count: await Comment.countDocuments({ postId: postDoc._id }),
  };
}

async function getAllComments(queryParams = {}, requester = null) {
  const { page, limit, skip } = buildPagination(queryParams.page, queryParams.limit || 20);
  const filter = {};

  if (queryParams.post) {
    const postDoc = await resolvePost(queryParams.post);
    filter.postId = postDoc._id;
  }

  const [items, total] = await Promise.all([
    Comment.find(filter)
      .populate('userId', 'name email role avatar')
      .populate('postId', 'title slug status')
      .populate('parentId', 'content userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => mapComment(item, requester)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

async function updateComment(commentId, payload, currentUser) {
  const comment = await getCommentById(commentId);
  const isOwner = String(comment.userId) === String(currentUser.id);
  const isAdmin = currentUser.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not allowed to edit this comment', 403);
  }

  if (!payload.content || !String(payload.content).trim()) {
    throw new AppError('Comment content is required', 400);
  }

  comment.content = String(payload.content).trim();
  await comment.save();

  const populated = await Comment.findById(comment._id)
    .populate('userId', 'name email role avatar')
    .populate('parentId', 'content userId')
    .lean();

  return mapComment(populated, currentUser);
}

async function deleteComment(commentId, currentUser = null) {
  const comment = await getCommentById(commentId);
  const isOwner = currentUser ? String(comment.userId) === String(currentUser.id) : false;
  const isAdmin = currentUser ? currentUser.role === 'admin' : true;

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not allowed to delete this comment', 403);
  }

  await deleteCommentBranch(comment._id);
}

async function toggleLike(commentId, currentUser) {
  const comment = await getCommentById(commentId);
  const currentUserId = String(currentUser.id);
  const hasLiked = comment.likes.some((likeId) => String(likeId) === currentUserId);

  if (hasLiked) {
    comment.likes = comment.likes.filter((likeId) => String(likeId) !== currentUserId);
  } else {
    comment.likes.push(currentUser.id);
  }

  await comment.save();

  const populated = await Comment.findById(comment._id)
    .populate('userId', 'name email role avatar')
    .populate('parentId', 'content userId')
    .lean();

  return mapComment(populated, currentUser);
}

module.exports = {
  createComment,
  getCommentsByPost,
  getAllComments,
  updateComment,
  deleteComment,
  toggleLike,
};
