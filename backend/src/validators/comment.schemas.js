const { z } = require('../middlewares/validate.middleware');
const { objectIdParamSchema, paginationQuerySchema } = require('./common.schemas');

const createCommentSchema = z.object({
  post: z.string().trim().min(1),
  content: z.string().trim().min(1).max(5000),
  parentId: z.string().trim().min(1).optional(),
});

const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

const commentQuerySchema = paginationQuerySchema.extend({
  post: z.string().trim().min(1),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
  commentQuerySchema,
  commentParamSchema: objectIdParamSchema,
};
