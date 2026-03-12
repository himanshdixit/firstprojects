const fs = require('fs/promises');
const path = require('path');

const UPLOADS_ROOT = path.resolve(path.join(__dirname, '..', '..', 'uploads'));

function extractUploadRelativePath(mediaUrl) {
  if (!mediaUrl || typeof mediaUrl !== 'string') return null;

  const normalized = mediaUrl.trim().replace(/\\/g, '/');
  if (!normalized) return null;

  if (normalized.startsWith('uploads/')) {
    return normalized.slice('uploads/'.length);
  }

  const uploadsIndex = normalized.toLowerCase().indexOf('/uploads/');
  if (uploadsIndex >= 0) {
    return normalized.slice(uploadsIndex + '/uploads/'.length);
  }

  try {
    const parsed = new URL(normalized);
    const pathname = (parsed.pathname || '').replace(/\\/g, '/');
    const pathIndex = pathname.toLowerCase().indexOf('/uploads/');
    if (pathIndex >= 0) {
      return pathname.slice(pathIndex + '/uploads/'.length);
    }
  } catch (_error) {
    return null;
  }

  return null;
}

function resolveSafeUploadPath(relativePath) {
  const cleaned = String(relativePath || '').replace(/^\/+/, '');
  const resolved = path.resolve(UPLOADS_ROOT, cleaned);

  if (!resolved.startsWith(`${UPLOADS_ROOT}${path.sep}`)) {
    return null;
  }

  return resolved;
}

async function deleteUploadFileByUrl(mediaUrl, options = {}) {
  const { expectedFolder = '' } = options;
  const relative = extractUploadRelativePath(mediaUrl);
  if (!relative) return false;

  if (expectedFolder) {
    const expectedPrefix = `${expectedFolder.toLowerCase()}/`;
    if (!relative.toLowerCase().startsWith(expectedPrefix)) {
      return false;
    }
  }

  const absolutePath = resolveSafeUploadPath(relative);
  if (!absolutePath) return false;

  try {
    await fs.unlink(absolutePath);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

module.exports = {
  deleteUploadFileByUrl,
};
