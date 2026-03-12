const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Avatar URL is too long'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Example document:
// {
//   "_id": "65f8b5f1b2a8f8d9f2c1a001",
//   "name": "Ava Sharma",
//   "email": "ava@example.com",
//   "password": "$2a$12$...",
//   "role": "user",
//   "avatar": "https://cdn.example.com/avatars/ava.png",
//   "createdAt": "2026-02-18T17:30:00.000Z",
//   "updatedAt": "2026-02-18T17:30:00.000Z"
// }

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
