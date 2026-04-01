jest.mock('../src/services/admin.service', () => ({
  getAllUsers: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
  viewAllPosts: jest.fn(),
  getAllComments: jest.fn(),
  getAllContacts: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn(),
  deleteComment: jest.fn(),
  getAnalytics: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const adminService = require('../src/services/admin.service');
const { buildAdmin, buildUser, buildPost, buildComment, buildContact, authHeaderFor } = require('./helpers/fixtures');

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/admin/users should require authentication', async () => {
    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/admin/users should reject non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', authHeaderFor(buildUser()));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it('GET /api/admin/users should return paginated users for admins', async () => {
    adminService.getAllUsers.mockResolvedValue({
      items: [buildUser()],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    const admin = buildAdmin();
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(adminService.getAllUsers).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('PATCH /api/admin/users/:id should enforce the stronger password rule', async () => {
    const admin = buildAdmin();

    const res = await request(app)
      .patch('/api/admin/users/65f8b5f1b2a8f8d9f2c1a001')
      .set('Authorization', authHeaderFor(admin))
      .send({ password: 'short7' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/password/i);
    expect(adminService.updateUser).not.toHaveBeenCalled();
  });

  it('GET /api/admin/posts should return post management data', async () => {
    adminService.viewAllPosts.mockResolvedValue({
      items: [buildPost()],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    const admin = buildAdmin();
    const res = await request(app)
      .get('/api/admin/posts?page=1&limit=10&status=published')
      .set('Authorization', authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(adminService.viewAllPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: 'published',
    });
  });

  it('GET /api/admin/comments should return comment moderation data', async () => {
    adminService.getAllComments.mockResolvedValue({
      items: [buildComment()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    const admin = buildAdmin();
    const res = await request(app)
      .get('/api/admin/comments?page=1&limit=20&search=editorial')
      .set('Authorization', authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(adminService.getAllComments).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: 'editorial',
    });
  });

  it('DELETE /api/admin/comments/:id should delete moderated comments', async () => {
    const admin = buildAdmin();

    const res = await request(app)
      .delete('/api/admin/comments/65f8b760b2a8f8d9f2c1a201')
      .set('Authorization', authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(adminService.deleteComment).toHaveBeenCalledWith(
      '65f8b760b2a8f8d9f2c1a201',
      expect.objectContaining({ id: admin._id, role: admin.role })
    );
  });

  it('GET /api/admin/contacts should return contact inbox data', async () => {
    adminService.getAllContacts.mockResolvedValue({
      items: [buildContact()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    const admin = buildAdmin();
    const res = await request(app)
      .get('/api/admin/contacts?page=1&limit=20&status=new')
      .set('Authorization', authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(adminService.getAllContacts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      status: 'new',
    });
  });

  it('PATCH /api/admin/contacts/:id should update submission state', async () => {
    const admin = buildAdmin();
    adminService.updateContact.mockResolvedValue(buildContact({ status: 'resolved' }));

    const res = await request(app)
      .patch('/api/admin/contacts/65f8b880b2a8f8d9f2c1a301')
      .set('Authorization', authHeaderFor(admin))
      .send({ status: 'resolved', notes: 'Handled by editorial ops.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(adminService.updateContact).toHaveBeenCalledWith(
      '65f8b880b2a8f8d9f2c1a301',
      { status: 'resolved', notes: 'Handled by editorial ops.' }
    );
  });

  it('DELETE /api/admin/contacts/:id should remove submissions', async () => {
    const admin = buildAdmin();

    const res = await request(app)
      .delete('/api/admin/contacts/65f8b880b2a8f8d9f2c1a301')
      .set('Authorization', authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(adminService.deleteContact).toHaveBeenCalledWith('65f8b880b2a8f8d9f2c1a301');
  });
});
