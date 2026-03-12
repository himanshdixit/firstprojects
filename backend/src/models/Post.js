const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [180, 'Title must be at most 180 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [20, 'Content must be at least 20 characters'],
      maxlength: [200000, 'Content is too long'],
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Cover image URL is too long'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 15,
        message: 'You can add at most 15 tags',
      },
      set: (arr) => {
        if (!Array.isArray(arr)) return [];
        const cleaned = arr
          .map((t) => String(t).trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 15);
        return [...new Set(cleaned)];
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// Example document:
// {
//   "_id": "65f8b6a4b2a8f8d9f2c1a101",
//   "title": "Scaling a MERN Blog in Production",
//   "slug": "scaling-a-mern-blog-in-production",
//   "content": "<p>This is rich text HTML content...</p>",
//   "coverImage": "https://cdn.example.com/covers/mern-scale.jpg",
//   "author": "65f8b5f1b2a8f8d9f2c1a001",
//   "status": "published",
//   "tags": ["mern", "mongodb", "express"],
//   "createdAt": "2026-02-18T18:10:00.000Z",
//   "updatedAt": "2026-02-18T18:10:00.000Z"
// }

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
