const { signAccessToken } = require('../../src/utils/jwt');

function buildUser(overrides = {}) {
  return {
    _id: '65f8b5f1b2a8f8d9f2c1a001',
    name: 'Ava Sharma',
    email: 'ava@example.com',
    role: 'user',
    avatar: '',
    createdAt: new Date('2026-02-18T17:30:00.000Z'),
    updatedAt: new Date('2026-02-18T17:30:00.000Z'),
    ...overrides,
  };
}

function buildAdmin(overrides = {}) {
  return buildUser({
    _id: '65f8b5f1b2a8f8d9f2c1a0ff',
    name: 'Mia Editor',
    email: 'admin@draftsphere.test',
    role: 'admin',
    ...overrides,
  });
}

function buildPost(overrides = {}) {
  return {
    _id: '65f8b6a4b2a8f8d9f2c1a101',
    title: 'Scaling a Luxury Editorial Platform',
    slug: 'scaling-a-luxury-editorial-platform',
    content:
      '<p>DraftSphere is a thoughtful publishing platform with deliberate spacing, richer imagery, and premium workflows for creators.</p>',
    coverImage: 'http://localhost:5000/uploads/posts/editorial-cover.webp',
    status: 'published',
    category: 'design',
    tags: ['design', 'publishing'],
    author: buildAdmin(),
    createdAt: '2026-02-18T18:10:00.000Z',
    updatedAt: '2026-02-18T18:10:00.000Z',
    ...overrides,
  };
}

function buildComment(overrides = {}) {
  return {
    _id: '65f8b760b2a8f8d9f2c1a201',
    postId: buildPost({ author: buildAdmin() }),
    userId: buildUser(),
    parentId: null,
    content: 'Great write-up. The editorial mood feels sharp and product-grade.',
    likes: [],
    replies: [],
    createdAt: '2026-02-18T18:25:00.000Z',
    updatedAt: '2026-02-18T18:25:00.000Z',
    ...overrides,
  };
}

function buildContact(overrides = {}) {
  return {
    _id: '65f8b880b2a8f8d9f2c1a301',
    name: 'Jordan Blake',
    email: 'jordan@clientmail.test',
    subject: 'Enterprise editorial collaboration',
    message: 'We would like to discuss a premium editorial workflow and content platform implementation for our publication team.',
    status: 'new',
    notes: '',
    resolvedAt: null,
    createdAt: '2026-02-18T19:10:00.000Z',
    updatedAt: '2026-02-18T19:10:00.000Z',
    ...overrides,
  };
}

function authHeaderFor(user) {
  return `Bearer ${signAccessToken(user)}`;
}

const edgeCases = {
  longText: 'L'.repeat(5200),
  specialCharactersTitle: 'Launch notes: DraftSphere <> [] {} - % ^ & *',
  invalidEmail: 'not-an-email',
  duplicateEmail: 'ava@example.com',
  emptyString: '',
};

module.exports = {
  buildUser,
  buildAdmin,
  buildPost,
  buildComment,
  buildContact,
  authHeaderFor,
  edgeCases,
};
