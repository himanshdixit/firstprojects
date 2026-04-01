import { getBackendOrigin } from '@/lib/config/appConfig';
import { getCuratedPostImage, HERO_SLIDES } from '@/lib/siteImages';

const BACKEND_ORIGIN = getBackendOrigin();

export function getPostCover(post) {
  if (post?.coverImage) {
    const coverValue = String(post.coverImage).trim().replace(/^['"]|['"]$/g, '');
    if (isBareImageFilename(coverValue)) {
      return `${BACKEND_ORIGIN}/uploads/posts/${coverValue}`;
    }
    return normalizeMediaUrl(coverValue);
  }
  return getCuratedPostImage(post);
}

export function getPostCoverFallback(post) {
  return getCuratedPostImage(post);
}

export function getAvatar(user) {
  if (user?.avatar) {
    const avatarValue = String(user.avatar).trim().replace(/^['"]|['"]$/g, '');
    if (isBareImageFilename(avatarValue)) {
      return `${BACKEND_ORIGIN}/uploads/avatars/${avatarValue}`;
    }
    return normalizeMediaUrl(avatarValue);
  }
  return getAvatarFallback(user);
}

export function getAvatarFallback(user) {
  const name = encodeURIComponent(user?.name || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=120d08&color=d6b57e&size=128`;
}

export const HERO_IMAGE = HERO_SLIDES[0]?.image || '';

export function isBackendUploadUrl(url) {
  const value = String(url || '');
  return value.includes('/uploads/') || value.startsWith(BACKEND_ORIGIN);
}

function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim().replace(/^['"]|['"]$/g, '');
  const slashNormalized = trimmed.replace(/\\/g, '/');
  const publicPathNormalized = slashNormalized.replace('/public/uploads/', '/uploads/');
  const normalized = publicPathNormalized;
  const lower = normalized.toLowerCase();
  const uploadsIndex = lower.indexOf('/uploads/');
  const uploadsIndexNoLead = lower.indexOf('uploads/');

  if (uploadsIndex >= 0) {
    const uploadPath = normalized.slice(uploadsIndex);
    return `${BACKEND_ORIGIN}${uploadPath}`;
  }

  if (uploadsIndexNoLead === 0) {
    return `${BACKEND_ORIGIN}/${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${BACKEND_ORIGIN}/${normalized}`;
  }

  if (normalized.startsWith('/uploads/')) {
    return `${BACKEND_ORIGIN}${normalized}`;
  }

  if (normalized.startsWith('/api/uploads/')) {
    return `${BACKEND_ORIGIN}${normalized.replace('/api/uploads/', '/uploads/')}`;
  }

  try {
    const parsed = new URL(normalized);
    const normalizedPath = parsed.pathname.replace(/\\/g, '/');

    if (normalizedPath.startsWith('/api/uploads/')) {
      return `${BACKEND_ORIGIN}${normalizedPath.replace('/api/uploads/', '/uploads/')}`;
    }

    if (normalizedPath.startsWith('/uploads/')) {
      if (parsed.hostname === 'localhost' && parsed.port === '3000') {
        return `${BACKEND_ORIGIN}${normalizedPath}`;
      }
      return `${parsed.origin}${normalizedPath}`;
    }
  } catch (_error) {
    return normalized;
  }

  return normalized;
}

function isBareImageFilename(value) {
  if (!value || value.includes('/') || value.includes('\\')) return false;
  return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(value);
}
