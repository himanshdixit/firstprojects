jest.mock('../src/services/post.service', () => ({
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  getAllPosts: jest.fn(),
  getPostById: jest.fn(),
  getPostsByUser: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const postService = require('../src/services/post.service');

describe('Post API', () => {
  it('GET /api/posts should return paginated posts', async () => {
    postService.getAllPosts.mockResolvedValue({
      items: [
        {
          _id: '65f8b6a4b2a8f8d9f2c1a101',
          title: 'First Post',
          slug: 'first-post',
          content: '<p>hello world content here...</p>',
          status: 'published',
          tags: ['nextjs'],
          author: {
            _id: '65f8b5f1b2a8f8d9f2c1a001',
            name: 'Admin',
            email: 'admin@example.com',
          },
          createdAt: '2026-02-18T18:10:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    });

    const res = await request(app).get('/api/posts?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(postService.getAllPosts).toHaveBeenCalledWith(
      { page: '1', limit: '10' },
      { role: 'user' }
    );
  });
});
