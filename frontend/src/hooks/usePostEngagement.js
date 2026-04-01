'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { getPostById, togglePostBookmark, togglePostLike } from '@/lib/api';

function normalizeEngagement(post) {
  return {
    id: String(post?._id || ''),
    slug: String(post?.slug || ''),
    likeCount: Number(post?.likeCount || 0),
    commentCount: Number(post?.commentCount || 0),
    likedByCurrentUser: Boolean(post?.likedByCurrentUser),
    bookmarkedByCurrentUser: Boolean(post?.bookmarkedByCurrentUser),
  };
}

export default function usePostEngagement(post, options = {}) {
  const { hydrateOnMount = false } = options;
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [engagement, setEngagement] = useState(() => normalizeEngagement(post));
  const [pending, setPending] = useState({ like: false, bookmark: false });

  useEffect(() => {
    setEngagement(normalizeEngagement(post));
  }, [
    post?._id,
    post?.slug,
    post?.likeCount,
    post?.commentCount,
    post?.likedByCurrentUser,
    post?.bookmarkedByCurrentUser,
  ]);

  const postId = useMemo(() => String(post?._id || ''), [post?._id]);
  const postRef = useMemo(() => String(post?.slug || post?._id || ''), [post?._id, post?.slug]);

  useEffect(() => {
    let active = true;

    async function hydrateEngagement() {
      if (!hydrateOnMount || !isAuthenticated || !postRef) {
        return;
      }

      try {
        const data = await getPostById(postRef);
        const updatedPost = data?.data?.post;
        if (active && updatedPost) {
          setEngagement((current) => ({
            ...current,
            ...normalizeEngagement(updatedPost),
          }));
        }
      } catch (_error) {
        // Silent on purpose: the visible state is already functional.
      }
    }

    hydrateEngagement();

    return () => {
      active = false;
    };
  }, [hydrateOnMount, isAuthenticated, postRef]);

  const handleUnauthedAction = useCallback(() => {
    toast.error('Login required', 'Please sign in to like or bookmark posts.');
  }, [toast]);

  const handleToggleLike = useCallback(async () => {
    if (!isAuthenticated) {
      handleUnauthedAction();
      return;
    }

    if (!postId || pending.like) {
      return;
    }

    const previous = engagement;
    const optimistic = {
      ...engagement,
      likedByCurrentUser: !engagement.likedByCurrentUser,
      likeCount: Math.max(0, engagement.likeCount + (engagement.likedByCurrentUser ? -1 : 1)),
    };

    setEngagement(optimistic);
    setPending((current) => ({ ...current, like: true }));

    try {
      const data = await togglePostLike(postId);
      const updatedPost = data?.data?.post;
      if (updatedPost) {
        setEngagement((current) => ({
          ...current,
          ...normalizeEngagement(updatedPost),
          commentCount: current.commentCount,
        }));
      }
    } catch (error) {
      setEngagement(previous);
      toast.error('Like failed', error?.message || 'We could not update the post like.');
    } finally {
      setPending((current) => ({ ...current, like: false }));
    }
  }, [engagement, handleUnauthedAction, isAuthenticated, pending.like, postId, toast]);

  const handleToggleBookmark = useCallback(async () => {
    if (!isAuthenticated) {
      handleUnauthedAction();
      return;
    }

    if (!postId || pending.bookmark) {
      return;
    }

    const previous = engagement;
    const optimistic = {
      ...engagement,
      bookmarkedByCurrentUser: !engagement.bookmarkedByCurrentUser,
    };

    setEngagement(optimistic);
    setPending((current) => ({ ...current, bookmark: true }));

    try {
      const data = await togglePostBookmark(postId);
      const updatedPost = data?.data?.post;
      if (updatedPost) {
        setEngagement((current) => ({
          ...current,
          ...normalizeEngagement(updatedPost),
          commentCount: current.commentCount,
        }));
      }
    } catch (error) {
      setEngagement(previous);
      toast.error('Bookmark failed', error?.message || 'We could not update the bookmark.');
    } finally {
      setPending((current) => ({ ...current, bookmark: false }));
    }
  }, [engagement, handleUnauthedAction, isAuthenticated, pending.bookmark, postId, toast]);

  return {
    engagement,
    pending,
    toggleLike: handleToggleLike,
    toggleBookmark: handleToggleBookmark,
  };
}
