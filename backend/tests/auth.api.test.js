jest.mock('../src/services/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  getPublicUser: jest.fn(),
}));

jest.mock('../src/services/user.service', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/auth.service');
const { buildUser, edgeCases, authHeaderFor } = require('./helpers/fixtures');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/register should register a user and return token payload', async () => {
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const createdUser = buildUser({
      _id: '65f8b5f1b2a8f8d9f2c1a001',
      name: payload.name,
      email: payload.email,
    });

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
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('auth_token='),
        expect.stringContaining('refresh_token='),
      ])
    );
    expect(authService.register).toHaveBeenCalledWith(payload);
  });

  it('POST /api/auth/register should reject invalid email formats before the service layer', async () => {
    const payload = {
      name: 'Ava Writer',
      email: edgeCases.invalidEmail,
      password: 'password123',
    };

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('POST /api/auth/login should reject missing password values', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ava@example.com', password: edgeCases.emptyString });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/password/i);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('GET /api/auth/profile should require authentication', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authentication required|invalid or expired token/i);
  });

  it('POST /api/auth/login should return cookies and the public user payload', async () => {
    const user = buildUser();
    authService.login.mockResolvedValue({
      user,
      accessToken: 'live-access-token',
      refreshToken: 'live-refresh-token',
    });
    authService.getPublicUser.mockReturnValue({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('auth_token='),
        expect.stringContaining('refresh_token='),
      ])
    );
    expect(authService.login).toHaveBeenCalledWith({
      email: user.email,
      password: 'password123',
    });
  });

  it('PATCH /api/auth/profile should require a valid access token', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', authHeaderFor(buildUser()))
      .send({ email: edgeCases.invalidEmail });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
  });
});
