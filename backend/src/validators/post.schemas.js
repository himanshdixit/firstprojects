const { z } = require('../middlewares/validate.middleware');
const { paginationQuerySchema } = require('./common.schemas');

const tagValue = z.string().trim().min(1).max(40);

const tagsField = z.union([
  z.array(tagValue).max(15),
  z.string().trim().max(500),
]).optional();

const postBodyBase = {
  title: z.string().trim().min(3).max(180).optional(),
  content: z.string().trim().min(20).max(200000).optional(),
  status: z.enum(['draft', 'published']).optional(),
  tags: tagsField,
  category: z.string().trim().min(1).max(60).optional(),
  coverImage: z.string().trim().max(500).optional(),
};

const createPostSchema = z.object({
  ...postBodyBase,
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(20).max(200000),
});

const updatePostSchema = z.object(postBodyBase).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided',
});

const postsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  status: z.enum(['draft', 'published', 'all']).optional(),
  tag: z.string().trim().max(40).optional(),
  category: z.string().trim().max(60).optional(),
  exclude: z.string().trim().max(300).optional(),
});

const userPostsParamsSchema = z.object({
  userId: z.string().min(1),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  postsQuerySchema,
  userPostsParamsSchema,
};
