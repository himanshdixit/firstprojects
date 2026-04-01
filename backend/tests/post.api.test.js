jest.mock('../src/services/post.service', () => ({
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  getAllPosts: jest.fn(),
  getPostById: jest.fn(),
  getPostsByUser: jest.fn(),
  togglePostLike: jest.fn(),
  togglePostBookmark: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const postService = require('../src/services/post.service');
const { buildUser, buildAdmin, buildPost, authHeaderFor, edgeCases } = require('./helpers/fixtures');

describe('Post API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/posts should return paginated posts for anonymous users', async () => {
    postService.getAllPosts.mockResolvedValue({
      items: [buildPost()],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
      filters: {
        tags: ['design'],
        categories: ['design'],
      },
    });

    const res = await request(app).get('/api/posts?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(postService.getAllPosts).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      { role: 'user' }
    );
  });

  it('GET /api/posts/:id should support slug-based reads', async () => {
    const post = buildPost();
    postService.getPostById.mockResolvedValue(post);

    const res = await request(app).get(`/api/posts/${post.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.post.slug).toBe(post.slug);
    expect(postService.getPostById).toHaveBeenCalledWith(post.slug, null);
  });

  it('POST /api/posts should require authentication', async () => {
    const res = await request(app).post('/api/posts').send({
      title: 'Unauthenticated draft',
      content: 'This should fail because the user is not authenticated.',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(postService.createPost).not.toHaveBeenCalled();
  });

  it('POST /api/posts should reject invalid payloads before the service layer', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', authHeaderFor(buildUser()))
      .send({
        title: 'Hi',
        content: 'too short',
        category: 'design',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/title|content/i);
    expect(postService.createPost).not.toHaveBeenCalled();
  });

  it('POST /api/posts should create a post with realistic data', async () => {
    const user = buildAdmin();
    const payload = {
      title: edgeCases.specialCharactersTitle,
      content:
        '<p>DraftSphere pairs careful typography with structured workflows, which makes this a good high-fidelity CRUD payload for tests.</p>',
      category: 'design',
      status: 'published',
      tags: ['design', 'ux', 'editorial'],
    };

    postService.createPost.mockResolvedValue(buildPost({
      title: payload.title,
      content: payload.content,
      category: payload.category,
      status: payload.status,
      tags: payload.tags,
    }));

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', authHeaderFor(user))
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.post.title).toBe(payload.title);
    expect(postService.createPost).toHaveBeenCalledWith(payload, expect.objectContaining({
      id: user._id,
      role: user.role,
      email: user.email,
    }));
  });

  it('PATCH /api/posts/:id should update a post', async () => {
    const user = buildAdmin();
    const updated = buildPost({ title: 'Updated premium headline' });
    postService.updatePost.mockResolvedValue(updated);

    const res = await request(app)
      .patch(`/api/posts/${updated._id}`)
      .set('Authorization', authHeaderFor(user))
      .send({ title: updated.title });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.post.title).toBe(updated.title);
    expect(postService.updatePost).toHaveBeenCalledWith(
      updated._id,
      { title: updated.title },
      expect.objectContaining({ id: user._id, role: user.role })
    );
  });

  it('PATCH /api/posts/:id/like should toggle likes for authenticated users', async () => {
    const user = buildUser();
    const likedPost = buildPost({ likeCount: 1, likedByCurrentUser: true });
    postService.togglePostLike.mockResolvedValue(likedPost);

    const res = await request(app)
      .patch(`/api/posts/${likedPost._id}/like`)
      .set('Authorization', authHeaderFor(user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(postService.togglePostLike).toHaveBeenCalledWith(
      likedPost._id,
      expect.objectContaining({ id: user._id, role: user.role })
    );
  });

  it('DELETE /api/posts/:id should delete a post safely', async () => {
    const user = buildAdmin();

    const res = await request(app)
      .delete('/api/posts/65f8b6a4b2a8f8d9f2c1a101')
      .set('Authorization', authHeaderFor(user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(postService.deletePost).toHaveBeenCalledWith(
      '65f8b6a4b2a8f8d9f2c1a101',
      expect.objectContaining({ id: user._id, role: user.role })
    );
  });
});
