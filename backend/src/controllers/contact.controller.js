const contactService = require('../services/contact.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

exports.createContact = catchAsync(async (req, res) => {
  const contact = await contactService.createContact(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Message sent successfully',
    data: {
      contact,
    },
  });
});
