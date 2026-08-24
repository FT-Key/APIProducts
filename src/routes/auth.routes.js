const express = require('express');
const router = express.Router();
const { createToken } = require('../controllers/auth.controller');

router.post('/token', createToken);

module.exports = router;
