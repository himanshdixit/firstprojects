const COVER_FALLBACKS = [
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80',
];

// const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
// const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-sdzh.onrender.com/api').replace(/\/api\/?$/, '');
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'https://firstprojects-tiz9.onrender.com/api').replace(/\/api\/?$/, '');


function stableIndex(seed, length) {
  const input = String(seed || '');
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}

export function getPostCover(post) {
  if (post?.coverImage) {
    const coverValue = String(post.coverImage).trim().replace(/^['"]|['"]$/g, '');
    if (isBareImageFilename(coverValue)) {
      return `${BACKEND_ORIGIN}/uploads/posts/${coverValue}`;
    }
    return normalizeMediaUrl(coverValue);
  }
  const idx = stableIndex(post?._id || post?.slug || post?.title, COVER_FALLBACKS.length);
  return COVER_FALLBACKS[idx];
}

export function getAvatar(user) {
  if (user?.avatar) {
    const avatarValue = String(user.avatar).trim().replace(/^['"]|['"]$/g, '');
    if (isBareImageFilename(avatarValue)) {
      return `${BACKEND_ORIGIN}/uploads/avatars/${avatarValue}`;
    }
    return normalizeMediaUrl(avatarValue);
  }
  const name = encodeURIComponent(user?.name || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=0f766e&color=fff&size=128`;
}

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1800&q=80';

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
