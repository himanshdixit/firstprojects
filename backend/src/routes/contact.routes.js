const express = require('express');
const contactController = require('../controllers/contact.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const { createContactSchema } = require('../validators/contact.schemas');

const router = express.Router();

router.post('/', validateRequest({ body: createContactSchema }), contactController.createContact);

module.exports = router;
