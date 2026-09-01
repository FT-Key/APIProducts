const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Client = require('../models/Client');

const createToken = async (req, res) => {
  try {
    const clientId = uuidv4();

    const client = new Client({ clientId });
    await client.save();

    const token = jwt.sign({ clientId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Token created successfully. Save it, you need it for all endpoints.',
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating token', detail: error.message });
  }
};

module.exports = { createToken };
