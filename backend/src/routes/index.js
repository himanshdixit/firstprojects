const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const adminRoutes = require('./admin.routes');
const commentRoutes = require('./comment.routes');
const contactRoutes = require('./contact.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/contacts', contactRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
