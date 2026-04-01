'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircleMore, Pencil, Reply, SendHorizonal, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import Skeleton from '@/components/ui/Skeleton';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { createComment, deleteComment, getComments, toggleCommentLike, updateComment } from '@/lib/api';
import { getAvatar } from '@/lib/media';

function replaceCommentInTree(tree, targetId, replacement) {
  return tree.map((comment) => {
    if (comment._id === targetId) {
      return replacement;
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: replaceCommentInTree(comment.replies, targetId, replacement),
      };
    }

    return comment;
  });
}

function upsertCommentTree(tree, updatedComment) {
  return tree.map((comment) => {
    if (comment._id === updatedComment._id) {
      return {
        ...comment,
        ...updatedComment,
        replies: updatedComment.replies || comment.replies || [],
      };
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: upsertCommentTree(comment.replies, updatedComment),
      };
    }

    return comment;
  });
}

function insertReply(tree, parentId, reply) {
  return tree.map((comment) => {
    if (comment._id === parentId) {
      return {
        ...comment,
        replies: [reply, ...(comment.replies || [])],
      };
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: insertReply(comment.replies, parentId, reply),
      };
    }

    return comment;
  });
}

function removeCommentFromTree(tree, targetId) {
  return tree
    .filter((comment) => comment._id !== targetId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies?.length ? removeCommentFromTree(comment.replies, targetId) : [],
    }));
}

function findCommentById(tree, targetId) {
  for (const comment of tree) {
    if (comment._id === targetId) {
      return comment;
    }

    if (comment.replies?.length) {
      const nested = findCommentById(comment.replies, targetId);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function countComments(comments) {
  return comments.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies || []);
  }, 0);
}

