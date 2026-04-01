const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');
const Contact = require('../src/models/Contact');

const TEST_DB_NAME = 'Codex_test_db_qa';
const TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Codex_test_db';

jest.setTimeout(30000);

function buildLongHtmlParagraph(sentence, repeatCount = 4) {
  return `<p>${Array.from({ length: repeatCount }, () => sentence).join(' ')}</p>`;
}

async function registerAndLogin(agent, payload) {
  const registerResponse = await agent.post('/api/auth/register').send(payload);

  expect(registerResponse.status).toBe(201);
  expect(registerResponse.body.success).toBe(true);

  return {
    user: registerResponse.body.data.user,
    accessToken: registerResponse.body.data.accessToken,
  };
}

describe('real CRUD integration', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGO_URI, {
        dbName: TEST_DB_NAME,
      });
    }
  });

  afterEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Contact.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });

  it('persists a full author and reader CRUD journey with draft gating, filters, nested comments, likes, bookmarks, and cleanup', async () => {
    const authorAgent = request.agent(app);
    const readerAgent = request.agent(app);

    const author = await registerAndLogin(authorAgent, {
      name: 'Ava Stone',
      email: 'ava.stone@example.com',
      password: 'StrongPass123',
    });

    const reader = await registerAndLogin(readerAgent, {
      name: 'Milan Brooks',
      email: 'milan.brooks@example.com',
      password: 'AnotherPass123',
    });

    const createDraftResponse = await authorAgent.post('/api/posts').send({
      title: 'DraftSphere Growth Playbook 2026',
      content: buildLongHtmlParagraph('This launch checklist covers audience research, pricing tests, content loops, and editorial distribution.'),
      status: 'draft',
      tags: ['Growth', ' SaaS ', 'growth'],
      category: 'Product',
    });

    expect(createDraftResponse.status).toBe(201);
    expect(createDraftResponse.body.data.post.status).toBe('draft');
    expect(createDraftResponse.body.data.post.slug).toBe('draftsphere-growth-playbook-2026');
    expect(createDraftResponse.body.data.post.tags).toEqual(['growth', 'saas']);
    expect(createDraftResponse.body.data.post.category).toBe('product');

    const createdPostId = createDraftResponse.body.data.post._id;
    const createdPostSlug = createDraftResponse.body.data.post.slug;

    const storedAuthor = await User.findById(author.user.id).select('+password');
    expect(storedAuthor.password).not.toBe('StrongPass123');
    expect(storedAuthor.password.length).toBeGreaterThan(20);

    const publicDraftListResponse = await request(app).get('/api/posts');
    expect(publicDraftListResponse.status).toBe(200);
    expect(publicDraftListResponse.body.data.items).toHaveLength(0);

    const publicDraftDetailResponse = await request(app).get(`/api/posts/${createdPostSlug}`);
    expect(publicDraftDetailResponse.status).toBe(404);

    const authorDraftDetailResponse = await authorAgent.get(`/api/posts/${createdPostSlug}`);
    expect(authorDraftDetailResponse.status).toBe(200);
    expect(authorDraftDetailResponse.body.data.post.status).toBe('draft');

    const publishResponse = await authorAgent.patch(`/api/posts/${createdPostId}`).send({
      title: 'DraftSphere Product Growth Playbook',
      content: buildLongHtmlParagraph('Updated content keeps the strategy practical, measured, and ready for real production rollout.'),
      status: 'published',
      tags: ['growth', 'product', 'analytics'],
      category: 'strategy',
    });

    expect(publishResponse.status).toBe(200);
    expect(publishResponse.body.data.post.status).toBe('published');
    expect(publishResponse.body.data.post.slug).toBe('draftsphere-product-growth-playbook');

    const publishedSlug = publishResponse.body.data.post.slug;

    const filteredListResponse = await request(app).get('/api/posts').query({
      search: 'production rollout',
      tag: 'product',
      category: 'strategy',
    });

    expect(filteredListResponse.status).toBe(200);
    expect(filteredListResponse.body.data.items).toHaveLength(1);
    expect(filteredListResponse.body.data.items[0].slug).toBe(publishedSlug);
    expect(filteredListResponse.body.data.filters.tags).toContain('product');
    expect(filteredListResponse.body.data.filters.categories).toContain('strategy');

    const readerCommentResponse = await readerAgent.post('/api/comments').send({
      post: publishedSlug,
      content: 'Great breakdown. The launch sequence and tagging advice feel practical.',
    });

    expect(readerCommentResponse.status).toBe(201);
    expect(readerCommentResponse.body.data.comment.content).toContain('launch sequence');

    const rootCommentId = readerCommentResponse.body.data.comment._id;

    const authorReplyResponse = await authorAgent.post('/api/comments').send({
      post: publishedSlug,
      parentId: rootCommentId,
      content: 'Thanks. I wanted the workflow to stay realistic for a small product team.',
    });

    expect(authorReplyResponse.status).toBe(201);
    expect(authorReplyResponse.body.data.comment.parentId).toBe(rootCommentId);

    const commentTreeResponse = await request(app).get('/api/comments').query({ post: publishedSlug });
    expect(commentTreeResponse.status).toBe(200);
    expect(commentTreeResponse.body.data.count).toBe(2);
    expect(commentTreeResponse.body.data.items).toHaveLength(1);
    expect(commentTreeResponse.body.data.items[0].replies).toHaveLength(1);

    const likePostResponse = await readerAgent.patch(`/api/posts/${createdPostId}/like`).send({});
    expect(likePostResponse.status).toBe(200);
    expect(likePostResponse.body.data.post.likeCount).toBe(1);
    expect(likePostResponse.body.data.post.likedByCurrentUser).toBe(true);

    const bookmarkPostResponse = await readerAgent.patch(`/api/posts/${createdPostId}/bookmark`).send({});
    expect(bookmarkPostResponse.status).toBe(200);
    expect(bookmarkPostResponse.body.data.post.bookmarkedByCurrentUser).toBe(true);

    const likeCommentResponse = await authorAgent.patch(`/api/comments/${rootCommentId}/like`).send({});
    expect(likeCommentResponse.status).toBe(200);
    expect(likeCommentResponse.body.data.comment.likeCount).toBe(1);

    const updatedProfileResponse = await authorAgent.patch('/api/auth/profile').send({
      name: 'Ava Stone Senior Editor',
    });
    expect(updatedProfileResponse.status).toBe(200);
    expect(updatedProfileResponse.body.data.user.name).toBe('Ava Stone Senior Editor');

    const deleteCommentResponse = await readerAgent.delete(`/api/comments/${rootCommentId}`);
    expect(deleteCommentResponse.status).toBe(200);

    const commentsAfterDelete = await Comment.find({});
    expect(commentsAfterDelete).toHaveLength(0);

    const deletePostResponse = await authorAgent.delete(`/api/posts/${createdPostId}`);
    expect(deletePostResponse.status).toBe(200);

    const [remainingPosts, remainingComments, readerAfterCleanup] = await Promise.all([
      Post.find({}),
      Comment.find({}),
      User.findById(reader.user.id).lean(),
    ]);

    expect(remainingPosts).toHaveLength(0);
    expect(remainingComments).toHaveLength(0);
    expect(readerAfterCleanup.bookmarks).toHaveLength(0);
  });

  it('normalizes duplicate and invalid persistence errors for user CRUD', async () => {
    const firstAgent = request.agent(app);
    const secondAgent = request.agent(app);

    await registerAndLogin(firstAgent, {
      name: 'Nina Cross',
      email: 'nina.cross@example.com',
      password: 'SecurePass123',
    });

    const duplicateRegistrationResponse = await secondAgent.post('/api/auth/register').send({
      name: 'Nina Cross Clone',
      email: 'nina.cross@example.com',
      password: 'SecurePass123',
    });

    expect(duplicateRegistrationResponse.status).toBe(409);
    expect(duplicateRegistrationResponse.body.message).toMatch(/exists|duplicate/i);

    const secondUser = await registerAndLogin(secondAgent, {
      name: 'Jordan Price',
      email: 'jordan.price@example.com',
      password: 'SecurePass456',
    });

    const duplicateProfileEmailResponse = await secondAgent.patch('/api/auth/profile').send({
      email: 'nina.cross@example.com',
    });

    expect(duplicateProfileEmailResponse.status).toBe(409);
    expect(duplicateProfileEmailResponse.body.message).toMatch(/duplicate/i);

    const unchangedUser = await User.findById(secondUser.user.id).lean();
    expect(unchangedUser.email).toBe('jordan.price@example.com');
  });

  it('allows admins to manage users and cascades deletion across authored posts and comments', async () => {
    const adminAgent = request.agent(app);
    const authorAgent = request.agent(app);
    const readerAgent = request.agent(app);

    await User.create({
      name: 'Admin Lead',
      email: 'admin.lead@example.com',
      password: 'AdminPass123',
      role: 'admin',
    });

    const adminLoginResponse = await adminAgent.post('/api/auth/login').send({
      email: 'admin.lead@example.com',
      password: 'AdminPass123',
    });

    expect(adminLoginResponse.status).toBe(200);

    const author = await registerAndLogin(authorAgent, {
      name: 'Casey Writer',
      email: 'casey.writer@example.com',
      password: 'WriterPass123',
    });

    await registerAndLogin(readerAgent, {
      name: 'Taylor Reader',
      email: 'taylor.reader@example.com',
      password: 'ReaderPass123',
    });

    const createdPostResponse = await authorAgent.post('/api/posts').send({
      title: 'Operational Content Strategy',
      content: buildLongHtmlParagraph('This piece explores operational planning, editorial velocity, and sustainable publishing systems.'),
      status: 'published',
      tags: ['operations', 'content'],
      category: 'operations',
    });

    expect(createdPostResponse.status).toBe(201);

    const createdPostId = createdPostResponse.body.data.post._id;
    const createdPostSlug = createdPostResponse.body.data.post.slug;

    const createdCommentResponse = await readerAgent.post('/api/comments').send({
      post: createdPostSlug,
      content: 'Helpful framing. The operations angle makes the content strategy feel actionable.',
    });

    expect(createdCommentResponse.status).toBe(201);

    const adminUsersResponse = await adminAgent.get('/api/admin/users');
    expect(adminUsersResponse.status).toBe(200);
    expect(adminUsersResponse.body.data.items.length).toBeGreaterThanOrEqual(3);

    const promoteUserResponse = await adminAgent.patch(`/api/admin/users/${author.user.id}`).send({
      role: 'admin',
      name: 'Casey Writer Lead',
    });

    expect(promoteUserResponse.status).toBe(200);
    expect(promoteUserResponse.body.data.user.role).toBe('admin');
    expect(promoteUserResponse.body.data.user.name).toBe('Casey Writer Lead');

    const adminPostsResponse = await adminAgent.get('/api/admin/posts').query({ search: 'operational' });
    expect(adminPostsResponse.status).toBe(200);
    expect(adminPostsResponse.body.data.items[0]._id).toBe(createdPostId);

    const deleteUserResponse = await adminAgent.delete(`/api/admin/users/${author.user.id}`);
    expect(deleteUserResponse.status).toBe(200);

    const [deletedUser, orphanedPost, orphanedComments] = await Promise.all([
      User.findById(author.user.id),
      Post.findById(createdPostId),
      Comment.find({ postId: createdPostId }),
    ]);

    expect(deletedUser).toBeNull();
    expect(orphanedPost).toBeNull();
    expect(orphanedComments).toHaveLength(0);
  });

  it('stores contact submissions and lets admins update and delete them through the admin inbox', async () => {
    const publicAgent = request.agent(app);
    const adminAgent = request.agent(app);

    await User.create({
      name: 'Inbox Admin',
      email: 'inbox.admin@example.com',
      password: 'AdminInbox123',
      role: 'admin',
    });

    const adminLoginResponse = await adminAgent.post('/api/auth/login').send({
      email: 'inbox.admin@example.com',
      password: 'AdminInbox123',
    });

    expect(adminLoginResponse.status).toBe(200);

    const createContactResponse = await publicAgent.post('/api/contacts').send({
      name: 'Olivia Grant',
      email: 'olivia.grant@example.com',
      subject: 'Editorial product advisory',
      message: 'We want to discuss a premium editorial workflow, publishing operations, and product positioning for a high-end digital magazine.',
    });

    expect(createContactResponse.status).toBe(201);
    expect(createContactResponse.body.data.contact.status).toBe('new');

    const createdContactId = createContactResponse.body.data.contact._id;

    const adminContactsResponse = await adminAgent.get('/api/admin/contacts').query({
      search: 'Olivia',
      status: 'new',
    });

    expect(adminContactsResponse.status).toBe(200);
    expect(adminContactsResponse.body.data.items).toHaveLength(1);
    expect(adminContactsResponse.body.data.items[0]._id).toBe(createdContactId);

    const updateContactResponse = await adminAgent.patch(`/api/admin/contacts/${createdContactId}`).send({
      status: 'resolved',
      notes: 'Replied with an initial discovery questionnaire.',
    });

    expect(updateContactResponse.status).toBe(200);
    expect(updateContactResponse.body.data.contact.status).toBe('resolved');
    expect(updateContactResponse.body.data.contact.notes).toContain('discovery questionnaire');
    expect(updateContactResponse.body.data.contact.resolvedAt).toBeTruthy();

    const persistedContact = await Contact.findById(createdContactId).lean();
    expect(persistedContact.status).toBe('resolved');
    expect(persistedContact.resolvedAt).toBeTruthy();

    const deleteContactResponse = await adminAgent.delete(`/api/admin/contacts/${createdContactId}`);
    expect(deleteContactResponse.status).toBe(200);

    const deletedContact = await Contact.findById(createdContactId);
    expect(deletedContact).toBeNull();
  });
});
