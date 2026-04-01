import { appConfig } from '@/lib/config/appConfig';
import { getAvatar, getPostCover } from '@/lib/media';

export function getSiteUrl() {
  return appConfig.siteUrl;
}

export function absoluteUrl(path = '/') {
  if (!path) {
    return getSiteUrl();
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function stripHtml(html = '') {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildExcerpt(content = '', maxLength = 160) {
  const plain = stripHtml(content);
  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trim()}...`;
}

export function getWordCount(content = '') {
  const text = stripHtml(content);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DraftSphere',
    url: absoluteUrl('/'),
    description:
      'DraftSphere is a premium editorial platform for thoughtful publishing, polished storytelling, and modern creator workflows.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/')}?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DraftSphere',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/draftsphere-logo.png'),
  };
}

export function buildArticleJsonLd(post) {
  const title = post?.title || 'Untitled post';
  const description = buildExcerpt(post?.content, 180) || 'Read this story on DraftSphere.';
  const url = absoluteUrl(`/posts/${post?.slug || post?._id || ''}`);
  const image = getPostCover(post);
  const authorImage = post?.author ? getAvatar(post.author) : undefined;
  const keywords = Array.isArray(post?.tags) ? post.tags : [];
  const wordCount = getWordCount(post?.content);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: url,
    url,
    image: image ? [image] : undefined,
    datePublished: post?.createdAt,
    dateModified: post?.updatedAt || post?.createdAt,
    articleSection: post?.category || keywords[0] || 'general',
    keywords,
    wordCount: wordCount || undefined,
    author: {
      '@type': 'Person',
      name: post?.author?.name || 'Unknown author',
      image: authorImage,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DraftSphere',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/draftsphere-logo.png'),
      },
    },
  };
}
