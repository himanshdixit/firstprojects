const { z } = require('../middlewares/validate.middleware');
const { objectIdParamSchema, paginationQuerySchema } = require('./common.schemas');

const adminUsersQuerySchema = paginationQuerySchema;

const adminPostsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

const adminCommentsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  post: z.string().trim().max(120).optional(),
});

const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(120).optional(),
  role: z.enum(['user', 'admin']).optional(),
  avatar: z.string().trim().max(500).optional(),
  password: z.string().min(8).max(128).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = {
  adminUsersQuerySchema,
  adminPostsQuerySchema,
  adminCommentsQuerySchema,
  adminUpdateUserSchema,
  adminResourceParamSchema: objectIdParamSchema,
};
