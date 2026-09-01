const connectDB = require('../src/config/db');
const app = require('../src/app');

const handler = async (req, res) => {
  await connectDB();
  return app(req, res);
};

module.exports = handler;
