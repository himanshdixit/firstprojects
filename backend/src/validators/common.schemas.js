const { z } = require('../middlewares/validate.middleware');

const objectIdParamSchema = z.object({
  id: z.string().min(1),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = {
  objectIdParamSchema,
  paginationQuerySchema,
};
