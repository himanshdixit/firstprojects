jest.mock('../src/services/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  getPublicUser: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/auth.service');

describe('Auth API', () => {
  it('POST /api/auth/register should register a user and return token payload', async () => {
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const createdUser = {
      _id: '65f8b5f1b2a8f8d9f2c1a001',
      name: payload.name,
      email: payload.email,
      role: 'user',
      avatar: '',
      createdAt: new Date('2026-02-18T17:30:00.000Z'),
      updatedAt: new Date('2026-02-18T17:30:00.000Z'),
    };

    authService.register.mockResolvedValue({
      user: createdUser,
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
    });

    authService.getPublicUser.mockReturnValue({
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      avatar: createdUser.avatar,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    });

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe('access-token-123');
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(authService.register).toHaveBeenCalledWith(payload);
  });
});
