const Contact = require('../models/Contact');

async function createContact(payload) {
  const contact = await Contact.create({
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
  });

  return contact;
}

module.exports = {
  createContact,
};
