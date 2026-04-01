jest.mock('../src/services/comment.service', () => ({
  createComment: jest.fn(),
  getCommentsByPost: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
  toggleLike: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const commentService = require('../src/services/comment.service');
const { buildUser, buildPost, buildComment, authHeaderFor, edgeCases } = require('./helpers/fixtures');

describe('Comment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/comments should return threaded comments for a post', async () => {
    const post = buildPost();
    const comment = buildComment({ postId: post });

    commentService.getCommentsByPost.mockResolvedValue({
      items: [comment],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      },
      count: 1,
    });

    const res = await request(app).get(`/api/comments?post=${post.slug}&page=1&limit=20`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(commentService.getCommentsByPost).toHaveBeenCalledWith(
      post.slug,
      { post: post.slug, page: 1, limit: 20 },
      null
    );
  });

  it('POST /api/comments should require authentication', async () => {
    const res = await request(app).post('/api/comments').send({
      post: 'scaling-a-luxury-editorial-platform',
      content: 'This should fail without auth.',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(commentService.createComment).not.toHaveBeenCalled();
  });

  it('POST /api/comments should reject empty content', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', authHeaderFor(buildUser()))
      .send({
        post: 'scaling-a-luxury-editorial-platform',
        content: edgeCases.emptyString,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/content/i);
    expect(commentService.createComment).not.toHaveBeenCalled();
  });

  it('POST /api/comments should create a comment with special characters and realistic content', async () => {
    const user = buildUser();
    const payload = {
      post: 'scaling-a-luxury-editorial-platform',
      content: 'Loved this launch note. Clean UI, strong hierarchy, and tags like #design #editorial all feel coherent.',
    };
    const comment = buildComment({ content: payload.content });
    commentService.createComment.mockResolvedValue(comment);

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', authHeaderFor(user))
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comment.content).toBe(payload.content);
    expect(commentService.createComment).toHaveBeenCalledWith(
      payload,
      expect.objectContaining({ id: user._id, role: user.role })
    );
  });

  it('PATCH /api/comments/:id should update comment content', async () => {
    const user = buildUser();
    const updatedComment = buildComment({ content: 'Updated comment body with clearer feedback.' });
    commentService.updateComment.mockResolvedValue(updatedComment);

    const res = await request(app)
      .patch(`/api/comments/${updatedComment._id}`)
      .set('Authorization', authHeaderFor(user))
      .send({ content: updatedComment.content });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(commentService.updateComment).toHaveBeenCalledWith(
      updatedComment._id,
      { content: updatedComment.content },
      expect.objectContaining({ id: user._id, role: user.role })
    );
  });

  it('PATCH /api/comments/:id should reject overly long content', async () => {
    const res = await request(app)
      .patch('/api/comments/65f8b760b2a8f8d9f2c1a201')
      .set('Authorization', authHeaderFor(buildUser()))
      .send({ content: edgeCases.longText });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(commentService.updateComment).not.toHaveBeenCalled();
  });

  it('PATCH /api/comments/:id/like should toggle comment likes', async () => {
    const user = buildUser();
    const likedComment = buildComment({ likeCount: 1, likedByCurrentUser: true });
    commentService.toggleLike.mockResolvedValue(likedComment);

    const res = await request(app)
      .patch(`/api/comments/${likedComment._id}/like`)
      .set('Authorization', authHeaderFor(user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(commentService.toggleLike).toHaveBeenCalledWith(
      likedComment._id,
      expect.objectContaining({ id: user._id, role: user.role })
    );
  });

  it('DELETE /api/comments/:id should delete comments safely', async () => {
    const user = buildUser();

    const res = await request(app)
      .delete('/api/comments/65f8b760b2a8f8d9f2c1a201')
      .set('Authorization', authHeaderFor(user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(commentService.deleteComment).toHaveBeenCalledWith(
      '65f8b760b2a8f8d9f2c1a201',
      expect.objectContaining({ id: user._id, role: user.role })
    );
  });
});
