jest.mock('../src/services/contact.service', () => ({
  createContact: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const contactService = require('../src/services/contact.service');
const { buildContact, edgeCases } = require('./helpers/fixtures');

describe('Contact API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/contacts should create a contact submission', async () => {
    const contact = buildContact();
    const payload = {
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
    };

    contactService.createContact.mockResolvedValue(contact);

    const res = await request(app).post('/api/contacts').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.contact.email).toBe(contact.email);
    expect(contactService.createContact).toHaveBeenCalledWith(payload);
  });

  it('POST /api/contacts should reject invalid emails', async () => {
    const res = await request(app).post('/api/contacts').send({
      name: 'Jordan Blake',
      email: edgeCases.invalidEmail,
      subject: 'Partnership',
      message: 'This is a serious inquiry about a partnership and platform engagement.',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
    expect(contactService.createContact).not.toHaveBeenCalled();
  });

  it('POST /api/contacts should reject short messages', async () => {
    const res = await request(app).post('/api/contacts').send({
      name: 'Jordan Blake',
      email: 'jordan@example.com',
      subject: 'Partnership',
      message: 'Too short',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/message/i);
    expect(contactService.createContact).not.toHaveBeenCalled();
  });
});
