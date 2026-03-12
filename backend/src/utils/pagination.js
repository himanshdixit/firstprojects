function buildPagination(pageQuery, limitQuery) {
  const page = Math.max(parseInt(pageQuery, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitQuery, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { buildPagination };
