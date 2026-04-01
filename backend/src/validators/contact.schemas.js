const { z } = require('../middlewares/validate.middleware');
const { objectIdParamSchema, paginationQuerySchema } = require('./common.schemas');

const createContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(20).max(5000),
});

const adminContactsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(160).optional(),
  status: z.enum(['new', 'in_progress', 'resolved', 'all']).optional(),
});

const adminUpdateContactSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(120).optional(),
  subject: z.string().trim().min(3).max(160).optional(),
  message: z.string().trim().min(20).max(5000).optional(),
  status: z.enum(['new', 'in_progress', 'resolved']).optional(),
  notes: z.string().trim().max(2000).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = {
  createContactSchema,
  adminContactsQuerySchema,
  adminUpdateContactSchema,
  contactParamSchema: objectIdParamSchema,
};