function createTempId() {
  return `temp-comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toOptimisticUser(user) {
  return {
    _id: user?.id || user?._id,
    id: user?.id || user?._id,
    name: user?.name || 'You',
    email: user?.email || '',
    role: user?.role || 'user',
    avatar: user?.avatar || '',
  };
}

function createOptimisticComment({ content, currentUser, parentId = null }) {
  const now = new Date().toISOString();
  return {
    _id: createTempId(),
    postId: null,
    parentId,
    content,
    createdAt: now,
    updatedAt: now,
    replies: [],
    likes: [],
    likeCount: 0,
    likedByCurrentUser: false,
    pending: true,
    userId: toOptimisticUser(currentUser),
  };
}

function CommentComposer({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
  placeholder,
}) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <TextArea
        label={label}
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={!value.trim()}
          loading={submitting}
          loadingLabel="Saving comment"
        >
          <SendHorizonal className="h-4 w-4" />
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  depth = 0,
  currentUser,
  isAuthenticated,
  onReply,
  onEdit,
  onDelete,
  onLike,
  busyState,
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content || '');
  const currentUserId = currentUser?.id || currentUser?._id;
  const commentUserId = comment.userId?._id || comment.userId?.id;

  const isOwner = currentUser && (currentUser.role === 'admin' || currentUserId === commentUserId);
  const replyBusy = busyState.reply === comment._id;
  const editBusy = busyState.edit === comment._id;
  const deleteBusy = busyState.delete === comment._id;
  const likeBusy = busyState.like === comment._id;

  useEffect(() => {
    setEditText(comment.content || '');
  }, [comment.content]);

  return (
    <div className={`${depth > 0 ? 'mt-4 border-l border-slate-200/80 pl-4 dark:border-slate-800' : ''}`}>
      <div className={`rounded-[24px] border border-slate-200/80 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 ${comment.pending ? 'opacity-75' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={getAvatar(comment.userId)}
              alt={comment.userId?.name || 'User'}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">{comment.userId?.name || 'Unknown user'}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
              {comment.pending ? (
                <span className="text-xs uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                  Sending
                </span>
              ) : null}
              {!comment.pending && comment.updatedAt && comment.updatedAt !== comment.createdAt ? (
                <span className="text-xs text-slate-400 dark:text-slate-500">edited</span>
              ) : null}
            </div>

            {editing ? (
              <div className="mt-3">
                <CommentComposer
                  label="Edit comment"
                  value={editText}
                  onChange={setEditText}
                  onSubmit={(event) => {
                    event.preventDefault();
                    onEdit(comment._id, editText, () => setEditing(false));
                  }}
                  onCancel={() => {
                    setEditText(comment.content || '');
                    setEditing(false);
                  }}
                  submitting={editBusy}
                  submitLabel="Save changes"
                  placeholder="Update your comment"
                />
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                {comment.content}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant={comment.likedByCurrentUser ? 'soft' : 'secondary'}
                size="sm"
                className="rounded-full"
                disabled={!isAuthenticated || likeBusy || comment.pending}
                onClick={() => onLike(comment._id)}
              >
                <Heart className={`h-4 w-4 ${comment.likedByCurrentUser ? 'fill-current' : ''}`} />
                {comment.likeCount || 0}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={!isAuthenticated || replyBusy || comment.pending}
                onClick={() => setReplying((prev) => !prev)}
              >
                <Reply className="h-4 w-4" />
                Reply
              </Button>

              {isOwner ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    disabled={editBusy || comment.pending}
                    onClick={() => setEditing((prev) => !prev)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full text-rose-600 dark:text-rose-300"
                    disabled={deleteBusy}
                    onClick={() => onDelete(comment._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : null}
            </div>

            {replying ? (
              <div className="mt-4">
                <CommentComposer
                  label="Reply"
                  value={replyText}
                  onChange={setReplyText}
                  onSubmit={(event) => {
                    event.preventDefault();
                    onReply(comment._id, replyText, () => {
                      setReplyText('');
                      setReplying(false);
                    });
                  }}
                  onCancel={() => {
                    setReplyText('');
                    setReplying(false);
                  }}
                  submitting={replyBusy}
                  submitLabel="Post reply"
                  placeholder="Join the thread"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {comment.replies?.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              busyState={busyState}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PostComments({ postRef, onCountChange }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [commentCount, setCommentCount] = useState(0);
  const [busyState, setBusyState] = useState({ create: false, reply: '', edit: '', delete: '', like: '' });

  const fetchComments = useCallback(async ({ showToast = false } = {}) => {
    try {
      setLoading(true);
      setError('');
      setPage(1);
      const data = await getComments(`post=${encodeURIComponent(postRef)}&page=1&limit=10`);
      setComments(data?.data?.items || []);
      setPagination(data?.data?.pagination || { page: 1, pages: 1, total: 0 });
      setCommentCount(data?.data?.count || 0);
    } catch (err) {
      const message = err.message || 'Failed to load comments';
      setError(message);
      if (showToast) {
        toast.error('Comments unavailable', message);
      }
    } finally {
      setLoading(false);
    }
  }, [postRef, toast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    onCountChange?.(commentCount);
  }, [commentCount, onCountChange]);

  const rootCountLabel = useMemo(() => {
    return `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`;
  }, [commentCount]);

  async function loadMoreComments() {
    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      const data = await getComments(`post=${encodeURIComponent(postRef)}&page=${nextPage}&limit=10`);
      setComments((prev) => [...prev, ...(data?.data?.items || [])]);
      setPagination(data?.data?.pagination || pagination);
      setPage(nextPage);
    } catch (err) {
      setError(err.message || 'Failed to load more comments');
      toast.error('Load failed', err.message || 'Failed to load more comments');
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleCreateRoot(event) {
    event.preventDefault();
    const draft = content.trim();
    if (!draft) return;

    const optimisticComment = createOptimisticComment({
      content: draft,
      currentUser: user,
    });

    setContent('');
    setComments((prev) => [optimisticComment, ...prev]);
    setCommentCount((prev) => prev + 1);
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));

    try {
      setBusyState((prev) => ({ ...prev, create: true }));
      setError('');
      const data = await createComment({
        post: postRef,
        content: draft,
      });

      const newComment = data?.data?.comment;
      if (newComment) {
        setComments((prev) => replaceCommentInTree(prev, optimisticComment._id, newComment));
      }
      toast.success('Comment posted', 'Your comment is now part of the discussion.');
    } catch (err) {
      setComments((prev) => removeCommentFromTree(prev, optimisticComment._id));
      setCommentCount((prev) => Math.max(0, prev - 1));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setContent(draft);
      setError(err.message || 'Failed to add comment');
      toast.error('Comment failed', err.message || 'Failed to add comment');
    } finally {
      setBusyState((prev) => ({ ...prev, create: false }));
    }
  }

  async function handleReply(parentId, replyText, done) {
    const draft = replyText.trim();
    if (!draft) return;

    const optimisticReply = createOptimisticComment({
      content: draft,
      currentUser: user,
      parentId,
    });

    setComments((prev) => insertReply(prev, parentId, optimisticReply));
    setCommentCount((prev) => prev + 1);

    try {
      setBusyState((prev) => ({ ...prev, reply: parentId }));
      setError('');
      const data = await createComment({
        post: postRef,
        parentId,
        content: draft,
      });

      const reply = data?.data?.comment;
      if (reply) {
        setComments((prev) => replaceCommentInTree(prev, optimisticReply._id, reply));
      }
      done?.();
      toast.success('Reply posted', 'Your reply has been added to the thread.');
    } catch (err) {
      setComments((prev) => removeCommentFromTree(prev, optimisticReply._id));
      setCommentCount((prev) => Math.max(0, prev - 1));
      setError(err.message || 'Failed to add reply');
      toast.error('Reply failed', err.message || 'Failed to add reply');
    } finally {
      setBusyState((prev) => ({ ...prev, reply: '' }));
    }
  }

  async function handleEdit(commentId, nextContent, done) {
    const draft = nextContent.trim();
    if (!draft) return;

    const previousComment = findCommentById(comments, commentId);
    if (!previousComment) return;

    const optimisticComment = {
      ...previousComment,
      content: draft,
      updatedAt: new Date().toISOString(),
    };

    setComments((prev) => replaceCommentInTree(prev, commentId, optimisticComment));

    try {
      setBusyState((prev) => ({ ...prev, edit: commentId }));
      setError('');
      const data = await updateComment(commentId, { content: draft });
      const updatedComment = data?.data?.comment;
      if (updatedComment) {
        setComments((prev) => upsertCommentTree(prev, updatedComment));
      }
      done?.();
      toast.success('Comment updated', 'Your changes were saved.');
    } catch (err) {
      setComments((prev) => replaceCommentInTree(prev, commentId, previousComment));
      setError(err.message || 'Failed to update comment');
      toast.error('Update failed', err.message || 'Failed to update comment');
    } finally {
      setBusyState((prev) => ({ ...prev, edit: '' }));
    }
  }

  async function handleDelete(commentId) {
    const previousTree = comments;
    const targetComment = findCommentById(comments, commentId);
    if (!targetComment) return;

    const removedCount = countComments([targetComment]);
    const wasRootComment = !targetComment.parentId;

    setComments((prev) => removeCommentFromTree(prev, commentId));
    setCommentCount((prev) => Math.max(0, prev - removedCount));
    if (wasRootComment) {
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    }

    try {
      setBusyState((prev) => ({ ...prev, delete: commentId }));
      setError('');
      await deleteComment(commentId);
      toast.success('Comment deleted', 'The selected comment thread was removed.');
    } catch (err) {
      setComments(previousTree);
      setCommentCount((prev) => prev + removedCount);
      if (wasRootComment) {
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      }
      setError(err.message || 'Failed to delete comment');
      toast.error('Delete failed', err.message || 'Failed to delete comment');
    } finally {
      setBusyState((prev) => ({ ...prev, delete: '' }));
    }
  }

  async function handleLike(commentId) {
    const previousComment = findCommentById(comments, commentId);
    if (!previousComment) return;

    const optimisticComment = {
      ...previousComment,
      likedByCurrentUser: !previousComment.likedByCurrentUser,
      likeCount: Math.max(
        0,
        (previousComment.likeCount || 0) + (previousComment.likedByCurrentUser ? -1 : 1)
      ),
    };

    setComments((prev) => replaceCommentInTree(prev, commentId, optimisticComment));

    try {
      setBusyState((prev) => ({ ...prev, like: commentId }));
      setError('');
      const data = await toggleCommentLike(commentId);
      const updatedComment = data?.data?.comment;
      if (updatedComment) {
        setComments((prev) => upsertCommentTree(prev, updatedComment));
      }
    } catch (err) {
      setComments((prev) => replaceCommentInTree(prev, commentId, previousComment));
      setError(err.message || 'Failed to update like');
      toast.error('Like failed', err.message || 'Failed to update like');
    } finally {
      setBusyState((prev) => ({ ...prev, like: '' }));
    }
  }

  return (
    <Card id="post-comments" className="mt-6 overflow-hidden" hover={false}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow inline-flex items-center gap-2">
            <MessageCircleMore className="h-3.5 w-3.5" />
            Discussion
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl">Comments</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{rootCountLabel}</p>
        </div>
      </div>

      {!authLoading && isAuthenticated ? (
        <div className="mt-6">
          <CommentComposer
            label="Add a comment"
            value={content}
            onChange={setContent}
            onSubmit={handleCreateRoot}
            submitting={busyState.create}
            submitLabel="Post comment"
            placeholder="Share your thoughts about this post..."
          />
        </div>
      ) : null}

      {!authLoading && !isAuthenticated ? (
        <div className="mt-6">
          <EmptyState
            eyebrow="Join the discussion"
            title="Sign in to comment"
            message="You can read the discussion right away, but posting, replying, and liking comments requires an account."
          />
        </div>
      ) : null}

      {error ? (
        <div className="mt-5">
          <Alert
            title="Comments error"
            message={error}
            action={(
              <Button variant="secondary" size="sm" onClick={() => fetchComments({ showToast: true })}>
                Try again
              </Button>
            )}
          />
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-28 w-full rounded-[24px]" />
            <Skeleton className="h-28 w-full rounded-[24px]" />
          </>
        ) : null}

        {!loading && comments.length === 0 ? (
          <EmptyState
            eyebrow="Start the thread"
            title="No comments yet"
            message="Be the first reader to add context, ask a question, or share feedback on this article."
          />
        ) : null}

        {!loading &&
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={user}
              isAuthenticated={isAuthenticated}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLike={handleLike}
              busyState={busyState}
            />
          ))}
      </div>

      {!loading && pagination.page < pagination.pages ? (
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={loadMoreComments}
            loading={loadingMore}
            loadingLabel="Loading more comments"
          >
            Load more comments
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
