const { z } = require('../middlewares/validate.middleware');

const email = z.string().trim().email().max(120);
const password = z.string().min(8).max(128);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
  avatar: z.string().trim().max(500).optional(),
});

const loginSchema = z.object({
  email,
  password,
});

const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: email.optional(),
  password: password.optional(),
  avatar: z.string().trim().max(500).optional(),
}).partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
};
