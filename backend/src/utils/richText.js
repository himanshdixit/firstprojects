const sanitizeHtml = require('sanitize-html');

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'a',
  'h2',
  'h3',
  'h4',
  'hr',
];

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensureHtmlContent(content) {
  const value = String(content || '').trim();
  if (!value) {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(value)) {
    return value;
  }

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function sanitizeRichText(content) {
  const preparedContent = ensureHtmlContent(content);
  if (!preparedContent) {
    return '';
  }

  return sanitizeHtml(preparedContent, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          href: attribs.href,
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
    },
  }).trim();
}

function getRichTextPlainText(content) {
  return sanitizeHtml(String(content || ''), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  sanitizeRichText,
  getRichTextPlainText,
};
