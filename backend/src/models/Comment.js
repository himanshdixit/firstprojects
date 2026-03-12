const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'postId is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [5000, 'Comment is too long'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });

// Example document:
// {
//   "_id": "65f8b760b2a8f8d9f2c1a201",
//   "postId": "65f8b6a4b2a8f8d9f2c1a101",
//   "userId": "65f8b5f1b2a8f8d9f2c1a001",
//   "content": "Great write-up. The indexing strategy is very practical.",
//   "createdAt": "2026-02-18T18:25:00.000Z",
//   "updatedAt": "2026-02-18T18:25:00.000Z"
// }

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
