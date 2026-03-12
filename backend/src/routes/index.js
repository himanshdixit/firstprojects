const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
